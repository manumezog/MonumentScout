# 🏛️ Monument Scout

> **Discover ancient gems and tourist attractions near you**

Monument Scout is a modern, location-aware web application that helps you explore monuments, museums, historic sites, and cultural attractions in your vicinity. Built with a secure architecture and stunning UI, it's designed for mobile-first tourism and urban exploration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## ✨ Features

### 🎯 Core Functionality

- **📍 Location-Aware**: Automatically centers on your current location using HTML5 Geolocation
- **🏛️ Smart Filtering**: Shows only genuine tourist attractions (museums, monuments, castles, ruins, etc.)
- **🔍 Customizable Radius**: Search within 1km, 5km, 10km, or 25km
- **📋 Interactive List**: Sidebar with ranked monuments showing distance and type
- **🗺️ Interactive Map**: Powered by Leaflet.js with OpenStreetMap tiles
- **🔒 Secure Architecture**: API calls handled server-side to protect sensitive data

### 🎨 Modern UI/UX

- **Glassmorphism Design**: Beautiful frosted glass effects with backdrop blur
- **Smooth Animations**: Polished transitions and micro-interactions
- **Dark Mode Support**: Automatically adapts to system preferences
- **Mobile Optimized**: Touch-friendly controls and responsive layout
- **Loading Indicators**: Professional spinners and progress feedback
- **Badge Counters**: Visual indicators of monuments found

### 🌐 Data Source

- **Overpass API**: Direct access to OpenStreetMap data
- **No API Keys Required**: Free and open-source data
- **Comprehensive Coverage**: Global database of tourist attractions
- **Real-time Updates**: Always current with OSM contributions

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Location services enabled on your device

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/manumezog/MonumentScout.git
   cd MonumentScout
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open in browser**

   ```
   http://localhost:3000
   ```

5. **Allow location access** when prompted by your browser

---

## 📁 Project Structure

```
MonumentScout/
├── public/
│   ├── index.html          # Main HTML with UI components
│   ├── style.css           # Modern CSS with glassmorphism
│   └── app.js              # Client-side JavaScript
├── server.js               # Express server with Overpass API integration
├── package.json            # Dependencies and scripts
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 🏗️ Architecture

### Two-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌──────────────────────────────────────────┐  │
│  │  HTML/CSS/JavaScript                      │  │
│  │  - Leaflet.js for maps                    │  │
│  │  - Geolocation API                        │  │
│  │  - Modern UI with glassmorphism           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────┐
│              Node.js/Express Server              │
│  ┌──────────────────────────────────────────┐  │
│  │  - Handles API requests                   │  │
│  │  - Queries Overpass API                   │  │
│  │  - Filters and transforms data            │  │
│  │  - Serves static files                    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────┐
│              Overpass API (OSM)                  │
│  - OpenStreetMap database                        │
│  - Tourist attraction data                       │
│  - Free and open-source                          │
└─────────────────────────────────────────────────┘
```

### Security Features

- ✅ **Server-side API calls**: No API keys exposed to the client
- ✅ **Input validation**: Sanitized user inputs
- ✅ **Rate limiting**: Radius capped at 50km to prevent abuse
- ✅ **HTTPS ready**: Secure communication support
- ✅ **No sensitive data storage**: Stateless architecture

---

## 🎮 Usage

### Basic Usage

1. **Open the app** in your browser
2. **Allow location access** when prompted
3. **Wait for monuments to load** (may take a few seconds for GPS)
4. **Explore the map** by clicking on markers
5. **View the list** by clicking the 📋 button (bottom right)
6. **Change radius** using the dropdown in the control panel
7. **Refresh location** by clicking the 📍 Refresh button

### UI Components

#### Control Panel (Top)

- **🏛️ Monument Scout**: App branding
- **📍 Refresh**: Update your current location
- **Radius Selector**: Choose search distance (1-25km)

#### Monument List Sidebar (Right)

- **Ranked list** of nearby attractions
- **Distance** from your location
- **Type** of attraction (museum, monument, etc.)
- **Click to zoom** to that location on the map

#### Map View

- **Blue marker**: Your current location
- **Red markers**: Tourist attractions
- **Click markers**: View details in popup
- **Zoom/Pan**: Standard map controls

---

## 🛠️ Technology Stack

### Frontend

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with custom properties
  - Glassmorphism effects
  - Backdrop blur filters
  - Smooth animations
  - Responsive design
- **JavaScript (ES6+)**: Client-side logic
  - Geolocation API
  - Fetch API for AJAX
  - Event-driven architecture

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web server framework
- **node-fetch**: HTTP client for API calls

