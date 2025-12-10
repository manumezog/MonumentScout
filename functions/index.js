const {onRequest} = require("firebase-functions/v2/https");
const express = require('express');
const fetch = require('node-fetch');

const app = express();

// Endpoint the client-side JavaScript will call
app.get('/api/nearby', async (req, res) => {
    // Get parameters from the client request
    const { lat, lon, radius } = req.query;

    if (!lat || !lon) {
        return res.status(400).send({ error: 'Missing latitude or longitude' });
    }

    // Use provided radius or default to 5000m (5km)
    // Cap at 50000m (50km) to prevent excessive API usage
    const searchRadius = Math.min(parseInt(radius) || 5000, 50000);

    // Use Overpass API to get actual tourist attractions (not hotels)
    // This gives us much better control over what types of places we get
    const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"="museum"](around:${searchRadius},${lat},${lon});
          node["tourism"="attraction"](around:${searchRadius},${lat},${lon});
          node["tourism"="artwork"](around:${searchRadius},${lat},${lon});
          node["tourism"="viewpoint"](around:${searchRadius},${lat},${lon});
          node["tourism"="gallery"](around:${searchRadius},${lat},${lon});
          node["historic"="monument"](around:${searchRadius},${lat},${lon});
          node["historic"="memorial"](around:${searchRadius},${lat},${lon});
          node["historic"="castle"](around:${searchRadius},${lat},${lon});
          node["historic"="ruins"](around:${searchRadius},${lat},${lon});
          node["historic"="archaeological_site"](around:${searchRadius},${lat},${lon});
          node["historic"="fort"](around:${searchRadius},${lat},${lon});
          node["historic"="tower"](around:${searchRadius},${lat},${lon});
          node["amenity"="place_of_worship"](around:${searchRadius},${lat},${lon});
          node["man_made"="lighthouse"](around:${searchRadius},${lat},${lon});
          way["tourism"="museum"](around:${searchRadius},${lat},${lon});
          way["tourism"="attraction"](around:${searchRadius},${lat},${lon});
          way["historic"="monument"](around:${searchRadius},${lat},${lon});
          way["historic"="memorial"](around:${searchRadius},${lat},${lon});
          way["historic"="castle"](around:${searchRadius},${lat},${lon});
          way["historic"="ruins"](around:${searchRadius},${lat},${lon});
          way["amenity"="place_of_worship"](around:${searchRadius},${lat},${lon});
        );
        out center;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    try {
        const response = await fetch(overpassUrl, {
            method: 'POST',
            body: overpassQuery
        });
        
        const data = await response.json();
        
        console.log(`Overpass API returned ${data.elements?.length || 0} total results for radius ${searchRadius}m`);
        
        // Transform Overpass format to our expected format
        const touristAttractions = (data.elements || []).map(element => {
            const tags = element.tags || {};
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;
            
            // Determine the type and name
            const type = tags.tourism || tags.historic || tags.amenity || tags.man_made || 'attraction';
            const name = tags.name || tags['name:en'] || 'Unknown Place';
            
            return {
                lat: lat,
                lon: lon,
                display_name: name,
                name: name,
                type: type,
                class: tags.tourism ? 'tourism' : (tags.historic ? 'historic' : 'amenity'),
                tags: tags
            };
        }).filter(place => place.lat && place.lon); // Only include places with valid coordinates
        
        console.log(`After processing: ${touristAttractions.length} tourist attractions found`);
        
        // Send filtered data back to the client-side JavaScript
        res.json(touristAttractions);
    } catch (error) {
        console.error("Overpass API Error:", error);
        res.status(500).send({ error: 'Failed to fetch location data' });
    }
});

// Endpoint for AI-generated monument explanations
app.post('/api/explain', async (req, res) => {
    const { name, type, lat, lon, detailed, language = 'en' } = req.body;

    if (!name) {
        return res.status(400).send({ error: 'Missing monument name' });
    }

    // Get OpenRouter API key from Firebase Secrets
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        console.error('OPENROUTER_API_KEY not configured');
        console.error('Available env vars:', Object.keys(process.env));
        return res.status(500).send({ 
            error: 'AI service not configured. Please add OPENROUTER_API_KEY to environment variables.' 
        });
    }
    
    console.log('API Key found, length:', apiKey.length);

    try {
        // Prepare the prompt based on language and detail level
        const prompts = {
            en: {
                brief: `Provide a brief, interesting summary (2-3 sentences) about ${name}, a ${type || 'monument'}. Focus on what makes it special and worth visiting.`,
                detailed: `Provide a detailed, educational explanation (4-5 sentences) about ${name}, a ${type || 'monument'}. Include historical significance, architectural features, and interesting facts. Be informative and engaging.`
            },
            es: {
                brief: `Proporciona un resumen breve e interesante (2-3 oraciones) sobre ${name}, un ${type || 'monumento'}. Enfócate en lo que lo hace especial y digno de visitar.`,
                detailed: `Proporciona una explicación detallada y educativa (4-5 oraciones) sobre ${name}, un ${type || 'monumento'}. Incluye su importancia histórica, características arquitectónicas y datos interesantes. Sé informativo y atractivo.`
            }
        };
        
        const selectedLanguage = language === 'es' ? 'es' : 'en';
        const prompt = detailed ? prompts[selectedLanguage].detailed : prompts[selectedLanguage].brief;

        // Call OpenRouter API with free Gemini Flash model
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://monumentscout.app', // Optional: your site URL
                'X-Title': 'Monument Scout' // Optional: your app name
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini-2024-07-18', // Exact OpenRouter model ID
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: detailed ? 300 : 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', errorData);
            throw new Error(`OpenRouter API returned ${response.status}`);
        }

        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content;

        if (!explanation) {
            throw new Error('No explanation generated');
        }

        console.log(`Generated ${detailed ? 'detailed' : 'brief'} explanation for: ${name}`);

        res.json({
            name,
            type,
            explanation: explanation.trim(),
            detailed: !!detailed
        });

    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).send({ 
            error: 'Failed to generate explanation. Please try again later.' 
        });
    }
});

// Export the Express app as a Cloud Function with secrets
exports.api = onRequest(
    {
        secrets: ['OPENROUTER_API_KEY']
    },
    app
);

