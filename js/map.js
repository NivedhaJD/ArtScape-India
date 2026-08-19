/**
 * map.js — Interactive Leaflet.js Map with dynamic search, filtering, directory sync, and detail views
 */

(function() {
  const info = document.getElementById("mapInfo");
  const mapContainer = document.getElementById("leafletMap");
  const eraFilter = document.getElementById("eraFilter");
  const regionFilter = document.getElementById("regionFilter");
  const countBadge = document.getElementById("artifactCountBadge");
  const resetBtn = document.getElementById("resetMapBtn");
  const directoryContainer = document.getElementById("pinsDirectory");

  if (!mapContainer) return;

  // Initialize Leaflet map centered over India
  const map = L.map("leafletMap", {
    center: [21.5, 78.9629],
    zoom: 5,
    minZoom: 4,
    maxZoom: 14,
    scrollWheelZoom: true
  });

  // Base OpenStreetMap tiles (graceful online overlay)
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmTileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 18,
    opacity: 0.85
  }).addTo(map);

  // Offline Vector GeoJSON Base Layer (Indian Subcontinent & States)
  let geoLayer = null;
  function getGeoStyle(feature) {
    const isLight = document.documentElement.dataset.theme === "light";
    const isState = feature.properties && feature.properties.type === "state";
    if (isState) {
      return {
        fillColor: "transparent",
        weight: 0.8,
        opacity: isLight ? 0.45 : 0.6,
        color: isLight ? "#9b7aa0" : "#d4a017",
        dashArray: "3, 4",
        fillOpacity: 0
      };
    }
    return {
      fillColor: isLight ? "#ece2ce" : "#241040",
      weight: 1.5,
      opacity: 0.9,
      color: isLight ? "#a8843c" : "#d4a017",
      fillOpacity: isLight ? 0.92 : 0.88
    };
  }


  if (window.subcontinentGeoJSON) {
    geoLayer = L.geoJSON(window.subcontinentGeoJSON, {
      style: getGeoStyle,
      onEachFeature: function(feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, {
            sticky: true,
            className: "map-geo-tooltip",
            direction: "top"
          });
        }
      }
    }).addTo(map);
  }

  // Update vector styles on dark/light theme switch
  const themeObserver = new MutationObserver(() => {
    if (geoLayer) geoLayer.setStyle(getGeoStyle);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const defaultLocations = [
    { artifactId: "dancing-girl", lat: 27.3243, lng: 68.1376, label: "Mohenjo-daro (Sindh)" },
    { artifactId: "lion-capital", lat: 25.3700, lng: 83.0243, label: "Sarnath, Uttar Pradesh" },
    { artifactId: "sanchi-stupa", lat: 23.4793, lng: 77.7394, label: "Sanchi, Madhya Pradesh" },
    { artifactId: "sarnath-buddha", lat: 25.3850, lng: 83.0300, label: "Sarnath, Uttar Pradesh" },
    { artifactId: "ajanta", lat: 20.5519, lng: 75.7033, label: "Ajanta, Maharashtra" },
    { artifactId: "elephanta-caves", lat: 18.9633, lng: 72.9315, label: "Elephanta Island, Maharashtra" },
    { artifactId: "kailasa-temple", lat: 20.0261, lng: 75.1799, label: "Ellora, Maharashtra" },
    { artifactId: "nataraja", lat: 11.0168, lng: 76.9558, label: "Tamil Nadu" },
    { artifactId: "brihadeeswarar-temple", lat: 10.7828, lng: 79.1318, label: "Thanjavur, Tamil Nadu" },
    { artifactId: "khajuraho", lat: 24.8519, lng: 79.9199, label: "Khajuraho, Madhya Pradesh" },
    { artifactId: "konark-sun-temple", lat: 19.8876, lng: 86.0945, label: "Konark, Odisha" },
    { artifactId: "hampi-stone-chariot", lat: 15.3350, lng: 76.4600, label: "Hampi, Karnataka" },
    { artifactId: "mughal-miniature", lat: 27.1767, lng: 78.0081, label: "Agra / Mughal courts" },
    { artifactId: "rajput-miniature", lat: 26.9124, lng: 75.7873, label: "Rajasthan" },
    { artifactId: "kangra-painting", lat: 32.1024, lng: 76.2673, label: "Kangra, Himachal Pradesh" },
    { artifactId: "bharat-mata", lat: 22.5726, lng: 88.3639, label: "Kolkata, Bengal" },
    { artifactId: "company-painting", lat: 22.5800, lng: 88.3800, label: "Calcutta / various centres" },
    { artifactId: "amrita-sher-gil", lat: 28.6139, lng: 77.2090, label: "NGMA, New Delhi" },
    { artifactId: "progressive-artists-group", lat: 18.9388, lng: 72.8258, label: "Bombay (Mumbai)" },
    { artifactId: "madhubani-painting", lat: 26.3634, lng: 86.0719, label: "Mithila region, Bihar" },
    { artifactId: "warli-painting", lat: 19.9975, lng: 72.9966, label: "Maharashtra (Dahanu area)" },
    { artifactId: "contemporary", lat: 19.0760, lng: 72.8777, label: "Mumbai / International" }
  ];

  let rawLocations = [];
  let currentMarkersGroup = L.featureGroup().addTo(map);
  let markersMap = {};

  function populateRegionDropdown(artifacts) {
    if (!regionFilter) return;
    const regions = Array.from(new Set(artifacts.map(a => a.region).filter(Boolean))).sort();
    regionFilter.innerHTML = '<option value="all">All Regions</option>' + 
      regions.map(r => `<option value="${r}">${r}</option>`).join("");
  }

  function getFilteredItems() {
    const selectedEra = eraFilter ? eraFilter.value : "all";
    const selectedRegion = regionFilter ? regionFilter.value : "all";

    return rawLocations.filter(loc => {
      const artifact = (window.artifacts || []).find(a => a.id === loc.artifactId);
      if (!artifact) return false;

      // Era filter
      if (selectedEra !== "all") {
        if (selectedEra === "Mughal") {
          if (!artifact.era.includes("Mughal") && !artifact.period.includes("Mughal") && !artifact.period.includes("Rajput") && !artifact.period.includes("Pahari")) return false;
        } else if (!artifact.era.toLowerCase().includes(selectedEra.toLowerCase())) {
          return false;
        }
      }

      // Region filter
      if (selectedRegion !== "all" && artifact.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }

  function selectArtifactOnMap(artifactId, shouldPan = true) {
    const loc = rawLocations.find(l => l.artifactId === artifactId);
    const artifact = (window.artifacts || []).find(a => a.id === artifactId);
    if (!loc || !artifact) return;

    if (info) {
      info.innerHTML = `
        <div class="map-info-content">
          ${artifact.imageUrl 
            ? `<div class="map-info-img-wrap"><img src="${artifact.imageUrl}" alt="${artifact.title}" class="map-info-img"></div>` 
            : `<div class="map-info-visual" style="background:linear-gradient(135deg, ${artifact.tone1}, ${artifact.tone2})">${artifact.symbol}</div>`}
          <div class="map-info-body">
            <span class="tag">${artifact.region} · ${artifact.era}</span>
            <h2>${artifact.title}</h2>
            <p class="map-info-meta"><strong>📍 ${loc.label}</strong> · ${artifact.date}</p>
            <p class="map-info-desc">${artifact.description}</p>
            <div class="map-info-pills">
              <span class="pill"><strong>Medium:</strong> ${artifact.medium}</span>
              <span class="pill"><strong>Period:</strong> ${artifact.period}</span>
            </div>
            <div class="map-info-actions">
              <button class="btn btn-primary" onclick="openArtifact('${artifact.id}')">Explore full archive record →</button>
            </div>
          </div>
        </div>
      `;
    }

    // Highlight active card in directory
    document.querySelectorAll(".pin-dir-card").forEach(c => {
      c.classList.toggle("active", c.dataset.id === artifactId);
    });

    const marker = markersMap[artifactId];
    if (marker) {
      if (shouldPan) {
        map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
      }
      marker.openPopup();
    }
  }

  window.selectArtifactOnMap = selectArtifactOnMap;

  function renderDirectory(filteredLocations) {
    if (!directoryContainer) return;
    if (filteredLocations.length === 0) {
      directoryContainer.innerHTML = `
        <div class="empty-state">
          <p>No locations found matching your filter criteria.</p>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('eraFilter').value='all'; document.getElementById('regionFilter').value='all'; window.applyMapFilters();">Clear all filters</button>
        </div>
      `;
      return;
    }

    directoryContainer.innerHTML = filteredLocations.map((loc, idx) => {
      const artifact = (window.artifacts || []).find(a => a.id === loc.artifactId);
      if (!artifact) return "";
      return `
        <div class="pin-dir-card" data-id="${artifact.id}" onclick="selectArtifactOnMap('${artifact.id}', true)">
          <div class="pin-dir-thumb">
            ${artifact.imageUrl 
              ? `<img src="${artifact.imageUrl}" alt="${artifact.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                 <div class="pin-dir-fallback" style="background:linear-gradient(135deg,${artifact.tone1},${artifact.tone2});display:none">${artifact.symbol}</div>`
              : `<div class="pin-dir-fallback" style="background:linear-gradient(135deg,${artifact.tone1},${artifact.tone2})">${artifact.symbol}</div>`}
            <span class="pin-badge-number" style="background:${artifact.tone1 || '#a36b2c'}">${idx + 1}</span>
          </div>
          <div class="pin-dir-content">
            <span class="tag tag-sm">${artifact.era}</span>
            <h4>${artifact.title}</h4>
            <p class="pin-dir-location">📍 ${loc.label}</p>
            <span class="date">${artifact.date}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderMarkers() {
    currentMarkersGroup.clearLayers();
    markersMap = {};

    const filtered = getFilteredItems();

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${rawLocations.length} locations`;
    }

    filtered.forEach((loc, index) => {
      const artifact = (window.artifacts || []).find(a => a.id === loc.artifactId);
      if (!artifact) return;

      const markerHtml = `
        <div class="custom-map-pin" style="--pin-color: ${artifact.tone1 || '#a36b2c'};" title="${artifact.title}">
          <span>${index + 1}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-div-icon',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(currentMarkersGroup);
      markersMap[artifact.id] = marker;

      const popupHtml = `
        <div class="map-popup-card">
          ${artifact.imageUrl ? `<img src="${artifact.imageUrl}" alt="${artifact.title}" class="map-popup-img">` : ''}
          <div class="map-popup-info">
            <span class="tag">${artifact.era}</span>
            <h4>${artifact.title}</h4>
            <p><small>📍 ${loc.label} · ${artifact.date}</small></p>
            <button class="btn btn-sm btn-primary" onclick="openArtifact('${artifact.id}')">View Details</button>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        selectArtifactOnMap(artifact.id, false);
      });
    });

    renderDirectory(filtered);

    if (filtered.length) {
      map.fitBounds(currentMarkersGroup.getBounds().pad(0.12));
    }
  }

  function applyMapFilters() {
    renderMarkers();
  }

  window.applyMapFilters = applyMapFilters;

  // Event Listeners
  if (eraFilter) {
    eraFilter.addEventListener("change", applyMapFilters);
  }
  if (regionFilter) {
    regionFilter.addEventListener("change", applyMapFilters);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (eraFilter) eraFilter.value = "all";
      if (regionFilter) regionFilter.value = "all";
      applyMapFilters();
      if (currentMarkersGroup.getLayers().length) {
        map.fitBounds(currentMarkersGroup.getBounds().pad(0.12));
      }
    });
  }

  // Load locations from JSON or fallback
  fetch("data/locations.json")
    .then(res => res.json())
    .then(data => {
      rawLocations = data;
      populateRegionDropdown(window.artifacts || []);
      renderMarkers();
    })
    .catch(() => {
      rawLocations = defaultLocations;
      populateRegionDropdown(window.artifacts || []);
      renderMarkers();
    });
})();
