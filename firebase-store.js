(() => {
  const SESSION_KEY = 'void_current_user';
  const SENSITIVE_USER_FIELDS = [
    'pass', 'password', 'bank', 'card', 'cardNumber', 'expiry', 'cvv', 'cvc'
  ];

  function firebaseReady() {
    return !!(
      window.firebaseDb &&
      typeof window.dbRef === 'function' &&
      typeof window.dbGet === 'function' &&
      typeof window.dbSet === 'function' &&
      typeof window.dbOnValue === 'function'
    );
  }

  function authReady() {
    return !!(window.firebaseAuth && window.firebaseAuth.currentUser);
  }

  async function waitForAuth(timeoutMs = 8000) {
    if (authReady()) return true;
    if (window.firebaseAuthReady && typeof window.firebaseAuthReady.then === 'function') {
      await Promise.race([
        window.firebaseAuthReady,
        new Promise((resolve) => setTimeout(resolve, timeoutMs))
      ]);
      return authReady();
    }

    const started = Date.now();
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (authReady() || Date.now() - started >= timeoutMs) {
          clearInterval(timer);
          resolve(authReady());
        }
      }, 100);
    });
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

  function sanitizeUserRecord(user) {
    if (!user || typeof user !== 'object') return null;
    const clean = { ...user };
    SENSITIVE_USER_FIELDS.forEach((field) => delete clean[field]);
    return clean;
  }

  function dedupeSalesHistory(value) {
    const records = valuesAsArray(value);
    const latestByOrderId = new Map();
    records.forEach((record) => {
      if (!record || typeof record !== 'object' || !record.orderId) return;
      const orderId = String(record.orderId);
      const current = latestByOrderId.get(orderId);
      const recordTime = Number(record.updatedAt || record.createdAt || record.dispatchTime || record.deliveredAt || 0);
      const currentTime = current
        ? Number(current.updatedAt || current.createdAt || current.dispatchTime || current.deliveredAt || 0)
        : -1;
      const recordHasBatch = !!record.batchId;
      const currentHasBatch = !!current?.batchId;
      const recordStatus = String(record.status || '').toLowerCase();
      const currentStatus = String(current?.status || '').toLowerCase();
      const recordIsFinal = ['delivered', 'completed'].includes(recordStatus);
      const currentIsFinal = ['delivered', 'completed'].includes(currentStatus);
      const shouldReplace = !current
        || (recordHasBatch && !currentHasBatch)
        || (recordIsFinal && !currentIsFinal)
        || (recordTime > currentTime && !(currentIsFinal && !recordIsFinal));
      if (shouldReplace) latestByOrderId.set(orderId, record);
    });
    return Array.from(latestByOrderId.values());
  }

  function dedupeLorryBatches(value) {
    const records = valuesAsArray(value);
    const latestByBatchId = new Map();
    records.forEach((record) => {
      if (!record || typeof record !== 'object' || !record.batchId) return;
      const batchId = String(record.batchId);
      const current = latestByBatchId.get(batchId);
      const recordTime = Number(record.lastUpdatedAt || record.updatedAt || record.dispatchTime || record.createdAt || 0);
      const currentTime = current
        ? Number(current.lastUpdatedAt || current.updatedAt || current.dispatchTime || current.createdAt || 0)
        : -1;
      if (!current || recordTime >= currentTime) latestByBatchId.set(batchId, record);
    });
    return Array.from(latestByBatchId.values());
  }

  function stableRecordKey(record, fallbackPrefix = 'record') {
    const raw = record && (
      record.uid || record.orderId || record.notificationId || record.batchId || record.slideId || record.id || record.email
    );
    return String(raw || `${fallbackPrefix}_${Date.now()}_${Math.random()}`)
      .replace(/[.#$\[\]/]/g, '_');
  }

  function currentAuthUser() {
    return window.firebaseAuth && window.firebaseAuth.currentUser
      ? window.firebaseAuth.currentUser
      : null;
  }

  function currentSessionUser() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function isCurrentSessionAdmin() {
    return currentSessionUser()?.role === 'admin';
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
    if (path === 'users' && !isCurrentSessionAdmin()) {
      const authUser = currentAuthUser();
      if (!authUser) return fallback;
      const ownUser = await read(`users/${authUser.uid}`, null);
      return ownUser ? [ownUser] : fallback;
    }
    return valuesAsArray(await read(path, fallback));
  }

  async function writeUserCollection(users) {
    const list = valuesAsArray(users)
      .map(sanitizeUserRecord)
      .filter(Boolean);
    const authUser = currentAuthUser();
    const writable = isCurrentSessionAdmin()
      ? list
      : list.filter((user) => authUser && user.uid === authUser.uid);

    await Promise.all(writable.map((user) => {
      const uid = stableRecordKey(user, 'user');
      return window.dbSet(
        window.dbRef(window.firebaseDb, `users/${uid}`),
        { ...user, uid }
      );
    }));

    return list;
  }

  async function writeSalesHistoryCollection(orders) {
    const list = dedupeSalesHistory(orders);
    const authUser = currentAuthUser();
    const isAdmin = isCurrentSessionAdmin();
    const writable = isAdmin
      ? list
      : list.filter((order) => authUser && order.customerUid === authUser.uid);

    await Promise.all(writable.map((order) => {
      const key = stableRecordKey(order, 'order');
      return window.dbSet(
        window.dbRef(window.firebaseDb, `sales_history/${key}`),
        { ...order, orderId: order.orderId || key }
      );
    }));

    return orders;
  }

  async function writeLorryBatchesCollection(batches) {
    const list = valuesAsArray(batches);
    const authUser = currentAuthUser();
    const isAdmin = isCurrentSessionAdmin();
    const writable = isAdmin
      ? list
      : list.filter((batch) => authUser && batch.createdByUid === authUser.uid);

    await Promise.all(writable.map((batch) => {
      const key = stableRecordKey(batch, 'batch');
      return window.dbSet(
        window.dbRef(window.firebaseDb, `lorry_batches/${key}`),
        { ...batch, batchId: batch.batchId || key }
      );
    }));

    return batches;
  }

  async function writeHeroSlidesCollection(slides) {
    if (!isCurrentSessionAdmin() || !currentAuthUser()) {
      throw new Error('Administrator Firebase authentication is not ready for Hero Slides synchronization.');
    }

    const list = valuesAsArray(slides).map((slide, index) => ({
      ...(slide || {}),
      slideId: stableRecordKey({ slideId: slide?.slideId || slide?.id || `slide_${index + 1}` }, 'slide'),
      sortOrder: index,
      updatedAt: Date.now()
    }));
    const keyedSlides = {};
    list.forEach((slide) => {
      keyedSlides[slide.slideId] = slide;
    });

    await window.dbSet(
      window.dbRef(window.firebaseDb, 'hero_slides'),
      keyedSlides
    );
    return list;
  }

  async function writeNotificationsCollection(notifications) {
    const list = valuesAsArray(notifications);
    const authUser = currentAuthUser();
    const isAdmin = isCurrentSessionAdmin();
    const email = authUser?.email?.toLowerCase() || '';
    const writable = isAdmin
      ? list
      : list.filter((notification) => String(notification.userId || '').toLowerCase() === email);

    await Promise.all(writable.map((notification, index) => {
      const key = stableRecordKey(notification, `notification_${index}`);
      return window.dbSet(
        window.dbRef(window.firebaseDb, `notifications/${key}`),
        { ...notification, notificationId: notification.notificationId || key }
      );
    }));

    return notifications;
  }

  async function write(path, value) {
    const ready = await waitForFirebase();
    if (!ready) throw new Error('Firebase is not available. Cloud data was not written.');

    if (path === 'users') return writeUserCollection(value);
    if (path === 'hero_slides') return writeHeroSlidesCollection(value);
    if (path === 'sales_history') return writeSalesHistoryCollection(value);
    if (path === 'lorry_batches') return writeLorryBatchesCollection(value);
    if (path === 'notifications') return writeNotificationsCollection(value);

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
    return currentSessionUser();
  }

  function setSessionUser(user) {
    if (user) {
      const clean = sanitizeUserRecord(user);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(clean));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  window.VoidFirebaseStore = {
    firebaseReady,
    authReady,
    waitForAuth,
    waitForFirebase,
    read,
    readArray,
    write,
    subscribe,
    valuesAsArray,
    sanitizeUserRecord,
    dedupeSalesHistory,
    dedupeLorryBatches,
    currentAuthUser,
    getSessionUser,
    setSessionUser
  };
})();
