const API_BASE = '/api';

let allProperties = [];

/* ===== NAVBAR SCROLL ===== */
window.addEventListener("scroll", function(){
  const navbar = document.querySelector(".navbar");

  if(window.scrollY > 50){
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* ===== FETCH PROPERTIES ===== */
async function fetchAllProperties(){

  const loading = document.getElementById('loading');
  const results = document.getElementById('results');

  if(loading) loading.style.display='block';
  if(results) results.innerHTML='';

  try{

    const res = await fetch(`${API_BASE}/propiedades`);
    const data = await res.json();

    let properties = Array.isArray(data) ? data : data.data || [];

    if(properties.length === 0){
      properties = getMockProperties();
    }

    allProperties = properties;
    renderProperties(properties);

  }catch(e){

    console.log("Error, usando mock");

    const mock = getMockProperties();
    allProperties = mock;

    renderProperties(mock);

  }

  if(loading) loading.style.display='none';
}

/* ===== RENDER ===== */
function renderProperties(properties){

  const results = document.getElementById('results');

  results.innerHTML = `
  <div class="property-grid">
  ${properties.map(p=>`

  <div class="property-card" onclick='selectProperty(${JSON.stringify(p)})'>

    <div class="property-image-wrap">
      <img src="${p.imagen || 'https://picsum.photos/400/250'}" class="property-image">
      <div class="remax-badge">RE/MAX</div>
    </div>

    <div class="property-body">
      <div class="property-title">${p.titulo}</div>
      <div class="property-address"><img src="img/ubicacion.png" class="logo-img"> ${p.ubicacion}</div>
      <div class="property-price">$${p.precio}</div>
    </div>

  </div>

  `).join('')}
  </div>
  `;
}

/* ===== CLICK PROPERTY ===== */
function selectProperty(property){
  localStorage.setItem("selectedProperty", JSON.stringify(property));
  const propertyId = property?.propiedad_id || property?.id || "";
  if(propertyId){
    window.location.href = `property-detail.html?id=${encodeURIComponent(propertyId)}`;
  } else {
    window.location.href = "property-detail.html";
  }
}
/* ===== FILTROS ===== */
function applyFilters(){
  const btn = document.querySelector('.filter-btn-search');

  // 🔥 animación visual
  btn.classList.add('loading');

  setTimeout(() => {
    btn.classList.remove('loading');
  }, 600);

  if(!allProperties.length) return;

  let filtered = allProperties;

  const location = document.getElementById("searchLocation").value.toLowerCase();
  const price = document.getElementById("priceRange").value;
  const category = document.getElementById("category").value;

  if(location){
    filtered = filtered.filter(p => p.ubicacion.toLowerCase().includes(location));
  }

  if(price){
    filtered = filtered.filter(p=>{
      if(price==="1") return p.precio<=1000000;
      if(price==="2") return p.precio<=3000000;
      if(price==="3") return p.precio>3000000;
    });
  }

  if(category){
    filtered = filtered.filter(p=>p.tipo===category);
  }

  renderProperties(filtered);
}

/* ===== MOCK ===== */
function getMockProperties(){
  return[
    {titulo:"Casa en Durango",ubicacion:"Durango",precio:2500000,tipo:"casa",imagen:"https://picsum.photos/400/250?1"},
    {titulo:"Departamento CDMX",ubicacion:"CDMX",precio:1800000,tipo:"departamento",imagen:"https://picsum.photos/400/250?2"},
    {titulo:"Terreno Monterrey",ubicacion:"Monterrey",precio:900000,tipo:"terreno",imagen:"https://picsum.photos/400/250?3"}
  ];
}


/* ===== INIT ===== */
window.onload = fetchAllProperties;
