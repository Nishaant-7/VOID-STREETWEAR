function getAdminSession() {
  return window.VoidFirebaseStore
    ? window.VoidFirebaseStore.getSessionUser()
    : null;
}

function setAdminSession(user) {
  if (window.VoidFirebaseStore) {
    window.VoidFirebaseStore.setSessionUser(user);
  }
}

async function readAdminProfile(uid) {
  if (!window.VoidFirebaseStore || !uid) return null;
  return window.VoidFirebaseStore.read(`users/${uid}`, null);
}

async function findLegacyAdminProfileByEmail(email) {
  if (!window.VoidFirebaseStore || !email) return null;
  const users = await window.VoidFirebaseStore.read('users', {});
  const wantedEmail = String(email).trim().toLowerCase();
  const matches = Object.entries(users || {})
    .filter(([, record]) => {
      if (!record || typeof record !== 'object') return false;
      return String(record.email || '').trim().toLowerCase() === wantedEmail
        && String(record.role || '').toLowerCase() === 'admin';
    })
    .sort(([keyA], [keyB]) => {
      const numericA = /^\d+$/.test(keyA) ? Number(keyA) : Number.MAX_SAFE_INTEGER;
      const numericB = /^\d+$/.test(keyB) ? Number(keyB) : Number.MAX_SAFE_INTEGER;
      return numericA - numericB;
    });

  if (!matches.length) return null;
  const [legacyKey, legacyProfile] = matches[0];
  return { legacyKey, legacyProfile };
}

async function writeAdminProfile(profile) {
  if (!window.VoidFirebaseStore || !profile || !profile.uid) {
    throw new Error('Firebase store helper or administrator UID is unavailable.');
  }
  return window.VoidFirebaseStore.write('users', [profile]);
}

const ADMIN_BOOTSTRAP_EMAIL = 'admin@void.com';
const ADMIN_RECAPTCHA_SITE_KEY = '6LdR4oktAAAAAGwxxmP8WlmU2QteNX9tlT2fIPQP';
let adminRecaptchaId = null;

function renderAdminRecaptcha() {
  if (adminRecaptchaId !== null || typeof grecaptcha === 'undefined') return;
  const container = document.getElementById('admin-recaptcha-container');
  if (!container) return;
  adminRecaptchaId = grecaptcha.render(container, {
    sitekey: ADMIN_RECAPTCHA_SITE_KEY
  });
}

window.onRecaptchaApiLoad = function() {
  window.reCaptchaReady = true;
  renderAdminRecaptcha();
};

function verifyAdminRecaptcha() {
  if (typeof grecaptcha === 'undefined' || adminRecaptchaId === null) {
    return true;
  }

  if (!grecaptcha.getResponse(adminRecaptchaId)) {
    alert('Please complete the security check before continuing.');
    return false;
  }

  return true;
}