### APIs & Libraries

- **Leaflet.js**: Interactive map library
- **OpenStreetMap**: Free map tiles
- **Overpass API**: OpenStreetMap query service

---

## 🎨 Design System

### Color Palette

```css
--primary-blue: #4285f4    /* Google Blue */
--primary-red: #ea4335     /* Marker Red */
--primary-green: #34a853   /* Success Green */
--primary-yellow: #fbbc04   /* Warning Yellow */
```

### Glassmorphism

```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.25);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Responsive Breakpoints

- **Mobile**: ≤ 480px
- **Tablet**: ≤ 768px
- **Desktop**: > 768px

---

## 🔧 Configuration

### Server Port

Default port is `3000`. To change:

```javascript
// server.js
const PORT = 3000; // Change this value
```

### Search Radius Limits

Maximum radius is capped at 50km:

```javascript
// server.js
const searchRadius = Math.min(parseInt(radius) || 5000, 50000);
```

### Geolocation Timeout

Default timeout is 30 seconds:

```javascript
// public/app.js
timeout: 30000, // milliseconds
```

---

## 📱 Mobile Optimization

### Features

- ✅ Touch-friendly buttons (min 48px)
- ✅ Viewport meta tag for proper scaling
- ✅ Full-screen sidebar on mobile
- ✅ Auto-close sidebar after selection
- ✅ Optimized font sizes
- ✅ Reduced motion support

### PWA Ready

The app is structured to be easily converted to a Progressive Web App:

- Service worker support (future)
- Manifest.json (future)
- Offline capability (future)
- Installable on mobile devices (future)

---

## 🌍 Supported Attraction Types

### Tourism

- 🏛️ Museums
- 🎨 Art galleries
- 🎭 Attractions
- 🖼️ Artwork installations
- 🌄 Viewpoints

### Historic

- 🗿 Monuments
- 🪦 Memorials
- 🏰 Castles
- 🏚️ Ruins
- ⚔️ Archaeological sites
- 🛡️ Forts
- 🗼 Towers

### Religious

- ⛪ Churches & Cathedrals
- 🕌 Mosques
- 🛕 Temples
- 🕍 Synagogues

### Other

- 🏮 Lighthouses
- ⛲ Fountains
- 🗽 Landmarks

---

## 🐛 Troubleshooting

### Location Not Working

- **Check browser permissions**: Ensure location access is allowed
- **Enable location services**: Turn on GPS/location on your device
- **Use HTTPS**: Some browsers require secure connection for geolocation
- **Wait longer**: GPS can take 10-30 seconds on first load

### No Monuments Found

- **Increase radius**: Try 10km or 25km instead of 5km
- **Different location**: Some areas have fewer mapped attractions
- **Check OpenStreetMap**: Verify data exists for your area

### Server Not Starting

- **Check port**: Ensure port 3000 is not in use
- **Install dependencies**: Run `npm install` again
- **Node version**: Verify Node.js v18+ is installed

### Map Not Loading

- **Internet connection**: Requires connection for map tiles
- **Firewall**: Check if OpenStreetMap is blocked
- **Browser console**: Check for JavaScript errors

---

## 🚧 Future Enhancements

### Phase 2 Features

- [ ] Monument detail modal with photos
- [ ] Favorites/bookmarking system
- [ ] Route drawing to selected monument
- [ ] Marker clustering for many results
- [ ] Manual location search
- [ ] Share functionality

### Phase 3 Features

- [ ] PWA with offline support
- [ ] Service worker for caching
- [ ] Geolocation tracking mode
- [ ] Custom map themes
- [ ] Multi-language support
- [ ] User reviews and ratings

### Phase 4 Features

- [ ] User accounts
- [ ] Trip planning
- [ ] Social features
- [ ] AR navigation
- [ ] Audio guides

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Use ES6+ JavaScript features
- Follow existing code formatting
- Add comments for complex logic
- Test on multiple browsers

---

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Monument Scout

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **OpenStreetMap Contributors**: For the amazing free map data
- **Leaflet.js**: For the excellent mapping library
- **Overpass API**: For providing OSM query capabilities
- **Google Design**: For color palette inspiration

---

## 📞 Contact & Support

- **GitHub**: [@manumezog](https://github.com/manumezog)
- **Repository**: [MonumentScout](https://github.com/manumezog/MonumentScout)
- **Issues**: [Report a bug](https://github.com/manumezog/MonumentScout/issues)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for explorers and history enthusiasts**

🏛️ **Monument Scout** - _Discover the world's ancient gems_

</div>
