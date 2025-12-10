// public/app.js - Client-Side JavaScript for Monument Scout

// ===== Global State =====
let map;
let poiMarkers = [];
let userMarker = null;
let currentPOIs = [];
let currentUserLocation = null;
let currentRadius = 5000; // Default 5km

// ===== Initialize Map =====
function initMap() {
    map = L.map('map', {
        zoomControl: true,
        attributionControl: true
    }).setView([40.7128, -74.0060], 13); // Default: New York City

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
}

// Store markers for easy management

// Custom icons
const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: '<div style="background-color: #4285f4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

const monumentIcon = L.divIcon({
    className: 'monument-icon',
    html: '<div style="background-color: #ea4335; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Get user's current location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    // Show loading message
    showMessage("📍 Getting your location... (this may take a few seconds)");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`User location: ${latitude}, ${longitude}`);
            
            // Store current user location
            currentUserLocation = { lat: latitude, lng: longitude };
            
            // Center map on user location
            map.setView([latitude, longitude], 14);
            
            // Add/update user marker
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                userMarker = L.marker([latitude, longitude], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('<strong>📍 You are here</strong>')
                    .openPopup();
            }
            
            // Find nearby POIs
            findNearbyPOIs(latitude, longitude, currentRadius);
        },
        (error) => {
            let errorMessage;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access was denied. Please enable location permissions.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out. Click the Refresh button to try again.";
                    break;
                default:
                    errorMessage = "An unknown error occurred while getting your location.";
            }
            showError(errorMessage);
        },
        {
            enableHighAccuracy: true, // Keep high accuracy for mobile GPS precision
            timeout: 30000, // Increased to 30 seconds to prevent timeouts
            maximumAge: 300000 // Cache location for 5 minutes
        }
    );
}

// Find nearby Points of Interest using our secure server endpoint
function findNearbyPOIs(lat, lng, radius = currentRadius) {
    showLoading("Searching for monuments and attractions...");
    
    const url = `/api/nearby?lat=${lat}&lon=${lng}&radius=${radius}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            console.log("Nearby POIs from server:", data);
            
            // Clear existing POI markers
            clearPOIMarkers();
            
            if (data.error) {
                showError(data.error);
                updateSidebar([]);
                return;
            }
            
            if (!Array.isArray(data) || data.length === 0) {
                showMessage("No monuments or attractions found. Try a different location or increase the radius!");
                updateSidebar([]);
                return;
            }
            
            // Store current POIs
            currentPOIs = data;
            
            // Add markers for each POI
            data.forEach((poi, index) => {
                addPOIMarker(poi, index + 1);
            });
            
            // Update sidebar with monument list
            updateSidebar(data);
            
            showSuccess(`🏛️ Found ${data.length} monument(s) nearby!`);
        })
        .catch(error => {
            hideLoading();
            console.error("Error fetching nearby POIs:", error);
            showError("Failed to fetch nearby attractions. Click refresh to try again.");
            updateSidebar([]);
        });
}

// Add a marker for a POI
function addPOIMarker(poi, rank) {
    const lat = parseFloat(poi.lat);
    const lon = parseFloat(poi.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
        console.warn("Invalid coordinates for POI:", poi);
        return;
    }
    
    // Calculate distance from user (if user location is available)
    let distanceText = '';
    if (userMarker) {
        const userLatLng = userMarker.getLatLng();
        const distance = map.distance([lat, lon], [userLatLng.lat, userLatLng.lng]);
        distanceText = distance < 1000 
            ? `${Math.round(distance)}m away` 
            : `${(distance / 1000).toFixed(1)}km away`;
    }
    
    // Create popup content
    const name = poi.display_name || poi.name || 'Unknown Place';
    const type = poi.type || poi.class || 'attraction';
    const popupContent = `
        <div style="min-width: 150px;">
            <strong>#${rank}: ${name.split(',')[0]}</strong>
            <br><small style="color: #666;">📍 ${type}</small>
            ${distanceText ? `<br><small style="color: #4285f4;">📏 ${distanceText}</small>` : ''}
        </div>
    `;
    
    const marker = L.marker([lat, lon], { icon: monumentIcon })
        .addTo(map)
        .bindPopup(popupContent);
    
    poiMarkers.push(marker);
}

// Clear all POI markers from the map
function clearPOIMarkers() {
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers = [];
}

// Show a message overlay on the map
function showMessage(message) {
    removeExistingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'map-message';
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #333;
    `;
    overlay.textContent = message;
    document.body.appendChild(overlay);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 5000);
}