async function firebaseAdminSignIn(email, password) {
  if (!window.firebaseAuth || typeof window.signInWithEmailAndPassword !== 'function') {
    throw new Error('Firebase Email/Password Authentication is not available.');
  }

  try {
    return await window.signInWithEmailAndPassword(
      window.firebaseAuth,
      email,
      password
    );
  } catch (error) {
    // Allow the first bootstrap administrator to be created from the admin
    // page. Future administrator accounts must already exist in Firebase Auth.
    if (
      email !== ADMIN_BOOTSTRAP_EMAIL ||
      typeof window.createUserWithEmailAndPassword !== 'function'
    ) {
      throw error;
    }

    return window.createUserWithEmailAndPassword(
      window.firebaseAuth,
      email,
      password
    );
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  if (!verifyAdminRecaptcha()) return;

  const email = document.getElementById('admin-login-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-login-password').value;

  try {
    const credential = await firebaseAdminSignIn(email, password);
    const authUser = credential.user;
    const profile = await readAdminProfile(authUser.uid);

    const isBootstrap = email === ADMIN_BOOTSTRAP_EMAIL;
    const legacyMatch = !profile && isBootstrap
      ? await findLegacyAdminProfileByEmail(email)
      : null;
    const adminProfile = profile || (legacyMatch
      ? {
          ...legacyMatch.legacyProfile,
          uid: authUser.uid,
          legacyUserKey: legacyMatch.legacyKey,
          email,
          role: 'admin',
          blocked: false
        }
      : (isBootstrap
        ? {
            uid: authUser.uid,
            name: 'System Admin',
            username: 'admin',
            email,
            phone: '0123456789',
            address: 'VOID HQ, Seksyen 7',
            city: 'Shah Alam',
            state: 'Selangor',
            zip: '40000',
            role: 'admin',
            blocked: false,
            createdAt: new Date().toISOString()
          }
        : null));

    if (!adminProfile || adminProfile.role !== 'admin') {
      if (typeof window.signOut === 'function') {
        await window.signOut(window.firebaseAuth);
      }
      alert('This Firebase account is not registered as an administrator.');
      return;
    }

    if (adminProfile.blocked) {
      if (typeof window.signOut === 'function') {
        await window.signOut(window.firebaseAuth);
      }
      alert('This administrator account is blocked.');
      return;
    }

    if (!profile) {
      await writeAdminProfile(adminProfile);
    }

    setAdminSession({ ...adminProfile, uid: authUser.uid, role: 'admin' });
    window.location.replace('admin.html');
  } catch (error) {
    console.error('Firebase administrator login failed:', error);
    const code = String(error?.code || 'unknown');
    const detail = code === 'auth/email-already-in-use'
      ? 'This email already exists in Firebase Authentication. Use its Firebase password or reset it in Authentication → Users.'
      : code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
        ? 'Firebase rejected the email or password. Check Authentication → Users and reset the password if needed.'
        : code === 'auth/operation-not-allowed'
          ? 'Firebase Email/Password provider is disabled. Enable it in Authentication → Sign-in method.'
          : code === 'auth/network-request-failed'
            ? 'The browser could not reach Firebase. Check the internet connection and try again.'
            : error?.message || 'Firebase Authentication is not configured for this account.';
    alert(`Administrator login failed (${code}). ${detail}`);
  } finally {
    if (typeof grecaptcha !== 'undefined' && adminRecaptchaId !== null) {
      grecaptcha.reset(adminRecaptchaId);
    }
  }
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

  if (!name || !username || !emailRegex.test(email)) {
    alert('Please complete all administrator details with a valid email.');
    return;
  }
  if (!passwordRegex.test(password)) {
    alert('Password must be 8+ characters with uppercase, lowercase, number, and symbol.');
    return;
  }
  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  if (
    !window.firebaseAuth ||
    typeof window.createUserWithEmailAndPasswordSecondary !== 'function' ||
    typeof window.signInWithEmailAndPasswordSecondary !== 'function'
  ) {
    alert('The administrator creation Firebase bridge is not available. Please deploy the updated admin-create.html.');
    return;
  }

  let credential = null;
  let createdNewAuthAccount = false;
  let profileWritten = false;

  try {
    // Use a secondary Auth instance so creating the new account does not log out
    // the current administrator. The current administrator remains the caller
    // that is authorized to write users/<newUid>.
    try {
      credential = await window.createUserWithEmailAndPasswordSecondary(
        window.firebaseAdminCreateAuth,
        email,
        password
      );
      createdNewAuthAccount = true;
    } catch (createError) {
      // The previous version could create Auth successfully and fail at the
      // database step. Reuse that orphan Auth account when the password matches.
      if (createError?.code !== 'auth/email-already-in-use') throw createError;
      credential = await window.signInWithEmailAndPasswordSecondary(
        window.firebaseAdminCreateAuth,
        email,
        password
      );
    }

    if (window.VoidFirebaseStore?.waitForAuth) {
      const ready = await window.VoidFirebaseStore.waitForAuth();
      if (!ready || !window.firebaseAuth.currentUser) {
        throw new Error('The current administrator Firebase session is not ready.');
      }
    }

    const currentAuthProfile = await readAdminProfile(window.firebaseAuth.currentUser.uid);
    if (!currentAuthProfile || currentAuthProfile.role !== 'admin' || currentAuthProfile.blocked) {
      throw new Error('The current Firebase session is not an administrator. Sign out and log in again with the administrator account.');
    }

    const profile = {
      uid: credential.user.uid,
      name,
      username,
      email,
      role: 'admin',
      blocked: false,
      createdAt: new Date().toISOString()
    };

    await writeAdminProfile(profile);
    profileWritten = true;
    alert('Administrator account saved to Firebase Authentication and Realtime Database.');
    window.location.replace('admin.html');
  } catch (error) {
    console.error('Firebase administrator creation failed:', error);

    // Clean up only an Auth account created during this attempt. Never delete
    // an existing account that was being recovered from the previous failure.
    if (createdNewAuthAccount && !profileWritten && credential?.user && typeof window.deleteSecondaryUser === 'function') {
      try {
        await window.deleteSecondaryUser(credential.user);
      } catch (cleanupError) {
        console.warn('New Auth account cleanup failed; it can be recovered by retrying the same form.', cleanupError);
      }
    }

    const detail = error?.code === 'auth/invalid-credential'
      ? 'The email already exists, but the password is incorrect.'
      : error?.code === 'PERMISSION_DENIED'
        ? 'Firebase Rules rejected the profile write. Publish the corrected Rules first.'
        : error?.message === 'The current Firebase session is not an administrator. Sign out and log in again with the administrator account.'
          ? error.message
          : error?.message || 'Check Firebase Authentication and Realtime Database Rules.';
    alert(`Administrator account could not be saved. ${detail}`);
  } finally {
    if (window.firebaseAdminCreateAuth?.currentUser && typeof window.signOutSecondaryAdminAuth === 'function') {
      try {
        await window.signOutSecondaryAdminAuth(window.firebaseAdminCreateAuth);
      } catch (cleanupError) {
        console.warn('Secondary administrator Auth cleanup failed.', cleanupError);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderAdminRecaptcha, 500);

  const createGuard = document.body.dataset.adminCreate === 'true';
  if (createGuard) {
    const current = getAdminSession();
    if (!current || current.role !== 'admin') {
      window.location.replace('admin-login.html');
    }
  }
});
