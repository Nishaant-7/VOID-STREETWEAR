(() => {
  const SESSION_KEY = 'void_current_user';

  function firebaseReady() {
    return !!(
      window.firebaseDb &&
      typeof window.dbRef === 'function' &&
      typeof window.dbGet === 'function' &&
      typeof window.dbSet === 'function' &&
      typeof window.dbOnValue === 'function'
    );
  }

  function waitForFirebase(timeoutMs = 10000) {
    if (firebaseReady()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (firebaseReady()) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() - started >= timeoutMs) {
          clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  }

  function valuesAsArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return Object.values(value).filter(Boolean);
  }

  async function read(path, fallback = null) {
    const ready = await waitForFirebase();
    if (!ready) return fallback;
    try {
      const snapshot = await window.dbGet(window.dbRef(window.firebaseDb, path));
      return snapshot.exists() ? snapshot.val() : fallback;
    } catch (error) {
      console.error(`Firebase read failed at /${path}:`, error);
      return fallback;
    }
  }

  async function readArray(path, fallback = []) {
    return valuesAsArray(await read(path, fallback));
  }

  async function write(path, value) {
    const ready = await waitForFirebase();
    if (!ready) throw new Error('Firebase is not available. Cloud data was not written.');
    await window.dbSet(window.dbRef(window.firebaseDb, path), value);
    return value;
  }

  function subscribe(path, callback) {
    const attach = () => {
      if (!firebaseReady()) {
        setTimeout(attach, 200);
        return;
      }
      window.dbOnValue(
        window.dbRef(window.firebaseDb, path),
        (snapshot) => callback(snapshot.exists() ? snapshot.val() : null, snapshot),
        (error) => console.error(`Firebase subscription failed at /${path}:`, error)
      );
    };
    attach();
  }

  function getSessionUser() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function setSessionUser(user) {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  window.VoidFirebaseStore = {
    firebaseReady,
    waitForFirebase,
    read,
    readArray,
    write,
    subscribe,
    valuesAsArray,
    getSessionUser,
    setSessionUser
  };
})();
