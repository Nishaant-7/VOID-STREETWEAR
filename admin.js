/* VOID Streetwear application bundle. Generated from the original script with page-safe initialization. */
// State Management
function readStoredJson(key, fallback) {
  return fallback;
}

function getSessionUser() {
  return window.VoidFirebaseStore ? window.VoidFirebaseStore.getSessionUser() : null;
}

function setSessionUser(user) {
  if (window.VoidFirebaseStore) window.VoidFirebaseStore.setSessionUser(user);
}

function writeFirebase(path, value) {
  if (!window.VoidFirebaseStore) return Promise.reject(new Error('Firebase store helper is unavailable.'));
  return window.VoidFirebaseStore.write(path, value);
}

let registeredUsers = [];

let currentUser = getSessionUser();
let cart = [];

// ==========================================
// SECURITY: SHA-256 PASSWORD HASHING
// ==========================================
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SECURITY: XSS Sanitization
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

// Map Tracking & Route Optimization Globals
let currentDetailProductId = null;
let currentDetailSize = 'S';
let firebaseConfirmationResult = null; 
let uploadedImageData = { add: null, slide: null };
let salesChartInstance = null;
let signupChartInstance = null;
let categoryChartInstance = null;
let costAnalyticsChartInstance = null;
let costAnalyticsGranularity = 'month';

let otpState = {
  prefix: null,      
  channel: null,     
  target: null,       
  code: null,
  expiresAt: null,
  attempts: 0,
  resendTimerId: null
};

let leafletMap = null;
let mapMarker = null;
let historyPolyline = null;
let remainingPolyline = null;
let originMarker = null;
let destMarker = null;
let trackingInterval = null;
let trackingAnimFrame = null;
let currentTrackingOrder = null;
let trackingViewOrigin = 'customer';
let activeRouteMeta = null;

let lorryLegMetas = [];
let lorryStopMarkers = [];
let lorryHistoryPolylines = [];
let lorryFuturePolylines = [];
let trafficIncidentMarkers = [];
let congestionOverlayLines = [];

const RECAPTCHA_SITE_KEY = '6LdR4oktAAAAAGwxxmP8WlmU2QteNX9tlT2fIPQP';
const TOMTOM_API_KEY = '3u4VGyZ0WFCxdV08IKLFVW9DNHQjytBX';

let loginRecaptchaId = null;
let signupRecaptchaId = null;
let forgotRecaptchaId = null;

function onRecaptchaApiLoad() {
  if (typeof grecaptcha === 'undefined') return;

  if (document.getElementById('login-recaptcha-container') && loginRecaptchaId === null) {
    loginRecaptchaId = grecaptcha.render('login-recaptcha-container', { sitekey: RECAPTCHA_SITE_KEY });
  }
  if (document.getElementById('signup-recaptcha-container') && signupRecaptchaId === null) {
    signupRecaptchaId = grecaptcha.render('signup-recaptcha-container', { sitekey: RECAPTCHA_SITE_KEY });
  }
  if (document.getElementById('forgot-recaptcha-container') && forgotRecaptchaId === null) {
    forgotRecaptchaId = grecaptcha.render('forgot-recaptcha-container', { sitekey: RECAPTCHA_SITE_KEY });
  }
}

function verifyRecaptcha(widgetId) {
  if (typeof grecaptcha === 'undefined' || widgetId === null) {
    alert('Security check failed to load. Please check your connection and try again.');
    return false;
  }
  const response = grecaptcha.getResponse(widgetId);
  if (!response) {
    alert('Please complete the "I\'m not a robot" verification before continuing.');
    return false;
  }
  return true;
}

let activeRoutes = [];
let bestRouteIndex = 0;
let deliverySimulationProgress = 0;
let notifications = [];

const PENINSULAR_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan', 'Pahang',
  'Penang', 'Perak', 'Perlis', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya'
];

const STANDARD_VAN_MAX_STOPS = 20;  
const STANDARD_VAN_MAX_ITEMS = 55;  
const LORRY_LEG_MIN_SEC = 25;   
const LORRY_LEG_MAX_SEC = 55;   

const STANDARD_VAN_FLEET = [
  { type: 'Toyota Hiace Van (New Fleet 2026)', icon: 'fa-van-shuttle', consumptionLperKm: 0.110, tankCapacityL: 70 },
  { type: 'Ford Transit Van (New Fleet 2026)', icon: 'fa-truck-ramp-box', consumptionLperKm: 0.125, tankCapacityL: 80 },
];
const LORRY_FLEET = [
  { type: 'Isuzu NPR 3-Ton Lorry (New Fleet 2026)', icon: 'fa-truck', consumptionLperKm: 0.180, tankCapacityL: 100 },
  { type: 'Hino 300 Series Lorry (New Fleet 2026)', icon: 'fa-truck', consumptionLperKm: 0.205, tankCapacityL: 120 },
];
const LORRY_COURIERS = ['Razif Hakim', 'Chong Wei Jian', 'Suhaimi Bakar', 'Ravindran Muthu'];
const INSTANT_VEHICLE_FLEET = [
  { category: 'motorcycle', type: 'Instant Dispatch Motorcycle', icon: 'fa-motorcycle', consumptionLperKm: 0.025, tankCapacityL: 4.2, maxItems: 8, maxDistanceKm: 45 },
  { category: 'car', type: 'Instant Dispatch Car', icon: 'fa-car', consumptionLperKm: 0.070, tankCapacityL: 45, maxItems: 25, maxDistanceKm: 120 }
];

function chooseDispatchVehicle(order) {
  const requested = String(order?.dispatchVehicle?.category || '').toLowerCase();
  const quantity = Math.max(1, Number(order?.qty || 1));
  const distanceKm = Number(order?.distanceKm || order?.routeDistanceKm || 0) || 0;
  if (requested === 'motorcycle' || requested === 'car') {
    return INSTANT_VEHICLE_FLEET.find((vehicle) => vehicle.category === requested) || INSTANT_VEHICLE_FLEET[0];
  }
  if (quantity > INSTANT_VEHICLE_FLEET[0].maxItems || distanceKm > INSTANT_VEHICLE_FLEET[0].maxDistanceKm) {
    return INSTANT_VEHICLE_FLEET[1];
  }
  return INSTANT_VEHICLE_FLEET[0];
}

let lorryBatches = [];
let adminSalesLoaded = false;
let adminBatchesLoaded = false;

function saveLorryBatches() {
  if (window.VoidFirebaseStore?.dedupeLorryBatches) {
    lorryBatches = window.VoidFirebaseStore.dedupeLorryBatches(lorryBatches);
  }
  return writeFirebase('lorry_batches', lorryBatches)
    .catch((error) => console.error('Cloud Sync Error (Batches):', error));
}

const BULK_DISCOUNT_MIN_QTY = 4;   
const BULK_DISCOUNT_RATE = 0.10;   
const SPEND_DISCOUNT_MIN_SUBTOTAL = 350; 
const SPEND_DISCOUNT_RATE = 0.10;  
const MALAYSIA_SST_RATE = 0.06;    
const SHIPPING_FEE_RATE = { instant: 0.08, standard: 0.05 }; 
const FREE_SHIPPING_MIN_SUBTOTAL = 750; 

function getEffectivePrice(prod) {
  if (prod.promoPrice != null && prod.promoPrice > 0 && prod.promoPrice < prod.price) {
    return prod.promoPrice;
  }
  return prod.price;
}

function calculateOrderPricing(cartItems, deliveryMethod) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const bulkDiscount = totalQty > 3 ? subtotal * BULK_DISCOUNT_RATE : 0;
  const bulkDiscountLabel = `Bulk Discount (${Math.round(BULK_DISCOUNT_RATE * 100)}% off — ${totalQty} items)`;

  const spendDiscount = subtotal >= SPEND_DISCOUNT_MIN_SUBTOTAL ? subtotal * SPEND_DISCOUNT_RATE : 0;
  const spendDiscountLabel = `RM${SPEND_DISCOUNT_MIN_SUBTOTAL}+ Discount (${Math.round(SPEND_DISCOUNT_RATE * 100)}% off)`;

  let discount = 0;
  let discountLabel = '';
  if (spendDiscount > bulkDiscount) {
    discount = spendDiscount;
    discountLabel = spendDiscountLabel;
  } else if (bulkDiscount > 0) {
    discount = bulkDiscount;
    discountLabel = bulkDiscountLabel;
  }

  let instantSurcharge = 0;
  let instantSurchargeLabel = '';
  const freeShipping = subtotal >= FREE_SHIPPING_MIN_SUBTOTAL;
  if (!freeShipping && (deliveryMethod === 'instant' || deliveryMethod === 'standard')) {
    const rate = SHIPPING_FEE_RATE[deliveryMethod];
    instantSurcharge = subtotal * rate;
    instantSurchargeLabel = `${deliveryMethod === 'instant' ? 'Instant' : 'Standard'} Delivery Fee — additional ${Math.round(rate * 100)}% added`;
  } else if (freeShipping) {
    instantSurchargeLabel = `Free Shipping (order RM${FREE_SHIPPING_MIN_SUBTOTAL}+)`;
  }

  const taxableAmount = subtotal - discount + instantSurcharge;
  const sst = taxableAmount * MALAYSIA_SST_RATE;
  const total = taxableAmount + sst;

  return { subtotal, discount, discountLabel, instantSurcharge, instantSurchargeLabel, freeShipping, sst, total, totalQty };
}

const WIND_BREAKER_IMAGE = 'assets/windbreaker.jpg';

function normalizeProductImage(product) {
  if (!product || typeof product !== 'object') return product;
  if (Number(product.id) === 4 && (!product.image || String(product.image).includes('1548883354'))) {
    return { ...product, image: WIND_BREAKER_IMAGE };
  }
  return product;
}

let products = [
  {
    id: 1,
    name: 'VOID HEAVYWEIGHT HOODIE',
    price: 145.0,
    category: 'outerwear',
    sizeStock: { S: 5, M: 8, L: 8, XL: 4 },
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: '480GSM French Terry cotton. Oversized boxy fit with dropped shoulders and custom rubberized branding.',
  },
  {
    id: 2,
    name: 'CYBERPUNK CARGO PANTS',
    price: 120.0,
    category: 'bottoms',
    sizeStock: { S: 2, M: 5, L: 5, XL: 2 },
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    description: 'Technical multi-pocket cargo pants with adjustable bungee cords at ankles and water-resistant nylon finish.',
  },
  {
    id: 3,
    name: 'DECAY GRAPHIC TEE',
    price: 65.0,
    category: 'tops',
    sizeStock: { S: 10, M: 12, L: 12, XL: 6 },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    description: '100% carded vintage-wash cotton. Acid wash treatment with distressed collar and chest screenprint.',
  },
  {
    id: 4,
    name: 'ARCHITECTURAL WINDBREAKER',
    price: 180.0,
    category: 'outerwear',
    sizeStock: { S: 1, M: 3, L: 3, XL: 1 },
    image: 'assets/windbreaker.jpg',
    description: 'Lightweight ripstop shell with storm flap, YKK aqua-guard zippers, and reflective piping.',
  },
 ];

products = products.map(normalizeProductImage);

const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'];

function getTotalStock(prod) {
  if (!prod) return 0;
  if (prod.sizeStock) {
    return PRODUCT_SIZES.reduce((sum, s) => sum + (parseInt(prod.sizeStock[s]) || 0), 0);
  }
  return parseInt(prod.stock) || 0; 
}

function getSizeStock(prod, size) {
  if (!prod) return 0;
  if (prod.sizeStock) return parseInt(prod.sizeStock[size]) || 0;
  return parseInt(prod.stock) || 0; 
}

let heroSlides = [
  {
    title: 'URBAN DECAY DROP',
    subtitle: 'SS/26 TECHNICAL COLLECTION OUT NOW',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    btnText: 'SHOP THE DROP',
    linkType: 'shop',
    targetItemId: null
  },
  {
    title: 'HEAVYWEIGHT ESSENTIALS',
    subtitle: 'ARCHITECTURAL SILHOUETTES & CUSTOM HARDWARE',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    btnText: 'VIEW HOODIE',
    linkType: 'item',
    targetItemId: 1
  },
];

const SEED_DATA_VERSION = 'v3-seed-items-detail';
let salesHistoryData = [
  {
    orderId: 'ORD-9421',
    customerName: 'Muhammad Danish',
    customerEmail: 'danish@void.com',
    trackingNo: 'TRK-2026-9421',
    address: '45 Jalan Tun Mamat 94/35, 40470 Shah Alam, Selangor',
    lat: 3.0312,
    lng: 101.5165,
    qty: 2,
    items: 'VOID HEAVYWEIGHT HOODIE (Size L) (x1), DECAY GRAPHIC TEE (Size M) (x1)',
    itemsDetail: [
      { id: 1, name: 'VOID HEAVYWEIGHT HOODIE', size: 'L', qty: 1, price: 145.00 },
      { id: 3, name: 'DECAY GRAPHIC TEE', size: 'M', qty: 1, price: 65.00 }
    ],
    amount: 210.00,
    date: 'Jul 15, 2026, 14:20',
    status: 'Pending',
    sender: 'VOID Central Hub, Shah Alam',
    courier: 'Aiman Zikri',
    vehicleType: 'Yamaha Y15ZR Motorcycle',
    vehicleCategory: 'motorcycle',
    vehicleIcon: 'fa-motorcycle',
    consumptionRate: 0.025, 
    tankCapacity: 4.2,      
    plateNo: 'VAB 4821',
    eta: 'Pending Admin Dispatch',
  },
  ...generateSeedDeliveryHistory()
];

// CORE FIREBASE SYNC FUNCTIONS
function saveSalesHistory() {
  return writeFirebase('sales_history', salesHistoryData)
    .catch((error) => {
      console.error('Cloud Sync Error (Sales):', error);
      return null;
    });
}

function saveProductsToCloud() {
  return writeFirebase('products', products)
    .catch((error) => console.error('Cloud Sync Error (Products):', error));
}

function setAdminSyncStatus(message, isSuccess = false) {
  const statusEl = document.getElementById('hero-sync-status');
  if (!statusEl) return;
  statusEl.innerText = message;
  statusEl.style.color = isSuccess ? 'var(--success)' : 'var(--text-secondary)';
}

async function waitForAdminFirebaseAuth(timeoutMs = 8000) {
  const authReady = typeof window.VoidFirebaseStore?.waitForAuth === 'function'
    ? await window.VoidFirebaseStore.waitForAuth(timeoutMs)
    : !!window.VoidFirebaseStore?.currentAuthUser();
  const session = typeof getAdminSession === 'function'
    ? getAdminSession()
    : window.VoidFirebaseStore?.getSessionUser?.();
  return !!(authReady && window.VoidFirebaseStore?.currentAuthUser() && session?.role === 'admin');
}

function normalizeHeroSlides(slides) {
  return (Array.isArray(slides) ? slides : []).map((slide, index) => ({
    ...(slide || {}),
    slideId: slide?.slideId || `slide_${index + 1}`,
    sortOrder: index
  }));
}

async function saveSlidesToCloud(options = {}) {
  const authReady = await waitForAdminFirebaseAuth();
  if (!authReady) {
    setAdminSyncStatus('Firebase admin session is still restoring. Sign in again if synchronization does not recover.', false);
    return null;
  }

  heroSlides = normalizeHeroSlides(heroSlides);
  setAdminSyncStatus('SYNCING HERO SLIDES WITH FIREBASE…', false);

  try {
    const savedSlides = await writeFirebase('hero_slides', heroSlides);
    heroSlides = normalizeHeroSlides(savedSlides || heroSlides);
    renderAdminSlides();
    setAdminSyncStatus(`FIREBASE SYNCED • ${new Date().toLocaleTimeString('en-MY')}`, true);
    return savedSlides || heroSlides;
  } catch (error) {
    console.error('Cloud Sync Error (Slides):', error);
    setAdminSyncStatus('Firebase sync failed. Check the admin Firebase Auth session and Rules.', false);
    if (!options.silent) {
      alert(`Hero Slides could not be synchronized with Firebase: ${error.message}`);
    }
    return null;
  }
}

function saveUsersToCloud(usersArray) {
  registeredUsers = Array.isArray(usersArray) ? usersArray : [];
  return writeFirebase('users', registeredUsers)
    .catch((error) => console.error('Cloud Sync Error (Users):', error));
}

function saveNotificationsToCloud() {
  return writeFirebase('notifications', notifications)
    .catch((error) => {
      console.error('Cloud Sync Error (Notifications):', error);
      return null;
    });
}

function syncOrderStatusViews() {
  saveSalesHistory();
  if (typeof renderAdminSalesHistory === 'function') renderAdminSalesHistory();
  if (typeof renderMyOrders === 'function') renderMyOrders();
  if (typeof renderCostAnalytics === 'function') renderCostAnalytics();
}

function checkAndAutoCompleteDeliveries() {
  const now = Date.now();
  let anyChanged = false;

  salesHistoryData.forEach((order) => {
    if (order.status !== 'Out for Delivery' || !order.dispatchTime) return;

    const totalDurationSec = order.durationSec || 90;
    const elapsedSec = (now - order.dispatchTime) / 1000;
    if (elapsedSec < totalDurationSec) return;

    order.status = 'Delivered';
    order.eta = 'Delivered';
    anyChanged = true;

    const targetEmail = order.customerEmail || (currentUser ? currentUser.email : null);
    if (targetEmail) {
      addNotification(
        targetEmail,
        'Order Delivered',
        `Your order ${order.orderId} (${order.trackingNo}) has been delivered successfully.`,
        order.trackingNo,
        {
          orderId: order.orderId,
          amount: order.amount,
          status: 'Delivered',
          items: order.items
        }
      );
    }

    if (currentTrackingOrder && currentTrackingOrder.trackingNo === order.trackingNo) {
      const etaEl = document.getElementById('track-eta');
      const descEl = document.getElementById('track-status-desc');
      if (etaEl) etaEl.innerText = 'DELIVERED';
      if (descEl) descEl.innerText = 'Item delivered to customer home address!';
    }
  });

  if (anyChanged) {
    syncOrderStatusViews();
  }
}

function findOrCreateLorryBatch(state, options = {}) {
  const deliveryMethod = options.deliveryMethod || 'standard';
  const isInstant = deliveryMethod === 'instant';
  const requestedVehicleCategory = isInstant
    ? String(options.vehicle?.category || 'motorcycle').toLowerCase()
    : 'van';
  const existing = lorryBatches.find((b) =>
    b.state === state &&
    b.status === 'Forming' &&
    (b.deliveryMethod || 'standard') === deliveryMethod &&
    (!isInstant || String(b.vehicleCategory || 'motorcycle').toLowerCase() === requestedVehicleCategory)
  );
  if (existing) return existing;

  const seed = `${state}-${deliveryMethod}-${Date.now()}`;
  const rand = seededRandom(seed);
  const standardVehicle = STANDARD_VAN_FLEET[Math.floor(rand() * STANDARD_VAN_FLEET.length)];
  const instantVehicle = options.vehicle || INSTANT_VEHICLE_FLEET[0];
  const vehicle = isInstant ? instantVehicle : standardVehicle;

  const batch = {
    batchId: isInstant
      ? 'EXP-2026-' + Math.floor(1000 + Math.random() * 9000)
      : 'LOT-2026-' + Math.floor(1000 + Math.random() * 9000),
    createdByUid: window.VoidFirebaseStore?.currentAuthUser()?.uid || null,
    state: state,
    deliveryMethod,
    batchType: isInstant ? 'express' : 'standard',
    status: 'Forming',
    vehicleType: vehicle.type,
    vehicleCategory: vehicle.category || (isInstant ? 'motorcycle' : 'van'),
    assignmentReason: isInstant
      ? `${vehicle.category === 'motorcycle' ? 'Motorcycle' : 'Car'} selected for Instant delivery using the 8-item / 45-km capacity rule.`
      : 'Van selected for Standard delivery; the batch upgrades to a lorry above 20 orders or 55 items.',
    vehicleIcon: vehicle.icon || (isInstant ? 'fa-motorcycle' : 'fa-truck'),
    consumptionRate: vehicle.consumptionLperKm,
    tankCapacity: vehicle.tankCapacityL,
    plateNo: isInstant
      ? 'EXP ' + Math.floor(1000 + Math.random() * 9000)
      : 'VVN ' + Math.floor(1000 + Math.random() * 9000),
    courier: isInstant ? 'Aiman Zikri' : LORRY_COURIERS[Math.floor(Math.random() * LORRY_COURIERS.length)],
    createdAt: Date.now(),
    dispatchTime: null,
    totalItems: 0,
    legDurations: [],
    stops: [],
    history: [{
      time: Date.now(),
      type: 'batch_created',
      text: `${isInstant ? 'Instant' : 'Standard'} delivery batch created for ${state}.`
    }]
  };
  lorryBatches.push(batch);
  return batch;
}

function upgradeBatchToLorry(batch) {
  if (batch.vehicleCategory === 'lorry') return;

  const rand = seededRandom(batch.batchId + '-upgrade');
  const vehicle = LORRY_FLEET[Math.floor(rand() * LORRY_FLEET.length)];
  const previousPlate = batch.plateNo;

  batch.vehicleType = vehicle.type;
  batch.vehicleCategory = 'lorry';
  batch.vehicleIcon = vehicle.icon;
  batch.consumptionRate = vehicle.consumptionLperKm;
  batch.tankCapacity = vehicle.tankCapacityL;
  batch.plateNo = 'VLR ' + Math.floor(1000 + Math.random() * 9000);

  batch.assignmentReason = `Lorry selected because this Standard batch exceeded ${STANDARD_VAN_MAX_STOPS} orders or ${STANDARD_VAN_MAX_ITEMS} items.`;
  batch.history.push({
    time: Date.now(),
    text: `Batch ${batch.batchId} for ${batch.state} grew past van capacity (${STANDARD_VAN_MAX_STOPS} orders / ${STANDARD_VAN_MAX_ITEMS} items) with ${batch.stops.length} order(s) and ${batch.totalItems} item(s) queued. Upgraded from Van ${previousPlate} to Lorry ${batch.plateNo} (${batch.vehicleType}) to carry the extra volume in one trip.`
  });
}

function assignOrderToLorryBatch(order, options = {}) {
  const isInstant = String(order.deliveryMethod || '').toLowerCase() === 'instant';
  const selectedVehicle = isInstant ? chooseDispatchVehicle(order) : STANDARD_VAN_FLEET[0];
  order.dispatchVehicle = selectedVehicle;
  const batch = findOrCreateLorryBatch(order.state, {
    deliveryMethod: isInstant ? 'instant' : 'standard',
    vehicle: isInstant ? selectedVehicle : null
  });
  batch.stops.push({
    orderId: order.orderId,
    deliveryMethod: order.deliveryMethod || 'standard',
    trackingNo: null,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    address: order.address,
    lat: order.lat,
    lng: order.lng,
    qty: order.qty,
    sequence: null,
    status: 'Queued',
    deliveredAt: null,
  });
  batch.totalItems = (batch.totalItems || 0) + (order.qty || 0);

  if (!isInstant && (batch.stops.length > STANDARD_VAN_MAX_STOPS || batch.totalItems > STANDARD_VAN_MAX_ITEMS)) {
    upgradeBatchToLorry(batch);
  }

  order.batchId = batch.batchId;
  order.vehicleCategory = batch.vehicleCategory;
  order.vehicleType = batch.vehicleType;
  order.vehicleIcon = batch.vehicleIcon;
  order.consumptionRate = batch.consumptionRate;
  order.tankCapacity = batch.tankCapacity;
  order.assignmentReason = isInstant
    ? `${batch.vehicleCategory === 'motorcycle' ? 'Motorcycle' : 'Car'} selected by Instant quantity/distance rule.`
    : 'Standard order grouped by state in a van; batch upgrades to lorry above capacity.';
  if (options.persist !== false) saveLorryBatches();
  return batch;
}

