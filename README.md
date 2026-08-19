# ✦ ArtScape_India — Interactive Provenance Map of Indian Art

An interactive geospatial exploration of India's artistic evolution, archaeological milestones, and regional traditions spanning over 4,500 years.

## 🌟 Features

- **Interactive Geospatial Map**: Built with [Leaflet.js](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/), pinpointing 22 archaeological and regional origin sites across South Asia.
- **Dynamic Search & Filtering**: Filter artifacts in real-time by search query, historical era (*Ancient, Medieval, Mughal / Early Modern, Colonial & Modern, Folk & Tribal*), and geographic region.
- **Synchronized Provenance Directory**: Browse all origin locations in a visual directory; selecting any card smooth-zooms and highlights the marker on the map.
- **Rich Archival Records**: Full modal views detailing period, medium/technique, archaeological location, historical context, and significance.
- **Theme Support**: Seamless dark and light mode with persistent settings.
- **Zero Framework Dependencies**: Clean Vanilla HTML5, CSS3, and modern JavaScript.

## 🚀 How to Run Locally

You can open `index.html` directly in any modern browser, or run a lightweight local HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

## 📁 Repository Structure

```
ArtScape_India/
├── index.html            # Main web application entry point
├── css/
│   └── style.css         # Design tokens, Leaflet map styling, modal, responsive layout
├── js/
│   ├── map.js            # Leaflet map engine, search, filters & sidebar sync
│   ├── artifacts.js      # Curated dataset of 22 milestones and modal renderer
│   ├── modal.js          # Modal interaction handlers & keyboard navigation
│   └── main.js           # Theme toggle controller & local storage
├── data/
│   ├── locations.json    # Latitude & longitude coordinates for all sites
│   ├── artifacts.json    # Complete metadata catalog
│   └── periods.json      # Chronological historical eras
├── images/               # High-resolution artifact imagery with archive citations
└── README.md             # Project overview and documentation
```

## 📜 License & Attributions

- Map tiles &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Artifact images and documentation sourced from open public domain archives and Wikimedia Commons with individual licensing citations in each record.