// Show an error message
function showError(message) {
    removeExistingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'map-message';
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(234, 67, 53, 0.95);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: white;
    `;
    overlay.textContent = '⚠️ ' + message;
    document.body.appendChild(overlay);
}

// Remove existing message overlay
function removeExistingOverlay() {
    const existing = document.getElementById('map-message');
    if (existing) {
        existing.remove();
    }
}

// Show loading overlay
function showLoading(message = "Loading...") {
    hideLoading(); // Remove any existing loading overlay
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">${message}</div>
    `;
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
    const existing = document.getElementById('loading-overlay');
    if (existing) {
        existing.remove();
    }
}

// Show success message
function showSuccess(message) {
    removeExistingOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'map-message';
    overlay.className = 'success';
    overlay.textContent = message;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 3000);
}

// Update sidebar with monument list
function updateSidebar(pois) {
    const monumentList = document.getElementById('monumentList');
    const monumentCount = document.getElementById('monumentCount');
    
    if (!pois || pois.length === 0) {
        monumentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏛️</div>
                <p>No monuments found.</p>
                <p style="font-size: 13px; margin-top: 8px;">Try a different location or increase the search radius!</p>
            </div>
        `;
        monumentCount.style.display = 'none';
        return;
    }
    
    // Show count badge
    monumentCount.textContent = pois.length;
    monumentCount.style.display = 'block';
    
    // Build monument list HTML
    let html = '';
    pois.forEach((poi, index) => {
        const name = poi.display_name || poi.name || 'Unknown Place';
        const type = poi.type || poi.class || 'attraction';
        
        let distanceText = '';
        if (currentUserLocation) {
            const distance = map.distance(
                [parseFloat(poi.lat), parseFloat(poi.lon)],
                [currentUserLocation.lat, currentUserLocation.lng]
            );
            distanceText = distance < 1000 
                ? `${Math.round(distance)}m away` 
                : `${(distance / 1000).toFixed(1)}km away`;
        }
        
        html += `
            <div class="monument-item" data-index="${index}" data-lat="${poi.lat}" data-lon="${poi.lon}" data-name="${name.split(',')[0]}" data-type="${type}">
                <div class="monument-rank">#${index + 1}</div>
                <div class="monument-name">${name.split(',')[0]}</div>
                <div class="monument-type">📍 ${type}</div>
                ${distanceText ? `<div class="monument-distance">📏 ${distanceText}</div>` : ''}
                <button class="explain-btn" data-index="${index}">🤖 Explain</button>
            </div>
        `;
    });
    
    monumentList.innerHTML = html;
    
    // Add click handlers to monument items
    document.querySelectorAll('.monument-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't zoom if clicking the Explain button
            if (e.target.classList.contains('explain-btn')) {
                return;
            }
            
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            const index = parseInt(item.dataset.index);
            
            // Zoom to monument
            map.setView([lat, lon], 16);
            
            // Open popup for this marker
            if (poiMarkers[index]) {
                poiMarkers[index].openPopup();
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
    
    // Add click handlers to Explain buttons
    document.querySelectorAll('.explain-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent monument item click
            const index = parseInt(btn.dataset.index);
            const poi = pois[index];
            if (poi) {
                showExplanation(poi);
            }
        });
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// ===== AI Explanation Feature =====

let currentExplanationData = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Show explanation modal
function showExplanation(poi) {
    const modal = document.getElementById('explanationModal');
    const title = document.getElementById('explanationTitle');
    const body = document.getElementById('explanationBody');
    const footer = document.getElementById('explanationFooter');
    
    // Store current monument data
    currentExplanationData = {
        name: poi.display_name || poi.name || 'Unknown Place',
        type: poi.type || poi.class || 'attraction',
        lat: poi.lat,
        lon: poi.lon
    };
    
    // Update modal title
    title.textContent = currentExplanationData.name.split(',')[0];
    
    // Show loading state
    body.innerHTML = `
        <div class="explanation-loading">
            <div class="spinner"></div>
            <p>Generating explanation...</p>
        </div>
    `;
    
    // Hide footer initially
    footer.style.display = 'none';
    
    // Show modal
    modal.classList.add('active');
    
    // Fetch explanation
    fetchExplanation(currentExplanationData, false);
}

// Fetch explanation from API
async function fetchExplanation(monumentData, detailed = false) {
    const body = document.getElementById('explanationBody');
    const footer = document.getElementById('explanationFooter');
    const moreDetailsBtn = document.getElementById('moreDetailsBtn');
    
    try {
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: monumentData.name,
                type: monumentData.type,
                lat: monumentData.lat,
                lon: monumentData.lon,
                detailed: detailed
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch explanation');
        }
        
        const data = await response.json();
        
        // Display explanation
        body.innerHTML = `<p class="explanation-text">${data.explanation}</p>`;
        
        // Show footer
        footer.style.display = 'flex';
        
        // Update More Details button state
        if (detailed) {
            moreDetailsBtn.disabled = true;
            moreDetailsBtn.textContent = '✓ Detailed View';
        } else {
            moreDetailsBtn.disabled = false;
            moreDetailsBtn.textContent = '📖 More Details';
        }
        
        // Store explanation for TTS
        currentExplanationData.explanation = data.explanation;
        
    } catch (error) {
        console.error('Error fetching explanation:', error);
        body.innerHTML = `
            <p class="explanation-text" style="color: rgba(255, 255, 255, 0.7);">
                ⚠️ ${error.message || 'Failed to generate explanation. Please try again later.'}
            </p>
        `;
        footer.style.display = 'flex';
        moreDetailsBtn.disabled = true;
    }
}

// Close explanation modal
function closeExplanationModal() {
    const modal = document.getElementById('explanationModal');
    modal.classList.remove('active');
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Reset data
    currentExplanationData = null;
}

// Text-to-speech functions
function speakText() {
    if (!currentExplanationData || !currentExplanationData.explanation) {
        return;
    }
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(currentExplanationData.explanation);
    currentUtterance.rate = 0.9; // Slightly slower for clarity
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1.0;
    
    // Update button states when speech ends
    currentUtterance.onend = () => {
        document.getElementById('speakBtn').style.display = 'block';
        document.getElementById('stopSpeakBtn').style.display = 'none';
    };
    
    // Start speaking
    speechSynthesis.speak(currentUtterance);
    
    // Update button states
    document.getElementById('speakBtn').style.display = 'none';
    document.getElementById('stopSpeakBtn').style.display = 'block';
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    // Reset button states
    document.getElementById('speakBtn').style.display = 'block';
    document.getElementById('stopSpeakBtn').style.display = 'none';
}

// Load more details
function loadMoreDetails() {
    if (currentExplanationData) {
        const body = document.getElementById('explanationBody');
        body.innerHTML = `
            <div class="explanation-loading">
                <div class="spinner"></div>
                <p>Loading detailed explanation...</p>
            </div>
        `;
        fetchExplanation(currentExplanationData, true);
    }
}

// ===== Event Listeners =====

// Refresh button
document.getElementById('refreshBtn')?.addEventListener('click', () => {
    getUserLocation();
});

// Radius selector
document.getElementById('radiusSelect')?.addEventListener('change', (e) => {
    currentRadius = parseInt(e.target.value);
    if (currentUserLocation) {
        findNearbyPOIs(currentUserLocation.lat, currentUserLocation.lng, currentRadius);
    }
});

// Toggle sidebar button
document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);

// Close sidebar button
document.getElementById('closeSidebar')?.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside on mobile
document.getElementById('sidebar')?.addEventListener('click', (e) => {
    if (e.target.id === 'sidebar') {
        toggleSidebar();
    }
});

// Explanation modal event listeners
document.getElementById('closeExplanation')?.addEventListener('click', closeExplanationModal);
document.getElementById('explanationOverlay')?.addEventListener('click', closeExplanationModal);
document.getElementById('moreDetailsBtn')?.addEventListener('click', loadMoreDetails);
document.getElementById('speakBtn')?.addEventListener('click', speakText);
document.getElementById('stopSpeakBtn')?.addEventListener('click', stopSpeaking);

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏛️ Monument Scout initialized');
    initMap();
    
    // Small delay to ensure map is ready
    setTimeout(() => {
        getUserLocation();
    }, 300);
});