function computeNearestNeighborOrder(stops) {
  const remaining = stops.slice();
  const ordered = [];
  let currentPos = HUB_START_COORDS;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineMeters(currentPos, [remaining[i].lat, remaining[i].lng]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    currentPos = [next.lat, next.lng];
  }
  return ordered;
}

function getDispatchVehicleLabel(batch) {
  if (!batch) return 'delivery vehicle';
  if ((batch.deliveryMethod || 'standard') === 'instant' || batch.batchType === 'express') {
    return `Express ${batch.vehicleType || 'Vehicle'}`;
  }
  return batch.vehicleCategory === 'lorry'
    ? `Lorry ${batch.plateNo || ''}`.trim()
    : `Van ${batch.plateNo || ''}`.trim();
}

function getVehicleAssignmentExplanation(batch) {
  if (!batch) return 'No vehicle assignment is available.';
  if (batch.assignmentReason) return batch.assignmentReason;
  if (batch.vehicleCategory === 'lorry') return `Lorry selected because the Standard batch exceeded ${STANDARD_VAN_MAX_STOPS} orders or ${STANDARD_VAN_MAX_ITEMS} items.`;
  if ((batch.deliveryMethod || 'standard') === 'instant' || batch.batchType === 'express') {
    return batch.vehicleCategory === 'motorcycle'
      ? 'Motorcycle selected for Instant delivery within 8 items and 45 km.'
      : 'Car selected for Instant delivery because the order volume or route exceeded motorcycle capacity.';
  }
  return 'Van selected for Standard delivery; it upgrades to a lorry above capacity.';
}

