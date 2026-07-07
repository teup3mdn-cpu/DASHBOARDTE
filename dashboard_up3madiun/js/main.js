/* ================= AUTO-SAVE LINK & AUTO-REFRESH ================= */
const AUTO_STORAGE_KEY = 'up3madiun_dash_links_v1';
const AUTO_REFRESH_MS = 5 * 60 * 1000; // refresh data setiap 5 menit

const AUTO_TABS = [
  { urlId:'susut_url', loadFn:()=>susutLoad() },
  { urlId:'kwh_url',   loadFn:()=>kwhLoad() },
  { urlId:'comp_url',  loadFn:()=>compLoad() },
  { urlId:'pra_url',   loadFn:()=>praLoad() },
  { urlId:'gm_url',    loadFn:()=>gmLoad() },
  { urlId:'prog_url',  loadFn:()=>progLoad() },
];

function getSavedLinks(){
  try{ return JSON.parse(localStorage.getItem(AUTO_STORAGE_KEY) || '{}'); }
  catch(e){ return {}; }
}
function saveLink(urlId, url){
  const links = getSavedLinks();
  if(url){ links[urlId] = url; } else { delete links[urlId]; }
  localStorage.setItem(AUTO_STORAGE_KEY, JSON.stringify(links));
}

let charts = {};
function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

AUTO_TABS.forEach(({urlId})=>{
  const input = document.getElementById(urlId);
  if(!input) return;
  input.addEventListener('change', ()=> saveLink(urlId, input.value.trim()));
});
document.querySelectorAll('.config button:not(.secondary)').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const input = btn.parentElement.querySelector('input[id$="_url"]');
    if(input && input.value.trim()) saveLink(input.id, input.value.trim());
  });
});

function refreshBadge(msg){
  let el = document.getElementById('auto_refresh_badge');
  if(!el){
    el = document.createElement('div');
    el.id = 'auto_refresh_badge';
    el.style.cssText = 'position:fixed;bottom:14px;right:14px;background:#0d2a4a;color:#fff;font-size:11px;font-weight:600;padding:7px 12px;border-radius:20px;box-shadow:0 4px 14px rgba(13,42,74,.25);z-index:999;font-family:Inter,sans-serif;opacity:.92;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

async function autoLoadAll(isInitial){
  const links = getSavedLinks();
  const tabsWithLink = AUTO_TABS.filter(t => links[t.urlId]);
  if(!tabsWithLink.length) return;
  if(isInitial){
    tabsWithLink.forEach(({urlId})=>{
      const input = document.getElementById(urlId);
      if(input) input.value = links[urlId];
    });
  }
  refreshBadge('🔄 Memuat ulang data...');
  for(const {urlId, loadFn} of tabsWithLink){
    try{ await loadFn(); } catch(e){ /* status sudah ditangani masing-masing Load() */ }
  }
  const now = new Date();
  refreshBadge('✓ Data terbaru — ' + now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}));
}

window.addEventListener('DOMContentLoaded', ()=>{ autoLoadAll(true); });
setInterval(()=>autoLoadAll(false), AUTO_REFRESH_MS);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') autoLoadAll(false); });
