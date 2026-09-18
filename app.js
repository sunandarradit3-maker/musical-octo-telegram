const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'temuinhp.device.v1';
const CHECK_KEY = 'temuinhp.checklist.v1';

const fields = ['deviceName','phoneNumber','imei','lastSeen','notes'];
let lastReport = '';

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function getData() {
  return Object.fromEntries(fields.map(id => [id, $(id).value.trim()]));
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    fields.forEach(id => { if (typeof saved[id] === 'string') $(id).value = saved[id]; });
  } catch {}
}

function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  return digits;
}

$('deviceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
  toast('Data tersimpan lokal di browser ini.');
});

$('clearData').addEventListener('click', () => {
  if (!confirm('Hapus semua data perangkat yang tersimpan di browser ini?')) return;
  localStorage.removeItem(STORAGE_KEY);
  fields.forEach(id => $(id).value = '');
  $('reportOutput').value = '';
  lastReport = '';
  $('downloadReport').disabled = true;
  toast('Data lokal dihapus.');
});

$('privacyBtn').addEventListener('click', () => $('privacyDialog').showModal());

$('callBtn').addEventListener('click', () => {
  const phone = $('phoneNumber').value.trim();
  if (!phone) return toast('Isi nomor HP dulu.');
  window.location.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
});

$('waBtn').addEventListener('click', () => {
  const phone = normalizePhone($('phoneNumber').value);
  if (!phone) return toast('Isi nomor HP dulu.');
  const msg = encodeURIComponent('HP ini hilang. Jika Anda menemukan perangkat ini, mohon balas pesan ini atau hubungi pemiliknya. Terima kasih.');
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
});

$('mapsBtn').addEventListener('click', () => {
  const last = $('lastSeen').value.trim();
  if (!last) return toast('Isi lokasi terakhir terlihat dulu.');
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(last)}`, '_blank', 'noopener,noreferrer');
});

$('copyBtn').addEventListener('click', async () => {
  const d = getData();
  const text = [
    `Perangkat: ${d.deviceName || '-'}`,
    `Nomor: ${d.phoneNumber || '-'}`,
    `IMEI/serial: ${d.imei || '-'}`,
    `Terakhir terlihat: ${d.lastSeen || '-'}`,
    `Catatan: ${d.notes || '-'}`
  ].join('\n');
  try { await navigator.clipboard.writeText(text); toast('Data perangkat disalin.'); }
  catch { toast('Clipboard diblokir browser.'); }
});

const checks = [...document.querySelectorAll('#checklist input[type="checkbox"]')];
function updateProgress() {
  const done = checks.filter(c => c.checked).length;
  $('progressText').textContent = `${done}/${checks.length} selesai`;
  $('progressBar').style.width = `${(done / checks.length) * 100}%`;
  const state = Object.fromEntries(checks.map(c => [c.dataset.step, c.checked]));
  localStorage.setItem(CHECK_KEY, JSON.stringify(state));
}
function loadChecks() {
  try {
    const state = JSON.parse(localStorage.getItem(CHECK_KEY) || '{}');
    checks.forEach(c => c.checked = Boolean(state[c.dataset.step]));
  } catch {}
  updateProgress();
}
checks.forEach(c => c.addEventListener('change', updateProgress));

function makeReport() {
  const d = getData();
  const now = new Date();
  const text = `RINGKASAN LAPORAN KEHILANGAN PERANGKAT\n\nTanggal dibuat: ${now.toLocaleString('id-ID')}\nNama perangkat: ${d.deviceName || '-'}\nNomor telepon: ${d.phoneNumber || '-'}\nIMEI / nomor serial: ${d.imei || '-'}\nLokasi terakhir terlihat: ${d.lastSeen || '-'}\nCatatan/ciri perangkat: ${d.notes || '-'}\n\nTINDAKAN YANG SUDAH DILAKUKAN\n${checks.map((c, i) => `${c.checked ? '[x]' : '[ ]'} ${i + 1}. ${c.closest('label').querySelector('b').textContent.replace(/^\d+\.\s*/, '')}`).join('\n')}\n\nCatatan: Dokumen ini adalah ringkasan pribadi untuk membantu proses pelaporan. Sertakan bukti kepemilikan, tangkapan layar lokasi, dus/nota, atau dokumen lain bila tersedia.`;
  lastReport = text;
  $('reportOutput').value = text;
  $('downloadReport').disabled = false;
  return text;
}

$('generateReport').addEventListener('click', () => { makeReport(); toast('Ringkasan laporan dibuat.'); });
$('downloadReport').addEventListener('click', () => {
  if (!lastReport) makeReport();
  const blob = new Blob([lastReport], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'laporan-hp-hilang.txt';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

loadData();
loadChecks();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