function dispatchLorryBatch(batchId, options = {}) {
  const batch = lorryBatches.find((item) => item.batchId === batchId);
  if (!batch || batch.status !== 'Forming') return;
  if (!Array.isArray(batch.stops) || batch.stops.length === 0) {
    alert('This batch has no orders in it yet.');
    return;
  }

  const ordered = computeNearestNeighborOrder(batch.stops);
  ordered.forEach((stop, idx) => {
    stop.sequence = idx + 1;
    stop.trackingNo = stop.trackingNo || `TRK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    stop.status = stop.status || 'Queued';
  });
  batch.stops = ordered;

  const rand = seededRandom(batch.batchId + '-legs');
  batch.legDurations = batch.stops.map(() => Math.floor(LORRY_LEG_MIN_SEC + rand() * (LORRY_LEG_MAX_SEC - LORRY_LEG_MIN_SEC)));
  const vehicleLabel = getDispatchVehicleLabel(batch);
  const now = Date.now();

  batch.status = 'Out for Delivery';
  batch.dispatchTime = now;
  batch.pausedElapsedSec = 0;
  batch.pausedAt = null;
  batch.driverState = 'En Route';
  batch.dispatchId = `DSP-${now}-${Math.floor(Math.random() * 1000)}`;
  batch.history = Array.isArray(batch.history) ? batch.history : [];
  batch.history.push({
    time: now,
    type: 'dispatch',
    text: `${vehicleLabel} ${batch.plateNo} (${batch.vehicleType}) departed VOID Central Hub, Shah Alam with ${batch.stops.length} parcel(s) bound for ${batch.state}. Route optimized nearest → farthest.`
  });
  updateBatchLiveTelemetry(batch, now);

  batch.stops.forEach((stop) => {
    const order = salesHistoryData.find((item) => item.orderId === stop.orderId);
    if (order) {
      order.status = 'Out for Delivery';
      order.trackingNo = stop.trackingNo;
      order.dispatchTime = null;
      order.eta = `Stop ${stop.sequence} of ${batch.stops.length} on ${vehicleLabel} ${batch.plateNo}`;
      order.sender = 'VOID Central Hub, Shah Alam';
      order.courier = batch.courier;
      order.vehicleType = batch.vehicleType;
      order.vehicleCategory = batch.vehicleCategory;
      order.vehicleIcon = batch.vehicleIcon;
      order.consumptionRate = batch.consumptionRate;
      order.tankCapacity = batch.tankCapacity;
      order.plateNo = batch.plateNo;
      order.batchDispatchId = batch.dispatchId;
      order.liveTracking = batch.liveTelemetry;
    }
    if (stop.customerEmail) {
      addNotification(
        stop.customerEmail,
        'Package Out For Delivery',
        `Your order ${stop.orderId} is now Out for Delivery aboard ${vehicleLabel} ${batch.plateNo}, heading to ${batch.state} (Stop ${stop.sequence} of ${batch.stops.length}). Tracking Code: ${stop.trackingNo}`,
        stop.trackingNo,
        { orderId: stop.orderId, status: 'Out for Delivery', dispatchId: batch.dispatchId }
      );
    }
  });

  saveLorryBatches();
  saveSalesHistory();
  if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
  syncOrderStatusViews();
  if (!options.silent) {
    alert(`${vehicleLabel} ${batch.plateNo} dispatched with ${batch.stops.length} parcel(s) to ${batch.state}.`);
  }
}

function pauseLorryBatch(batchId) {
  const batch = lorryBatches.find((item) => item.batchId === batchId);
  if (!batch || batch.status !== 'Out for Delivery') return;
  const now = Date.now();
  updateBatchLiveTelemetry(batch, now);
  batch.pausedElapsedSec = getBatchElapsedSeconds(batch, now);
  batch.status = 'Paused';
  batch.pausedAt = now;
  batch.driverState = 'Paused';
  batch.history = Array.isArray(batch.history) ? batch.history : [];
  batch.history.push({ time: now, type: 'pause', text: `Dispatch paused by admin at the last reported vehicle location.` });
  updateBatchLiveTelemetry(batch, now);
  persistLiveBatchState(batch, true);
  if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
  syncOrderStatusViews();
}

function resumeLorryBatch(batchId) {
  const batch = lorryBatches.find((item) => item.batchId === batchId);
  if (!batch || batch.status !== 'Paused') return;
  const now = Date.now();
  const elapsed = Number(batch.pausedElapsedSec) || 0;
  batch.dispatchTime = now - (elapsed * 1000);
  batch.status = 'Out for Delivery';
  batch.resumedAt = now;
  batch.pausedAt = null;
  batch.driverState = 'En Route';
  batch.history = Array.isArray(batch.history) ? batch.history : [];
  batch.history.push({ time: now, type: 'resume', text: `Dispatch resumed from the last Firebase location.` });
  updateBatchLiveTelemetry(batch, now);
  persistLiveBatchState(batch, true);
  if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
  syncOrderStatusViews();
}

function completeNextLorryStop(batchId) {
  const batch = lorryBatches.find((item) => item.batchId === batchId);
  if (!batch || !['Out for Delivery', 'Paused'].includes(batch.status)) return;
  const stop = (batch.stops || []).find((item) => item.status !== 'Delivered');
  if (!stop) return;

  const now = Date.now();
  stop.status = 'Delivered';
  stop.deliveredAt = now;
  const order = salesHistoryData.find((item) => item.orderId === stop.orderId);
  if (order) {
    order.status = 'Delivered';
    order.eta = 'Delivered';
    order.liveTracking = { ...(batch.liveTelemetry || {}), completedAt: now };
  }

  batch.history = Array.isArray(batch.history) ? batch.history : [];
  batch.history.push({ time: now, type: 'stop_completed', text: `Stop ${stop.sequence || 'next'} (${stop.orderId}) was marked delivered by admin.` });
  if (stop.customerEmail) {
    addNotification(stop.customerEmail, 'Order Delivered', `Your order ${stop.orderId} has been delivered successfully.`, stop.trackingNo, { orderId: stop.orderId, status: 'Delivered' });
  }

  const remaining = batch.stops.some((item) => item.status !== 'Delivered');
  if (!remaining) {
    batch.status = 'Delivered';
    batch.driverState = 'Completed';
    batch.completedAt = now;
    batch.pausedElapsedSec = getBatchTotalDuration(batch);
  }
  updateBatchLiveTelemetry(batch, now);
  persistLiveBatchState(batch, true);
  if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
  syncOrderStatusViews();
}


function checkAndProgressLorryBatches() {
  const now = Date.now();
  const canMutateFleet = typeof renderAdminLorryBatches === 'function';
  if (!canMutateFleet) return;
  const changedBatches = [];
  let anyStopChanged = false;

  lorryBatches.forEach((batch) => {
    if (!batch || !Array.isArray(batch.stops)) return;
    const telemetryChanged = updateBatchLiveTelemetry(batch, now);
    if (telemetryChanged) changedBatches.push(batch);

    if (batch.status !== 'Out for Delivery' || !batch.dispatchTime) return;

    const progress = computeLorryProgress(batch, now);
    const elapsedSec = getBatchElapsedSeconds(batch, now);
    let cumulative = 0;
    const vehicleLabel = batch.vehicleCategory === 'van' ? 'Van' : 'Lorry';

    batch.stops.forEach((stop, idx) => {
      cumulative += Number(batch.legDurations[idx]) || 40;
      if (stop.status === 'Delivered' || elapsedSec < cumulative) return;

      stop.status = 'Delivered';
      stop.deliveredAt = now;
      anyStopChanged = true;

      const order = salesHistoryData.find((item) => item.orderId === stop.orderId);
      if (order) {
        order.status = 'Delivered';
        order.eta = 'Delivered';
        order.liveTracking = batch.liveTelemetry;
      }

      const isLastStop = idx === batch.stops.length - 1;
      batch.history = Array.isArray(batch.history) ? batch.history : [];
      batch.history.push({
        time: now,
        type: 'stop_completed',
        text: isLastStop
          ? `Parcel ${stop.orderId} delivered (Stop ${stop.sequence} of ${batch.stops.length}). ${vehicleLabel} ${batch.plateNo} completed the run and is returning to VOID Central Hub.`
          : `Parcel ${stop.orderId} delivered (Stop ${stop.sequence} of ${batch.stops.length}). ${vehicleLabel} ${batch.plateNo} is now en route to Stop ${stop.sequence + 1}.`
      });

      if (stop.customerEmail) {
        addNotification(
          stop.customerEmail,
          'Order Delivered',
          `Your order ${stop.orderId} has been delivered successfully via ${vehicleLabel} ${batch.plateNo}.`,
          stop.trackingNo,
          { orderId: stop.orderId, status: 'Delivered' }
        );
      }

      if (isLastStop) {
        batch.status = 'Delivered';
        batch.driverState = 'Completed';
        batch.completedAt = now;
      }
    });

    if (anyStopChanged) {
      updateBatchLiveTelemetry(batch, now);
      if (!changedBatches.includes(batch)) changedBatches.push(batch);
    }
  });

  let telemetryPersistNeeded = false;
  changedBatches.forEach((batch) => {
    if (!batch || !batch.batchId) return;
    const lastWrite = liveTelemetryWriteAt.get(batch.batchId) || 0;
    if (now - lastWrite >= LIVE_TELEMETRY_WRITE_MS) {
      liveTelemetryWriteAt.set(batch.batchId, now);
      telemetryPersistNeeded = true;
    }
  });

  if (telemetryPersistNeeded || anyStopChanged) {
    // Persist the complete batch collection once per timer tick, not once per batch.
    saveLorryBatches();
  }

  if (anyStopChanged) {
    if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
    syncOrderStatusViews();
    if (currentTrackingOrder && currentTrackingOrder.batchId) renderLorryManifestPanel(currentTrackingOrder);
  } else if (changedBatches.length && typeof renderAdminLorryBatches === 'function') {
    renderAdminLorryBatches();
  }
}


function buildSeedItemsDetail(totalQty, rand) {
  const lines = [];
  let remaining = totalQty;
  while (remaining > 0) {
    const prod = products[Math.floor(rand() * products.length)];
    const size = PRODUCT_SIZES[Math.floor(rand() * PRODUCT_SIZES.length)];
    const lineQty = lines.length === 0 && remaining > 1 && rand() > 0.5 ? 1 : remaining;
    lines.push({ id: prod.id, name: prod.name, size: size, qty: lineQty, price: prod.price });
    remaining -= lineQty;
  }
  const itemsText = lines.map((l) => `${l.name} (Size ${l.size}) (x${l.qty})`).join(', ');
  return { itemsDetail: lines, itemsText: itemsText };
}

function generateSeedDeliveryHistory() {
  const rand = seededRandom('void-transport-cost-seed-v1');
  const vehiclePool = [
    { type: 'Yamaha Y15ZR Motorcycle', category: 'motorcycle', icon: 'fa-motorcycle', consumptionLperKm: 0.025, plate: 'VAB 4821' },
    { type: 'Honda RS150R Motorcycle', category: 'motorcycle', icon: 'fa-motorcycle', consumptionLperKm: 0.028, plate: 'VBK 2210' },
    { type: 'Perodua Myvi Car', category: 'car', icon: 'fa-car', consumptionLperKm: 0.065, plate: 'WXY 3391' },
    { type: 'Honda Civic FC Car', category: 'car', icon: 'fa-car', consumptionLperKm: 0.075, plate: 'JKL 8820' },
    { type: 'Toyota Hiace Van', category: 'van', icon: 'fa-van-shuttle', consumptionLperKm: 0.110, plate: 'DEV 5567' },
    { type: 'Ford Transit Van', category: 'van', icon: 'fa-truck-ramp-box', consumptionLperKm: 0.125, plate: 'PQR 9034' }
  ];

  const customers = [
    { name: 'Aina Rosli', email: 'aina.r@void.com' },
    { name: 'Firdaus Yusof', email: 'firdaus.y@void.com' },
    { name: 'Mei Ling Tan', email: 'meiling.t@void.com' },
    { name: 'Suresh Kumar', email: 'suresh.k@void.com' },
    { name: 'Nurul Iman', email: 'nurul.i@void.com' },
    { name: 'Bryan Wong', email: 'bryan.w@void.com' }
  ];

  const cities = [
    { city: 'Shah Alam', state: 'Selangor', lat: 3.0731, lng: 101.5183 },
    { city: 'Petaling Jaya', state: 'Selangor', lat: 3.1073, lng: 101.6067 },
    { city: 'Kuala Lumpur', state: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
    { city: 'Klang', state: 'Selangor', lat: 3.0449, lng: 101.4456 },
    { city: 'Subang Jaya', state: 'Selangor', lat: 3.0567, lng: 101.5851 }
  ];

  const fuelPricePerLitre = 2.05;
  const tollRatePerKm = { car: 0.184, van: 0.281, motorcycle: 0 };
  const seedOrders = [];
  const now = new Date();

  for (let monthsAgo = 13; monthsAgo >= 0; monthsAgo--) {
    const deliveriesThisMonth = 5 + Math.floor(rand() * 5);
    const maxDayThisMonth = monthsAgo === 0 ? Math.max(1, now.getDate() - 1) : 27;
    for (let d = 0; d < deliveriesThisMonth; d++) {
      const dayOfMonth = 1 + Math.floor(rand() * Math.min(maxDayThisMonth, 27));
      const orderDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth, Math.floor(rand() * 14) + 8, Math.floor(rand() * 60));
      const vehicle = vehiclePool[Math.floor(rand() * vehiclePool.length)];
      const customer = customers[Math.floor(rand() * customers.length)];
      const dest = cities[Math.floor(rand() * cities.length)];

      const distanceKm = 6 + rand() * 34; 
      const fuelUsedL = distanceKm * vehicle.consumptionLperKm;
      const fuelCostRM = fuelUsedL * fuelPricePerLitre;
      const tolledPortion = distanceKm > 12 ? (0.35 + rand() * 0.35) : 0;
      const tollCostRM = distanceKm * tolledPortion * (tollRatePerKm[vehicle.category] || 0);
      const totalCostRM = fuelCostRM + tollCostRM;
      const amount = 60 + rand() * 280;
      const seedItems = buildSeedItemsDetail(1 + Math.floor(rand() * 4), rand);

      seedOrders.push({
        orderId: 'ORD-' + Math.floor(1000 + rand() * 9000),
        customerName: customer.name,
        customerEmail: customer.email,
        trackingNo: 'TRK-' + orderDate.getFullYear() + '-' + Math.floor(1000 + rand() * 9000),
        address: `${1 + Math.floor(rand() * 200)} Jalan Contoh ${1 + Math.floor(rand() * 20)}/${1 + Math.floor(rand() * 99)}, ${dest.city}, ${dest.state}`,
        lat: dest.lat + (rand() - 0.5) * 0.05,
        lng: dest.lng + (rand() - 0.5) * 0.05,
        qty: seedItems.itemsDetail.reduce((sum, l) => sum + l.qty, 0),
        items: seedItems.itemsText,
        itemsDetail: seedItems.itemsDetail,
        amount: amount,
        date: orderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Delivered',
        sender: 'VOID Central Hub, Shah Alam',
        courier: 'Fleet Courier',
        vehicleType: vehicle.type,
        vehicleCategory: vehicle.category,
        vehicleIcon: vehicle.icon,
        consumptionRate: vehicle.consumptionLperKm,
        plateNo: vehicle.plate,
        eta: 'Delivered',
        distanceKm: distanceKm,
        fuelUsedL: fuelUsedL,
        tollCostRM: tollCostRM,
        deliveryCostRM: totalCostRM
      });
    }
  }

  const todaySeed = [
    { vehicle: vehiclePool[0], hour: 9,  minute: 10, distanceKm: 10 },  
    { vehicle: vehiclePool[1], hour: 11, minute: 35, distanceKm: 14 },  
    { vehicle: vehiclePool[3], hour: 13, minute: 5,  distanceKm: 22 },  
    { vehicle: vehiclePool[4], hour: 15, minute: 40, distanceKm: 33 },  
  ];

  todaySeed.forEach((entry, idx) => {
    const orderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), entry.hour, entry.minute);
    const vehicle = entry.vehicle;
    const customer = customers[idx % customers.length];
    const dest = cities[idx % cities.length];

    const distanceKm = entry.distanceKm;
    const fuelUsedL = distanceKm * vehicle.consumptionLperKm;
    const fuelCostRM = fuelUsedL * fuelPricePerLitre;
    const tolledPortion = distanceKm > 12 ? 0.5 : 0;
    const tollCostRM = distanceKm * tolledPortion * (tollRatePerKm[vehicle.category] || 0);
    const totalCostRM = fuelCostRM + tollCostRM;
    const seedItems = buildSeedItemsDetail(1 + (idx % 3), rand);

    seedOrders.push({
      orderId: 'ORD-T' + (100 + idx),
      customerName: customer.name,
      customerEmail: customer.email,
      trackingNo: 'TRK-' + orderDate.getFullYear() + '-T' + (100 + idx),
      address: `${5 + idx} Jalan Contoh ${idx + 1}/${10 + idx}, ${dest.city}, ${dest.state}`,
      lat: dest.lat + (idx - 1.5) * 0.01,
      lng: dest.lng + (idx - 1.5) * 0.01,
      qty: seedItems.itemsDetail.reduce((sum, l) => sum + l.qty, 0),
      items: seedItems.itemsText,
      itemsDetail: seedItems.itemsDetail,
      amount: 60 + idx * 25,
      date: orderDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered',
      sender: 'VOID Central Hub, Shah Alam',
      courier: 'Fleet Courier',
      vehicleType: vehicle.type,
      vehicleCategory: vehicle.category,
      vehicleIcon: vehicle.icon,
      consumptionRate: vehicle.consumptionLperKm,
      plateNo: vehicle.plate,
      eta: 'Delivered',
      distanceKm: distanceKm,
      fuelUsedL: fuelUsedL,
      tollCostRM: tollCostRM,
      deliveryCostRM: totalCostRM
    });
  });

  return seedOrders;
}

let currentSlide = 0;
let slideInterval;
let salesStatusFilter = 'all';


function firebaseToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
}

function normalizeOrderStatus(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (raw === 'out for delivery' || raw === 'outfordelivery' || raw === 'dispatched' || raw === 'in transit') return 'Out for Delivery';
  if (raw === 'delivered' || raw === 'completed' || raw === 'complete') return 'Delivered';
  if (raw === 'cancelled' || raw === 'canceled') return 'Cancelled';
  return 'Pending';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function normalizeTransportVehicleCategory(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (['motorcycle', 'motorbike', 'bike'].includes(raw) || raw.includes('motorcycle') || raw.includes('motorbike')) return 'motorcycle';
  if (['car', 'sedan'].includes(raw) || raw.includes('car')) return 'car';
  if (['van', 'minivan'].includes(raw) || raw.includes('van')) return 'van';
  if (['lorry', 'truck'].includes(raw) || raw.includes('lorry') || raw.includes('truck') || raw.includes('npr') || raw.includes('hino')) return 'lorry';
  return '';
}

function getBatchRouteDistanceKm(batch) {
  if (!batch) return 0;
  const stored = Number(batch.totalDistanceKm ?? batch.routeDistanceKm ?? batch.distanceKm ?? 0) || 0;
  if (stored > 0) return stored;
  const stops = firebaseToArray(batch.stops).filter((stop) => Number.isFinite(Number(stop?.lat)) && Number.isFinite(Number(stop?.lng)));
  if (!stops.length || typeof haversineMeters !== 'function') return 0;
  let totalMeters = 0;
  let previous = HUB_START_COORDS;
  stops.forEach((stop) => {
    const next = [Number(stop.lat), Number(stop.lng)];
    totalMeters += haversineMeters(previous, next);
    previous = next;
  });
  return totalMeters / 1000;
}

function getOrderVehicleCategory(order) {
  const batch = order?.batchId ? lorryBatches.find((item) => String(item.batchId) === String(order.batchId)) : null;
  // The linked batch is authoritative because a standard van batch can later be upgraded to a lorry.
  const batchCategory = normalizeTransportVehicleCategory(batch?.vehicleCategory || batch?.vehicleType);
  if (batchCategory) return batchCategory;

  const direct = normalizeTransportVehicleCategory(order?.vehicleCategory || order?.vehicleType);
  if (direct) return direct;

  if (String(order?.deliveryMethod || '').toLowerCase() === 'instant') {
    return normalizeTransportVehicleCategory(order?.dispatchVehicle?.category) || 'motorcycle';
  }
  return 'van';
}

function getOrderTransportMetrics(order) {
  const batch = order?.batchId ? lorryBatches.find((item) => String(item.batchId) === String(order.batchId)) : null;
  const vehicleCategory = getOrderVehicleCategory(order);
  const batchDistanceKm = getBatchRouteDistanceKm(batch);
  const stop = batch ? firebaseToArray(batch.stops).find((item) => String(item?.orderId) === String(order?.orderId)) : null;
  const storedDistanceKm = Number(order?.distanceKm ?? order?.routeDistanceKm ?? order?.distance ?? stop?.distanceKm ?? 0) || 0;
  const distanceKm = Math.max(0, storedDistanceKm > 0 ? storedDistanceKm : batchDistanceKm);
  const defaultRate = { motorcycle: 0.025, car: 0.07, van: 0.11, lorry: 0.18 }[vehicleCategory] || 0.11;
  const consumptionRate = Math.max(0, Number(order?.consumptionRate || batch?.consumptionRate || defaultRate) || defaultRate);
  const storedFuelUsedL = Number(order?.fuelUsedL || 0) || 0;
  const fuelUsedL = Math.max(0, storedFuelUsedL > 0 ? storedFuelUsedL : distanceKm * consumptionRate);
  const fuelCostRM = fuelUsedL * FUEL_PRICE_PER_LITRE_RM;
  const defaultTollRM = vehicleCategory === 'motorcycle'
    ? 0
    : distanceKm * (TOLL_RATE_RM_PER_KM[vehicleCategory] || 0);
  const storedTollRM = Number(order?.tollCostRM || 0) || 0;
  const tollCostRM = Math.max(0, storedTollRM > 0 ? storedTollRM : defaultTollRM);
  const storedTotalRM = Number(order?.deliveryCostRM || 0) || 0;
  const totalCostRM = Math.max(0, storedTotalRM > 0 ? storedTotalRM : fuelCostRM + tollCostRM);
  return { vehicleCategory, distanceKm, fuelUsedL, fuelCostRM, tollCostRM, totalCostRM };
}

function addNotification(targetUserId, title, message, trackingNo = null, extraData = {}) {
  if (!targetUserId) return;
  
  const now = Date.now();
  const newNotif = {
    id: now,
    notificationId: extraData.notificationId || `notif_${now}`,
    threadId: extraData.threadId || null,
    type: extraData.type || (trackingNo || ['Out for Delivery', 'Delivered'].includes(extraData.status) ? 'tracking' : 'activity'),
    senderRole: extraData.senderRole || 'system',
    userId: targetUserId,
    title: title,
    message: String(message),
    trackingNo: trackingNo,
    extraData: extraData,
    replies: Array.isArray(extraData.replies) ? extraData.replies : [],
    date: new Date(now).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: now,
    updatedAt: now,
    read: false
  };

  notifications.unshift(newNotif);
  saveNotificationsToCloud();
  renderNotifications();
}

function markNotificationAsRead(id) {
  const notif = notifications.find((n) => n.id === id);
  if (notif && !notif.read) {
    notif.read = true;
    saveNotificationsToCloud();
    renderNotifications();
  }
}

function markAllNotificationsAsRead() {
  if (!currentUser) return;
  let updated = false;
  notifications.forEach((n) => {
    if ((n.userId === currentUser.email || n.userId === currentUser.username) && !n.read) {
      n.read = true;
      updated = true;
    }
  });
  if (updated) {
    saveNotificationsToCloud();
    renderNotifications();
  }
}

function openNotificationDetail(id) {
  const notif = notifications.find((n) => n.id === id);
  if (!notif) return;

  markNotificationAsRead(id);

  const modalTitle = document.getElementById('notif-modal-title');
  const modalDate = document.getElementById('notif-modal-date');
  const modalBadge = document.getElementById('notif-modal-badge');
  const messageContainer = document.getElementById('notif-modal-message');

  if (modalTitle) modalTitle.innerText = notif.title;
  if (modalDate) modalDate.innerText = notif.date;

  let trackingCode = notif.trackingNo;
  if (!trackingCode) {
    const match = notif.message.match(/TRK-\d{4}-\d{4}/);
    if (match) trackingCode = match[0];
  }

  if (modalBadge) {
    modalBadge.innerText = trackingCode ? 'FULFILLMENT' : 'ACTIVITY';
    modalBadge.style.background = trackingCode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    modalBadge.style.color = trackingCode ? 'var(--accent)' : 'var(--text-secondary)';
  }

  let extraHtml = '';
  if (notif.extraData && Object.keys(notif.extraData).length > 0) {
    extraHtml = `<div class="notif-detail-grid">`;
    if (notif.extraData.orderId) extraHtml += `<div class="detail-item"><span>Order ID</span><strong>${notif.extraData.orderId}</strong></div>`;
    if (notif.extraData.amount) extraHtml += `<div class="detail-item"><span>Total Amount</span><strong style="color:var(--accent);">RM ${parseFloat(notif.extraData.amount).toFixed(2)}</strong></div>`;
    if (notif.extraData.status) extraHtml += `<div class="detail-item"><span>Status</span><strong>${notif.extraData.status}</strong></div>`;
    if (notif.extraData.items) extraHtml += `<div class="detail-item" style="grid-column: span 2;"><span>Items</span><strong>${notif.extraData.items}</strong></div>`;
    extraHtml += `</div>`;
  }

  let trackingCardHtml = '';
  if (trackingCode) {
    trackingCardHtml = `
      <div class="notif-tracking-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 0.5rem;">
          <span style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px;"><i class="fa-solid fa-truck-fast"></i> Live Optimization Tracking</span>
          <span class="tracking-code-pill">${trackingCode}</span>
        </div>
        <p style="font-size:0.85rem; color:#ccc; margin-bottom: 0.8rem; line-height: 1.4;">Real-time route cost comparison and dynamic map delivery active.</p>
        <button type="button" class="btn-full tracking-action-btn" onclick="openTrackingView('${trackingCode}'); closeNotificationDetail();">
          <i class="fa-solid fa-map-location-dot"></i> VIEW LIVE SHIPMENT MAP (${trackingCode})
        </button>
      </div>
    `;
  }

  const replies = Array.isArray(notif.replies) ? notif.replies : [];
  const replyHtml = replies.length
    ? `<div class="notif-replies"><h4>CONVERSATION</h4>${replies.map((reply) => `<div class="notif-reply"><strong>${escapeHtml(reply.senderRole || 'reply')}</strong><small>${escapeHtml(reply.date || '')}</small><p>${escapeHtml(reply.message)}</p></div>`).join('')}</div>`
    : '';

  if (messageContainer) {
    messageContainer.innerHTML = `
      <div class="notif-body-text">${escapeHtml(notif.message)}</div>
      ${extraHtml}
      ${replyHtml}
      ${trackingCardHtml}
    `;
  }

  const modal = document.getElementById('notif-modal-overlay');
  if (modal) modal.classList.add('active');

  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown) dropdown.classList.remove('active');
}

function closeNotificationDetail() {
  const modal = document.getElementById('notif-modal-overlay');
  if (modal) modal.classList.remove('active');
}

function renderNotifications() {
  const container = document.getElementById('notif-items');
  const countBadge = document.getElementById('notif-count');
  if (!container) return;

  container.innerHTML = '';

  if (!currentUser) {
    container.innerHTML = `
      <div class="notif-item">
        <small style="color: var(--text-secondary);">Please log in or sign up to see your activity history.</small>
      </div>
    `;
    if (countBadge) countBadge.innerText = '0';
    return;
  }

  const userNotifs = notifications.filter(
    (n) => n.userId === currentUser.email || n.userId === currentUser.username
  );

  const unreadCount = userNotifs.filter((n) => !n.read).length;
  if (countBadge) countBadge.innerText = unreadCount;

  if (userNotifs.length === 0) {
    container.innerHTML = `
      <div class="notif-item">
        <small style="color: var(--text-secondary);">No activity recorded for your account yet.</small>
      </div>
    `;
    return;
  }

  userNotifs.forEach((notif) => {
    const isUnread = !notif.read;
    container.innerHTML += `
      <div class="notif-item ${isUnread ? 'unread' : ''}" 
           onclick="openNotificationDetail(${notif.id})"
           style="cursor: pointer; transition: background 0.2s; ${isUnread ? 'border-left: 3px solid var(--accent); background: rgba(129, 140, 248, 0.08);' : 'opacity: 0.85;'}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <strong style="color: var(--accent); font-size: 0.85rem;">${notif.title}</strong>
          ${isUnread ? '<span style="font-size:0.6rem; background:var(--accent); color:#000; padding:1px 5px; border-radius:3px; font-weight:bold;">NEW</span>' : ''}
        </div>
        <p style="margin: 2px 0; font-size: 0.8rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${notif.message}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <small style="color: var(--text-secondary); font-size: 0.7rem;">${notif.date}</small>
          <small style="color: var(--accent); font-size: 0.7rem; font-weight:bold;">View Details →</small>
        </div>
      </div>
    `;
  });
}

let adminActivityPanel = 'inquiries';
let adminInquiryFilter = 'open';
let adminActivitySearch = '';
let adminSelectedActivityKey = null;

function setAdminActivityPanel(panel) {
  adminActivityPanel = panel === 'tracking' ? 'tracking' : 'inquiries';
  document.querySelectorAll('[data-admin-activity-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminActivityTab === adminActivityPanel);
  });
  renderAdminInquiryCenter();
}

function setAdminInquiryFilter(filter) {
  adminInquiryFilter = ['all', 'open', 'replied', 'closed'].includes(filter) ? filter : 'open';
  adminSelectedActivityKey = null;
  renderAdminInquiryCenter();
}

function setAdminActivitySearch(value) {
  adminActivitySearch = String(value || '').trim().toLowerCase();
  adminSelectedActivityKey = null;
  renderAdminInquiryCenter();
}

function getActivityKey(notification) {
  return String(notification?.notificationId || notification?.id || '');
}

function getInquiryThreads() {
  return notifications
    .filter((notification) => notification && (notification.type === 'inquiry' || notification.extraData?.type === 'inquiry'))
    .sort((a, b) => Number(b.updatedAt || b.createdAt || b.id || 0) - Number(a.updatedAt || a.createdAt || a.id || 0));
}

function getAdminTrackingActivity() {
  return notifications
    .filter((notification) => notification && (notification.type === 'tracking' || notification.extraData?.type === 'tracking'))
    .sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
}

function activityMatchesSearch(notification) {
  if (!adminActivitySearch) return true;
  const haystack = [
    notification.title,
    notification.message,
    notification.userId,
    notification.customerName,
    notification.customerEmail,
    notification.trackingNo,
    notification.extraData?.orderId,
    notification.extraData?.dispatchId
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(adminActivitySearch);
}

function selectAdminActivity(encodedKey) {
  adminSelectedActivityKey = decodeURIComponent(String(encodedKey || ''));
  renderAdminInquiryCenter();
}

function renderAdminActivityDetail(selected) {
  const detail = document.getElementById('admin-inquiry-detail');
  if (!detail) return;
  if (!selected) {
    detail.innerHTML = '<div class="admin-activity-empty">Select an inquiry or tracking event to view its details.</div>';
    return;
  }

  const key = getActivityKey(selected);
  const isInquiry = selected.type === 'inquiry' || selected.extraData?.type === 'inquiry';
  const replies = Array.isArray(selected.replies) ? selected.replies : [];
  const replyHtml = replies.length
    ? `<div class="admin-activity-replies"><h4>CONVERSATION</h4>${replies.map((reply) => `<div class="admin-inquiry-reply"><strong>${escapeHtml(reply.senderRole || 'reply')}</strong><small>${escapeHtml(reply.date || '')}</small><p>${escapeHtml(reply.message || '')}</p></div>`).join('')}</div>`
    : '<div class="admin-activity-no-replies">No replies yet.</div>';

  detail.innerHTML = `<div class="admin-activity-detail-header">
      <div>
        <span class="admin-activity-kicker">${isInquiry ? 'CUSTOMER INQUIRY' : 'TRACKING EVENT'}</span>
        <h4>${escapeHtml(selected.title || (isInquiry ? 'Customer Inquiry' : 'Tracking Activity'))}</h4>
        <small>${escapeHtml(selected.customerName || selected.userId || 'VOID customer')} · ${escapeHtml(selected.customerEmail || selected.date || '')}</small>
      </div>
      <span class="status-badge">${escapeHtml(selected.status || (selected.read ? 'read' : 'new'))}</span>
    </div>
    <p class="admin-activity-detail-message">${escapeHtml(selected.message || 'No message available.')}</p>
    ${selected.trackingNo ? `<div class="admin-activity-tracking-code">TRACKING <strong>${escapeHtml(selected.trackingNo)}</strong></div>` : ''}
    ${isInquiry ? `${replyHtml}<div class="admin-inquiry-reply-form admin-activity-reply-form">
      <textarea id="inquiry-reply-${encodeURIComponent(key)}" rows="3" placeholder="Reply privately to this customer..."></textarea>
      <button type="button" class="admin-action-btn" onclick="replyToCustomerInquiry('${encodeURIComponent(key)}')">SEND REPLY</button>
    </div>` : `<div class="admin-activity-detail-meta">This event is visible to the addressed customer only and is retained as a read-only tracking record here.</div>`}`;
}

function renderAdminInquiryCenter() {
  const list = document.getElementById('admin-inquiry-list');
  if (!list) return;

  const allThreads = getInquiryThreads();
  const trackingActivity = getAdminTrackingActivity();
  const filteredThreads = allThreads.filter((thread) => {
    const status = String(thread.status || 'open').toLowerCase();
    const statusMatches = adminInquiryFilter === 'all' || status === adminInquiryFilter;
    return statusMatches && activityMatchesSearch(thread);
  });
  const filteredTracking = trackingActivity.filter(activityMatchesSearch).slice(0, 50);
  const activeItems = adminActivityPanel === 'tracking' ? filteredTracking : filteredThreads;
  const activeKey = activeItems.some((item) => getActivityKey(item) === adminSelectedActivityKey)
    ? adminSelectedActivityKey
    : getActivityKey(activeItems[0]);
  adminSelectedActivityKey = activeKey || null;

  const sync = document.getElementById('admin-inquiry-sync');
  if (sync) sync.innerText = `LIVE FIREBASE SYNC • ${new Date().toLocaleTimeString('en-MY')}`;
  const inquiryCount = document.getElementById('admin-inquiry-count');
  const trackingCount = document.getElementById('admin-tracking-count');
  if (inquiryCount) inquiryCount.innerText = String(allThreads.filter((thread) => String(thread.status || 'open').toLowerCase() === 'open').length);
  if (trackingCount) trackingCount.innerText = String(trackingActivity.length);

  document.querySelectorAll('[data-admin-activity-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminActivityTab === adminActivityPanel);
  });

  if (!activeItems.length) {
    list.innerHTML = `<div class="admin-activity-empty">No ${adminActivityPanel === 'tracking' ? 'tracking activity' : 'inquiries matching this filter'} found.</div>`;
    renderAdminActivityDetail(null);
    return;
  }

  list.innerHTML = activeItems.map((item) => {
    const itemKey = getActivityKey(item);
    const isInquiry = item.type === 'inquiry' || item.extraData?.type === 'inquiry';
    const secondary = isInquiry
      ? `${item.customerName || item.userId || 'Customer'} · ${item.date || ''}`
      : `${item.userId || 'Customer'} · ${item.date || ''}`;
    return `<button type="button" class="admin-activity-item ${itemKey === activeKey ? 'active' : ''}" onclick="selectAdminActivity('${encodeURIComponent(itemKey)}')">
      <span class="admin-activity-item-top"><strong>${escapeHtml(item.title || (isInquiry ? 'Customer Inquiry' : 'Tracking Event'))}</strong><span class="admin-activity-dot ${item.read ? 'read' : ''}"></span></span>
      <small>${escapeHtml(secondary)}</small>
      <span>${escapeHtml(String(item.message || '').slice(0, 110))}${String(item.message || '').length > 110 ? '…' : ''}</span>
    </button>`;
  }).join('');

  renderAdminActivityDetail(activeItems.find((item) => getActivityKey(item) === activeKey));
}

async function replyToCustomerInquiry(encodedThreadKey) {
  const threadKey = decodeURIComponent(String(encodedThreadKey || ''));
  const thread = notifications.find((notification) => String(notification.notificationId || notification.id) === threadKey);
  if (!thread) return;
  const textarea = document.getElementById(`inquiry-reply-${encodedThreadKey}`);
  const message = textarea?.value.trim();
  if (!message) {
    alert('Write a reply before sending.');
    return;
  }
  const now = Date.now();
  const reply = {
    replyId: `reply_${now}`,
    senderRole: 'admin',
    senderUid: window.VoidFirebaseStore?.currentAuthUser()?.uid || null,
    message,
    createdAt: now,
    date: new Date(now).toLocaleString('en-MY')
  };
  thread.replies = Array.isArray(thread.replies) ? thread.replies : [];
  thread.replies.push(reply);
  thread.status = 'replied';
  thread.updatedAt = now;
  const saved = await saveNotificationsToCloud();
  if (saved === null) {
    alert('Firebase rejected the reply. Check the administrator session and Notifications Rules.');
    return;
  }
  addNotification(thread.userId, 'VOID Reply', message, null, {
    type: 'inquiry_reply',
    threadId: thread.notificationId || thread.id,
    replyId: reply.replyId,
    senderRole: 'admin'
  });
  renderAdminInquiryCenter();
}

function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));

  const target = document.getElementById(viewId + '-view');
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }

  if (viewId !== 'tracking') {
    if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
    if (trackingAnimFrame) { cancelAnimationFrame(trackingAnimFrame); trackingAnimFrame = null; }
  }

  if (viewId === 'orders') {
    renderMyOrders();
  }

  if (viewId === 'admin') {
    renderAdminProducts();
    renderAdminSlides();
    renderAdminUsers();
    renderAdminSalesHistory();
    setTimeout(initAdminCharts, 100);
    if(typeof renderCostAnalytics === 'function') setTimeout(renderCostAnalytics, 100);
  }

  if (viewId === 'tracking') {
    setTimeout(() => {
      initOrderTrackingMap(currentTrackingOrder || salesHistoryData[0]);
    }, 200);
  }
}

function handleSlideButtonClick(index) {
  const slide = heroSlides[index];
  if (!slide) return;

  if (slide.linkType === 'item' && slide.targetItemId) {
    openProductDetail(parseInt(slide.targetItemId));
  } else {
    navigateTo('home');
    const shopEl = document.getElementById('shop');
    if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderHeroSlider() {
  const container = document.getElementById('slides-container');
  const dotsContainer = document.getElementById('slider-dots');
  if (!container) return;

  container.innerHTML = '';
  dotsContainer.innerHTML = '';

  heroSlides.forEach((slide, index) => {
    container.innerHTML += `
      <div class="slide">
          <img src="${slide.image}" alt="${slide.title}">
          <div class="slide-content">
              <h1>${slide.title}</h1>
              <p>${slide.subtitle}</p>
              <button class="slide-btn" onclick="handleSlideButtonClick(${index})">${slide.btnText}</button>
          </div>
      </div>
    `;

    dotsContainer.innerHTML += `<div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`;
  });

  startSlideInterval();
}

function updateSlider() {
  const container = document.getElementById('slides-container');
  const dots = document.querySelectorAll('.dot');
  if (!container) return;

  container.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

function nextSlide() {
  if (!heroSlides.length) return;
  currentSlide = (currentSlide + 1) % heroSlides.length;
  updateSlider();
}

function prevSlide() {
  if (!heroSlides.length) return;
  currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
  updateSlider();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
  startSlideInterval();
}

function startSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

function renderProducts(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (items.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-secondary);">No products found.</p>`;
    return;
  }

  items.forEach((prod) => {
    const totalStock = getTotalStock(prod);
    const stockDisplay = totalStock > 0 
      ? `<span style="font-size:0.75rem; color:#4ade80;">Total Stock: ${totalStock}</span>`
      : `<span style="font-size:0.75rem; color:#ef4444;">Out of Stock</span>`;

    const hasPromo = prod.promoPrice != null && prod.promoPrice > 0 && prod.promoPrice < prod.price;
    const priceHtml = hasPromo
      ? `<span class="price-original">RM ${prod.price.toFixed(2)}</span><span class="price-promo">RM ${prod.promoPrice.toFixed(2)}</span>`
      : `RM ${prod.price.toFixed(2)}`;

    grid.innerHTML += `
      <div class="product-card" onclick="openProductDetail(${prod.id})" style="position: relative;">
          ${hasPromo ? `<span class="promo-badge">SALE</span>` : ''}
          <div class="product-img-wrapper">
              <img src="${prod.image}" alt="${prod.name}">
          </div>
          <div class="product-info">
              <div class="product-title">${prod.name}</div>
              <div class="product-price">${priceHtml}</div>
          </div>
          <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center;">
              ${stockDisplay}
          </div>
      </div>
    `;
  });
}


function logout() {
  if (currentUser) {
    addNotification(currentUser.email, 'Account Logout', 'You logged out of your account.');
  }
  currentUser = null;
  setSessionUser(null);
  if (window.firebaseAuth && typeof window.signOut === 'function') {
    window.signOut(window.firebaseAuth).catch((error) => console.warn('Firebase admin sign-out failed:', error));
  }
  window.location.href = 'admin-login.html';
}
function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-btn').forEach((b) => b.classList.remove('active'));

  const targetTab = document.getElementById('admin-' + tabId);
  if (targetTab) targetTab.classList.add('active');

  const activeBtn = Array.from(document.querySelectorAll('.admin-tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  if (tabId === 'sales-history') {
    renderAdminSalesHistory();
  }

  if (tabId === 'cost-analytics') {
    setTimeout(renderCostAnalytics, 50);
  }

  if (tabId === 'lorry-batches') {
    checkAndProgressLorryBatches();
    if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();
  }
}

function jumpToSalesHistory(filterType) {
  salesStatusFilter = filterType === 'pending' ? 'Pending'
    : filterType === 'delivered' ? 'Delivered'
      : 'all';
  switchAdminTab('sales-history');

  const monthEl = document.getElementById('sales-month-filter');
  const yearEl = document.getElementById('sales-year-filter');
  const statusEl = document.getElementById('sales-status-filter');
  const now = new Date();
  if (monthEl) monthEl.value = filterType === 'monthly' ? now.toLocaleDateString('en-US', { month: 'short' }) : 'all';
  if (yearEl) yearEl.value = filterType === 'monthly' || filterType === 'yearly' ? String(now.getFullYear()) : 'all';
  if (statusEl) statusEl.value = salesStatusFilter;
  renderAdminSalesHistory();
}

function compressImageDataUrl(dataUrl, maxWidth = 1600, maxBytes = 900000) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;
      let compressed = canvas.toDataURL('image/jpeg', quality);
      while (compressed.length > maxBytes && quality > 0.48) {
        quality -= 0.08;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(compressed);
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

function handleImageFileSelect(event, prefix) {
  const file = event.target.files && event.target.files[0];
  const previewEl = document.getElementById(`${prefix}-image-preview`);
  if (!file) {
    uploadedImageData[prefix] = null;
    if (previewEl) previewEl.innerHTML = `<span class="image-upload-placeholder">No image selected</span>`;
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file (JPEG, PNG, WEBP, etc.)');
    event.target.value = '';
    uploadedImageData[prefix] = null;
    if (previewEl) previewEl.innerHTML = `<span class="image-upload-placeholder">No image selected</span>`;
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    uploadedImageData[prefix] = await compressImageDataUrl(reader.result, prefix === 'slide' ? 1600 : 1200, prefix === 'slide' ? 900000 : 700000);
    if (previewEl) {
      previewEl.innerHTML = `
        <div class="image-upload-thumb-wrap">
            <img src="${uploadedImageData[prefix]}" alt="Preview">
            <span class="image-upload-filename">${file.name}</span>
        </div>
      `;
    }
  };
  reader.onerror = () => {
    alert('Could not read that image file. Please try again.');
    uploadedImageData[prefix] = null;
  };
  reader.readAsDataURL(file);
}

function resetImageUpload(prefix) {
  uploadedImageData[prefix] = null;
  const fileInput = document.getElementById(`${prefix}-image-file`);
  if (fileInput) fileInput.value = '';
  const previewEl = document.getElementById(`${prefix}-image-preview`);
  if (previewEl) previewEl.innerHTML = `<span class="image-upload-placeholder">No image selected</span>`;
}

function adminAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById('add-name').value;
  const price = parseFloat(document.getElementById('add-price').value);
  const category = document.getElementById('add-category').value;

  const sizeStock = {
    S: parseInt(document.getElementById('add-stock-s').value) || 0,
    M: parseInt(document.getElementById('add-stock-m').value) || 0,
    L: parseInt(document.getElementById('add-stock-l').value) || 0,
    XL: parseInt(document.getElementById('add-stock-xl').value) || 0,
  };

  if (!uploadedImageData.add) {
    alert('Please choose a product image from your computer.');
    return;
  }
  const image = uploadedImageData.add;
  const description = document.getElementById('add-desc').value;

  const promoInput = document.getElementById('add-promo-price');
  const promoRaw = promoInput ? parseFloat(promoInput.value) : NaN;
  let promoPrice = null;
  if (!isNaN(promoRaw) && promoRaw > 0) {
    if (promoRaw >= price) {
      alert('Promotion price must be lower than the regular price. The product will be added without a promotion.');
    } else {
      promoPrice = promoRaw;
    }
  }

  products.unshift({ id: Date.now(), name, price, promoPrice, category, sizeStock, image, description });

  // THE FIX: Push the newly added product directly to the Firebase Database
  if (typeof saveProductsToCloud === 'function') {
    saveProductsToCloud();
  }

  if (currentUser) {
    const total = sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL;
    addNotification(currentUser.email, 'Admin Action', `Added product "${name}" with ${total} total stock units (S:${sizeStock.S} M:${sizeStock.M} L:${sizeStock.L} XL:${sizeStock.XL})${promoPrice != null ? ` and a promo price of RM ${promoPrice.toFixed(2)}` : ''}.`);
  }

  renderAdminProducts();
  renderProducts(products);
  populateSlideProductDropdown();
  alert('Product added successfully!');
  e.target.reset();
  resetImageUpload('add');
}

function renderAdminProducts() {
  const tbody = document.getElementById('admin-product-list');
  if (!tbody) return;
  tbody.innerHTML = '';
  let rowsHtml = '';

  products.forEach((p, idx) => {
    const hasPromo = p.promoPrice != null && p.promoPrice > 0 && p.promoPrice < p.price;
    if (!p.sizeStock) {
      p.sizeStock = { S: p.stock || 0, M: 0, L: 0, XL: 0 };
    }
    const total = getTotalStock(p);
    const sizeCells = PRODUCT_SIZES.map((s) => `
          <td>
             <input type="number" value="${p.sizeStock[s] || 0}" min="0" onchange="updateSizeStock(${p.id}, '${s}', this.value)" style="width:55px; padding:4px; background:#111; color:#fff; border:1px solid #444; margin:0;">
          </td>`).join('');

    rowsHtml += `
      <tr>
          <td style="display:flex; align-items:center; gap:10px;"><img src="${p.image}" style="width:40px; height:40px; object-fit:cover;"> ${p.name}</td>
          <td>RM ${p.price.toFixed(2)}</td>
          <td>
             <input type="number" value="${p.promoPrice != null ? p.promoPrice : ''}" min="0" step="0.01" placeholder="none" onchange="updateProductPromo(${p.id}, this.value)" style="width:80px; padding:4px; background:#111; color:${hasPromo ? '#4ade80' : '#fff'}; border:1px solid #444; margin:0;">
          </td>
          ${sizeCells}
          <td style="font-weight: bold;">${total}</td>
          <td style="color: ${total > 0 ? '#4ade80' : '#ef4444'};">${total > 0 ? 'Active' : 'Out of Stock'}</td>
          <td style="text-align: center;"><button onclick="deleteProduct(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

function updateProductPromo(id, value) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  const val = parseFloat(value);
  if (value === '' || isNaN(val) || val <= 0) {
    const hadPromo = p.promoPrice != null;
    p.promoPrice = null;
    if (currentUser && hadPromo) {
      addNotification(currentUser.email, 'Admin Action', `Removed promotion price for "${p.name}".`);
    }
  } else if (val >= p.price) {
    alert('Promotion price must be lower than the regular price.');
    renderAdminProducts(); 
    return;
  } else {
    p.promoPrice = val;
    if (currentUser) {
      addNotification(currentUser.email, 'Admin Action', `Set promotion price for "${p.name}" to RM ${val.toFixed(2)} (regular RM ${p.price.toFixed(2)}).`);
    }
  }

  // THE FIX: Save promo price update to Firebase
  if (typeof saveProductsToCloud === 'function') {
    saveProductsToCloud();
  }

  renderAdminProducts();
  renderProducts(products);
}

function updateSizeStock(id, size, newValue) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  if (!p.sizeStock) p.sizeStock = { S: 0, M: 0, L: 0, XL: 0 };
  p.sizeStock[size] = Math.max(0, parseInt(newValue) || 0);

  // THE FIX: Push the updated inventory count instantly to Firebase
  if (typeof saveProductsToCloud === 'function') {
    saveProductsToCloud();
  }

  if (currentUser) {
    addNotification(currentUser.email, 'Admin Action', `Updated size ${size} stock for "${p.name}" to ${p.sizeStock[size]} units (total now ${getTotalStock(p)}).`);
  }

  renderAdminProducts();
  renderProducts(products);
}

function deleteProduct(index) {
  const removed = products[index];
  products.splice(index, 1);

  // THE FIX: Sync product deletion to Firebase
  if (typeof saveProductsToCloud === 'function') {
    saveProductsToCloud();
  }

  if (currentUser && removed) {
    addNotification(currentUser.email, 'Admin Action', `Deleted product "${removed.name}".`);
  }

  renderAdminProducts();
  renderProducts(products);
  populateSlideProductDropdown();
}

function toggleSlideTargetField() {
  const type = document.getElementById('slide-link-type').value;
  const shopField = document.getElementById('slide-shop-target');
  const itemField = document.getElementById('slide-item-target');

  if (type === 'item') {
    shopField.style.display = 'none';
    itemField.style.display = 'block';
  } else {
    shopField.style.display = 'block';
    itemField.style.display = 'none';
  }
}

function populateSlideProductDropdown() {
  const dropdown = document.getElementById('slide-item-select');
  if (!dropdown) return;
  
  dropdown.innerHTML = '<option value="" disabled selected>Select Specific Item Page</option>';
  products.forEach(p => {
    dropdown.innerHTML += `<option value="${p.id}">${p.name} (RM ${p.price})</option>`;
  });
}

async function adminAddSlide(e) {
  e.preventDefault();
  const form = e.currentTarget || e.target;
  const submitButton = form.querySelector('button[type="submit"]') || e.submitter;
  if (submitButton?.disabled) return;
  if (submitButton) { submitButton.disabled = true; submitButton.innerText = 'SYNCHRONIZING…'; }

  const title = document.getElementById('slide-title').value.trim();
  const subtitle = document.getElementById('slide-subtitle').value.trim();
  const image = uploadedImageData.slide;
  const linkType = document.getElementById('slide-link-type').value;
  const btnText = document.getElementById('slide-btnText').value.trim();
  const targetSelect = document.getElementById('slide-item-select');
  const targetItemId = linkType === 'item' ? parseInt(targetSelect?.value, 10) : null;

  if (!title || !subtitle || !btnText) {
    alert('Please complete the Hero Slide title, subtitle, and button text.');
    if (submitButton) { submitButton.disabled = false; submitButton.innerText = 'ADD HERO SLIDE'; }
    return;
  }
  if (!image || image === 'processing') {
    alert('Please wait for the banner image preview to finish processing.');
    if (submitButton) { submitButton.disabled = false; submitButton.innerText = 'ADD HERO SLIDE'; }
    return;
  }
  if (image.length > 1000000) {
    alert('This banner is still too large. Choose a smaller image and try again.');
    if (submitButton) { submitButton.disabled = false; submitButton.innerText = 'ADD HERO SLIDE'; }
    return;
  }
  if (linkType === 'item' && !Number.isFinite(targetItemId)) {
    alert('Select the product page that this slide should open.');
    if (submitButton) { submitButton.disabled = false; submitButton.innerText = 'ADD HERO SLIDE'; }
    return;
  }

  const newSlideId = `slide_${Date.now()}`;
  const previousSlides = heroSlides.slice();
  heroSlides.push({ slideId: newSlideId, title, subtitle, image, btnText, linkType, targetItemId, sortOrder: heroSlides.length });
  setAdminSyncStatus('SYNCHRONIZING NEW HERO SLIDE WITH FIREBASE…', false);

  try {
    const authReady = await waitForAdminFirebaseAuth();
    if (!authReady) throw new Error('The Firebase administrator session is not ready. Sign out and sign in again through admin-login.html.');
    const savedSlides = await saveSlidesToCloud();
    if (!savedSlides) throw new Error('Firebase did not confirm the Hero Slides write. Check Realtime Database Rules and the admin UID role.');
    renderAdminSlides();
    renderHeroSlider();
    if (currentUser) addNotification(currentUser.email, 'Admin Action', `Added hero slide "${title}".`);
    alert('Hero slide added successfully and synchronized with Firebase.');
    form.reset();
    resetImageUpload('slide');
  } catch (error) {
    heroSlides = previousSlides;
    renderAdminSlides();
    setAdminSyncStatus(`HERO SLIDE SAVE FAILED • ${error.message}`, false);
    alert(`Hero Slide was not saved: ${error.message}`);
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.innerText = 'ADD HERO SLIDE'; }
  }
}

function renderAdminSlides() {
  const tbody = document.getElementById('admin-slide-list');
  if (!tbody) return;
  tbody.innerHTML = '';
  let rowsHtml = '';

  heroSlides.forEach((s, idx) => {
    const linkLabel = s.linkType === 'item' ? `Direct to Item ID: ${s.targetItemId}` : 'Redirects to Shop Catalog';
    rowsHtml += `
      <tr>
          <td><img src="${s.image}" style="width:60px; height:35px; object-fit:cover;"></td>
          <td><strong>${s.title}</strong><br><small style="color:var(--text-secondary);">${s.subtitle}</small></td>
          <td>${s.btnText}</td>
          <td><small style="color:var(--accent);">${linkLabel}</small></td>
          <td style="text-align: center;"><button onclick="deleteSlide(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

async function deleteSlide(idx) {
  const removed = heroSlides[idx];
  if (!removed) return;
  heroSlides.splice(idx, 1);
  heroSlides = normalizeHeroSlides(heroSlides);

  const savedSlides = typeof saveSlidesToCloud === 'function'
    ? await saveSlidesToCloud({ silent: true })
    : heroSlides;
  if (!savedSlides) {
    heroSlides.splice(idx, 0, removed);
    heroSlides = normalizeHeroSlides(heroSlides);
    renderAdminSlides();
    return;
  }

  if (currentUser) {
    addNotification(currentUser.email, 'Admin Action', `Deleted slide "${removed.title}".`);
  }

  renderAdminSlides();
  renderHeroSlider();
}

function getRegisteredUsersList() {
  return Array.isArray(registeredUsers) ? registeredUsers : [];
}

function renderAdminUsers() {
  const tbody = document.getElementById('admin-user-list');
  if (!tbody) return;
  tbody.innerHTML = '';
  let rowsHtml = '';

  let users = getRegisteredUsersList();

  users.forEach((u) => {
    const isBlocked = !!u.blocked;
    const statusCell = isBlocked
      ? `<span style="color: #ef4444; font-weight: bold; display: block; margin-bottom: 4px;">Blocked</span>
         <button class="admin-action-btn" style="background: var(--bg-primary); border: 1px solid var(--border); padding: 4px 8px; font-size: 0.75rem; color: var(--text-primary); cursor: pointer;" onclick="toggleUserBlock('${u.email}')" title="Restore account access">
             Unblock
         </button>`
      : `<span style="color: #4ade80; font-weight: bold; display: block; margin-bottom: 4px;">Active</span>
         <button class="admin-action-btn" style="background: var(--bg-primary); border: 1px solid var(--border); padding: 4px 8px; font-size: 0.75rem; color: var(--text-primary); cursor: pointer;" onclick="toggleUserBlock('${u.email}')" title="Block this account from logging in">
             Block
         </button>`;

    rowsHtml += `
      <tr>
          <td>${u.username || 'user'}</td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td>${u.address || '—'}</td>
          <td>${u.state || 'Selangor'}</td>
          <td>${statusCell}</td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

async function toggleUserBlock(email) {
  const users = getRegisteredUsersList().map((user) => ({ ...user }));
  const idx = users.findIndex((user) => (user.email || '').toLowerCase() === email.toLowerCase());
  if (idx === -1) return;
  users[idx].blocked = !users[idx].blocked;
  registeredUsers = users;
  await saveUsersToCloud(users);
  renderAdminUsers();
}

function renderAdminSalesHistory() {
  const tbody = document.getElementById('admin-sales-list');
  if (!tbody) return;
  const salesTab = document.getElementById('admin-sales-history');
  if (salesTab && !salesTab.classList.contains('active')) return;
  tbody.innerHTML = '';

  const monthFilter = document.getElementById('sales-month-filter').value;
  const yearFilter = document.getElementById('sales-year-filter').value;

  let filtered = salesHistoryData.filter((order) => {
    const orderDate = analyticsOrderDate(order);
    const dateText = String(order.date || '');
    const displayStatus = normalizeOrderStatus(order.status);
    const matchesMonth = monthFilter === 'all'
      || dateText.includes(monthFilter)
      || (orderDate && orderDate.toLocaleDateString('en-US', { month: 'short' }) === monthFilter);
    const matchesYear = yearFilter === 'all'
      || dateText.includes(yearFilter)
      || (orderDate && String(orderDate.getFullYear()) === yearFilter);
    const matchesStatus = salesStatusFilter === 'all' || displayStatus === salesStatusFilter;
    return matchesMonth && matchesYear && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">No sales records found for this period.</td></tr>`;
    return;
  }

  let rowsHtml = '';
  filtered.forEach((order) => {
    const displayStatus = normalizeOrderStatus(order.status);
    let statusColor = '#ef4444';
    if (displayStatus === 'Pending') statusColor = '#94a3b8';
    if (displayStatus === 'Out for Delivery') statusColor = '#f59e0b';
    if (displayStatus === 'Delivered') statusColor = '#4ade80';

    let trackingDisplay = order.trackingNo 
      ? `<span class="tracking-link" style="color: var(--accent); cursor: pointer;" onclick="openTrackingView('${order.trackingNo}', 'admin')">${order.trackingNo}</span>`
      : `<span style="color: var(--text-secondary); font-style: italic;">Pending Generation</span>`;

    const isInstantOrder = String(order.deliveryMethod || '').toLowerCase() === 'instant';
    let deliveryDisplay = order.batchId
      ? `<span style="color: var(--text-secondary); font-size: 0.75rem;"><i class="fa-solid ${isInstantOrder ? 'fa-bolt' : 'fa-truck'}"></i> ${isInstantOrder ? 'Instant Express' : 'Standard'}<br><span style="cursor:pointer; color: var(--accent);" onclick="switchAdminTab('lorry-batches')">${order.batchId}</span></span>`
      : `<span style="color: var(--text-secondary); font-size: 0.75rem;"><i class="fa-solid ${isInstantOrder ? 'fa-bolt' : 'fa-truck'}"></i> ${isInstantOrder ? 'Instant — awaiting batch repair' : 'Standard — awaiting batch assignment'}</span>`;

    let statusActionCell = `<span style="color: ${statusColor}; font-weight: bold; display: block; margin-bottom: 4px;">${displayStatus}</span>
         <button class="admin-action-btn" style="background: var(--bg-primary); border: 1px solid var(--border); padding: 4px 8px; font-size: 0.75rem; color: var(--text-primary); cursor: pointer;" onclick="toggleOrderStatus('${order.orderId}')" title="Change fulfillment status">
             Update Status ⟳
         </button>
         ${order.batchId ? '<span style="display:block; color: var(--text-secondary); font-size: 0.7rem; font-style: italic; margin-top:0.25rem;">Linked to live batch</span>' : ''}`;

    rowsHtml += `
      <tr>
          <td>${order.orderId}</td>
          <td>${order.customerName}</td>
          <td>${trackingDisplay}</td>
          <td>${order.address}</td>
          <td>${deliveryDisplay}</td>
          <td style="color: var(--accent); font-weight: bold;">RM ${(order.amount || 0).toFixed(2)}</td>
          <td>${order.date}</td>
          <td style="text-align: center;">
              <button class="admin-action-btn" style="background: var(--bg-primary); border: 1px solid var(--border); padding: 6px 12px; font-size: 0.75rem; color: var(--accent); cursor: pointer; white-space: nowrap;" onclick="openOrderDetailModal('${order.orderId}')" title="View full order & item details">
                  <i class="fa-solid fa-eye"></i> View Details
              </button>
          </td>
          <td>
              ${statusActionCell}
          </td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

let currentOrderDetailId = null;

function openOrderDetailModal(orderId) {
  const decodedOrderId = decodeURIComponent(String(orderId || ''));
  const order = salesHistoryData.find((o) => String(o.orderId) === decodedOrderId);
  if (!order) return;

  currentOrderDetailId = decodedOrderId;

  const modalTitle = document.getElementById('order-modal-title');
  if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-receipt" style="color:var(--accent); margin-right:8px;"></i> OVERVIEW — ${order.orderId}`;

  let statusColor = '#ef4444';
  if (order.status === 'Pending') statusColor = '#94a3b8';
  if (order.status === 'Out for Delivery') statusColor = '#f59e0b';
  if (order.status === 'Delivered') statusColor = '#4ade80';

  const trackingDisplay = order.trackingNo
    ? `<span class="tracking-link" style="color: var(--accent); cursor: pointer;" onclick="openTrackingView('${order.trackingNo}', 'admin'); closeOrderDetailModal();">${order.trackingNo}</span>`
    : `<span style="color: var(--text-secondary); font-style: italic;">Pending Generation</span>`;

  const deliveryLabel = order.batchId
    ? `${order.deliveryMethod === 'instant' ? 'Instant Express' : 'Standard'} (Batch ${order.batchId})`
    : (order.deliveryMethod === 'standard' ? 'Standard' : 'Instant — awaiting batch repair');

  const lines = (order.itemsDetail && order.itemsDetail.length > 0)
    ? order.itemsDetail
    : [{ name: order.items || 'No item detail recorded for this order.', size: '—', qty: order.qty != null ? order.qty : '—' }];

  const itemsHtml = `
    <table class="order-detail-items-table">
        <thead><tr><th>Item Name</th><th>Size</th><th>Total Qty</th></tr></thead>
        <tbody>
            ${lines.map((it) => `
              <tr>
                  <td>${it.name}</td>
                  <td>${it.size ? it.size : '—'}</td>
                  <td>${it.qty}</td>
              </tr>
            `).join('')}
        </tbody>
    </table>`;

  const statusActionHtml = order.batchId
    ? `<span style="color: ${statusColor}; font-weight: bold;">${order.status}</span>
       <div style="color: var(--text-secondary); font-size: 0.75rem; font-style: italic; margin-top: 4px;">Managed via Lorry Batches — dispatch/deliver it from the "Lorry Batches" tab.</div>`
    : `<div style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; flex-wrap: wrap;">
           <span style="color: ${statusColor}; font-weight: bold;">${order.status}</span>
           <button class="admin-action-btn" style="background: var(--bg-primary); border: 1px solid var(--border); padding: 6px 14px; font-size: 0.75rem; color: var(--text-primary); cursor: pointer;" onclick="updateStatusFromOrderModal('${order.orderId}')" title="Change fulfillment status">
               Update Status ⟳
           </button>
       </div>`;

  const body = document.getElementById('order-modal-body');
  if (body) {
    body.innerHTML = `
      <div class="notif-detail-grid" style="margin-bottom: 1rem;">
          <div class="detail-item"><span>Customer</span><strong>${order.customerName}</strong></div>
          <div class="detail-item"><span>Date & Time</span><strong>${order.date}</strong></div>
          <div class="detail-item"><span>Delivery Method</span><strong>${deliveryLabel}</strong></div>
          <div class="detail-item"><span>Tracking Number</span><strong>${trackingDisplay}</strong></div>
          <div class="detail-item" style="grid-column: span 2;"><span>Delivery Address</span><strong>${order.address}</strong></div>
          <div class="detail-item"><span>Total Quantity</span><strong>${order.qty}</strong></div>
          <div class="detail-item"><span>Total Amount</span><strong style="color: var(--accent);">RM ${(order.amount || 0).toFixed(2)}</strong></div>
      </div>

      <h4 style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--accent); margin-bottom: 0.6rem;">ITEMS PURCHASED</h4>
      ${itemsHtml}

      <h4 style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--accent); margin: 1.2rem 0 0.6rem;">FULFILLMENT STATUS</h4>
      ${statusActionHtml}
    `;
  }

  const modal = document.getElementById('order-detail-modal');
  if (modal) modal.classList.add('active');
}

function closeOrderDetailModal() {
  const modal = document.getElementById('order-detail-modal');
  if (modal) modal.classList.remove('active');
  currentOrderDetailId = null;
}

function updateStatusFromOrderModal(orderId) {
  const decodedOrderId = decodeURIComponent(String(orderId || ''));
  const exists = salesHistoryData.some((o) => String(o.orderId) === decodedOrderId);
  if (!exists) return;
  toggleOrderStatus(decodedOrderId);
  const modal = document.getElementById('order-detail-modal');
  if (modal && modal.classList.contains('active')) {
    openOrderDetailModal(orderId);
  }
}

function ensureOpenOrdersHaveDispatchBatches() {
  if (!adminSalesLoaded || !adminBatchesLoaded) return false;
  if (!Array.isArray(salesHistoryData) || !Array.isArray(lorryBatches)) return false;

  let batchesChanged = false;
  let ordersChanged = false;
  const ordersToDispatch = new Set();

  salesHistoryData.forEach((order) => {
    if (!order || !['instant', 'standard'].includes(String(order.deliveryMethod || '').toLowerCase())) return;
    const orderStatus = normalizeOrderStatus(order.status);
    if (!['Pending', 'Out for Delivery', 'Delivered'].includes(orderStatus)) return;

    let attachedBatch = lorryBatches.find((batch) =>
      String(batch.batchId) === String(order.batchId)
      || (Array.isArray(batch.stops) && batch.stops.some((stop) => String(stop.orderId) === String(order.orderId)))
    );

    if (!attachedBatch && orderStatus !== 'Delivered') {
      attachedBatch = assignOrderToLorryBatch(order, { persist: false });
      batchesChanged = true;
      ordersChanged = true;
    }

    if (!attachedBatch) return;
    if (order.batchId !== attachedBatch.batchId) {
      order.batchId = attachedBatch.batchId;
      ordersChanged = true;
    }

    const stop = Array.isArray(attachedBatch.stops)
      ? attachedBatch.stops.find((item) => String(item.orderId) === String(order.orderId))
      : null;
    if (!stop) return;

    if (attachedBatch.status === 'Out for Delivery' || attachedBatch.status === 'Paused') {
      const nextStatus = attachedBatch.status === 'Paused' ? 'Out for Delivery' : 'Out for Delivery';
      const nextTracking = stop.trackingNo || order.trackingNo || null;
      if (normalizeOrderStatus(order.status) !== nextStatus) { order.status = nextStatus; ordersChanged = true; }
      if (nextTracking && order.trackingNo !== nextTracking) { order.trackingNo = nextTracking; ordersChanged = true; }
      if (order.vehicleCategory !== attachedBatch.vehicleCategory) { order.vehicleCategory = attachedBatch.vehicleCategory; ordersChanged = true; }
      if (order.vehicleType !== attachedBatch.vehicleType) { order.vehicleType = attachedBatch.vehicleType; ordersChanged = true; }
    } else if (attachedBatch.status === 'Delivered' || normalizeOrderStatus(stop.status) === 'Delivered') {
      if (normalizeOrderStatus(order.status) !== 'Delivered') { order.status = 'Delivered'; ordersChanged = true; }
      if (order.eta !== 'Delivered') { order.eta = 'Delivered'; ordersChanged = true; }
    } else if (orderStatus === 'Out for Delivery' && attachedBatch.status === 'Forming') {
      ordersToDispatch.add(attachedBatch.batchId);
    }
  });

  ordersToDispatch.forEach((batchId) => {
    const batch = lorryBatches.find((item) => item.batchId === batchId);
    if (batch && batch.status === 'Forming') {
      dispatchLorryBatch(batchId, { silent: true });
      batchesChanged = true;
      ordersChanged = true;
    }
  });

  if (batchesChanged) saveLorryBatches();
  if (ordersChanged) {
    saveSalesHistory();
    renderAdminSalesHistory();
    scheduleAnalyticsRefresh();
  }
  return batchesChanged || ordersChanged;
}

function renderAdminLorryBatches() {
  const container = document.getElementById('admin-lorry-batches-list');
  if (!container) return;

  if (lorryBatches.length === 0) {
    container.innerHTML = `<div class="lorry-batch-empty-note">No dispatch batches yet. Standard orders create state-based van/lorry batches, while Instant orders create express dispatch batches automatically.</div>`;
    return;
  }

  const sorted = lorryBatches.slice().sort((a, b) => {
    const rank = { 'Forming': 0, 'Out for Delivery': 1, 'Paused': 2, 'Delivered': 3 };
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return (b.dispatchTime || b.createdAt) - (a.dispatchTime || a.createdAt);
  });

  container.innerHTML = sorted.map((batch) => {
    let statusColor = '#94a3b8';
    if (batch.status === 'Out for Delivery') statusColor = '#f59e0b';
    if (batch.status === 'Paused') statusColor = '#fb923c';
    if (batch.status === 'Delivered') statusColor = '#4ade80';

    const stopsFillPct = batch.stops.length / STANDARD_VAN_MAX_STOPS;
    const itemsFillPct = (batch.totalItems || 0) / STANDARD_VAN_MAX_ITEMS;
    const fillPct = batch.vehicleCategory === 'lorry'
      ? 100
      : Math.min(100, Math.round(Math.max(stopsFillPct, itemsFillPct) * 100));
    const isInstantBatch = (batch.deliveryMethod || 'standard') === 'instant' || batch.batchType === 'express';
    const dispatchLabel = isInstantBatch
      ? 'DISPATCH EXPRESS'
      : (batch.vehicleCategory === 'lorry' ? 'DISPATCH LORRY' : 'DISPATCH VAN');

    const telemetry = batch.liveTelemetry || {};
    const nextStop = batch.stops.find((stop) => stop.status !== 'Delivered');
    const liveUpdateLabel = telemetry.lastUpdatedAt ? new Date(telemetry.lastUpdatedAt).toLocaleTimeString('en-MY') : 'waiting';
    const liveSummary = `${telemetry.completedStops || 0}/${telemetry.totalStops || batch.stops.length} stops complete · ETA ${formatLiveEta(telemetry.remainingSec)} · live ${liveUpdateLabel}`;
    let dispatchBtn = '';
    if (batch.status === 'Forming') {
      dispatchBtn = `<button class="admin-action-btn" style="background: var(--accent); border: none; padding: 8px 16px; font-size: 0.78rem; color: #000; font-weight: bold; cursor: pointer;" onclick="dispatchLorryBatch('${batch.batchId}')"><i class="fa-solid fa-truck-fast"></i> ${dispatchLabel}</button>`;
    } else if (batch.status === 'Out for Delivery') {
      dispatchBtn = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="admin-action-btn" style="background:#f59e0b; border:none; padding:8px 10px; font-size:0.72rem; color:#000; font-weight:bold; cursor:pointer;" onclick="pauseLorryBatch('${batch.batchId}')"><i class="fa-solid fa-pause"></i> PAUSE</button>
        <button class="admin-action-btn" style="background:#4ade80; border:none; padding:8px 10px; font-size:0.72rem; color:#000; font-weight:bold; cursor:pointer;" onclick="completeNextLorryStop('${batch.batchId}')"><i class="fa-solid fa-check"></i> NEXT STOP</button>
        ${nextStop && nextStop.trackingNo ? `<button class="admin-action-btn" style="background:#818cf8; border:none; padding:8px 10px; font-size:0.72rem; color:#000; font-weight:bold; cursor:pointer;" onclick="openTrackingView('${nextStop.trackingNo}', 'admin')"><i class="fa-solid fa-map-location-dot"></i> LIVE MAP</button>` : ''}
      </div>`;
    } else if (batch.status === 'Paused') {
      dispatchBtn = `<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="admin-action-btn" style="background:#4ade80; border:none; padding:8px 10px; font-size:0.72rem; color:#000; font-weight:bold; cursor:pointer;" onclick="resumeLorryBatch('${batch.batchId}')"><i class="fa-solid fa-play"></i> RESUME</button>
        <button class="admin-action-btn" style="background:#f59e0b; border:none; padding:8px 10px; font-size:0.72rem; color:#000; font-weight:bold; cursor:pointer;" onclick="completeNextLorryStop('${batch.batchId}')"><i class="fa-solid fa-check"></i> NEXT STOP</button>
      </div>`;
    } else {
      dispatchBtn = `<span style="color: ${statusColor}; font-weight: bold; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> Completed</span>`;
    }

    const manifestRows = batch.stops.map((stop) => {
      let stopColor = '#94a3b8';
      if (stop.status === 'Delivered') stopColor = '#4ade80';
      else if (batch.status === 'Out for Delivery') stopColor = '#f59e0b';
      return `
        <tr>
            <td>${stop.sequence || '—'}</td>
            <td>${stop.orderId}</td>
            <td>${stop.customerName || '—'}</td>
            <td>${stop.address}</td>
            <td>${stop.trackingNo ? `<span class="tracking-link" style="color: var(--accent); cursor:pointer;" onclick="openTrackingView('${stop.trackingNo}', 'admin')">${stop.trackingNo}</span>` : '—'}</td>
            <td style="color: ${stopColor}; font-weight: bold;">${stop.status}</td>
        </tr>`;
    }).join('');

    return `
      <div class="lorry-batch-admin-card">
          <div class="lorry-batch-admin-header">
              <div class="lorry-batch-admin-title">
                  <i class="fa-solid ${batch.vehicleIcon || 'fa-truck'}"></i>
                  <div>
                      <strong>${batch.batchId} — ${batch.state} ${isInstantBatch ? '• INSTANT' : '• STANDARD'}</strong>
                      <small>${batch.vehicleType} • Plate ${batch.plateNo} • Driver: ${batch.courier}</small>
                      <div class="lorry-batch-fill-bar"><div class="lorry-batch-fill-bar-inner" style="width:${fillPct}%;"></div></div>
                      <small>${batch.stops.length} order(s) / ${batch.totalItems || 0} item(s) ${batch.vehicleCategory === 'lorry' ? '(upgraded to lorry)' : `(van limit: ${STANDARD_VAN_MAX_STOPS} orders / ${STANDARD_VAN_MAX_ITEMS} items)`} · <span style="color:${statusColor}; font-weight:bold;">${batch.status}</span></small><small style="color:var(--accent); display:block; margin-top:4px;">${liveSummary}</small><small style="color:var(--text-secondary); display:block; margin-top:4px;"><i class="fa-solid fa-circle-info"></i> Vehicle rule: ${getVehicleAssignmentExplanation(batch)}</small>
                  </div>
              </div>
              ${dispatchBtn}
          </div>
          <table class="lorry-batch-manifest-table">
              <thead>
                  <tr><th>Stop</th><th>Order ID</th><th>Customer</th><th>Address</th><th>Tracking</th><th>Status</th></tr>
              </thead>
              <tbody>
                  ${manifestRows || `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary);">No parcels in this batch yet.</td></tr>`}
              </tbody>
          </table>
      </div>`;
  }).join('');
}

async function toggleBatchedOrderStatus(order) {
  const batch = lorryBatches.find((item) => String(item.batchId) === String(order.batchId));
  const stop = batch?.stops?.find((item) => String(item.orderId) === String(order.orderId));
  if (!batch || !stop) {
    alert('The batch link is stale. Refresh Firebase data and use the repair control in Lorry Batches.');
    return;
  }

  const currentStatus = normalizeOrderStatus(order.status);
  if (currentStatus === 'Pending' && batch.status === 'Forming') {
    dispatchLorryBatch(batch.batchId, { silent: true });
    renderAdminSalesHistory();
    scheduleAnalyticsRefresh();
    alert(`Order ${order.orderId} status updated to: Out for Delivery`);
    return;
  }
  if (currentStatus === 'Pending' && batch.status === 'Paused') {
    alert('This dispatch is paused. Resume the batch before changing the order status.');
    return;
  }
  if (currentStatus === 'Out for Delivery') {
    const now = Date.now();
    stop.status = 'Delivered';
    stop.deliveredAt = now;
    order.status = 'Delivered';
    order.eta = 'Delivered';
    order.deliveredAt = now;
    order.updatedAt = now;
    if (batch.stops.every((item) => normalizeOrderStatus(item.status) === 'Delivered')) batch.status = 'Delivered';
    updateBatchLiveTelemetry(batch, now);
    saveLorryBatches();
    const saved = await saveSalesHistory();
    if (saved === null) {
      alert('Firebase rejected the delivery update. Check the administrator session and Firebase Rules.');
      return;
    }
    if (order.customerEmail) addNotification(order.customerEmail, 'Order Delivered', `Your order ${order.orderId} has been delivered successfully.`, order.trackingNo, { orderId: order.orderId, status: 'Delivered', type: 'tracking' });
    renderAdminSalesHistory();
    renderAdminLorryBatches();
    scheduleAnalyticsRefresh();
    alert(`Order ${order.orderId} status updated to: Delivered`);
    return;
  }
  alert(`Order ${order.orderId} is already ${currentStatus}.`);
}

async function toggleOrderStatus(orderId) {
  const order = salesHistoryData.find((item) => String(item.orderId) === String(orderId));
  if (!order) return;
  if (order.batchId) return toggleBatchedOrderStatus(order);

  const currentStatus = normalizeOrderStatus(order.status);
  let nextStatus = 'Pending';
  const now = Date.now();
  const targetEmail = order.customerEmail || null;

  if (currentStatus === 'Pending') {
    nextStatus = 'Out for Delivery';
    order.dispatchTime = now;
    order.durationSec = Number(order.durationSec) || 120;
    order.eta = `${order.durationSec}s remaining`;
    order.trackingNo = order.trackingNo || `TRK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!order.vehicleCategory) order.vehicleCategory = getOrderVehicleCategory(order);
    if (targetEmail) addNotification(targetEmail, 'Package Out For Delivery', `Your order ${order.orderId} is now Out for Delivery. Tracking Code: ${order.trackingNo}`, order.trackingNo, {
      orderId: order.orderId, amount: order.amount, status: nextStatus, items: order.items, type: 'tracking'
    });
  } else if (currentStatus === 'Out for Delivery') {
    nextStatus = 'Delivered';
    order.eta = 'Delivered';
    order.deliveredAt = now;
    if (targetEmail) addNotification(targetEmail, 'Order Delivered', `Your order ${order.orderId} (${order.trackingNo || 'tracking pending'}) has been delivered successfully.`, order.trackingNo, {
      orderId: order.orderId, amount: order.amount, status: nextStatus, items: order.items, type: 'tracking'
    });
  } else {
    nextStatus = 'Pending';
    order.eta = 'Pending Dispatch';
    order.trackingNo = null;
    delete order.dispatchTime;
    delete order.deliveredAt;
  }

  order.status = nextStatus;
  order.updatedAt = now;

  if (nextStatus === 'Out for Delivery' && !order.batchId && ['instant', 'standard'].includes(String(order.deliveryMethod || '').toLowerCase())) {
    const batch = assignOrderToLorryBatch(order);
    if (batch && batch.status === 'Forming') dispatchLorryBatch(batch.batchId, { silent: true });
  }

  const saved = await saveSalesHistory();
  if (saved === null) {
    alert('Firebase rejected the status update. Check the administrator session and Firebase Rules.');
    return;
  }
  renderAdminSalesHistory();
  scheduleAnalyticsRefresh();
  alert(`Order ${order.orderId} status updated to: ${nextStatus}`);
}

function openTrackingView(trackingNo, origin = 'customer') {
  const decodedTrackingNo = decodeURIComponent(String(trackingNo || ''));
  const order = salesHistoryData.find((o) => String(o.trackingNo) === decodedTrackingNo) || salesHistoryData[0];
  if (!order) {
    alert('No order data is available for tracking yet.');
    return;
  }

  if (order.status !== 'Out for Delivery' && order.status !== 'Delivered') {
    const msg = order.batchId
      ? `Tracking Locked: Order status is currently "${order.status}". This order is waiting in its dispatch batch (${order.batchId}) and will unlock once an admin dispatches that batch.`
      : `Tracking Locked: Order status is currently "${order.status}". The admin must update the status to "Out for Delivery" before live map tracking can be accessed.`;
    alert(msg);
    return;
  }

  currentTrackingOrder = order;
  trackingViewOrigin = origin;
  updateTrackingBackButton();

  document.getElementById('track-number-disp').innerText = order.trackingNo || 'TRK-2026-0000';
  document.getElementById('track-sender').innerText = order.sender || 'VOID Central Hub, Shah Alam';
  document.getElementById('track-courier').innerText = order.courier || 'Aiman Zikri';
  document.getElementById('track-vehicle-type').innerText = order.vehicleType || 'Yamaha Y15ZR Motorcycle';
  document.getElementById('track-plate').innerText = order.plateNo || 'VAB 4821';
  document.getElementById('track-dest-address').innerText = order.address;

  navigateTo('tracking');
}

function updateTrackingBackButton() {
  const btn = document.getElementById('tracking-back-btn');
  if (!btn) return;
  if (trackingViewOrigin === 'admin') {
    btn.innerHTML = '← Back to Dashboard';
    btn.onclick = () => navigateTo('admin');
  } else {
    btn.innerHTML = '← Back to Home';
    btn.onclick = () => navigateTo('home');
  }
}

const HUB_START_COORDS = [3.0738, 101.5183];

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

const TOLL_RATE_RM_PER_KM = {
  motorcycle: 0,
  car: 0.14,
  van: 0.22,
  lorry: 0.32,
};

const TRAFFIC_INCIDENT_TYPES = {
  jam:      { icon: 'fa-car-side',       label: 'Traffic Congestion', color: '#f59e0b', minDelaySec: 20, maxDelaySec: 60 },
  accident: { icon: 'fa-car-burst',      label: 'Accident Reported',  color: '#ef4444', minDelaySec: 40, maxDelaySec: 110 },
  flood:    { icon: 'fa-water',          label: 'Flood / Heavy Rain', color: '#38bdf8', minDelaySec: 60, maxDelaySec: 150 },
  roadwork: { icon: 'fa-person-digging', label: 'Road Works',         color: '#facc15', minDelaySec: 15, maxDelaySec: 45 },
};

const TRAFFIC_INCIDENT_DESCRIPTIONS = {
  jam: [
    'Vehicles are backed up ahead — moving slower than usual.',
    'Heavier-than-normal traffic reported along this stretch.',
    'Congestion building up near a busy junction ahead.'
  ],
  accident: [
    'A minor collision is blocking one lane ahead.',
    'Emergency services are on scene clearing an accident ahead.',
    'A breakdown is causing lane closures on the route.'
  ],
  roadwork: [
    'Lane closure for road maintenance ahead.',
    'Utility works are narrowing the road ahead.',
    'Resurfacing works are slowing traffic ahead.'
  ]
};

async function fetchLiveWeatherRisk(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,rain,weather_code&timezone=auto`;
    const res = await fetchWithTimeout(url, 6000);
    if (!res.ok) throw new Error(`weather HTTP ${res.status}`);
    const data = await res.json();
    const cur = data.current || {};
    const rainMm = (Number(cur.rain) || 0) + (Number(cur.precipitation) || 0);
    const code = Number(cur.weather_code);
    const isRaining = rainMm > 0.2 || (code >= 51 && code <= 82) || code >= 95;
    const isHeavy = rainMm > 4 || (code >= 65 && code <= 67) || code === 82 || code >= 95;
    return { isRaining, isHeavy, rainMm, code, live: true };
  } catch (err) {
    console.warn('Live weather check unavailable, skipping weather-based traffic factor:', err);
    return null;
  }
}

async function generateRouteConditions(target, seedKey, weather, routeMeta) {
  if (target.trafficIncidents && target.trafficCongestion) {
    return { incidents: target.trafficIncidents, congestion: target.trafficCongestion, isNew: false, source: target.trafficSource || 'simulated' };
  }

  if (hasTomTomKey() && routeMeta) {
    const live = await generateLiveTomTomConditions(routeMeta);
    if (live) {
      target.trafficIncidents = live.incidents;
      target.trafficCongestion = live.congestion;
      target.trafficSource = 'tomtom';
      return { incidents: live.incidents, congestion: live.congestion, isNew: true, source: 'tomtom' };
    }
    console.warn('TomTom traffic data unavailable this time — falling back to the simulated traffic engine.');
  }

  return generateSimulatedRouteConditions(target, seedKey, weather);
}

function generateSimulatedRouteConditions(target, seedKey, weather) {
  const rand = seededRandom(String(seedKey) + '-traffic-v1');
  const SEGMENTS = 6;
  const congestion = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const r = rand();
    congestion.push(r > 0.85 ? 'heavy' : r > 0.55 ? 'moderate' : 'free');
  }

  const incidents = [];

  if (weather && weather.isHeavy) {
    incidents.push({
      id: 'inc-flood',
      type: 'flood',
      fraction: 0.3 + rand() * 0.35,
      delayAddedSec: 60 + Math.floor(rand() * 90),
      description: 'Heavy rain is currently falling over the delivery area (live weather data) — low-lying stretches of the route may flood.',
      notified: false,
    });
  } else if (weather && weather.isRaining && rand() > 0.45) {
    incidents.push({
      id: 'inc-rain-jam',
      type: 'jam',
      fraction: 0.25 + rand() * 0.4,
      delayAddedSec: 25 + Math.floor(rand() * 35),
      description: 'Live weather shows rain over the route right now, slowing traffic.',
      notified: false,
    });
  }

  if (rand() > 0.45) {
    const pool = incidents.length ? ['accident', 'roadwork'] : ['jam', 'accident', 'roadwork'];
    const type = pool[Math.floor(rand() * pool.length)];
    const meta = TRAFFIC_INCIDENT_TYPES[type];
    const descPool = TRAFFIC_INCIDENT_DESCRIPTIONS[type];
    incidents.push({
      id: 'inc-sim-' + type,
      type,
      fraction: 0.2 + rand() * 0.55,
      delayAddedSec: meta.minDelaySec + Math.floor(rand() * (meta.maxDelaySec - meta.minDelaySec)),
      description: descPool[Math.floor(rand() * descPool.length)],
      notified: false,
    });
  }

  incidents.sort((a, b) => a.fraction - b.fraction);

  target.trafficIncidents = incidents;
  target.trafficCongestion = congestion;
  target.trafficSource = 'simulated';
  return { incidents, congestion, isNew: true, source: 'simulated' };
}

function hasTomTomKey() {
  return typeof TOMTOM_API_KEY === 'string' && TOMTOM_API_KEY.length > 10 && TOMTOM_API_KEY !== 'YOUR_TOMTOM_API_KEY_HERE';
}

const TOMTOM_ICON_CATEGORY_MAP = {
  1: 'accident', accident: 'accident',
  4: 'jam', rain: 'jam',
  6: 'jam', jam: 'jam', jamlane: 'jam',
  7: 'roadwork', laneclosed: 'roadwork',
  8: 'roadwork', roadclosed: 'roadwork',
  9: 'roadwork', roadworks: 'roadwork',
  11: 'flood', flooding: 'flood',
};

async function fetchTomTomIncidents(bbox) {
  try {
    const fields = '{incidents{type,geometry{type,coordinates},properties{iconCategory,delay,events{description}}}}';
    const url = `https://api.tomtom.com/maps/orbis/traffic/incidentDetails?apiVersion=1&key=${TOMTOM_API_KEY}&bbox=${bbox.join(',')}&fields=${encodeURIComponent(fields)}&language=en-GB&timeValidityFilter=present`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) throw new Error(`TomTom incidents HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.incidents) ? data.incidents : [];
  } catch (err) {
    console.warn('TomTom Orbis incidents fetch failed:', err);
    return null;
  }
}

async function fetchTomTomTrafficRoute(origin, destination) {
  try {
    const loc = `${origin[0]},${origin[1]}:${destination[0]},${destination[1]}`;
    const url = `https://api.tomtom.com/maps/orbis/routing/calculateRoute/${loc}/json?apiVersion=2&key=${TOMTOM_API_KEY}&traffic=true&sectionType=traffic&routeRepresentation=polyline`;
    const res = await fetchWithTimeout(url, 9000);
    if (!res.ok) throw new Error(`TomTom traffic route HTTP ${res.status}`);
    const data = await res.json();
    const route = data.routes && data.routes[0];
    if (!route) return null;
    const rawPoints = route.legs ? route.legs.flatMap((l) => l.points || []) : (route.points || []);
    const points = rawPoints.map((p) => [p.latitude, p.longitude]);
    const sections = (route.sections || []).filter((s) => String(s.sectionType).toUpperCase() === 'TRAFFIC');
    if (!points.length || !sections.length) return { points, sections: [] };
    return { points, sections };
  } catch (err) {
    console.warn('TomTom traffic-aware route fetch failed:', err);
    return null;
  }
}

function nearestFractionForPoint(routeMeta, latlng) {
  const { roadCoords, cumDist, totalDist } = routeMeta;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < roadCoords.length; i++) {
    const d = haversineMeters(roadCoords[i], latlng);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return totalDist > 0 ? cumDist[bestIdx] / totalDist : 0;
}

function convertTomTomIncidents(rawIncidents, routeMeta) {
  const out = [];
  rawIncidents.forEach((raw, i) => {
    const props = raw.properties || {};
    const geom = raw.geometry || {};
    let coord = null;
    if (geom.type === 'Point' && geom.coordinates) coord = geom.coordinates;
    else if (Array.isArray(geom.coordinates) && geom.coordinates.length) coord = geom.coordinates[0];
    if (!coord || coord.length < 2) return;

    const latlng = [coord[1], coord[0]]; 
    const iconKey = String(props.iconCategory).toLowerCase();
    const type = TOMTOM_ICON_CATEGORY_MAP[props.iconCategory] || TOMTOM_ICON_CATEGORY_MAP[iconKey] || 'jam';
    const meta = TRAFFIC_INCIDENT_TYPES[type];
    const reportedDelay = Number(props.delay);
    const delayAddedSec = reportedDelay > 0 ? Math.min(reportedDelay, 600) : (meta.minDelaySec + Math.floor(Math.random() * (meta.maxDelaySec - meta.minDelaySec)));
    const eventDesc = props.events && props.events[0] && props.events[0].description;

    out.push({
      id: 'tt-' + i,
      type,
      fraction: nearestFractionForPoint(routeMeta, latlng),
      delayAddedSec,
      description: `${eventDesc || meta.label} (live TomTom traffic data)`,
      notified: false,
      source: 'tomtom',
    });
  });

  return out.filter((inc) => inc.fraction > 0.02 && inc.fraction < 0.98);
}

function convertTrafficSectionsToCongestion(routeMeta, trafficRoute) {
  const SEGMENTS = 6;
  const congestion = new Array(SEGMENTS).fill('free');
  const extraIncidents = [];
  if (!trafficRoute || !trafficRoute.points.length || !trafficRoute.sections.length) {
    return { congestion, extraIncidents, matched: false };
  }

  const rank = { free: 0, moderate: 1, heavy: 2 };
  trafficRoute.sections.forEach((sec, i) => {
    const startPt = trafficRoute.points[sec.startPointIndex];
    const endPt = trafficRoute.points[sec.endPointIndex];
    if (!startPt || !endPt) return;
    const mid = [(startPt[0] + endPt[0]) / 2, (startPt[1] + endPt[1]) / 2];
    const fraction = nearestFractionForPoint(routeMeta, mid);
    const bin = Math.min(SEGMENTS - 1, Math.max(0, Math.floor(fraction * SEGMENTS)));

    const mag = Number(sec.magnitudeOfDelay) || 0; 
    const level = mag >= 3 ? 'heavy' : mag >= 1 ? 'moderate' : 'free';
    if (rank[level] > rank[congestion[bin]]) congestion[bin] = level;

    if (mag >= 2 && fraction > 0.02 && fraction < 0.98) {
      const delaySec = Number(sec.delayInSeconds) || 0;
      const speedNote = sec.effectiveSpeedInKmh ? `moving at roughly ${Math.round(sec.effectiveSpeedInKmh)} km/h` : 'slower than usual';
      extraIncidents.push({
        id: 'tt-route-sec-' + i,
        type: 'jam',
        fraction,
        delayAddedSec: Math.min(Math.max(delaySec, 20), 600),
        description: `Real congestion detected on this route — ${speedNote} (live TomTom routing data).`,
        notified: false,
        source: 'tomtom-route',
      });
    }
  });

  return { congestion, extraIncidents, matched: true };
}

async function generateLiveTomTomConditions(routeMeta) {
  const lats = routeMeta.roadCoords.map((c) => c[0]);
  const lngs = routeMeta.roadCoords.map((c) => c[1]);
  const pad = 0.01;
  const bbox = [Math.min(...lngs) - pad, Math.min(...lats) - pad, Math.max(...lngs) + pad, Math.max(...lats) + pad];
  const origin = routeMeta.roadCoords[0];
  const destination = routeMeta.roadCoords[routeMeta.roadCoords.length - 1];

  const [incidentsRaw, trafficRoute] = await Promise.all([
    fetchTomTomIncidents(bbox),
    fetchTomTomTrafficRoute(origin, destination),
  ]);

  const sectionResult = convertTrafficSectionsToCongestion(routeMeta, trafficRoute);
  if (incidentsRaw === null && !sectionResult.matched) return null; 

  let incidents = incidentsRaw ? convertTomTomIncidents(incidentsRaw, routeMeta) : [];
  let congestion;

  if (sectionResult.matched) {
    congestion = sectionResult.congestion;
    incidents = incidents.concat(sectionResult.extraIncidents);
  } else {
    const rand = seededRandom(routeMeta.totalDist + '-flow-fallback');
    congestion = [];
    for (let i = 0; i < 6; i++) {
      const r = rand();
      congestion.push(r > 0.85 ? 'heavy' : r > 0.55 ? 'moderate' : 'free');
    }
  }

  incidents = incidents.sort((a, b) => a.fraction - b.fraction).slice(0, 4);
  return { incidents, congestion };
}

function pathBetweenFractions(routeMeta, fromFraction, toFraction) {
  const from = pointAtFraction(routeMeta, fromFraction);
  const to = pointAtFraction(routeMeta, toFraction);
  const middle = routeMeta.roadCoords.slice(from.index + 1, to.index + 1);
  return [from.latlng, ...middle, to.latlng];
}

function renderCongestionOverlay(routeMeta, congestion) {
  congestionOverlayLines.forEach((l) => leafletMap.removeLayer(l));
  congestionOverlayLines = [];
  if (!congestion || !congestion.length) return;

  const colors = { free: '#4ade80', moderate: '#f59e0b', heavy: '#ef4444' };
  const n = congestion.length;
  for (let i = 0; i < n; i++) {
    const segCoords = pathBetweenFractions(routeMeta, i / n, (i + 1) / n);
    if (segCoords.length < 2) continue;
    const line = L.polyline(segCoords, {
      color: colors[congestion[i]] || colors.free,
      weight: 10,
      opacity: 0.28,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(leafletMap);
    congestionOverlayLines.push(line);
  }
}

function renderIncidentMarkers(routeMeta, incidents) {
  trafficIncidentMarkers.forEach((m) => leafletMap.removeLayer(m));
  trafficIncidentMarkers = [];
  if (!incidents || !incidents.length) return;

  incidents.forEach((inc) => {
    const meta = TRAFFIC_INCIDENT_TYPES[inc.type];
    if (!meta) return;
    const pt = pointAtFraction(routeMeta, inc.fraction);
    const icon = L.divIcon({
      className: 'traffic-incident-marker',
      html: `<div class="incident-pin" style="background:${meta.color};"><i class="fa-solid ${meta.icon}"></i></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    const marker = L.marker(pt.latlng, { icon, zIndexOffset: 500 })
      .addTo(leafletMap)
      .bindPopup(`<b>${meta.label}</b><br>${inc.description}<br><small>+${Math.ceil(inc.delayAddedSec / 60)} min added to ETA</small>`);
    trafficIncidentMarkers.push(marker);
  });
}

function notifyNewIncidents(incidents, targetEmail, trackingNo) {
  let extraDelaySec = 0;
  incidents.forEach((inc) => {
    if (inc.notified) return;
    inc.notified = true;
    extraDelaySec += inc.delayAddedSec;
    const meta = TRAFFIC_INCIDENT_TYPES[inc.type];
    if (targetEmail) {
      addNotification(
        targetEmail,
        `Traffic Alert: ${meta.label}`,
        `${inc.description} Your delivery (${trackingNo}) ETA has been adjusted by +${Math.ceil(inc.delayAddedSec / 60)} min to reflect the current situation.`,
        trackingNo,
        { trafficType: inc.type }
      );
    }
  });
  return extraDelaySec;
}

function computeCongestionDelaySec(congestion, totalDistMeters) {
  if (!congestion || !congestion.length || !totalDistMeters) return { delaySec: 0, heavyKm: 0, moderateKm: 0 };
  const segKm = (totalDistMeters / 1000) / congestion.length;
  let heavyKm = 0;
  let moderateKm = 0;
  congestion.forEach((level) => {
    if (level === 'heavy') heavyKm += segKm;
    else if (level === 'moderate') moderateKm += segKm;
  });
  const delaySec = heavyKm * 25 + moderateKm * 10;
  return { delaySec: Math.round(delaySec), heavyKm, moderateKm };
}

function notifyCongestionDelay(target, congestion, totalDistMeters, targetEmail, trackingNo) {
  if (target.trafficCongestionApplied) return 0;
  target.trafficCongestionApplied = true;

  const { delaySec, heavyKm, moderateKm } = computeCongestionDelaySec(congestion, totalDistMeters);
  if (delaySec <= 0) return 0;

  if (targetEmail) {
    const parts = [];
    if (heavyKm > 0.05) parts.push(`${heavyKm.toFixed(1)} km of heavy (red) traffic`);
    if (moderateKm > 0.05) parts.push(`${moderateKm.toFixed(1)} km of moderate (yellow) traffic`);
    addNotification(
      targetEmail,
      'Traffic Alert: Route Congestion',
      `${parts.join(' and ')} detected along the route. ETA adjusted by +${delaySec} sec (red = +25 sec/km, yellow = +10 sec/km) to reflect current road conditions.`,
      trackingNo,
      { trafficType: 'congestion' }
    );
  }
  return delaySec;
}

function renderTrafficBanner(incidents, currentFraction) {
  const banner = document.getElementById('track-traffic-banner');
  if (!banner) return;
  if (!incidents || !incidents.length) {
    banner.style.display = 'none';
    return;
  }

  const ahead = incidents.filter((inc) => inc.fraction > currentFraction - 0.015);
  if (ahead.length === 0) {
    banner.style.display = 'flex';
    banner.className = 'traffic-banner traffic-clear';
    banner.innerHTML = `<i class="fa-solid fa-circle-check"></i><div><strong>ROUTE CLEAR</strong><span>All reported incidents are behind the vehicle now.</span></div>`;
    return;
  }

  const inc = ahead[0];
  const meta = TRAFFIC_INCIDENT_TYPES[inc.type];
  banner.style.display = 'flex';
  banner.className = `traffic-banner traffic-${inc.type}`;
  banner.innerHTML = `<i class="fa-solid ${meta.icon}"></i><div><strong>${meta.label.toUpperCase()}</strong><span>${inc.description} +${Math.ceil(inc.delayAddedSec / 60)} min added to ETA.</span></div>`;
}

async function fetchSingleRouteOSRM(startCoords, destCoords, vehicleCategory, consumptionRate, seedTag) {
  const tollRatePerKm = TOLL_RATE_RM_PER_KM[vehicleCategory] !== undefined ? TOLL_RATE_RM_PER_KM[vehicleCategory] : TOLL_RATE_RM_PER_KM.car;
  const coords = `${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}`;

  if (hasTomTomKey()) {
    try {
      const loc = `${startCoords[0]},${startCoords[1]}:${destCoords[0]},${destCoords[1]}`;
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${loc}/json?key=${TOMTOM_API_KEY}&routeRepresentation=polyline`;
      
      const res = await fetchWithTimeout(url, 8000);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const r = data.routes[0];
        const roadCoords = r.legs[0].points.map(p => [p.latitude, p.longitude]);
        const distanceKm = r.summary.lengthInMeters / 1000;
        const fuelUsedL = distanceKm * consumptionRate;
        const tollCostRM = distanceKm * tollRatePerKm;
        
        return {
          roadCoords,
          distanceKm,
          durationMin: r.summary.travelTimeInSeconds / 60,
          fuelUsedL,
          tollCostRM,
          totalCostRM: (fuelUsedL * 2.05) + tollCostRM
        };
      }
    } catch (err) {
      console.warn('TomTom routing failed, attempting fallback...', err);
    }
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const r = data.routes[0];
      const roadCoords = r.geometry.coordinates.map(c => [c[1], c[0]]);
      const distanceKm = r.distance / 1000;
      const fuelUsedL = distanceKm * consumptionRate;
      const tollCostRM = distanceKm * tollRatePerKm;
      return {
        roadCoords,
        distanceKm,
        durationMin: r.duration / 60,
        fuelUsedL,
        tollCostRM,
        totalCostRM: (fuelUsedL * 2.05) + tollCostRM
      };
    }
  } catch (err) {
    console.warn('OSRM single-leg routing failed, using fallback path:', err);
  }

  const roadCoords = generateFallbackPath(startCoords, destCoords, seedTag);
  const distanceKm = routeDistanceKm(roadCoords);
  const fuelUsedL = distanceKm * consumptionRate;
  const tollCostRM = distanceKm * tollRatePerKm;
  return {
    roadCoords,
    distanceKm,
    durationMin: distanceKm * 1.2,
    fuelUsedL,
    tollCostRM,
    totalCostRM: (fuelUsedL * 2.05) + tollCostRM
  };
}

async function fetchMultiRoutesOSRM(startCoords, destCoords, order) {
  const vehicleCat = order && order.vehicleCategory ? order.vehicleCategory : 'car';
  const consumptionRate = order && order.consumptionRate ? order.consumptionRate : 0.075;
  const tollRatePerKm = TOLL_RATE_RM_PER_KM[vehicleCat] !== undefined ? TOLL_RATE_RM_PER_KM[vehicleCat] : TOLL_RATE_RM_PER_KM.car;
  const coords = `${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true`;
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return data.routes.map((r, idx) => {
          const roadCoords = r.geometry.coordinates.map(c => [c[1], c[0]]);
          const distanceKm = r.distance / 1000;
          const durationMin = r.duration / 60;

          const isHighway = idx === 0;
          const fuelUsedL = distanceKm * consumptionRate;
          const fuelPricePerLitre = 2.05;
          const fuelCost = fuelUsedL * fuelPricePerLitre;

          let tollCost = isHighway ? distanceKm * tollRatePerKm : 0;
          const totalCostRM = fuelCost + tollCost;

          return {
            name: idx === 0 ? "Express Highway Route" : (idx === 1 ? "Secondary Arterial Bypass" : "Local Transit Corridor"),
            roadCoords: roadCoords,
            distanceKm: distanceKm,
            durationMin: durationMin,
            fuelUsedL: fuelUsedL,
            tollCostRM: tollCost,
            totalCostRM: totalCostRM
          };
        });
      }
    } catch (err) {
      console.warn(`OSRM routing attempt ${attempt + 1} failed:`, err);
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  console.warn("OSRM unavailable after retry. Generating synthesized street-like route patterns.");

  const seedBase = (order && (order.trackingNo || order.orderId)) || 'VOID-DEFAULT';
  const routeA_Coords = generateFallbackPath(startCoords, destCoords, seedBase + '-A');
  const routeB_Coords = generateFallbackPath(startCoords, destCoords, seedBase + '-B');

  const distKm = routeDistanceKm(routeA_Coords);
  const distKmB = routeDistanceKm(routeB_Coords);

  const fuelUsedL_A = distKm * consumptionRate;
  const fuelUsedL_B = distKmB * consumptionRate;
  const fuelPricePerLitre = 2.05;

  const tollCostA = distKm * tollRatePerKm;

  return [
    {
      name: "Highway Express (A1)",
      roadCoords: routeA_Coords,
      distanceKm: distKm,
      durationMin: distKm * 1.2,
      fuelUsedL: fuelUsedL_A,
      tollCostRM: tollCostA,
      totalCostRM: (fuelUsedL_A * fuelPricePerLitre) + tollCostA
    },
    {
      name: "Non-Toll Arterial (B1)",
      roadCoords: routeB_Coords,
      distanceKm: distKmB,
      durationMin: distKmB * 1.6,
      fuelUsedL: fuelUsedL_B,
      tollCostRM: 0.00,
      totalCostRM: (fuelUsedL_B * fuelPricePerLitre)
    }
  ];
}

function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function generateFallbackPath(start, dest, seedStr) {
  const rand = seededRandom(seedStr);
  const dLat = dest[0] - start[0];
  const dLng = dest[1] - start[1];

  const legCount = 5 + Math.floor(rand() * 3); 
  const waypoints = [start];
  let progress = 0;

  for (let i = 1; i < legCount; i++) {
    progress = i / legCount;
    const axisBias = i % 2 === 0 ? 0.75 : 0.25;
    const jitter = (rand() - 0.5) * 0.08;
    const lat = start[0] + dLat * Math.min(1, progress + jitter * (1 - axisBias));
    const lng = start[1] + dLng * Math.min(1, progress + jitter * axisBias);
    waypoints.push([lat, lng]);
  }
  waypoints.push(dest);

  return roundCorners(waypoints, 24);
}

function roundCorners(points, segmentsPerLeg = 20) {
  if (points.length < 3) return points;
  const out = [];
  const p = points;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i === 0 ? i : i - 1];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2 < p.length ? i + 2 : i + 1];
    for (let s = 0; s < segmentsPerLeg; s++) {
      const t = s / segmentsPerLeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const lat = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lng = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([lat, lng]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function routeDistanceKm(roadCoords) {
  let d = 0;
  for (let i = 0; i < roadCoords.length - 1; i++) {
    d += haversineMeters(roadCoords[i], roadCoords[i + 1]);
  }
  return d / 1000;
}

function buildRouteMeta(roadCoords) {
  const cumDist = [0];
  let total = 0;
  for (let i = 0; i < roadCoords.length - 1; i++) {
    total += haversineMeters(roadCoords[i], roadCoords[i + 1]);
    cumDist.push(total);
  }
  return { roadCoords, cumDist, totalDist: total };
}

function pointAtFraction(routeMeta, fraction) {
  const { roadCoords, cumDist, totalDist } = routeMeta;
  if (roadCoords.length === 1) return { latlng: roadCoords[0], index: 0 };
  const clamped = Math.max(0, Math.min(1, fraction));
  const target = clamped * totalDist;

  let idx = 0;
  let hi = cumDist.length - 1;
  while (idx < hi - 1) {
    const mid = (idx + hi) >> 1;
    if (cumDist[mid] < target) idx = mid; else hi = mid;
  }
  const segLen = cumDist[idx + 1] - cumDist[idx];
  const ratio = segLen === 0 ? 0 : (target - cumDist[idx]) / segLen;
  const a = roadCoords[idx];
  const b = roadCoords[idx + 1] || a;
  const latlng = [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
  return { latlng, index: idx };
}

function pathUpToFraction(routeMeta, fraction) {
  const pt = pointAtFraction(routeMeta, fraction);
  const pts = routeMeta.roadCoords.slice(0, pt.index + 1);
  pts.push(pt.latlng);
  return pts;
}

function pathFromFraction(routeMeta, fraction) {
  const pt = pointAtFraction(routeMeta, fraction);
  return [pt.latlng, ...routeMeta.roadCoords.slice(pt.index + 1)];
}

function bearingBetween(a, b) {
  const lat1 = a[0] * Math.PI / 180, lat2 = b[0] * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

async function initOrderTrackingMap(order) {
  if (!order) order = salesHistoryData[0];
  currentTrackingOrder = order;

  document.getElementById('track-number-disp').innerText = order.trackingNo || 'TRK-2026-0000';
  document.getElementById('track-sender').innerText = order.sender || 'VOID Central Hub, Shah Alam';
  document.getElementById('track-courier').innerText = order.courier || 'Aiman Zikri';
  document.getElementById('track-vehicle-type').innerText = order.vehicleType || 'Yamaha Y15ZR Motorcycle';
  document.getElementById('track-plate').innerText = order.plateNo || 'VAB 4821';
  document.getElementById('track-dest-address').innerText = order.address;

  if (order.batchId) {
    renderLorryManifestPanel(order);
    return initLorryTrackingMap(order);
  } else {
    const grid = document.getElementById('lorry-manifest-grid');
    if (grid) grid.style.display = 'none';
  }

  let destCoords = [order.lat || 3.0312, order.lng || 101.5165];
  let totalDurationSec = order.durationSec || 90;

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (trackingAnimFrame) { cancelAnimationFrame(trackingAnimFrame); trackingAnimFrame = null; }
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  trafficIncidentMarkers = [];
  congestionOverlayLines = [];

  const midLat = (HUB_START_COORDS[0] + destCoords[0]) / 2;
  const midLng = (HUB_START_COORDS[1] + destCoords[1]) / 2;

  leafletMap = L.map('map', { zoomSnap: 0.25 }).setView([midLat, midLng], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  originMarker = L.marker(HUB_START_COORDS).addTo(leafletMap)
    .bindPopup(`<b>Hub:</b> ${order.sender || 'VOID Central Hub'}`);

  destMarker = L.marker(destCoords).addTo(leafletMap)
    .bindPopup(`<b>Destination:</b> ${order.address}`);

  const vIconClass = order.vehicleIcon || 'fa-motorcycle';
  const vehicleIcon = L.divIcon({
    className: 'custom-vehicle-marker',
    html: `<div class="vehicle-pulse-pin"><span class="vehicle-heading-arrow"><i class="fa-solid fa-location-arrow"></i></span><i class="fa-solid ${vIconClass}"></i> ${order.plateNo || 'VAB 4821'}</div>`,
    iconSize: [130, 32],
    iconAnchor: [65, 16],
  });

  document.getElementById('track-status-desc').innerText = 'Analyzing vehicle fuel efficiency & toll costs...';
  activeRoutes = await fetchMultiRoutesOSRM(HUB_START_COORDS, destCoords, order);

  bestRouteIndex = 0;
  for (let i = 1; i < activeRoutes.length; i++) {
    if (activeRoutes[i].totalCostRM < activeRoutes[bestRouteIndex].totalCostRM) {
      bestRouteIndex = i;
    }
  }

  const optimalRoute = activeRoutes[bestRouteIndex];
  document.getElementById('track-pattern').innerText = `${optimalRoute.name} (Optimal)`;

  document.getElementById('metric-dist').innerText = `${optimalRoute.distanceKm.toFixed(2)} km`;
  document.getElementById('metric-fuel').innerText = `${optimalRoute.fuelUsedL.toFixed(2)} L`;
  document.getElementById('metric-toll').innerText = `RM ${optimalRoute.tollCostRM.toFixed(2)}`;
  document.getElementById('metric-cost').innerText = `RM ${optimalRoute.totalCostRM.toFixed(2)}`;

  order.distanceKm = optimalRoute.distanceKm;
  order.fuelUsedL = optimalRoute.fuelUsedL;
  order.tollCostRM = optimalRoute.tollCostRM;
  order.deliveryCostRM = optimalRoute.totalCostRM;
  saveSalesHistory();

  activeRouteMeta = buildRouteMeta(optimalRoute.roadCoords);

  const liveWeather = await fetchLiveWeatherRisk(destCoords[0], destCoords[1]);
  const routeConditions = await generateRouteConditions(order, order.trackingNo || order.orderId, liveWeather, activeRouteMeta);
  if (routeConditions.isNew) {
    const targetEmail = order.customerEmail || (currentUser ? currentUser.email : null);
    const incidentDelaySec = notifyNewIncidents(routeConditions.incidents, targetEmail, order.trackingNo);
    const congestionDelaySec = notifyCongestionDelay(order, routeConditions.congestion, activeRouteMeta.totalDist, targetEmail, order.trackingNo);
    const extraDelaySec = incidentDelaySec + congestionDelaySec;
    if (extraDelaySec > 0) {
      totalDurationSec += extraDelaySec;
      order.durationSec = totalDurationSec;
    }
    saveSalesHistory();
  }
  renderCongestionOverlay(activeRouteMeta, routeConditions.congestion);
  renderIncidentMarkers(activeRouteMeta, routeConditions.incidents);

  if (!order.dispatchTime && order.status === 'Out for Delivery') {
    order.dispatchTime = Date.now();
  }

  let elapsedSec = 0;
  if (order.status === 'Delivered') {
    elapsedSec = totalDurationSec;
  } else if (order.dispatchTime) {
    elapsedSec = (Date.now() - order.dispatchTime) / 1000;
  }

  let tripFinished = false;
  if (elapsedSec >= totalDurationSec) {
    elapsedSec = totalDurationSec;
    tripFinished = true;
    if (order.status !== 'Delivered') {
      order.status = 'Delivered';
      order.eta = 'Delivered';
      syncOrderStatusViews();
    }
    document.getElementById('track-eta').innerText = 'DELIVERED';
    document.getElementById('track-status-desc').innerText = 'Package delivered using cost-optimized route.';
  } else {
    document.getElementById('track-status-desc').innerText = `En route via ${optimalRoute.name}. Cost efficiency verified.`;
  }

  let fraction = elapsedSec / totalDurationSec;
  renderTrafficBanner(order.trafficIncidents, fraction);

  historyPolyline = L.polyline(pathUpToFraction(activeRouteMeta, fraction), {
    color: '#818cf8',
    weight: 6,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round',
    smoothFactor: 1
  }).addTo(leafletMap);

  remainingPolyline = L.polyline(pathFromFraction(activeRouteMeta, fraction), {
    color: '#475569',
    weight: 4,
    opacity: 0.7,
    dashArray: '8, 8',
    lineJoin: 'round',
    lineCap: 'round',
    smoothFactor: 1
  }).addTo(leafletMap);

  const startPt = pointAtFraction(activeRouteMeta, fraction);
  mapMarker = L.marker(startPt.latlng, { icon: vehicleIcon }).addTo(leafletMap);

  const bounds = L.latLngBounds(activeRouteMeta.roadCoords);
  leafletMap.fitBounds(bounds, { padding: [40, 40] });

  if (tripFinished) return;
  if (order.status !== 'Out for Delivery') return;

  const tripStartTs = Date.now() - elapsedSec * 1000;
  let lastEtaLabel = '';

  function tick() {
    const nowElapsedSec = (Date.now() - tripStartTs) / 1000;
    fraction = Math.min(1, nowElapsedSec / totalDurationSec);

    const pt = pointAtFraction(activeRouteMeta, fraction);
    mapMarker.setLatLng(pt.latlng);

    const lookahead = pointAtFraction(activeRouteMeta, Math.min(1, fraction + 0.01));
    if (lookahead.latlng[0] !== pt.latlng[0] || lookahead.latlng[1] !== pt.latlng[1]) {
      const heading = bearingBetween(pt.latlng, lookahead.latlng);
      const el = mapMarker.getElement();
      if (el) {
        const pin = el.querySelector('.vehicle-pulse-pin');
        if (pin) pin.style.setProperty('--heading', `${heading}deg`);
      }
    }

    historyPolyline.setLatLngs(pathUpToFraction(activeRouteMeta, fraction));
    remainingPolyline.setLatLngs(pathFromFraction(activeRouteMeta, fraction));

    const remainingTime = Math.max(0, Math.ceil(totalDurationSec - nowElapsedSec));
    const etaLabel = `${remainingTime}s remaining`;
    if (etaLabel !== lastEtaLabel) {
      lastEtaLabel = etaLabel;
      order.eta = etaLabel;
      document.getElementById('track-eta').innerText = etaLabel;
      renderTrafficBanner(order.trafficIncidents, fraction);
    }

    if (fraction >= 1) {
      order.status = 'Delivered';
      order.eta = 'Delivered';
      document.getElementById('track-eta').innerText = 'DELIVERED';
      document.getElementById('track-status-desc').innerText = 'Item delivered to customer home address!';
      renderTrafficBanner(order.trafficIncidents, 1);

      const targetEmail = order.customerEmail || (currentUser ? currentUser.email : null);
      if (targetEmail) {
        addNotification(
          targetEmail,
          'Order Delivered',
          `Your order ${order.orderId} (${order.trackingNo}) has been delivered successfully! Total delivery cost: RM ${optimalRoute.totalCostRM.toFixed(2)}.`,
          order.trackingNo,
          {
            orderId: order.orderId,
            amount: order.amount,
            status: 'Delivered',
            items: order.items
          }
        );
      }

      syncOrderStatusViews();
      trackingAnimFrame = null;
      return;
    }

    trackingAnimFrame = requestAnimationFrame(tick);
  }

  trackingAnimFrame = requestAnimationFrame(tick);
}


const LIVE_TELEMETRY_WRITE_MS = 5000;
const liveTelemetryWriteAt = new Map();

function getBatchTotalDuration(batch) {
  return Array.isArray(batch && batch.legDurations)
    ? batch.legDurations.reduce((total, seconds) => total + (Number(seconds) || 0), 0)
    : 0;
}

function getBatchElapsedSeconds(batch, now = Date.now()) {
  if (!batch || !batch.dispatchTime) return 0;
  const totalDuration = getBatchTotalDuration(batch);
  if (batch.status === 'Delivered') return totalDuration;
  if (batch.status === 'Paused') {
    return Math.max(0, Math.min(Number(batch.pausedElapsedSec) || 0, totalDuration));
  }
  return Math.max(0, Math.min((now - batch.dispatchTime) / 1000, totalDuration));
}

function getBatchLivePoint(batch, progress) {
  const routeMeta = typeof lorryLegMetas !== 'undefined' && lorryLegMetas
    ? lorryLegMetas[progress.activeLegIndex]
    : null;
  if (routeMeta && routeMeta.roadCoords && routeMeta.roadCoords.length) {
    return pointAtFraction(routeMeta, progress.fractionInLeg).latlng;
  }

  const waypoints = [HUB_START_COORDS, ...(batch.stops || []).map((stop) => [Number(stop.lat), Number(stop.lng)])];
  const start = waypoints[progress.activeLegIndex] || HUB_START_COORDS;
  const end = waypoints[progress.activeLegIndex + 1] || start;
  const fraction = progress.fractionInLeg || 0;
  return [
    start[0] + ((end[0] - start[0]) * fraction),
    start[1] + ((end[1] - start[1]) * fraction)
  ];
}

function updateBatchLiveTelemetry(batch, now = Date.now()) {
  if (!batch || !Array.isArray(batch.stops)) return false;
  const previous = JSON.stringify(batch.liveTelemetry || null);
  const totalDuration = getBatchTotalDuration(batch);
  const elapsedSec = getBatchElapsedSeconds(batch, now);
  const progress = computeLorryProgress(batch, now);
  const point = getBatchLivePoint(batch, progress);
  const nextStop = batch.stops.find((stop) => stop.status !== 'Delivered');
  const completedStops = batch.stops.filter((stop) => stop.status === 'Delivered').length;
  const totalStops = batch.stops.length;
  const overallFraction = totalDuration > 0 ? Math.min(1, elapsedSec / totalDuration) : 0;
  const remainingSec = Math.max(0, Math.ceil(totalDuration - elapsedSec));

  batch.liveTelemetry = {
    source: 'firebase-route-simulation',
    lastUpdatedAt: now,
    lastKnownLocation: { lat: point[0], lng: point[1] },
    activeLegIndex: progress.activeLegIndex,
    fractionInLeg: progress.fractionInLeg,
    overallFraction,
    elapsedSec,
    remainingSec,
    etaAt: remainingSec > 0 ? now + (remainingSec * 1000) : now,
    currentStopSequence: nextStop ? nextStop.sequence : null,
    completedStops,
    totalStops,
    driverState: batch.status === 'Paused' ? 'Paused' : (batch.status === 'Delivered' ? 'Completed' : 'En Route')
  };
  batch.lastUpdatedAt = now;
  batch.completedStops = completedStops;
  batch.totalStops = totalStops;

  return previous !== JSON.stringify(batch.liveTelemetry);
}

function persistLiveBatchState(batch, force = false) {
  // Only the admin runtime is allowed to publish authoritative fleet telemetry.
  if (typeof renderAdminLorryBatches !== 'function') return false;
  if (!batch || !batch.batchId) return false;
  const now = Date.now();
  const lastWrite = liveTelemetryWriteAt.get(batch.batchId) || 0;
  if (!force && now - lastWrite < LIVE_TELEMETRY_WRITE_MS) return false;
  liveTelemetryWriteAt.set(batch.batchId, now);
  saveLorryBatches();
  saveSalesHistory();
  return true;
}

function formatLiveEta(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  if (value <= 0) return 'ARRIVED';
  const minutes = Math.floor(value / 60);
  const remaining = Math.round(value % 60);
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

function updateLiveTrackingReadout(batch, order) {
  const telemetry = batch && batch.liveTelemetry ? batch.liveTelemetry : {};
  const stop = batch && order ? batch.stops.find((item) => item.orderId === order.orderId) : null;
  const etaEl = document.getElementById('track-eta');
  const descEl = document.getElementById('track-status-desc');
  if (etaEl) {
    etaEl.innerText = batch && batch.status === 'Delivered'
      ? 'DELIVERED'
      : batch && batch.status === 'Paused'
        ? `PAUSED · ${formatLiveEta(telemetry.remainingSec)}`
        : `STOP ${stop && stop.sequence ? stop.sequence : telemetry.currentStopSequence || '—'} · ${formatLiveEta(telemetry.remainingSec)}`;
  }
  if (descEl && batch) {
    const updated = telemetry.lastUpdatedAt ? new Date(telemetry.lastUpdatedAt).toLocaleTimeString('en-MY') : 'waiting for update';
    descEl.innerText = batch.status === 'Paused'
      ? `Driver paused at the last Firebase location. Last update ${updated}.`
      : batch.status === 'Delivered'
        ? `All stops completed. Last Firebase update ${updated}.`
        : `Live Firebase location updated ${updated}. ${telemetry.completedStops || 0}/${telemetry.totalStops || batch.stops.length} stops completed.`;
  }
}

function refreshOpenLorryTrackingFromFirebase() {
  if (!currentTrackingOrder || !currentTrackingOrder.batchId) return;
  const freshOrder = salesHistoryData.find((order) => order.orderId === currentTrackingOrder.orderId);
  if (freshOrder) currentTrackingOrder = freshOrder;
  const batch = lorryBatches.find((item) => item.batchId === currentTrackingOrder.batchId);
  if (!batch) return;
  updateLiveTrackingReadout(batch, currentTrackingOrder);
  if (typeof renderLorryManifestPanel === 'function') renderLorryManifestPanel(currentTrackingOrder);
}

function computeLorryProgress(batch, now = Date.now()) {
  if (!batch || !Array.isArray(batch.legDurations) || batch.legDurations.length === 0) {
    return { activeLegIndex: 0, fractionInLeg: 0, isComplete: false };
  }

  const totalDuration = getBatchTotalDuration(batch);
  const elapsedSec = getBatchElapsedSeconds(batch, now);
  let cumulative = 0;
  for (let i = 0; i < batch.legDurations.length; i++) {
    const legStart = cumulative;
    cumulative += Number(batch.legDurations[i]) || 1;
    if (elapsedSec < cumulative || i === batch.legDurations.length - 1) {
      const legDuration = Number(batch.legDurations[i]) || 1;
      const fractionInLeg = Math.max(0, Math.min(1, (elapsedSec - legStart) / legDuration));
      return { activeLegIndex: i, fractionInLeg, isComplete: elapsedSec >= totalDuration };
    }
  }
  return { activeLegIndex: batch.legDurations.length - 1, fractionInLeg: 1, isComplete: true };
}

async function initLorryTrackingMap(order) {
  let batch = lorryBatches.find((b) => b.batchId === order.batchId);
  if (!batch) return;

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (trackingAnimFrame) { cancelAnimationFrame(trackingAnimFrame); trackingAnimFrame = null; }
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  lorryStopMarkers = [];
  lorryHistoryPolylines = [];
  lorryFuturePolylines = [];
  trafficIncidentMarkers = [];
  congestionOverlayLines = [];

  const waypoints = [HUB_START_COORDS, ...batch.stops.map((s) => [s.lat, s.lng])];

  document.getElementById('track-status-desc').innerText = `Loading multi-stop route for ${batch.stops.length} parcel(s)...`;

  lorryLegMetas = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const leg = await fetchSingleRouteOSRM(
      waypoints[i], waypoints[i + 1], 'lorry', batch.consumptionRate || 0.19, `${batch.batchId}-leg${i}`
    );
    lorryLegMetas.push(buildRouteMeta(leg.roadCoords));

    const legOwnerOrder = salesHistoryData.find((o) => o.orderId === batch.stops[i].orderId);
    if (legOwnerOrder) {
      legOwnerOrder.distanceKm = leg.distanceKm;
      legOwnerOrder.fuelUsedL = leg.fuelUsedL;
      legOwnerOrder.tollCostRM = leg.tollCostRM;
      legOwnerOrder.deliveryCostRM = leg.totalCostRM;
    }
  }
  saveSalesHistory();

  const lorryCombinedCoords = lorryLegMetas.reduce(
    (acc, m, i) => acc.concat(i === 0 ? m.roadCoords : m.roadCoords.slice(1)), []
  );
  const lorryCombinedMeta = buildRouteMeta(lorryCombinedCoords);

  const lorryRepStop = batch.stops[batch.stops.length - 1] || batch.stops[0];
  const lorryLiveWeather = lorryRepStop ? await fetchLiveWeatherRisk(lorryRepStop.lat, lorryRepStop.lng) : null;
  const lorryConditions = await generateRouteConditions(batch, batch.batchId, lorryLiveWeather, lorryCombinedMeta);
  if (lorryConditions.isNew) {
    const targetEmail = order.customerEmail || (currentUser ? currentUser.email : null);
    const trackingRef = order.trackingNo || batch.plateNo;

    const incidentDelaySec = notifyNewIncidents(lorryConditions.incidents, targetEmail, trackingRef);
    if (incidentDelaySec > 0 && batch.legDurations && batch.legDurations.length && lorryConditions.incidents.length) {
      const idx = Math.min(
        batch.legDurations.length - 1,
        Math.max(0, Math.floor(lorryConditions.incidents[0].fraction * batch.legDurations.length))
      );
      batch.legDurations[idx] = (batch.legDurations[idx] || 0) + incidentDelaySec;
    }

    const congestionDelaySec = notifyCongestionDelay(batch, lorryConditions.congestion, lorryCombinedMeta.totalDist, targetEmail, trackingRef);
    if (congestionDelaySec > 0 && batch.legDurations && batch.legDurations.length === lorryLegMetas.length) {
      lorryLegMetas.forEach((legMeta, i) => {
        const share = lorryCombinedMeta.totalDist > 0 ? legMeta.totalDist / lorryCombinedMeta.totalDist : 0;
        batch.legDurations[i] = (batch.legDurations[i] || 0) + Math.round(congestionDelaySec * share);
      });
    }
    saveLorryBatches();
  }

  const midLat = waypoints.reduce((a, w) => a + w[0], 0) / waypoints.length;
  const midLng = waypoints.reduce((a, w) => a + w[1], 0) / waypoints.length;
  leafletMap = L.map('map', { zoomSnap: 0.25 }).setView([midLat, midLng], 10);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(leafletMap);

  originMarker = L.marker(HUB_START_COORDS).addTo(leafletMap)
    .bindPopup(`<b>Hub:</b> VOID Central Hub, Shah Alam`);

  const isAdminView = trackingViewOrigin === 'admin';
  batch.stops.forEach((stop) => {
    const isMine = stop.orderId === order.orderId;
    const isDelivered = stop.status === 'Delivered';
    const pinColor = isMine ? 'var(--accent)' : (isDelivered ? '#4ade80' : '#475569');
    const label = (isMine || isAdminView) ? `Stop ${stop.sequence}` : `Stop ${stop.sequence}`;
    const popupHtml = (isMine || isAdminView)
      ? `<b>Stop ${stop.sequence}${isMine ? ' (You)' : ''}:</b> ${stop.customerName || ''}<br>${stop.address}<br>Status: ${stop.status}`
      : `<b>Stop ${stop.sequence}</b><br>Another customer's delivery on this route.<br>Status: ${stop.status}`;

    const icon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: `<div class="vehicle-pulse-pin" style="border-color:${pinColor}; ${isMine ? '' : 'opacity:0.85;'}"><i class="fa-solid ${isDelivered ? 'fa-check' : 'fa-box'}"></i> ${label}</div>`,
      iconSize: [90, 32],
      iconAnchor: [45, 16],
    });

    const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(leafletMap).bindPopup(popupHtml);
    lorryStopMarkers.push(marker);
  });

  const progress = computeLorryProgress(batch);

  lorryLegMetas.forEach((legMeta, i) => {
    if (i < progress.activeLegIndex || (i === progress.activeLegIndex && progress.isComplete)) {
      lorryHistoryPolylines.push(L.polyline(legMeta.roadCoords, {
        color: '#818cf8', weight: 5, opacity: 0.85, lineJoin: 'round', lineCap: 'round'
      }).addTo(leafletMap));
    } else if (i === progress.activeLegIndex) {
      lorryHistoryPolylines.push(L.polyline(pathUpToFraction(legMeta, progress.fractionInLeg), {
        color: '#818cf8', weight: 6, opacity: 0.95, lineJoin: 'round', lineCap: 'round'
      }).addTo(leafletMap));
      lorryFuturePolylines.push(L.polyline(pathFromFraction(legMeta, progress.fractionInLeg), {
        color: '#475569', weight: 4, opacity: 0.7, dashArray: '8, 8', lineJoin: 'round', lineCap: 'round'
      }).addTo(leafletMap));
    } else {
      lorryFuturePolylines.push(L.polyline(legMeta.roadCoords, {
        color: '#475569', weight: 3, opacity: 0.5, dashArray: '6, 10', lineJoin: 'round', lineCap: 'round'
      }).addTo(leafletMap));
    }
  });

  const activeLegMeta = lorryLegMetas[progress.activeLegIndex];
  const startPt = pointAtFraction(activeLegMeta, progress.fractionInLeg);
  const vehicleIcon = L.divIcon({
    className: 'custom-vehicle-marker',
    html: `<div class="vehicle-pulse-pin"><span class="vehicle-heading-arrow"><i class="fa-solid fa-location-arrow"></i></span><i class="fa-solid fa-truck"></i> ${batch.plateNo}</div>`,
    iconSize: [130, 32],
    iconAnchor: [65, 16],
  });
  mapMarker = L.marker(startPt.latlng, { icon: vehicleIcon }).addTo(leafletMap);

  renderCongestionOverlay(lorryCombinedMeta, lorryConditions.congestion);
  renderIncidentMarkers(lorryCombinedMeta, lorryConditions.incidents);
  const lorryOverallFraction = (progress.activeLegIndex + progress.fractionInLeg) / lorryLegMetas.length;
  renderTrafficBanner(lorryConditions.incidents, lorryOverallFraction);

  const allCoords = lorryLegMetas.flatMap((m) => m.roadCoords);
  leafletMap.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });

  const myStop = batch.stops.find((s) => s.orderId === order.orderId);
  const batchTollRate = TOLL_RATE_RM_PER_KM[batch.vehicleCategory] != null ? TOLL_RATE_RM_PER_KM[batch.vehicleCategory] : TOLL_RATE_RM_PER_KM.lorry;
  const batchVehicleLabel = batch.vehicleCategory === 'van' ? 'Van' : 'Lorry';
  document.getElementById('metric-dist').innerText = `${lorryLegMetas.reduce((a, m) => a + m.totalDist / 1000, 0).toFixed(2)} km (full route)`;
  document.getElementById('metric-fuel').innerText = `${(lorryLegMetas.reduce((a, m) => a + m.totalDist / 1000, 0) * (batch.consumptionRate || 0.19)).toFixed(2)} L`;
  document.getElementById('metric-toll').innerText = `RM ${(lorryLegMetas.reduce((a, m) => a + m.totalDist / 1000, 0) * batchTollRate).toFixed(2)}`;
  document.getElementById('metric-cost').innerText = `RM ${(lorryLegMetas.reduce((a, m) => a + m.totalDist / 1000, 0) * ((batch.consumptionRate || 0.19) * 2.05 + batchTollRate)).toFixed(2)}`;
  document.getElementById('track-pattern').innerText = `Multi-Stop ${batchVehicleLabel} Route (${batch.stops.length} parcels)`;

  if (myStop && myStop.status === 'Delivered') {
    document.getElementById('track-eta').innerText = 'DELIVERED';
    document.getElementById('track-status-desc').innerText = `Your parcel has been delivered by the ${batchVehicleLabel.toLowerCase()}.`;
  } else if (myStop) {
    document.getElementById('track-eta').innerText = `Stop ${myStop.sequence} of ${batch.stops.length}`;
    document.getElementById('track-status-desc').innerText = batch.status === 'Forming'
      ? 'Waiting for this batch to be dispatched.'
      : `En route. ${batchVehicleLabel} is currently on Stop ${progress.activeLegIndex + 1}'s leg.`;
  }

  if (batch.status !== 'Out for Delivery') return;

  let lastPanelRefresh = 0;

  function tick() {
    const freshBatch = lorryBatches.find((item) => item.batchId === order.batchId);
    if (freshBatch) batch = freshBatch;
    updateLiveTrackingReadout(batch, order);
    if (batch.status === 'Paused') {
      trackingAnimFrame = null;
      return;
    }
    const p = computeLorryProgress(batch);
    const legMeta = lorryLegMetas[p.activeLegIndex];
    if (legMeta) {
      const pt = pointAtFraction(legMeta, p.fractionInLeg);
      mapMarker.setLatLng(pt.latlng);

      const lookahead = pointAtFraction(legMeta, Math.min(1, p.fractionInLeg + 0.02));
      if (lookahead.latlng[0] !== pt.latlng[0] || lookahead.latlng[1] !== pt.latlng[1]) {
        const heading = bearingBetween(pt.latlng, lookahead.latlng);
        const el = mapMarker.getElement();
        if (el) {
          const pin = el.querySelector('.vehicle-pulse-pin');
          if (pin) pin.style.setProperty('--heading', `${heading}deg`);
        }
      }
    }

    const now = Date.now();
    if (now - lastPanelRefresh > 1000) {
      lastPanelRefresh = now;
      renderLorryManifestPanel(order);
      renderTrafficBanner(batch.trafficIncidents, (p.activeLegIndex + p.fractionInLeg) / lorryLegMetas.length);
      const freshMyStop = batch.stops.find((s) => s.orderId === order.orderId);
      if (freshMyStop && freshMyStop.status === 'Delivered') {
        document.getElementById('track-eta').innerText = 'DELIVERED';
        document.getElementById('track-status-desc').innerText = `Your parcel has been delivered by the ${batch.vehicleCategory === 'van' ? 'van' : 'lorry'}.`;
      }
    }

    if (p.isComplete) {
      trackingAnimFrame = null;
      renderLorryManifestPanel(order);
      return;
    }

    trackingAnimFrame = requestAnimationFrame(tick);
  }

  trackingAnimFrame = requestAnimationFrame(tick);
}

function renderLorryManifestPanel(order) {
  const grid = document.getElementById('lorry-manifest-grid');
  const manifestList = document.getElementById('lorry-manifest-list');
  const historyList = document.getElementById('lorry-history-list');
  if (!grid || !manifestList || !historyList) return;

  if (!order || !order.batchId) {
    grid.style.display = 'none';
    return;
  }

  const batch = lorryBatches.find((b) => b.batchId === order.batchId);
  if (!batch) {
    grid.style.display = 'none';
    return;
  }

  grid.style.display = 'grid';
  const isAdminView = trackingViewOrigin === 'admin';

  manifestList.innerHTML = batch.stops.map((stop) => {
    const isMine = stop.orderId === order.orderId;
    const isDelivered = stop.status === 'Delivered';
    const statusColor = isDelivered ? '#4ade80' : (batch.status === 'Out for Delivery' ? '#f59e0b' : '#94a3b8');

    const label = (isMine || isAdminView)
      ? `<strong>${isMine ? 'Your Parcel — ' : ''}${stop.orderId}</strong><span>${stop.address}</span>`
      : `<strong>Stop ${stop.sequence}</strong><span>Another customer's delivery (hidden for privacy)</span>`;

    return `
      <div class="lorry-manifest-stop ${isMine ? 'is-mine' : ''} ${isDelivered ? 'is-delivered' : ''}">
          <div class="lorry-stop-seq">${stop.sequence || '—'}</div>
          <div class="lorry-stop-info">${label}</div>
          <div class="lorry-stop-status" style="color:${statusColor}; border: 1px solid ${statusColor};">${stop.status}</div>
      </div>`;
  }).join('');

  const historyEntries = batch.history.slice().reverse();
  historyList.innerHTML = historyEntries.length > 0
    ? historyEntries.map((h) => `
        <div class="lorry-history-item">
            <i class="fa-solid fa-road"></i>
            <div class="lorry-history-item-text">${h.text}<span class="lorry-history-item-time">${new Date(h.time).toLocaleString('en-MY', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span></div>
        </div>`).join('')
    : `<div style="color: var(--text-secondary); font-size: 0.8rem; text-align:center; padding: 1.5rem;">No journey events yet - this batch hasn't dispatched.</div>`;
}

const VEHICLE_CATEGORY_META = {
  motorcycle: { label: 'Motorcycle', color: '#4ade80', icon: 'fa-motorcycle' },
  car: { label: 'Car', color: '#818cf8', icon: 'fa-car' },
  van: { label: 'Van', color: '#f59e0b', icon: 'fa-van-shuttle' },
  lorry: { label: 'Lorry', color: '#ef4444', icon: 'fa-truck' }
};
const FUEL_PRICE_PER_LITRE_RM = 2.05;

let costAnalyticsDetailRecords = {};

function costAnalyticsEligibleOrders() {
  return salesHistoryData.filter((order) => {
    if (!analyticsIsRevenueOrder(order)) return false;
    const metrics = getOrderTransportMetrics(order);
    return metrics.distanceKm > 0 || !!order.batchId || !!order.vehicleCategory;
  });
}

function getBucketKey(dateObj, granularity) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const d = dateObj.getDate();
  if (granularity === 'day') return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (granularity === 'year') return `${y}`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

function getBucketLabel(dateObj, granularity) {
  if (granularity === 'day') return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  if (granularity === 'year') return `${dateObj.getFullYear()}`;
  return dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function setCostAnalyticsGranularity(granularity) {
  costAnalyticsGranularity = granularity;
  document.querySelectorAll('.cost-granularity-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.granularity === granularity);
  });
  renderCostAnalytics();
}

function renderCostAnalytics() {
  const root = document.getElementById('admin-cost-analytics');
  if (!root) return;
  if (!root.classList.contains('active')) return;

  const eligible = costAnalyticsEligibleOrders();
  const granularity = costAnalyticsGranularity || 'month';

  const now = new Date();
  const currentPeriodKey = getBucketKey(now, granularity);
  const periodLabel = {
    day: "TODAY'S TOTALS BY VEHICLE TYPE",
    month: "THIS MONTH'S TOTALS BY VEHICLE TYPE",
    year: "THIS YEAR'S TOTALS BY VEHICLE TYPE"
  }[granularity];

  const headingEl = document.getElementById('cost-summary-heading');
  if (headingEl) headingEl.innerText = periodLabel;

  const periodOrders = eligible.filter((o) => {
    const d = analyticsOrderDate(o);
    if (!d) return false;
    return getBucketKey(d, granularity) === currentPeriodKey;
  });

  const totals = {
    motorcycle: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
    car: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
    van: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
    lorry: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 }
  };

  periodOrders.forEach((o) => {
    const metrics = getOrderTransportMetrics(o);
    const cat = totals[metrics.vehicleCategory] ? metrics.vehicleCategory : null;
    if (!cat) return;
    totals[cat].deliveries += 1;
    totals[cat].distanceKm += metrics.distanceKm;
    totals[cat].fuelL += metrics.fuelUsedL;
    totals[cat].fuelCostRM += metrics.fuelCostRM;
    totals[cat].tollRM += metrics.tollCostRM;
    totals[cat].totalRM += metrics.totalCostRM;
  });

  const grandTotal = Object.values(totals).reduce((acc, t) => ({
    deliveries: acc.deliveries + t.deliveries,
    distanceKm: acc.distanceKm + t.distanceKm,
    fuelL: acc.fuelL + t.fuelL,
    fuelCostRM: acc.fuelCostRM + t.fuelCostRM,
    tollRM: acc.tollRM + t.tollRM,
    totalRM: acc.totalRM + t.totalRM
  }), { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 });

  const cardsWrap = document.getElementById('cost-summary-cards');
  if (cardsWrap) {
    let cardsHtml = '';
    Object.keys(VEHICLE_CATEGORY_META).forEach((cat) => {
      const meta = VEHICLE_CATEGORY_META[cat];
      const t = totals[cat];
      cardsHtml += `
        <div class="vehicle-cost-card" style="border-top: 3px solid ${meta.color};">
          <h3><i class="fa-solid ${meta.icon}" style="color:${meta.color};"></i> ${meta.label.toUpperCase()}</h3>
          <div class="vehicle-cost-metric"><span>Deliveries</span><b>${t.deliveries}</b></div>
          <div class="vehicle-cost-metric"><span>Total Distance</span><b>${t.distanceKm.toFixed(1)} km</b></div>
          <div class="vehicle-cost-metric"><span>Fuel Used</span><b>${t.fuelL.toFixed(2)} L</b></div>
          <div class="vehicle-cost-metric"><span>Fuel Cost</span><b>RM ${t.fuelCostRM.toFixed(2)}</b></div>
          <div class="vehicle-cost-metric"><span>Toll Cost</span><b>${cat === 'motorcycle' ? 'RM 0.00 (exempt)' : 'RM ' + t.tollRM.toFixed(2)}</b></div>
          <div class="vehicle-cost-metric vehicle-cost-metric-total"><span>Total Cost</span><b>RM ${t.totalRM.toFixed(2)}</b></div>
        </div>`;
    });
    cardsHtml += `
      <div class="vehicle-cost-card vehicle-cost-card-grand">
        <h3><i class="fa-solid fa-truck-fast"></i> GRAND TOTAL (ALL VEHICLES)</h3>
        <div class="vehicle-cost-metric"><span>Deliveries</span><b>${grandTotal.deliveries}</b></div>
        <div class="vehicle-cost-metric"><span>Total Distance</span><b>${grandTotal.distanceKm.toFixed(1)} km</b></div>
        <div class="vehicle-cost-metric"><span>Fuel Used</span><b>${grandTotal.fuelL.toFixed(2)} L</b></div>
        <div class="vehicle-cost-metric"><span>Fuel Cost</span><b>RM ${grandTotal.fuelCostRM.toFixed(2)}</b></div>
        <div class="vehicle-cost-metric"><span>Toll Cost</span><b>RM ${grandTotal.tollRM.toFixed(2)}</b></div>
        <div class="vehicle-cost-metric vehicle-cost-metric-total"><span>Total Cost</span><b>RM ${grandTotal.totalRM.toFixed(2)}</b></div>
      </div>`;

    if (periodOrders.length === 0) {
      const noDataLabel = { day: 'today', month: 'this month', year: 'this year' }[granularity];
      cardsHtml = `<div class="vehicle-cost-card vehicle-cost-card-empty" style="grid-column: 1 / -1;">No dispatched deliveries ${noDataLabel} yet.</div>` + cardsHtml;
    }

    cardsWrap.innerHTML = cardsHtml;
  }

  const buckets = {};
  costAnalyticsDetailRecords = {};

  eligible.forEach((o) => {
    const d = analyticsOrderDate(o);
    if (!d) return;
    const key = getBucketKey(d, granularity);
    if (!buckets[key]) {
      buckets[key] = {
        label: getBucketLabel(d, granularity),
        sortKey: key,
        motorcycle: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
        car: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
        van: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 },
        lorry: { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 }
      };
    }
    const metrics = getOrderTransportMetrics(o);
    const cat = buckets[key][metrics.vehicleCategory] ? metrics.vehicleCategory : null;
    if (!cat) return;
    const b = buckets[key][cat];
    b.deliveries += 1;
    b.distanceKm += metrics.distanceKm;
    b.fuelL += metrics.fuelUsedL;
    b.fuelCostRM += metrics.fuelCostRM;
    b.tollRM += metrics.tollCostRM;
    b.totalRM += metrics.totalCostRM;
    const detailKey = `${key}:${cat}`;
    if (!costAnalyticsDetailRecords[detailKey]) costAnalyticsDetailRecords[detailKey] = [];
    costAnalyticsDetailRecords[detailKey].push({ order: o, metrics, period: getBucketLabel(d, granularity) });
  });

  const maxBuckets = granularity === 'day' ? 30 : (granularity === 'year' ? 6 : 12);
  const sortedBuckets = Object.values(buckets).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-maxBuckets);

  const chartCtx = document.getElementById('costAnalyticsChart');
  if (chartCtx && typeof Chart !== 'undefined') {
    const labels = sortedBuckets.map((b) => b.label);
    const datasets = Object.keys(VEHICLE_CATEGORY_META).map((cat) => {
      const meta = VEHICLE_CATEGORY_META[cat];
      return {
        label: meta.label,
        data: sortedBuckets.map((b) => Number(b[cat].totalRM.toFixed(2))),
        borderColor: meta.color,
        backgroundColor: meta.color + '22',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 3
      };
    });

    if (costAnalyticsChartInstance) {
      costAnalyticsChartInstance.data.labels = labels;
      costAnalyticsChartInstance.data.datasets = datasets;
      costAnalyticsChartInstance.update('none');
    } else {
      costAnalyticsChartInstance = new Chart(chartCtx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: true, labels: { color: '#ccc' } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: RM ${ctx.parsed.y.toFixed(2)}`
              }
            }
          },
          scales: {
            x: { grid: { color: '#222' }, ticks: { color: '#888' } },
            y: { grid: { color: '#222' }, ticks: { color: '#888', callback: (v) => 'RM ' + v } }
          }
        }
      });
    }
  }

  const tbody = document.getElementById('cost-analytics-table-body');
  if (tbody) {
    let rowsHtml = '';
    [...sortedBuckets].reverse().forEach((b) => {
      Object.keys(VEHICLE_CATEGORY_META).forEach((cat) => {
        const row = b[cat];
        if (row.deliveries === 0) return;
        const meta = VEHICLE_CATEGORY_META[cat];
        rowsHtml += `
          <tr>
            <td>${b.label}</td>
            <td><button type="button" class="transport-detail-link" onclick="openTransportCostDetails('${b.sortKey}:${cat}')"><i class="fa-solid ${meta.icon}" style="color:${meta.color};"></i> ${meta.label} · VIEW ORDERS</button></td>
            <td>${row.deliveries}</td>
            <td>${row.distanceKm.toFixed(1)} km</td>
            <td>${row.fuelL.toFixed(2)} L</td>
            <td>RM ${row.fuelCostRM.toFixed(2)}</td>
            <td>${cat === 'motorcycle' ? 'RM 0.00' : 'RM ' + row.tollRM.toFixed(2)}</td>
            <td style="color: var(--accent); font-weight: bold;">RM ${row.totalRM.toFixed(2)}</td>
          </tr>`;
      });
    });

    if (!rowsHtml) {
      rowsHtml = `<tr><td colspan="8" style="text-align:center; color: var(--text-secondary);">No dispatched deliveries in this period yet.</td></tr>`;
    } else {
      const shownTotal = sortedBuckets.reduce((acc, b) => {
        Object.keys(VEHICLE_CATEGORY_META).forEach((cat) => {
          acc.deliveries += b[cat].deliveries;
          acc.distanceKm += b[cat].distanceKm;
          acc.fuelL += b[cat].fuelL;
          acc.fuelCostRM += b[cat].fuelCostRM;
          acc.tollRM += b[cat].tollRM;
          acc.totalRM += b[cat].totalRM;
        });
        return acc;
      }, { deliveries: 0, distanceKm: 0, fuelL: 0, fuelCostRM: 0, tollRM: 0, totalRM: 0 });

      rowsHtml += `
        <tr class="cost-table-total-row">
          <td colspan="2">TOTAL (SHOWN PERIOD)</td>
          <td>${shownTotal.deliveries}</td>
          <td>${shownTotal.distanceKm.toFixed(1)} km</td>
          <td>${shownTotal.fuelL.toFixed(2)} L</td>
          <td>RM ${shownTotal.fuelCostRM.toFixed(2)}</td>
          <td>RM ${shownTotal.tollRM.toFixed(2)}</td>
          <td>RM ${shownTotal.totalRM.toFixed(2)}</td>
        </tr>`;
    }

    tbody.innerHTML = rowsHtml;
  }
}

function openTransportCostDetails(detailKey) {
  const key = decodeURIComponent(String(detailKey || ''));
  const records = costAnalyticsDetailRecords[key] || [];
  const body = document.getElementById('transport-detail-modal-body');
  const modal = document.getElementById('transport-detail-modal');
  if (!body || !modal) return;

  if (!records.length) {
    body.innerHTML = '<p style="color:var(--text-secondary);">No Firebase delivery records are linked to this vehicle period.</p>';
  } else {
    body.innerHTML = `<div class="transport-detail-list">${records.map(({ order, metrics, period }) => `
      <div class="transport-detail-item">
        <div>
          <strong>${escapeHtml(order.orderId || 'Order')}</strong>
          <small>${escapeHtml(order.customerName || order.customerEmail || 'Customer')} · ${escapeHtml(period)}</small>
          <small>${escapeHtml(order.address || 'Route address unavailable')}</small>
          <small>${escapeHtml(order.vehicleType || metrics.vehicleCategory)} · ${metrics.distanceKm.toFixed(1)} km · RM ${metrics.totalCostRM.toFixed(2)}</small>
        </div>
        <div class="transport-detail-actions">
          <button type="button" class="admin-action-btn" onclick="openOrderDetailModal('${encodeURIComponent(String(order.orderId || ''))}')">VIEW ORDER</button>
          ${order.trackingNo ? `<button type="button" class="admin-action-btn" onclick="openTrackingView('${encodeURIComponent(String(order.trackingNo))}', 'admin')">TRACK</button>` : ''}
        </div>
      </div>`).join('')}</div>`;
  }
  modal.classList.add('active');
}

function closeTransportCostDetails() {
  const modal = document.getElementById('transport-detail-modal');
  if (modal) modal.classList.remove('active');
}

function parseAnalyticsDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const numericDate = new Date(value);
    return Number.isNaN(numericDate.getTime()) ? null : numericDate;
  }
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const match = raw.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (!match) return null;
  const fallback = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function analyticsOrderDate(order) {
  return parseAnalyticsDate(order?.createdAt || order?.date || order?.orderDate);
}

function analyticsOrderAmount(order) {
  const numeric = Number(String(order?.amount ?? order?.total ?? 0).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function analyticsIsRevenueOrder(order) {
  return !['cancelled', 'canceled', 'refunded', 'failed'].includes(String(order?.status || '').toLowerCase());
}

function createAnalyticsMonthSeries() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: 0,
      orders: 0,
      signups: 0
    };
  });
}

function getAnalyticsCategoryForName(name) {
  const lower = String(name || '').toLowerCase();
  const product = products.find((item) => String(item?.name || '').toLowerCase() === lower);
  if (product?.category) return String(product.category).toLowerCase();
  if (lower.includes('hoodie') || lower.includes('windbreaker') || lower.includes('jacket') || lower.includes('outer')) return 'outerwear';
  if (lower.includes('tee') || lower.includes('top') || lower.includes('shirt')) return 'tops';
  if (lower.includes('pant') || lower.includes('cargo') || lower.includes('bottom')) return 'bottoms';
  return null;
}

function getAnalyticsOrderItems(order) {
  if (Array.isArray(order?.itemsDetail) && order.itemsDetail.length > 0) return order.itemsDetail;
  return [{ name: order?.items || '', qty: Number(order?.qty || 1) }];
}

function calculateCategoryShareData(timeframe) {
  const totals = { outerwear: 0, tops: 0, bottoms: 0 };
  const now = new Date();

  salesHistoryData.forEach((order) => {
    if (!analyticsIsRevenueOrder(order)) return;
    const date = analyticsOrderDate(order);
    if (timeframe === 'month' && (!date || date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth())) return;
    if (timeframe === 'year' && (!date || date.getFullYear() !== now.getFullYear())) return;

    getAnalyticsOrderItems(order).forEach((item) => {
      const category = getAnalyticsCategoryForName(item?.name);
      const qty = Math.max(1, Number(item?.qty || 1));
      if (category === 'outerwear' || category === 'tops' || category === 'bottoms') totals[category] += qty;
    });
  });

  return [totals.outerwear, totals.tops, totals.bottoms];
}

function updateAnalyticsKpis(monthSeries) {
  const now = new Date();
  const revenueOrders = salesHistoryData.filter(analyticsIsRevenueOrder);
  const currentMonthSales = revenueOrders.reduce((sum, order) => {
    const date = analyticsOrderDate(order);
    return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      ? sum + analyticsOrderAmount(order)
      : sum;
  }, 0);
  const yearlySales = revenueOrders.reduce((sum, order) => {
    const date = analyticsOrderDate(order);
    return date && date.getFullYear() === now.getFullYear() ? sum + analyticsOrderAmount(order) : sum;
  }, 0);
  const pendingOrders = salesHistoryData.filter((order) => normalizeOrderStatus(order?.status) === 'Pending').length;
  const deliveredOrders = salesHistoryData.filter((order) => normalizeOrderStatus(order?.status) === 'Delivered').length;
  const activeBatches = lorryBatches.filter((batch) => {
    const batchStatus = String(batch?.status || '').trim().toLowerCase();
    return !['delivered', 'completed'].includes(batchStatus);
  }).length;

  const values = {
    'stat-monthly-sales': `RM ${currentMonthSales.toFixed(2)}`,
    'stat-yearly-sales': `RM ${yearlySales.toFixed(2)}`,
    'stat-total-users': String(getRegisteredUsersList().length),
    'stat-total-orders': String(salesHistoryData.length),
    'stat-pending-orders': String(pendingOrders),
    'stat-delivered-orders': String(deliveredOrders),
    'stat-active-batches': String(activeBatches)
  };
  Object.entries(values).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) element.innerText = text;
  });

  const liveSync = document.getElementById('analytics-live-sync');
  if (liveSync) liveSync.innerText = `LIVE FIREBASE SYNC • ${new Date().toLocaleTimeString('en-MY')}`;
}

function initAdminCharts() {
  const salesCtx = document.getElementById('salesChart');
  const signupCtx = document.getElementById('signupChart');
  const categoryCtx = document.getElementById('categoryChart');
  const monthSeries = createAnalyticsMonthSeries();

  salesHistoryData.filter(analyticsIsRevenueOrder).forEach((order) => {
    const date = analyticsOrderDate(order);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthSeries.find((item) => item.key === key);
    if (bucket) {
      bucket.revenue += analyticsOrderAmount(order);
      bucket.orders += 1;
    }
  });

  getRegisteredUsersList().forEach((user) => {
    const date = parseAnalyticsDate(user?.createdAt || user?.createdDate || user?.registeredAt);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthSeries.find((item) => item.key === key);
    if (bucket) bucket.signups += 1;
  });

  updateAnalyticsKpis(monthSeries);
  if (typeof Chart === 'undefined' || !salesCtx || !signupCtx || !categoryCtx) return;

  const labels = monthSeries.map((item) => item.label);
  const revenueData = monthSeries.map((item) => Number(item.revenue.toFixed(2)));
  const signupData = monthSeries.map((item) => item.signups);
  const categoryData = calculateCategoryShareData(document.getElementById('timeframe-select')?.value || 'year');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#222' }, ticks: { color: '#888' } },
      y: { grid: { color: '#222' }, ticks: { color: '#888' }, beginAtZero: true }
    }
  };

  if (salesChartInstance) {
    salesChartInstance.data.labels = labels;
    salesChartInstance.data.datasets[0].data = revenueData;
    salesChartInstance.update('none');
  } else {
    salesChartInstance = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (RM)',
          data: revenueData,
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: chartOptions
    });
  }

  if (signupChartInstance) {
    signupChartInstance.data.labels = labels;
    signupChartInstance.data.datasets[0].data = signupData;
    signupChartInstance.update('none');
  } else {
    signupChartInstance = new Chart(signupCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'New registered users',
          data: signupData,
          backgroundColor: '#818cf8'
        }]
      },
      options: {
        ...chartOptions,
        scales: {
          ...chartOptions.scales,
          y: { ...chartOptions.scales.y, precision: 0, ticks: { color: '#888', precision: 0 } }
        }
      }
    });
  }

  if (categoryChartInstance) {
    categoryChartInstance.data.datasets[0].data = categoryData;
    categoryChartInstance.update('none');
  } else {
    categoryChartInstance = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Outerwear', 'Tops', 'Bottoms'],
        datasets: [{
          data: categoryData,
          backgroundColor: ['#ffffff', '#818cf8', '#4b5563'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#fff', font: { family: 'Space Grotesk', size: 12 }, padding: 16, boxWidth: 14 }
          }
        }
      }
    });
  }
}

function updateCategoryChart() {
  const timeframe = document.getElementById('timeframe-select')?.value || 'year';
  if (!categoryChartInstance) {
    scheduleAnalyticsRefresh();
    return;
  }

  categoryChartInstance.data.datasets[0].data = calculateCategoryShareData(timeframe);
  categoryChartInstance.update('none');
}

let analyticsRefreshTimer = null;
let analyticsRefreshPending = false;

function scheduleAnalyticsRefresh() {
  analyticsRefreshPending = true;
  if (analyticsRefreshTimer !== null) return;

  analyticsRefreshTimer = window.setTimeout(() => {
    analyticsRefreshTimer = null;
    if (!analyticsRefreshPending) return;
    analyticsRefreshPending = false;
    initAdminCharts();
    renderCostAnalytics();
  }, 250);
}

function toggleMenu() {
  const links = document.getElementById('nav-links');
  const isOpening = !links.classList.contains('active');
  links.classList.toggle('active');

  if (isOpening) {
    document.body.classList.add('mobile-nav-open');
  } else {
    document.body.classList.remove('mobile-nav-open');
  }
}

function closeMobileMenu() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.remove('active');
  document.body.classList.remove('mobile-nav-open');
}

function bootFirebase() {
  if (!window.VoidFirebaseStore || !window.VoidFirebaseStore.firebaseReady()) {
    setTimeout(bootFirebase, 200);
    return;
  }

  console.log('Firebase Connected! Syncing live admin data...');

  window.VoidFirebaseStore.subscribe('products', (value) => {
    if (value) {
      products = firebaseToArray(value).map(normalizeProductImage);
      renderAdminProducts();
      scheduleAnalyticsRefresh();
    } else {
      saveProductsToCloud();
    }
  });

  window.VoidFirebaseStore.subscribe('sales_history', (value) => {
    if (value) {
      salesHistoryData = window.VoidFirebaseStore.dedupeSalesHistory
        ? window.VoidFirebaseStore.dedupeSalesHistory(value)
        : firebaseToArray(value);
      adminSalesLoaded = true;
      ensureOpenOrdersHaveDispatchBatches();
      renderAdminSalesHistory();
      scheduleAnalyticsRefresh();
    } else {
      salesHistoryData = [];
      adminSalesLoaded = true;
    }
  });

  window.VoidFirebaseStore.subscribe('lorry_batches', (value) => {
    lorryBatches = value
      ? (window.VoidFirebaseStore.dedupeLorryBatches
        ? window.VoidFirebaseStore.dedupeLorryBatches(value)
        : firebaseToArray(value))
      : [];
    adminBatchesLoaded = true;
    ensureOpenOrdersHaveDispatchBatches();
    renderAdminLorryBatches();
    scheduleAnalyticsRefresh();
    refreshOpenLorryTrackingFromFirebase();
  });

  window.VoidFirebaseStore.subscribe('users', (value) => {
    registeredUsers = firebaseToArray(value);
    renderAdminUsers();
    const totalUsers = document.getElementById('stat-total-users');
    if (totalUsers) totalUsers.innerText = String(registeredUsers.length);
    scheduleAnalyticsRefresh();
  });

  window.VoidFirebaseStore.subscribe('notifications', (value) => {
    notifications = firebaseToArray(value);
    renderAdminInquiryCenter();
  });

  window.VoidFirebaseStore.subscribe('hero_slides', (value) => {
    if (value) {
      heroSlides = normalizeHeroSlides(firebaseToArray(value).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      renderAdminSlides();
      populateSlideProductDropdown();
    } else if (heroSlides.length > 0) {
      saveSlidesToCloud();
    }
  });
}

function setupAdminEventListeners() {
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));

  document.addEventListener('click', (event) => {
    const nav = document.getElementById('nav-links');
    const burger = document.querySelector('.hamburger');
    if (!nav || !nav.classList.contains('active')) return;
    if (nav.contains(event.target) || (burger && burger.contains(event.target))) return;
    closeMobileMenu();
  });
}

function setupEventListeners() {
  return setupAdminEventListeners();
}

function initApp() {
  renderAdminProducts();
  renderAdminSlides();
  renderAdminUsers();
  renderAdminSalesHistory();
  renderAdminLorryBatches();
  populateSlideProductDropdown();
  setupEventListeners();
  renderNotifications();
  setTimeout(scheduleAnalyticsRefresh, 100);
  bootFirebase();
  checkAndAutoCompleteDeliveries();
  checkAndProgressLorryBatches();
  setInterval(() => {
    checkAndAutoCompleteDeliveries();
    checkAndProgressLorryBatches();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);
