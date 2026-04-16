const API_BASE = '/api';

window.allProperties = [];

/* ===== NAVBAR SCROLL ===== */
window.addEventListener('scroll', function(){
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== FETCH PROPERTIES ===== */
async function fetchAllProperties(){
  const results = document.getElementById('results');
  if (!results) return;

  results.innerHTML = '<p style="padding:20px;color:#666;">Cargando propiedades...</p>';

  try {
    const res = await fetch(`${API_BASE}/propiedades`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let properties = Array.isArray(data) ? data : data.data || [];

    // Mapear campos extra del raw: operacion y propuesta
    if (data.raw?.data?.prop_data) {
      const rawMap = {};
      data.raw.data.prop_data.forEach(r => {
        rawMap[r.propiedad_id] = {
          operacion: r.operacion,
          // Solo guardar propuesta si el campo EXISTE en el objeto
          propuesta: 'propuesta' in r ? r.propuesta : undefined
        };
      });

      properties = properties.map(p => {
        const raw = rawMap[p.propiedad_id] || rawMap[p.id] || {};
        return {
          ...p,
          operacion: p.operacion || raw.operacion || '1',
          // Si raw tiene el campo propuesta, usarlo; si no, mantener el de p; si ninguno, undefined
          propuesta: 'propuesta' in raw ? raw.propuesta : p.propuesta
        };
      });
    }

    window.allProperties = properties;

    if (!properties.length) {
      results.innerHTML = '<p style="padding:20px;color:#666;">No se encontraron propiedades.</p>';
      return;
    }

    if (typeof renderProperties === 'function') {
      renderProperties(properties);
    }

  } catch(e) {
    console.error('Error al cargar propiedades:', e);
    results.innerHTML = `<p style="padding:20px;color:#c00;">Error al cargar propiedades. Verifica que el servidor esté corriendo.<br><small>${e.message}</small></p>`;
  }
}

/* ===== INIT ===== */
window.onload = fetchAllProperties;
