// ════════════════════════════════════════════════════════
// auth-router.js (ES Module)
// MORNING ROUND DIGITAL — PT. RISKI HARIYANTO
// Fokus: Konstanta global, state, autentikasi & navigasi
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// CONSTANTS — Exported for use in other modules
// ════════════════════════════════════════════════════════
export const ALL_SCREENS = [
  's-login','s-dashboard','s-form','s-success',
  's-history','s-detail','s-dept-head','s-verif',
  's-notif','s-profil','s-open-findings','s-close-finding',
  's-manager'
];

export const AREAS = [
  'Area Produksi Line 1','Area Produksi Line 2','Area Pengemasan',
  'Area Mixing / Blending','Gudang Bahan Baku','Gudang Produk Jadi',
  'Area QC Lab','Workshop Maintenance','Area Utilitas','Area HSE / K3',
  'Toilet & Kantin','Area Loading Dock'
];

export const ITEMS_5R = [
  { key:'ringkas', label:'Ringkas (Seiri)',   desc:'Bebas dari barang tidak diperlukan' },
  { key:'rapi',    label:'Rapi (Seiton)',     desc:'Setiap barang ada tempatnya yang jelas' },
  { key:'resik',   label:'Resik (Seiso)',     desc:'Area bersih, bebas debu & kotoran' },
  { key:'rawat',   label:'Rawat (Seiketsu)',  desc:'Peralatan terawat & standar terjaga' },
  { key:'rajin',   label:'Rajin (Shitsuke)',  desc:'Standar dijalankan secara konsisten' }
];

export const CATEGORIES  = ['Delivery','Quality','Safety','Efisiensi','Moral'];
export const DEPARTMENTS = ['IRGA','Produksi','Teknik / Maintenance','QC / QA','HSE','Gudang','Lainnya'];
export const PRIO_LABELS = { High:'Tinggi', Medium:'Sedang', Low:'Rendah' };
export const PRIO_DAYS   = { High: 1, Medium: 3, Low: 7 };

export const USERS = {
  petugas: {
    uid:'u1', displayName:'Riski Hariyanto', role:'petugas',
    email:'riski.hariyanto@riski-hariyanto.id', jabatan:'Petugas Produksi',
    initials:'RH', dept:'Produksi'
  },
  dept_head: {
    uid:'u2', displayName:'Yanti Puspita', role:'dept_head',
    email:'yanti.puspita@riski-hariyanto.id', jabatan:'Dept Head',
    initials:'YP', dept:'Produksi'
  },
  factory_manager: {
    uid:'u3', displayName:'Bapak Direktur', role:'factory_manager',
    email:'direktur@riski-hariyanto.id', jabatan:'Factory Manager',
    initials:'BD', dept:'Manajemen'
  }
};

// ════════════════════════════════════════════════════════
// STATE MANAGEMENT (Encapsulated with getters/setters)
// ════════════════════════════════════════════════════════
class AppState {
  constructor() {
    this.currentUser = null;
    this.cl5R = {};
    this.findingsData = {};
    this.extraFindings = [];
    this.photoData = { before: null, after: null };
    this.currentShift = 'PAGI';
    this.selectedReport = null;
    this.histFilter = 'today';
    this.findingsFilter = 'all';
    this.cfReportId = null;
    this.cfFindingKey = null;
    this.cfIsExtra = false;
    this.cfPhotoData = null;
    this.extraFindingIdCounter = 0;
  }

  // Getters & Setters for controlled access
  setCurrentUser(user) { this.currentUser = user; }
  getCurrentUser() { return this.currentUser; }
  
  setCl5R(data) { this.cl5R = data; }
  getCl5R() { return this.cl5R; }
  
  setFindingsData(data) { this.findingsData = data; }
  getFindingsData() { return this.findingsData; }
  
  setExtraFindings(data) { this.extraFindings = data; }
  getExtraFindings() { return this.extraFindings; }
  
  setPhotoData(data) { this.photoData = data; }
  getPhotoData() { return this.photoData; }
  
  setCurrentShift(shift) { this.currentShift = shift; }
  getCurrentShift() { return this.currentShift; }
  
  setSelectedReport(report) { this.selectedReport = report; }
  getSelectedReport() { return this.selectedReport; }
  
  setHistFilter(filter) { this.histFilter = filter; }
  getHistFilter() { return this.histFilter; }
  
  setFindingsFilter(filter) { this.findingsFilter = filter; }
  getFindingsFilter() { return this.findingsFilter; }
  
  // Close Finding State
  setCfReportId(id) { this.cfReportId = id; }
  getCfReportId() { return this.cfReportId; }
  
  setCfFindingKey(key) { this.cfFindingKey = key; }
  getCfFindingKey() { return this.cfFindingKey; }
  
