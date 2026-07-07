/* ================= TAB 5: GANTI METER & AMRISASI ================= */
let gmData = [];
function gmRender(rows){
  const bKey = findKey(rows[0], ['bulan']);
  const tKey = findKey(rows[0], ['target']);
  const rKey = findKey(rows[0], ['realisasi']);
  if(!bKey||!tKey||!rKey){ setStatus('gm_status', false, 'Kolom Bulan/Target/Realisasi tidak ditemukan.'); return; }
  gmData = rows.map(r=>({bulan:r[bKey], target:num(r[tKey]), realisasi:num(r[rKey])})).filter(d=>d.bulan);
  gmRecalc();
  setStatus('gm_status', true, 'Data berhasil dimuat.');
}
function gmRecalc(){
  if(!gmData.length) return;
  const filled = gmData.filter(d => (d.target + d.realisasi) > 0);
  if(!filled.length) return;
  const last = filled[filled.length-1];
  const capaian = last.target ? (last.realisasi/last.target*100) : 0;
  const amrTarget = num(document.getElementById('gm_amr_target').value);
  const amrReal = num(document.getElementById('gm_amr_real').value);
  const amrCapaian = amrTarget ? (amrReal/amrTarget*100) : 0;
  document.getElementById('gm_kpi').innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Realisasi ganti meter (terakhir)</div><div class="kpi-value">${last.realisasi.toLocaleString('id-ID')} unit</div></div>
    <div class="kpi-card green"><div class="kpi-label">Target s.d periode ini</div><div class="kpi-value">${last.target.toLocaleString('id-ID')} unit</div></div>
    <div class="kpi-card ${capaian>=100?'green':'red'}"><div class="kpi-label">Persentase capaian</div><div class="kpi-value">${capaian.toFixed(2)}%</div></div>
    <div class="kpi-card purple"><div class="kpi-label">Realisasi amrisasi</div><div class="kpi-value">${amrReal.toLocaleString('id-ID')} unit</div><div class="kpi-sub">dari target ${amrTarget.toLocaleString('id-ID')} unit</div></div>
    <div class="kpi-card ${amrCapaian>=100?'green':'amber'}"><div class="kpi-label">Capaian amrisasi</div><div class="kpi-value">${amrCapaian.toFixed(2)}%</div></div>`;
  document.getElementById('gm_table').innerHTML = gmData.map(d=>{
    const c = d.target ? (d.realisasi/d.target*100) : 0;
    return `<tr><td>${d.bulan}</td><td>${d.target.toLocaleString('id-ID')}</td><td>${d.realisasi.toLocaleString('id-ID')}</td><td><span class="pill ${c>=100?'good':'bad'}">${c.toFixed(2)}%</span></td></tr>`;
  }).join('');
  destroyChart('gm_chart');
  charts['gm_chart'] = new Chart(document.getElementById('gm_chart'), {
    type:'line', data:{ labels:gmData.map(d=>d.bulan), datasets:[
      {label:'Target kumulatif', data:gmData.map(d=>d.target), borderColor:'#1f6fc6', tension:0.2},
      {label:'Realisasi kumulatif', data:gmData.map(d=>d.realisasi), borderColor:'#1c8a4a', tension:0.2}]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
  });
  showDash('gm');
}
async function gmLoad(){
  const url = document.getElementById('gm_url').value.trim();
  if(!url){ setStatus('gm_status', false, 'Masukkan link CSV terlebih dahulu.'); return; }
  setStatus('gm_status', true, 'Memuat data...');
  try{ gmRender(await fetchCSV(url)); } catch(e){ setStatus('gm_status', false, 'Gagal memuat: ' + e.message); }
}
function gmSample(){
  gmRender([
    {Bulan:'JAN', Target_Kumulatif:'1281', Realisasi_Kumulatif:'819'},
    {Bulan:'FEB', Target_Kumulatif:'3251', Realisasi_Kumulatif:'1638'},
    {Bulan:'MAR', Target_Kumulatif:'4768', Realisasi_Kumulatif:'2457'},
    {Bulan:'APR', Target_Kumulatif:'6521', Realisasi_Kumulatif:'4095'},
    {Bulan:'MEI', Target_Kumulatif:'7371', Realisasi_Kumulatif:'5733'},
    {Bulan:'JUN', Target_Kumulatif:'8750', Realisasi_Kumulatif:'8584'},
  ]);
}

