# 🏛️ Monument Scout: Your Local Landmark Guide

## 👋 Welcome!

Monument Scout is a simple, secure web application that uses modern mapping technology to quickly find and rank the most popular tourist attractions and monuments near your current location.

This project demonstrates a best-practice, two-part architecture to protect sensitive API keys while providing a fast, interactive map experience.

### ✨ Highlights

- **Location-Aware:** Automatically centers the map on your device's location using the HTML5 Geolocation API.
- **Proximity Ranking:** Finds and displays monuments and popular Points of Interest (POI) within a 5km radius.
- **Secure Architecture:** Uses a Node.js/Express server to securely handle all external API calls, ensuring your private keys are never exposed in the browser.
- **Cost-Effective Mapping:** Built using the lightweight **Leaflet.js** map library and the generous free-tier APIs from **LocationIQ** (an OpenStreetMap-based service).

## 🚀 Getting Started

This project is split into a secure backend (Node.js) and a static frontend (HTML/JavaScript).

### Prerequisites

To run this application locally, you will need:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- A free API key from **LocationIQ**.

### 1. Project Setup

First, clone the repository and install the necessary Node.js packages:

```bash
# Clone the repository
git clone [YOUR_REPO_URL]
cd monument-scout

# Install Node.js dependencies (Express, dotenv, and node-fetch)
npm install express dotenv node-fetch
```
