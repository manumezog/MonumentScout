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

// Export the Express app as a Cloud Function
exports.api = onRequest(app);
