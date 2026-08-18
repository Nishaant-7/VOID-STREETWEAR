function getAdminSession() {
  return window.VoidFirebaseStore ? window.VoidFirebaseStore.getSessionUser() : null;
}

function setAdminSession(user) {
  if (window.VoidFirebaseStore) window.VoidFirebaseStore.setSessionUser(user);
}

async function readUsersFromCloud() {
  if (!window.VoidFirebaseStore) return [];
  return window.VoidFirebaseStore.readArray('users', []);
}

async function writeUsersToCloud(users) {
  if (!window.VoidFirebaseStore) throw new Error('Firebase store helper is unavailable.');
  return window.VoidFirebaseStore.write('users', users);
}

const ADMIN_BOOTSTRAP_EMAIL = 'admin@void.com';
const ADMIN_BOOTSTRAP_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
const ADMIN_RECAPTCHA_SITE_KEY = '6LdR4oktAAAAAGwxxmP8WlmU2QteNX9tlT2fIPQP';
let adminRecaptchaId = null;

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function firebaseToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return Object.values(value).filter(Boolean);
}

function renderAdminRecaptcha() {
  if (adminRecaptchaId !== null || typeof grecaptcha === 'undefined') return;
  const container = document.getElementById('admin-recaptcha-container');
  if (!container) return;
  adminRecaptchaId = grecaptcha.render(container, { sitekey: ADMIN_RECAPTCHA_SITE_KEY });
}

window.onRecaptchaApiLoad = function() {
  window.reCaptchaReady = true;
  renderAdminRecaptcha();
};

function verifyAdminRecaptcha() {
  if (typeof grecaptcha === 'undefined' || adminRecaptchaId === null) return true;
  if (!grecaptcha.getResponse(adminRecaptchaId)) {
    alert('Please complete the security check before continuing.');
    return false;
  }
  return true;
}

async function handleAdminLogin(event) {
  event.preventDefault();
  if (!verifyAdminRecaptcha()) return;

  const email = document.getElementById('admin-login-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-login-password').value;
  const hashed = await hashPassword(password);
  const users = await readUsersFromCloud();
  let admin = users.find((user) => (user.email || '').toLowerCase() === email && user.pass === hashed && user.role === 'admin');

  // Preserve the existing bootstrap administrator, but persist it to Firebase on first successful use.
  if (!admin && email === ADMIN_BOOTSTRAP_EMAIL && hashed === ADMIN_BOOTSTRAP_HASH) {
    admin = {
      name: 'System Admin', username: 'admin', email: ADMIN_BOOTSTRAP_EMAIL,
      phone: '0123456789', address: 'VOID HQ, Seksyen 7', city: 'Shah Alam',
      state: 'Selangor', zip: '40000', role: 'admin', pass: hashed, blocked: false,
      createdAt: new Date().toISOString()
    };
    if (!users.some((user) => user.email === ADMIN_BOOTSTRAP_EMAIL && user.role === 'admin')) {
      users.push(admin);
      try {
        await writeUsersToCloud(users);
      } catch (error) {
        console.error('Firebase could not persist the bootstrap admin record:', error);
        alert('Admin login succeeded, but Firebase rejected the administrator record write. Update Firebase rules before creating or synchronizing accounts.');
      }
    }
  }

  if (!admin) {
    alert('Invalid administrator email or password.');
    if (typeof grecaptcha !== 'undefined' && adminRecaptchaId !== null) grecaptcha.reset(adminRecaptchaId);
    return;
  }
  if (admin.blocked) {
    alert('This administrator account is blocked.');
    return;
  }

  setAdminSession({ ...admin, role: 'admin' });
  window.location.replace('admin.html');
}

async function handleAdminCreate(event) {
  event.preventDefault();
  const current = getAdminSession();
  if (!current || current.role !== 'admin') {
    alert('Only an authenticated administrator can create another administrator account.');
    window.location.replace('admin-login.html');
    return;
  }

  const name = document.getElementById('admin-create-name').value.trim();
  const username = document.getElementById('admin-create-username').value.trim();
  const email = document.getElementById('admin-create-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-create-password').value;
  const confirm = document.getElementById('admin-create-confirm').value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!name || !username || !emailRegex.test(email)) return alert('Please complete all administrator details with a valid email.');
  if (!passwordRegex.test(password)) return alert('Password must be 8+ characters with uppercase, lowercase, number, and symbol.');
  if (password !== confirm) return alert('Passwords do not match.');

  const users = await readUsersFromCloud();
  if (users.some((user) => (user.email || '').toLowerCase() === email)) {
    alert('An account with this email already exists.');
    return;
  }

  const pass = await hashPassword(password);
  users.push({ name, username, email, pass, role: 'admin', blocked: false, createdAt: new Date().toISOString() });
  try {
    await writeUsersToCloud(users);
  } catch (error) {
    console.error('Firebase administrator creation failed:', error);
    alert('Administrator account could not be saved to Firebase. Check your Firebase Realtime Database rules.');
    return;
  }
  alert('Administrator account created in Firebase. You can now sign in from the admin login page.');
  window.location.replace('admin-login.html');
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderAdminRecaptcha, 500);
  const createGuard = document.body.dataset.adminCreate === 'true';
  if (createGuard) {
    const current = getAdminSession();
    if (!current || current.role !== 'admin') window.location.replace('admin-login.html');
  }
});