  setCfIsExtra(isExtra) { this.cfIsExtra = isExtra; }
  getCfIsExtra() { return this.cfIsExtra; }
  
  setCfPhotoData(data) { this.cfPhotoData = data; }
  getCfPhotoData() { return this.cfPhotoData; }
  
  incrementExtraFindingId() { return ++this.extraFindingIdCounter; }
}

// Create singleton instance
export const appState = new AppState();

// ════════════════════════════════════════════════════════
// SCREEN NAVIGATION
// ════════════════════════════════════════════════════════
export function goTo(id) {
  // Interceptor: Redirect based on role
  if (id === 's-dashboard' && appState.currentUser) {
    if (appState.currentUser.role === 'factory_manager') {
      id = 's-manager';
      console.log('[Interceptor] Dashboard → s-manager (Factory Manager)');
    } else if (appState.currentUser.role === 'dept_head') {
      id = 's-dept-head';
      console.log('[Interceptor] Dashboard → s-dept-head (Dept Head)');
    }
  }

  // Hide all screens
  ALL_SCREENS.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.remove('active');
  });

  // Show target screen
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }

  console.log('[Navigation] → ' + id);
}

// ════════════════════════════════════════════════════════
// AUTHENTICATION
// ════════════════════════════════════════════════════════
export function doLogin() {
  const nama = document.getElementById('l-nama')?.value?.trim();
  const pin  = document.getElementById('l-pin')?.value?.trim();

  if (!nama) {
    toast('Nama lengkap harus diisi', 'red');
    return;
  }
  if (!pin || pin.length !== 4) {
    toast('PIN harus 4 digit', 'red');
    return;
  }

  let user = null;
  if (pin === '1111')      user = { ...USERS.petugas, displayName: nama };
  else if (pin === '5555') user = { ...USERS.dept_head, displayName: nama };
  else if (pin === '9999') user = { ...USERS.factory_manager, displayName: nama };
  else {
    toast('PIN salah!', 'red');
    return;
  }

  user.initials = nama.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  appState.setCurrentUser(user);
  
  toast(`Selamat datang, ${user.displayName}!`, 'green');
  goTo('s-dashboard');
}

export function quickLogin(role) {
  const user = USERS[role];
  if (!user) return;
  
  appState.setCurrentUser({...user});
  toast(`Login cepat: ${user.jabatan}`, 'green');
  goTo('s-dashboard');
}

export function doLogout() {
  if (!confirm('Yakin ingin keluar?')) return;
  
  // Reset state
  appState.setCurrentUser(null);
  appState.setCl5R({});
  appState.setFindingsData({});
  appState.setExtraFindings([]);
  appState.setPhotoData({ before: null, after: null });
  
  toast('Berhasil keluar', 'green');
  goTo('s-login');
}

// ════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════════════════
export function toast(msg, color = 'green') {
  const zone = document.getElementById('toast-zone');
  if (!zone) return;

  const t = document.createElement('div');
  t.className = 'toast-item';
  
  let bgColor = 'var(--neo-green)';
  let icon = '✓';
  
  if (color === 'red') {
    bgColor = 'var(--neo-red)';
    icon = '✗';
  } else if (color === 'yellow') {
    bgColor = 'var(--neo-yellow)';
    icon = '⚠';
  }
  
  t.style.background = bgColor;
  t.style.color = 'var(--neo-black)';
  t.style.borderColor = 'var(--neo-black)';
  t.innerHTML = `<span style="font-weight:700">${icon}</span><span style="flex:1">${msg}</span>`;
  
  zone.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ════════════════════════════════════════════════════════
// MODAL MANAGEMENT
// ════════════════════════════════════════════════════════
export function openModal(htmlContent) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  content.innerHTML = htmlContent;
  overlay.classList.add('open');
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function closeModalOutside(e) {
  if (e.target.id === 'modal-overlay') closeModal();
}

// ════════════════════════════════════════════════════════
// Expose to window for legacy compatibility (temporary)
// ════════════════════════════════════════════════════════
window.ALL_SCREENS = ALL_SCREENS;
window.AREAS = AREAS;
window.ITEMS_5R = ITEMS_5R;
window.CATEGORIES = CATEGORIES;
window.DEPARTMENTS = DEPARTMENTS;
window.PRIO_LABELS = PRIO_LABELS;
window.PRIO_DAYS = PRIO_DAYS;
window.USERS = USERS;
window.currentUser = null; // Will be synced from appState
window.currentShift = 'PAGI';
window.goTo = goTo;
window.doLogin = doLogin;
window.quickLogin = quickLogin;
window.doLogout = doLogout;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOutside = closeModalOutside;
