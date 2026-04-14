const API_BASE = '/api';

let allProperties = [];

/* ===== NAVBAR SCROLL ===== */
window.addEventListener("scroll", function(){
  const navbar = document.querySelector(".navbar");
  if(navbar){
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }
});

/* ===== FETCH PROPERTIES ===== */
async function fetchAllProperties(){
  const results = document.getElementById('results');
  if(!results) return;

  results.innerHTML = '<p style="padding:20px;color:#666;">Cargando propiedades...</p>';

  try {
    const res = await fetch(`${API_BASE}/propiedades`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    let properties = Array.isArray(data) ? data : data.data || [];

    allProperties = properties;

    if(properties.length === 0){
      results.innerHTML = '<p style="padding:20px;color:#666;">No se encontraron propiedades.</p>';
      return;
    }

    renderProperties(properties);

  } catch(e) {
    console.error("Error al cargar propiedades:", e);
    results.innerHTML = `<p style="padding:20px;color:#c00;">Error al cargar propiedades. Verifica que el servidor esté corriendo.<br><small>${e.message}</small></p>`;
  }
}

/* ===== RENDER ===== */
function renderProperties(properties){
  const results = document.getElementById('results');
  if(!results) return;

  if(!properties.length){
    results.innerHTML = '<p style="padding:20px;color:#666;">No hay propiedades que coincidan con tu búsqueda.</p>';
    return;
  }

  results.innerHTML = `
  <div class="property-grid">
  ${properties.map(p => `
    <div class="property-card" onclick='selectProperty(${JSON.stringify(p)})'>
      <div class="property-image-wrap">
        <img src="${p.imagen || 'https://cdn.remax.com.mx/properties/default_rebrand.jpg'}" class="property-image" onerror="this.src='https://cdn.remax.com.mx/properties/default_rebrand.jpg'">
        <div class="remax-badge">RE/MAX</div>
      </div>
      <div class="property-body">
        <div class="property-title">${p.titulo || 'Propiedad'}</div>
        <div class="property-address">
          <img src="img/ubicacion.png" class="logo-img"> ${p.ubicacion || 'N/D'}
        </div>
        <div class="property-price">
          ${Number(p.precio || 0).toLocaleString('es-MX', {style:'currency', currency:'MXN', maximumFractionDigits:0})}
        </div>
      </div>
    </div>
  `).join('')}
  </div>
  `;
}

/* ===== CLICK PROPIEDAD ===== */
function selectProperty(property){
  const propertyId = property?.propiedad_id || property?.id || "";
  if(propertyId){
    window.location.href = `property-detail.html?id=${encodeURIComponent(propertyId)}`;
  } else {
    window.location.href = "property-detail.html";
  }
}

/* ===== FILTROS ===== */
function applyFilters(){
  if(!allProperties.length) return;

  let filtered = [...allProperties];

  const location = (document.getElementById("searchLocation")?.value || "").toLowerCase();
  const price    = document.getElementById("priceRange")?.value || "";
  const category = document.getElementById("category")?.value || "";

  if(location){
    filtered = filtered.filter(p => (p.ubicacion || "").toLowerCase().includes(location));
  }

  if(price){
    filtered = filtered.filter(p => {
      if(price === "1") return p.precio <= 1000000;
      if(price === "2") return p.precio <= 3000000;
      if(price === "3") return p.precio > 3000000;
      return true;
    });
  }

  if(category){
    filtered = filtered.filter(p => (p.tipo || "").toLowerCase().includes(category));
  }

  renderProperties(filtered);
}

/* ===== INIT ===== */
window.onload = fetchAllProperties;
