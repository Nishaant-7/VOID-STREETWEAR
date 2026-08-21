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

async function readFirebaseArray(path, fallback = []) {
  if (!window.VoidFirebaseStore) return fallback;
  return window.VoidFirebaseStore.readArray(path, fallback);
}

async function writeFirebase(path, value) {
  if (!window.VoidFirebaseStore) throw new Error('Firebase store helper is unavailable.');
  return window.VoidFirebaseStore.write(path, value);
}

let registeredUsers = [];
async function loadUsersFromFirebase() {
  registeredUsers = await readFirebaseArray('users', registeredUsers);
  return registeredUsers;
}

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

let lorryBatches = [];

function saveLorryBatches() {
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

const DEFAULT_PRODUCTS = [
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

let products = DEFAULT_PRODUCTS.map(normalizeProductImage);

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

const DEFAULT_HERO_SLIDES = [
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

let heroSlides = [...DEFAULT_HERO_SLIDES];

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
    .catch((error) => console.error('Cloud Sync Error (Sales):', error));
}

function saveProductsToCloud() {
  return writeFirebase('products', products)
    .catch((error) => console.error('Cloud Sync Error (Products):', error));
}

function saveSlidesToCloud() {
  return writeFirebase('hero_slides', heroSlides)
    .catch((error) => console.error('Cloud Sync Error (Slides):', error));
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
  const existing = lorryBatches.find((b) =>
    b.state === state &&
    b.status === 'Forming' &&
    (b.deliveryMethod || 'standard') === deliveryMethod
  );
  if (existing) return existing;

  const seed = `${state}-${deliveryMethod}-${Date.now()}`;
  const rand = seededRandom(seed);
  const standardVehicle = STANDARD_VAN_FLEET[Math.floor(rand() * STANDARD_VAN_FLEET.length)];
  const instantVehicle = options.vehicle || {
    type: 'Instant Dispatch Motorcycle',
    category: 'motorcycle',
    icon: 'fa-motorcycle',
    consumptionLperKm: 0.025,
    tankCapacityL: 4.2
  };
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

  batch.history.push({
    time: Date.now(),
    text: `Batch ${batch.batchId} for ${batch.state} grew past van capacity (${STANDARD_VAN_MAX_STOPS} orders / ${STANDARD_VAN_MAX_ITEMS} items) with ${batch.stops.length} order(s) and ${batch.totalItems} item(s) queued. Upgraded from Van ${previousPlate} to Lorry ${batch.plateNo} (${batch.vehicleType}) to carry the extra volume in one trip.`
  });
}

function assignOrderToLorryBatch(order) {
  const isInstant = order.deliveryMethod === 'instant';
  const batch = findOrCreateLorryBatch(order.state, {
    deliveryMethod: isInstant ? 'instant' : 'standard',
    vehicle: isInstant ? order.dispatchVehicle : null
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
  saveLorryBatches();
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

function dispatchLorryBatch(batchId) {
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
  const vehicleLabel = batch.vehicleCategory === 'van' ? 'Van' : 'Lorry';
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
  alert(`${vehicleLabel} ${batch.plateNo} dispatched with ${batch.stops.length} parcel(s) to ${batch.state}.`);
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

  changedBatches.forEach((batch) => persistLiveBatchState(batch, anyStopChanged));
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


function firebaseToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data).filter(Boolean);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function validateRealAddress(addressData) {
    const { street, city, postcode, state } = addressData;

    if (!street || street.trim().length < 5) {
        return { isValid: false, message: "Street address is too short or invalid." };
    }

    const gibberishPattern = /^(asd|qwe|zxc|test|fake|abc|12345|11111)/i;
    if (gibberishPattern.test(street.trim())) {
        return { isValid: false, message: "Invalid location detected. Please enter a real street address." };
    }

    const hasNumber = /(\b\d+\b|no\.?\s*\d+|lot\s*\d+|unit\s*\d+|level\s*\d+)/i.test(street);
    if (!hasNumber) {
        return { isValid: false, message: "Address must include a house, building, unit, or lot number." };
    }

    const roadKeywords = /\b(jalan|lorong|persiaran|lebuh|taman|section|seksyen|ss\d+|usj\d+|street|st|road|rd|avenue|ave|boulevard|blvd|lane|ln|drive|dr)\b/i;
    if (!roadKeywords.test(street)) {
        return { isValid: false, message: "Please include a valid road type (e.g., Jalan, Lorong, Street, Road)." };
    }

    const postcodeRegex = /^\d{5}$/;
    if (!postcodeRegex.test(postcode)) {
        return { isValid: false, message: "Please enter a valid 5-digit postal code." };
    }

    if (!city || city.trim().length < 2) {
        return { isValid: false, message: "Please specify a valid city." };
    }

    if (!state) {
        return { isValid: false, message: "Please select a state." };
    }

    return { isValid: true, message: "Address is valid." };
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

function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));

  const navAnchors = Array.from(document.querySelectorAll('#nav-links a'));
  navAnchors.forEach((anchor) => anchor.classList.remove('active'));
  const shopAnchor = navAnchors.find((anchor) => anchor.textContent.trim().toUpperCase() === 'SHOP');
  const accountAnchor = document.getElementById('nav-account-link');
  const ordersAnchor = navAnchors.find((anchor) => anchor.textContent.trim().toUpperCase() === 'ORDERS');
  if (viewId === 'home' && shopAnchor) shopAnchor.classList.add('active');
  if (['auth', 'profile'].includes(viewId) && accountAnchor) accountAnchor.classList.add('active');
  if (viewId === 'orders' && ordersAnchor) ordersAnchor.classList.add('active');

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
    window.location.href = 'admin-login.html';
    return;
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
  if (!container || !dotsContainer) return;

  heroSlides = (Array.isArray(heroSlides) ? heroSlides : [])
    .filter((slide) => slide && slide.image)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  currentSlide = heroSlides.length > 0 ? Math.min(currentSlide, heroSlides.length - 1) : 0;

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

  updateSlider();
  if (heroSlides.length > 1) {
    startSlideInterval();
  } else {
    clearInterval(slideInterval);
  }
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
              <img src="${prod.image || WIND_BREAKER_IMAGE}" alt="${prod.name}" onerror="this.onerror=null; this.src=WIND_BREAKER_IMAGE;">
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

function handlePriceRangeChange() {
  const rangeSelect = document.getElementById('price-range-filter');
  const customBox = document.getElementById('custom-price-range');
  if (!rangeSelect || !customBox) return;

  if (rangeSelect.value === 'custom') {
    customBox.classList.add('active');
    return; 
  }

  customBox.classList.remove('active');
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-filter').value;
  const sort = document.getElementById('sort-filter').value;
  const rangeSelect = document.getElementById('price-range-filter');
  const priceRange = rangeSelect ? rangeSelect.value : 'any';

  let minPrice = 0;
  let maxPrice = Infinity;

  if (priceRange === 'custom') {
    const minInput = document.getElementById('price-min-input');
    const maxInput = document.getElementById('price-max-input');
    minPrice = minInput && minInput.value !== '' ? parseFloat(minInput.value) : 0;
    maxPrice = maxInput && maxInput.value !== '' ? parseFloat(maxInput.value) : Infinity;
    if (minPrice > maxPrice) { [minPrice, maxPrice] = [maxPrice, minPrice]; }
  } else if (priceRange !== 'any') {
    const [lo, hi] = priceRange.split('-').map(Number);
    minPrice = lo;
    maxPrice = hi;
  }

  let filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search);
    const matchesCat = category === 'all' || p.category === category;
    const effectivePrice = getEffectivePrice(p);
    const matchesPrice = effectivePrice >= minPrice && effectivePrice <= maxPrice;
    return matchesSearch && matchesCat && matchesPrice;
  });

  if (sort === 'low-high') filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
  if (sort === 'high-low') filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));

  renderProducts(filtered);
}

function findProductForItem(item) {
  if (!item) return null;
  if (item.id != null) {
    const p = products.find((p) => p.id === item.id);
    if (p) return p;
  }
  return products.find((p) => p.name === item.name) || null;
}

function getDeliveredPurchasedProducts(email) {
  if (!email) return [];
  const map = new Map();
  salesHistoryData
    .filter((o) => (o.customerEmail || '').toLowerCase() === email.toLowerCase() && o.status === 'Delivered')
    .forEach((order) => {
      (order.itemsDetail || []).forEach((item) => {
        const prod = findProductForItem(item);
        if (!prod) return;
        if (!map.has(prod.id)) {
          map.set(prod.id, { product: prod, sizes: new Set(), orderId: order.orderId });
        }
        if (item.size) map.get(prod.id).sizes.add(item.size);
      });
    });
  return Array.from(map.values());
}

function getUserReviewForProduct(prod, email) {
  if (!prod || !prod.reviews || !email) return null;
  return prod.reviews.find((r) => r.email && r.email.toLowerCase() === email.toLowerCase()) || null;
}

function hasReviewedProduct(prod, email) {
  return !!getUserReviewForProduct(prod, email);
}

function openProductDetail(id) {
  const prod = products.find((p) => p.id === id);
  if (!prod) return;

  currentDetailProductId = id;
  currentDetailSize = PRODUCT_SIZES.find((s) => getSizeStock(prod, s) > 0) || PRODUCT_SIZES[0];

  if (!prod.reviews) {
    prod.reviews = [
      { user: 'Muhammad Danish', rating: 5, comment: 'High-quality material and perfect oversized fit.', size: 'L' },
      { user: 'Aiman Zikri', rating: 4, comment: 'Fast shipping and great attention to detail.', size: 'M' }
    ];
  }

  const hasPromo = prod.promoPrice != null && prod.promoPrice > 0 && prod.promoPrice < prod.price;
  const detailPriceHtml = hasPromo
    ? `<span class="price-original" style="font-size: 1.1rem;">RM ${prod.price.toFixed(2)}</span><span class="price-promo" style="font-size: 1.6rem;">RM ${prod.promoPrice.toFixed(2)}</span>`
    : `RM ${prod.price.toFixed(2)}`;

  const container = document.getElementById('product-detail-container');
  container.innerHTML = `
    <img src="${prod.image}" class="detail-img" alt="${prod.name}">
    <div class="detail-info">
        <span class="back-link" onclick="navigateTo('home')" style="cursor: pointer; color: var(--text-secondary); display: inline-block; margin-bottom: 1rem;">← Back to Shop</span>
        <h2>${prod.name}</h2>
        <div class="detail-price">${detailPriceHtml}</div>
        <p style="margin-bottom: 1rem; color: ${getTotalStock(prod) > 0 ? '#4ade80' : '#ef4444'}; font-weight: bold;">
            ${getTotalStock(prod) > 0 ? `Total Stock (All Sizes): ${getTotalStock(prod)} units` : 'Out of Stock'}
        </p>
        <p class="detail-desc">${prod.description}</p>
        
        <div style="margin-bottom: 2rem;">
            <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">SELECT SIZE</label>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="size-selector">
                ${PRODUCT_SIZES.map((s) => {
                  const qty = getSizeStock(prod, s);
                  const isOut = qty <= 0;
                  const isActive = s === currentDetailSize;
                  const bg = isActive ? 'var(--text-primary)' : 'var(--bg-secondary)';
                  const color = isActive ? 'var(--bg-primary)' : 'var(--text-primary)';
                  const border = isActive ? 'none' : '1px solid var(--border)';
                  return `<button type="button" class="size-btn${isActive ? ' active' : ''}" ${isOut ? 'disabled' : ''} onclick="selectSize(this, '${s}')"
                    style="padding: 10px 16px; background: ${bg}; color: ${color}; border: ${border}; cursor: ${isOut ? 'not-allowed' : 'pointer'}; font-weight: bold; opacity: ${isOut ? '0.4' : '1'}; line-height: 1.2;">
                      ${s}${isOut ? '<br><span style="font-size:0.55rem; font-weight:normal;">SOLD OUT</span>' : ''}
                    </button>`;
                }).join('')}
            </div>
            <p id="size-stock-info" style="margin-top: 0.6rem; font-size: 0.8rem;"></p>
        </div>

        <button class="btn-full" id="add-to-cart-btn" style="background-color: var(--accent); color: #000; font-weight: bold; margin-bottom: 2rem;" 
          onclick="addToCart(${prod.id})">
            <i class="fa-solid fa-cart-shopping"></i> <span id="add-to-cart-label">ADD TO CART</span>
        </button>

        <div class="reviews-section">
            <div class="review-filter-bar">
                <h3 style="font-family: var(--font-heading); font-size: 1.1rem; margin: 0;">CUSTOMER REVIEWS</h3>
                <select id="review-filter-select" class="review-filter-select" onchange="renderProductReviewList(${prod.id})">
                    <option value="all">All Reviews</option>
                    <option value="positive">Positive Only (4–5★)</option>
                    <option value="critical">Critical Only (1–2★)</option>
                    <option value="hide-critical">Hide Bad Reviews (1–2★)</option>
                </select>
            </div>
            <div class="review-list" id="review-list-container"></div>

            ${renderReviewEligibilityBox(prod)}
        </div>
    </div>
  `;
  navigateTo('product');
  updateSizeStockInfo(prod);
  renderProductReviewList(prod.id);
}

function renderProductReviewList(productId) {
  const prod = products.find((p) => p.id === productId);
  const container = document.getElementById('review-list-container');
  if (!prod || !container) return;

  const filter = document.getElementById('review-filter-select')?.value || 'all';
  let reviews = prod.reviews || [];

  if (filter === 'positive') reviews = reviews.filter((r) => r.rating >= 4);
  else if (filter === 'critical') reviews = reviews.filter((r) => r.rating <= 2);
  else if (filter === 'hide-critical') reviews = reviews.filter((r) => r.rating > 2);

  if (reviews.length === 0) {
    container.innerHTML = `<p class="review-empty-msg">No reviews match this filter yet.</p>`;
    return;
  }

  container.innerHTML = reviews.map((r) => `
      <div class="review-card">
          <div class="review-header">
              <strong style="color: var(--text-primary);">${r.user}</strong>
              <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          ${r.email ? `<div class="review-verified-badge"><i class="fa-solid fa-circle-check"></i> Verified Purchase${r.size ? ` — Size ${r.size}` : ''}</div>` : ''}
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">${r.comment}</p>
      </div>
  `).join('');
}

function renderReviewEligibilityBox(prod) {
  if (!currentUser) {
    return `
      <div class="review-eligibility-box">
        <span>Log in and receive this item to leave a review.</span>
        <button type="button" class="order-review-btn" onclick="navigateTo('auth')">LOG IN</button>
      </div>`;
  }

  const existing = getUserReviewForProduct(prod, currentUser.email);
  if (existing) {
    return `
      <div class="review-eligibility-box">
        <span>You've already reviewed this item${existing.size ? ` (Size ${existing.size})` : ''} — ${'★'.repeat(existing.rating)}${'☆'.repeat(5 - existing.rating)}</span>
      </div>`;
  }

  const purchased = getDeliveredPurchasedProducts(currentUser.email).find((p) => p.product.id === prod.id);
  if (!purchased) {
    return `
      <div class="review-eligibility-box">
        <span>You can review this item once it's been delivered to you.</span>
        <button type="button" class="order-review-btn" onclick="goToMyOrders()">VIEW MY ORDERS</button>
      </div>`;
  }

  return `
    <div class="review-eligibility-box">
      <span>This item was delivered to you — let other buyers know what you think.</span>
      <button type="button" class="order-review-btn" onclick="openRateItemModal(${prod.id})">RATE & REVIEW</button>
    </div>`;
}

function openRateItemModal(productId, orderId) {
  if (!currentUser) { navigateTo('auth'); return; }

  const prod = products.find((p) => p.id === productId);
  if (!prod) return;

  if (hasReviewedProduct(prod, currentUser.email)) {
    alert('You\'ve already reviewed this item.');
    return;
  }

  const purchased = getDeliveredPurchasedProducts(currentUser.email).find((p) => p.product.id === productId);
  if (!purchased) {
    alert('You can only review items that have been delivered to you.');
    return;
  }

  document.getElementById('rate-item-product-id').value = productId;
  document.getElementById('rate-item-order-id').value = orderId || purchased.orderId || '';
  document.getElementById('rate-item-image').src = prod.image;
  document.getElementById('rate-item-image').alt = prod.name;
  document.getElementById('rate-item-name').innerText = prod.name;

  const sizes = Array.from(purchased.sizes);
  const sizeSelect = document.getElementById('rate-item-size-select');
  if (sizes.length > 0) {
    sizeSelect.style.display = '';
    sizeSelect.innerHTML = sizes.map((s) => `<option value="${s}">Size Purchased: ${s}</option>`).join('');
  } else {
    sizeSelect.style.display = 'none';
  }

  document.getElementById('rate-item-rating').value = '5';
  document.getElementById('rate-item-comment').value = '';

  document.getElementById('rate-item-modal').classList.add('active');
}

function closeRateItemModal() {
  document.getElementById('rate-item-modal').classList.remove('active');
}

function submitItemReview(e) {
  e.preventDefault();
  if (!currentUser) return;

  const productId = parseInt(document.getElementById('rate-item-product-id').value);
  const prod = products.find((p) => p.id === productId);
  if (!prod) return;

  if (hasReviewedProduct(prod, currentUser.email)) {
    alert('You\'ve already reviewed this item.');
    closeRateItemModal();
    return;
  }
  const purchased = getDeliveredPurchasedProducts(currentUser.email).find((p) => p.product.id === productId);
  if (!purchased) {
    alert('You can only review items that have been delivered to you.');
    closeRateItemModal();
    return;
  }

  const rating = parseInt(document.getElementById('rate-item-rating').value);
  const comment = document.getElementById('rate-item-comment').value;
  const sizeSelect = document.getElementById('rate-item-size-select');
  const size = sizeSelect.style.display !== 'none' ? sizeSelect.value : null;

  if (!prod.reviews) prod.reviews = [];
  prod.reviews.unshift({
    email: currentUser.email,
    user: currentUser.name,
    rating,
    comment,
    size,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  saveProductsToCloud();
  addNotification(currentUser.email, 'Review Submitted', `You reviewed "${prod.name}" (${rating} Stars).`);

  closeRateItemModal();
  renderMyOrders();
  if (currentDetailProductId === productId) {
    openProductDetail(productId);
  }
  alert('Review submitted successfully!');
}

async function submitInquiry(e) {
  e.preventDefault();

  const nameInput = document.getElementById('inquiry-name');
  const emailInput = document.getElementById('inquiry-email');
  const messageInput = document.getElementById('inquiry-message');
  const successMsg = document.getElementById('inquiry-success-msg');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !emailRegex.test(email) || !message) {
    alert('Please fill in your name, a valid email, and a message before sending.');
    return;
  }
  if (!currentUser?.email) {
    alert('Please log in to your VOID account before sending an inquiry so the admin can reply securely.');
    return;
  }

  const now = Date.now();
  const inquiry = {
    id: now,
    notificationId: `inq_${now}`,
    threadId: `inq_${now}`,
    type: 'inquiry',
    senderRole: 'customer',
    userId: currentUser.email,
    customerUid: currentUser.uid || null,
    customerName: name,
    customerEmail: email,
    title: 'Customer Inquiry',
    message,
    replies: [],
    status: 'open',
    date: new Date(now).toLocaleString('en-MY'),
    createdAt: now,
    updatedAt: now,
    read: false,
    trackingNo: null,
    extraData: { type: 'inquiry', customerName: name, customerEmail: email }
  };

  notifications.unshift(inquiry);
  try {
    const saved = await saveNotificationsToCloud();
    if (saved === null) throw new Error('Firebase rejected the inquiry write. Check the signed-in customer account and Firebase Rules.');
    const form = document.getElementById('footer-inquiry-form');
    if (form) form.reset();
    if (successMsg) {
      successMsg.innerText = 'Your inquiry was sent to VOID Central Hub. Replies will appear in Account notifications.';
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }
  } catch (error) {
    notifications = notifications.filter((item) => item.notificationId !== inquiry.notificationId);
    alert(`Inquiry could not be sent: ${error.message}`);
  }
}

function selectSize(btn, size) {
  if (btn.disabled) return; 

  currentDetailSize = size;

  document.querySelectorAll('#size-selector .size-btn').forEach((b) => {
    if (b.disabled) return; 
    b.classList.remove('active');
    b.style.background = 'var(--bg-secondary)';
    b.style.color = 'var(--text-primary)';
    b.style.border = '1px solid var(--border)';
  });
  btn.classList.add('active');
  btn.style.background = 'var(--text-primary)';
  btn.style.color = 'var(--bg-primary)';
  btn.style.border = 'none';

  const prod = products.find((p) => p.id === currentDetailProductId);
  updateSizeStockInfo(prod);
}

function updateSizeStockInfo(prod) {
  if (!prod) return;
  const qty = getSizeStock(prod, currentDetailSize);
  const infoEl = document.getElementById('size-stock-info');
  const btn = document.getElementById('add-to-cart-btn');
  const label = document.getElementById('add-to-cart-label');

  if (infoEl) {
    infoEl.style.color = qty > 0 ? '#4ade80' : '#ef4444';
    infoEl.style.fontWeight = 'bold';
    infoEl.innerText = qty > 0
      ? `Size ${currentDetailSize}: ${qty} in stock`
      : `Size ${currentDetailSize}: Out of Stock`;
  }

  if (btn && label) {
    btn.disabled = qty <= 0;
    btn.style.opacity = qty > 0 ? '1' : '0.5';
    btn.style.cursor = qty > 0 ? 'pointer' : 'not-allowed';
    label.innerText = qty > 0 ? 'ADD TO CART' : 'OUT OF STOCK';
  }
}

function addToCart(id) {
  const prod = products.find((p) => p.id === id);
  if (!prod) return;

  const size = currentDetailSize || PRODUCT_SIZES[0];
  const availableQty = getSizeStock(prod, size);
  if (availableQty <= 0) return alert(`Size ${size} is out of stock!`);

  const existing = cart.find((item) => item.id === id && item.size === size);

  if (existing) {
    if (existing.qty + 1 > availableQty) return alert(`Maximum available stock reached for size ${size} (${availableQty})!`);
    existing.qty += 1;
  } else {
    cart.push({ ...prod, size, qty: 1, price: getEffectivePrice(prod), originalPrice: prod.price });
  }

  const currentSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  if (currentUser) {
    addNotification(
      currentUser.email, 
      'Cart Updated', 
      `Added "${prod.name}" (Size ${size}) to your cart. Current cart subtotal: RM ${currentSubtotal.toFixed(2)}`
    );
  }

  updateCartCount();
  renderCartItems();
  toggleCart();
}

function updateCartItemQty(index, delta) {
  const item = cart[index];
  if (!item) return;

  const originalProd = products.find(p => p.id === item.id);
  const newQty = item.qty + delta;

  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }

  const availableQty = originalProd ? getSizeStock(originalProd, item.size) : Infinity;
  if (newQty > availableQty) {
    alert(`Only ${availableQty} items in stock for size ${item.size || ''}!`);
    return;
  }

  item.qty = newQty;
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById('cart-count').innerText = count;
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('total-price');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">Your cart is empty.</p>`;
    totalEl.innerText = 'RM 0.00';
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const hasPromo = item.originalPrice != null && item.originalPrice > item.price;
    const priceHtml = hasPromo
      ? `<span class="price-original">RM ${item.originalPrice.toFixed(2)}</span><span class="price-promo">RM ${item.price.toFixed(2)}</span>`
      : `RM ${item.price.toFixed(2)}`;
    container.innerHTML += `
      <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
              <div class="cart-item-title">${item.name}${item.size ? ` <span style="color: var(--text-secondary); font-size: 0.75rem;">(Size ${item.size})</span>` : ''}</div>
              <div class="cart-item-price">${priceHtml}</div>
              <div class="cart-qty-control" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <button type="button" onclick="updateCartItemQty(${index}, -1)" class="cart-qty-btn">-</button>
                  <span style="font-size: 0.85rem; font-weight: bold;">${item.qty}</span>
                  <button type="button" onclick="updateCartItemQty(${index}, 1)" class="cart-qty-btn">+</button>
              </div>
          </div>
          <button onclick="removeFromCart(${index})" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  });

  totalEl.innerText = `RM ${total.toFixed(2)}`;
}

function removeFromCart(index) {
  const removed = cart[index];
  cart.splice(index, 1);

  if (currentUser && removed) {
    addNotification(currentUser.email, 'Cart Updated', `Removed "${removed.name}" from your cart.`);
  }

  updateCartCount();
  renderCartItems();
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('active');
}

function renderCheckoutPriceBreakdown() {
  const deliveryMethod = document.getElementById('chk-delivery-method') ? document.getElementById('chk-delivery-method').value : 'instant';
  const pricing = calculateOrderPricing(cart, deliveryMethod);

  const subtotalEl = document.getElementById('pb-subtotal');
  if (subtotalEl) subtotalEl.innerText = `RM ${pricing.subtotal.toFixed(2)}`;

  const discountRow = document.getElementById('pb-discount-row');
  const discountLabelEl = document.getElementById('pb-discount-label');
  const discountEl = document.getElementById('pb-discount');
  if (discountRow) {
    if (pricing.discount > 0) {
      discountRow.style.display = 'flex';
      if (discountLabelEl) discountLabelEl.innerText = pricing.discountLabel;
      if (discountEl) discountEl.innerText = `-RM ${pricing.discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  const surchargeRow = document.getElementById('pb-instant-surcharge-row');
  const surchargeLabelEl = document.getElementById('pb-instant-surcharge-label');
  const surchargeEl = document.getElementById('pb-instant-surcharge');
  const surchargeNoteEl = document.getElementById('pb-instant-surcharge-note');
  if (surchargeRow) {
    if (pricing.instantSurcharge > 0) {
const methodLabel = deliveryMethod === 'instant' ? 'Instant' : 'Standard';      const rate = Math.round(SHIPPING_FEE_RATE[deliveryMethod] * 100);
      surchargeRow.style.display = 'flex';
      if (surchargeLabelEl) surchargeLabelEl.innerText = `${methodLabel} Delivery Fee (${rate}%)`;
      if (surchargeEl) surchargeEl.innerText = `+RM ${pricing.instantSurcharge.toFixed(2)}`;
      if (surchargeNoteEl) {
        surchargeNoteEl.innerText = `Note: additional ${rate}% added for ${methodLabel} Delivery.`;
        surchargeNoteEl.style.display = 'block';
      }
    } else {
      surchargeRow.style.display = 'none';
      if (surchargeNoteEl) {
        if (pricing.freeShipping) {
          surchargeNoteEl.innerText = `Free Shipping — order qualifies (RM${FREE_SHIPPING_MIN_SUBTOTAL}+).`;
          surchargeNoteEl.style.display = 'block';
        } else {
          surchargeNoteEl.innerText = '';
          surchargeNoteEl.style.display = 'none';
        }
      }
    }
  }

  const sstEl = document.getElementById('pb-sst');
  if (sstEl) sstEl.innerText = `RM ${pricing.sst.toFixed(2)}`;

  const totalEl = document.getElementById('checkout-total-price');
  if (totalEl) totalEl.innerText = `RM ${pricing.total.toFixed(2)}`;

  return pricing;
}

function goToCheckout() {
  if (cart.length === 0) return alert('Your cart is empty!');

  if (!currentUser) {
    alert('Please sign up or log in to proceed to checkout.');
    toggleCart();
    navigateTo('auth');
    switchAuthView('signup');
    return;
  }

  toggleCart();

  renderCheckoutPriceBreakdown();

  document.getElementById('chk-name').value = currentUser.name || '';
  document.getElementById('chk-email').value = currentUser.email || '';
  document.getElementById('chk-address').value = currentUser.address || '';
  document.getElementById('chk-city').value = currentUser.city || '';
  document.getElementById('chk-state').value = currentUser.state || '';
  if (document.getElementById('chk-zip')) {
    document.getElementById('chk-zip').value = currentUser.zip || '';
  }

  if (currentUser.lat && currentUser.lng) {
    setVerifiedState('chk', true);
    document.getElementById('chk-lat').value = currentUser.lat;
    document.getElementById('chk-lng').value = currentUser.lng;
  } else {
    setVerifiedState('chk', false);
  }

  selectDeliveryMethod('instant');

  navigateTo('checkout');
}

function selectDeliveryMethod(method) {
  const hiddenInput = document.getElementById('chk-delivery-method');
  if (hiddenInput) hiddenInput.value = method;

  const instantCard = document.getElementById('dm-instant-card');
  const standardCard = document.getElementById('dm-standard-card');
  if (instantCard) instantCard.classList.toggle('active', method === 'instant');
  if (standardCard) standardCard.classList.toggle('active', method === 'standard');

  updateLorryBatchPreview();
  renderCheckoutPriceBreakdown();
}

function updateLorryBatchPreview() {
  const previewEl = document.getElementById('lorry-batch-preview');
  if (!previewEl) return;

  const method = document.getElementById('chk-delivery-method') ? document.getElementById('chk-delivery-method').value : 'instant';
  const stateEl = document.getElementById('chk-state');
  const state = stateEl ? stateEl.value : '';

  if (method !== 'standard') {
    previewEl.style.display = 'none';
    return;
  }

  previewEl.style.display = 'block';

  if (!state) {
    previewEl.classList.remove('warning');
    previewEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> Select your state above to see the current delivery batch.`;
    return;
  }

  if (!PENINSULAR_STATES.includes(state)) {
    previewEl.classList.add('warning');
    previewEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Standard Delivery isn't available for ${state} (East Malaysia). Please choose Instant Delivery instead.`;
    return;
  }

  previewEl.classList.remove('warning');
  const openBatch = lorryBatches.find((b) => b.state === state && b.status === 'Forming');
  const filled = openBatch ? openBatch.stops.length : 0;
  const filledItems = openBatch ? (openBatch.totalItems || 0) : 0;
  const isLorry = openBatch && openBatch.vehicleCategory === 'lorry';
  const vehicleLabel = isLorry ? 'lorry' : 'van';
  const vehicleIconClass = isLorry ? 'fa-truck' : 'fa-van-shuttle';

  previewEl.innerHTML = `<i class="fa-solid ${vehicleIconClass}"></i> Current batch for <strong>${state}</strong>: ${filled} order(s) / ${filledItems} item(s) `
    + (isLorry
      ? `(upgraded to a lorry — past the ${STANDARD_VAN_MAX_STOPS}-order / ${STANDARD_VAN_MAX_ITEMS}-item van limit). `
      : `(van, up to ${STANDARD_VAN_MAX_STOPS} orders / ${STANDARD_VAN_MAX_ITEMS} items — a lorry takes over automatically beyond that). `)
    + (filled > 0
      ? `Your order will join this ${vehicleLabel} and be routed nearest-to-farthest once dispatched (usually within 2–4 days).`
      : `You'll start a new delivery batch for ${state} — it dispatches once ready, or earlier at admin's discretion.`);
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

async function geocodeAddressStrict(addressStr, cityStr, stateStr, zipStr) {
  const country = 'Malaysia';

  async function tryQuery(url) {
    try {
      const res = await fetchWithTimeout(url, 7000);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), formatted: data[0].display_name };
      }
    } catch (e) {
      console.warn('Geocode query failed:', url, e);
    }
    return null;
  }

  let hit = await tryQuery(
    `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=1` +
    `&street=${encodeURIComponent(addressStr)}&city=${encodeURIComponent(cityStr)}` +
    `&state=${encodeURIComponent(stateStr)}&postalcode=${encodeURIComponent(zipStr)}&country=${country}`
  );
  if (hit) return { ...hit, precise: true };

  hit = await tryQuery(
    `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=1` +
    `&street=${encodeURIComponent(addressStr)}&city=${encodeURIComponent(cityStr)}` +
    `&state=${encodeURIComponent(stateStr)}&country=${country}`
  );
  if (hit) return { ...hit, precise: true };

  hit = await tryQuery(
    `${NOMINATIM_BASE}/search?format=json&countrycodes=my&limit=1` +
    `&q=${encodeURIComponent(`${addressStr}, ${zipStr} ${cityStr}, ${stateStr}, ${country}`)}`
  );
  if (hit) return { ...hit, precise: true };

  const roadOnly = addressStr.replace(/^\s*(no\.?|lot|unit|level)?\s*\d+[a-zA-Z]?[,.]?\s*/i, '').trim();
  if (roadOnly && roadOnly.toLowerCase() !== addressStr.toLowerCase()) {
    hit = await tryQuery(
      `${NOMINATIM_BASE}/search?format=json&countrycodes=my&limit=1` +
      `&q=${encodeURIComponent(`${roadOnly}, ${cityStr}, ${stateStr}, ${country}`)}`
    );
    if (hit) return { ...hit, formatted: `${hit.formatted} (street-level match, please confirm exact spot)`, precise: false };
  }

  hit = await tryQuery(
    `${NOMINATIM_BASE}/search?format=json&countrycodes=my&limit=1` +
    `&postalcode=${encodeURIComponent(zipStr)}&country=${country}`
  );
  if (hit) return { ...hit, formatted: `Postcode ${zipStr} area (please pin your exact address)`, precise: false };

  const cityCenters = {
    'kuala lumpur': [3.1390, 101.6869],
    'kl': [3.1390, 101.6869],
    'petaling jaya': [3.1073, 101.6067],
    'klang': [3.0449, 101.4456],
    'subang': [3.0567, 101.5851],
    'shah alam': [3.0738, 101.5183],
    'johor bahru': [1.4927, 103.7414],
    'johor': [1.4927, 103.7414],
    'george town': [5.4164, 100.3327],
    'penang': [5.4164, 100.3327],
  };
  const cityLower = (cityStr || '').toLowerCase();
  const matchedKey = Object.keys(cityCenters).find((k) => cityLower.includes(k));
  const [baseLat, baseLng] = matchedKey ? cityCenters[matchedKey] : [3.1390, 101.6869];

  return {
    lat: baseLat,
    lng: baseLng,
    precise: false,
    formatted: `${addressStr}, ${zipStr} ${cityStr}, ${stateStr} (could not verify - please pin manually)`
  };
}

const addressPinMaps = {};      
const addressDebounceTimers = {};

function debounce(fn, delay, key) {
  return function (...args) {
    clearTimeout(addressDebounceTimers[key]);
    addressDebounceTimers[key] = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setVerifiedState(prefix, isVerified) {
  const verifiedInput = document.getElementById(`${prefix}-verified`);
  const badge = document.getElementById(`${prefix}-addr-verified-badge`);
  if (verifiedInput) verifiedInput.value = isVerified ? '1' : '0';
  if (badge) {
    badge.innerText = isVerified ? '✓ LOCATION VERIFIED' : 'NOT VERIFIED';
    badge.classList.toggle('is-verified', !!isVerified);
  }
}

function isAddressVerified(prefix) {
  const verifiedInput = document.getElementById(`${prefix}-verified`);
  const latInput = document.getElementById(`${prefix}-lat`);
  const lngInput = document.getElementById(`${prefix}-lng`);
  return !!(verifiedInput && verifiedInput.value === '1' && latInput && latInput.value && lngInput && lngInput.value);
}

function getVerifiedCoords(prefix) {
  const latInput = document.getElementById(`${prefix}-lat`);
  const lngInput = document.getElementById(`${prefix}-lng`);
  return { lat: parseFloat(latInput.value), lng: parseFloat(lngInput.value) };
}

async function fetchAddressSuggestions(prefix, query) {
  const box = document.getElementById(`${prefix}-address-suggestions`);
  if (!box) return;

  if (!query || query.trim().length < 4) {
    box.classList.remove('active');
    box.innerHTML = '';
    return;
  }

  box.innerHTML = `<div class="addr-loading"><i class="fa-solid fa-spinner fa-spin"></i> Searching real-world addresses...</div>`;
  box.classList.add('active');

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=6&countrycodes=my&q=${encodeURIComponent(query + ', Malaysia')}`;
    const res = await fetchWithTimeout(url, 6000);
    const data = await res.json();

    if (!data || data.length === 0) {
      box.innerHTML = `<div class="addr-suggestion-empty">No matching address found yet. Keep typing, or use "VERIFY &amp; PIN ON MAP" below.</div>`;
      return;
    }

    box.innerHTML = '';
    data.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'addr-suggestion-item';
      row.innerHTML = `<i class="fa-solid fa-location-dot"></i><span>${item.display_name}</span>`;
      row.addEventListener('click', () => applyAddressSuggestion(prefix, item));
      box.appendChild(row);
    });
  } catch (err) {
    box.innerHTML = `<div class="addr-suggestion-empty">Live search is temporarily unavailable. Use "VERIFY &amp; PIN ON MAP" to try again.</div>`;
  }
}

function normalizeStateMatch(selectEl, stateStr) {
  if (!selectEl || !stateStr) return;
  const target = stateStr.toLowerCase();
  const match = Array.from(selectEl.options).find(
    (o) => o.value && (target.includes(o.value.toLowerCase()) || o.value.toLowerCase().includes(target))
  );
  if (match) selectEl.value = match.value;
}

const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';

async function findNearbyHouseNumber(lat, lng, roadName) {
  const radii = [60, 150, 350]; 
  for (const radius of radii) {
    try {
      const query = `[out:json][timeout:8];(node(around:${radius},${lat},${lng})["addr:housenumber"];way(around:${radius},${lat},${lng})["addr:housenumber"];);out center 40;`;
      const url = `${OVERPASS_BASE}?data=${encodeURIComponent(query)}`;
      const res = await fetchWithTimeout(url, 8000);
      const data = await res.json();
      const elements = (data && data.elements) || [];
      if (!elements.length) continue;

      const points = elements.map((el) => {
        const elLat = el.lat != null ? el.lat : (el.center ? el.center.lat : null);
        const elLng = el.lon != null ? el.lon : (el.center ? el.center.lon : null);
        const hn = el.tags && el.tags['addr:housenumber'];
        if (elLat == null || elLng == null || !hn) return null;
        return {
          lat: elLat,
          lng: elLng,
          houseNumber: hn,
          street: (el.tags && el.tags['addr:street']) || '',
          distance: haversineMeters([lat, lng], [elLat, elLng])
        };
      }).filter(Boolean);

      if (!points.length) continue;

      let candidates = points;
      if (roadName) {
        const sameRoad = points.filter((p) => p.street && p.street.toLowerCase().trim() === roadName.toLowerCase().trim());
        if (sameRoad.length) candidates = sameRoad;
      }
      candidates.sort((a, b) => a.distance - b.distance);

      const numeric = candidates
        .map((c) => ({ ...c, num: parseFloat(c.houseNumber) }))
        .filter((c) => !isNaN(c.num));

      if (numeric.length >= 2) {
        const [p1, p2] = numeric;
        const totalDist = p1.distance + p2.distance;
        if (totalDist > 0 && p1.num !== p2.num) {
          const interpolated = Math.round(p1.num + (p2.num - p1.num) * (p1.distance / totalDist));
          if (interpolated > 0) {
            return { houseNumber: String(interpolated), source: 'interpolated', distanceM: Math.min(p1.distance, p2.distance) };
          }
        }
      }

      const nearest = candidates[0];
      if (nearest) {
        return { houseNumber: nearest.houseNumber, source: 'nearest', distanceM: nearest.distance };
      }
    } catch (e) {
      console.warn('Overpass house-number lookup failed at radius', radius, e);
    }
  }
  return null;
}

function placeholderHouseNumber(lat, lng) {
  const rand = seededRandom(`housenum-${lat.toFixed(4)}-${lng.toFixed(4)}`);
  const num = 1 + Math.floor(rand() * 180);
  const suffix = rand() < 0.15 ? String.fromCharCode(65 + Math.floor(rand() * 4)) : '';
  return `${num}${suffix}`;
}

async function resolveHouseNumber(lat, lng, roadName) {
  const found = await findNearbyHouseNumber(lat, lng, roadName);
  if (found) return found;
  return { houseNumber: placeholderHouseNumber(lat, lng), source: 'placeholder', distanceM: null };
}

function setHouseNumberEstimateNote(prefix, source) {
  const note = document.getElementById(`${prefix}-housenum-note`);
  if (!note) return;
  const messages = {
    interpolated: 'House/lot number is estimated from nearby addresses on this road — please correct it if it doesn\'t match the real one.',
    nearest: 'House/lot number is copied from the closest known address on this road — please correct it if it doesn\'t match the real one.',
    placeholder: 'No nearby address data was found — this number is a placeholder only. Please replace it with the real house/lot number.'
  };
  if (source && messages[source]) {
    note.innerText = messages[source];
    note.style.display = 'block';
  } else {
    note.innerText = '';
    note.style.display = 'none';
  }
}

async function applyAddressSuggestion(prefix, item) {
  const addr = item.address || {};
  const addressInput = document.getElementById(`${prefix}-address`);
  const cityInput = document.getElementById(`${prefix}-city`);
  const stateSelect = document.getElementById(`${prefix}-state`);
  const zipInput = document.getElementById(`${prefix}-zip`);
  const box = document.getElementById(`${prefix}-address-suggestions`);

  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon !== undefined ? item.lon : item.lng);

  const road = addr.road || addr.pedestrian || '';
  let houseNo = addr.house_number || '';
  let houseNoSource = null;
  if (!houseNo && road && !isNaN(lat) && !isNaN(lng)) {
    const resolved = await resolveHouseNumber(lat, lng, road);
    houseNo = resolved.houseNumber;
    houseNoSource = resolved.source;
  }
  const streetLine = [houseNo, road].filter(Boolean).join(' ') || (item.display_name ? item.display_name.split(',')[0] : (addressInput ? addressInput.value : ''));

  if (addressInput) addressInput.value = streetLine;
  if (cityInput) {
    cityInput.value = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || cityInput.value;
  }
  if (zipInput && addr.postcode) zipInput.value = addr.postcode;
  if (stateSelect) normalizeStateMatch(stateSelect, addr.state || '');
  setHouseNumberEstimateNote(prefix, houseNoSource);

  if (box) {
    box.classList.remove('active');
    box.innerHTML = '';
  }

  showPinConfirmation(prefix, lat, lng);
  setVerifiedState(prefix, true);
}

function showPinConfirmation(prefix, lat, lng, precise = true) {
  const wrap = document.getElementById(`${prefix}-pin-map-wrap`);
  const mapDiv = document.getElementById(`${prefix}-pin-map`);
  const latInput = document.getElementById(`${prefix}-lat`);
  const lngInput = document.getElementById(`${prefix}-lng`);
  if (!wrap || !mapDiv || isNaN(lat) || isNaN(lng)) return;

  if (latInput) latInput.value = lat;
  if (lngInput) lngInput.value = lng;

  wrap.classList.add('active');
  const zoomLevel = precise ? 17 : 13;

  setTimeout(() => {
    if (!addressPinMaps[prefix]) {
      const map = L.map(mapDiv, { zoomControl: true }).setView([lat, lng], zoomLevel);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
        .bindPopup(precise ? 'Drag me to your exact delivery spot' : 'Approximate area only — drag me to your exact address').openPopup();

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (latInput) latInput.value = pos.lat;
        if (lngInput) lngInput.value = pos.lng;
        setVerifiedState(prefix, true);
        reverseGeocodeAndFillFields(prefix, pos.lat, pos.lng);
      });

      addressPinMaps[prefix] = { map, marker };
    } else {
      addressPinMaps[prefix].map.invalidateSize();
      addressPinMaps[prefix].map.setView([lat, lng], zoomLevel);
      addressPinMaps[prefix].marker.setLatLng([lat, lng]);
      addressPinMaps[prefix].marker.setPopupContent(precise ? 'Drag me to your exact delivery spot' : 'Approximate area only — drag me to your exact address');
    }
  }, 80);
}

async function reverseGeocodeAndFillFields(prefix, lat, lng) {
  const addressInput = document.getElementById(`${prefix}-address`);
  const cityInput = document.getElementById(`${prefix}-city`);
  const stateSelect = document.getElementById(`${prefix}-state`);
  const zipInput = document.getElementById(`${prefix}-zip`);
  const badge = document.getElementById(`${prefix}-addr-verified-badge`);
  const marker = addressPinMaps[prefix] ? addressPinMaps[prefix].marker : null;

  if (badge) badge.innerText = 'LOCATING ADDRESS...';
  if (marker) marker.setPopupContent('Locating address at this spot...');

  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`;
    const res = await fetchWithTimeout(url, 7000);
    const data = await res.json();
    const addr = (data && data.address) || {};

    const road = addr.road || addr.pedestrian || addr.suburb || '';
    let houseNo = addr.house_number || '';
    let houseNoSource = null;
    if (!houseNo && road) {
      const resolved = await resolveHouseNumber(lat, lng, road);
      houseNo = resolved.houseNumber;
      houseNoSource = resolved.source;
    }
    const streetLine = [houseNo, road].filter(Boolean).join(' ');

    if (streetLine && addressInput) addressInput.value = streetLine;
    if (cityInput) {
      cityInput.value = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || cityInput.value;
    }
    if (zipInput && addr.postcode) zipInput.value = addr.postcode;
    if (stateSelect) normalizeStateMatch(stateSelect, addr.state || '');
    setHouseNumberEstimateNote(prefix, houseNoSource);

    if (marker) {
      marker.setPopupContent(data && data.display_name ? `Pinned: ${data.display_name}` : 'Drag me to your exact delivery spot');
    }
  } catch (e) {
    console.warn('Reverse geocoding failed for dragged pin:', e);
    if (marker) marker.setPopupContent('Drag me to your exact delivery spot');
  } finally {
    setVerifiedState(prefix, true);
  }
}

async function manualLocateAddress(prefix, evt) {
  const addressInput = document.getElementById(`${prefix}-address`);
  const cityInput = document.getElementById(`${prefix}-city`);
  const stateSelect = document.getElementById(`${prefix}-state`);
  const zipInput = document.getElementById(`${prefix}-zip`);
  const btn = evt ? evt.currentTarget : null;

  const street = addressInput ? addressInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : '';
  const state = stateSelect ? stateSelect.value : '';
  const zip = zipInput ? zipInput.value.trim() : '';

  const check = validateRealAddress({ street, city, postcode: zip, state });
  if (!check.isValid) {
    alert('Location Error: ' + check.message);
    return;
  }

  const originalLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> LOCATING...';
  }

  const geo = await geocodeAddressStrict(street, city, state, zip);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = originalLabel;
  }

  showPinConfirmation(prefix, geo.lat, geo.lng, geo.precise);
  setVerifiedState(prefix, true);

  if (!geo.precise) {
    alert('We couldn\'t find that exact address on the map — ' + geo.formatted + '\n\nPlease drag the pin to your exact delivery location before continuing. This is what your route, toll and fuel cost will be calculated from.');
  }
}

function useMyCurrentLocation(prefix, evt) {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported in this browser. Please search your address manually.');
    return;
  }

  const btn = evt ? evt.currentTarget : null;
  const originalLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> LOCATING...';
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const url = `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`;
        const res = await fetchWithTimeout(url, 7000);
        const data = await res.json();
        if (data && data.address) {
          applyAddressSuggestion(prefix, { lat: latitude, lon: longitude, display_name: data.display_name, address: data.address });
        } else {
          showPinConfirmation(prefix, latitude, longitude);
          setVerifiedState(prefix, true);
        }
      } catch (e) {
        showPinConfirmation(prefix, latitude, longitude);
        setVerifiedState(prefix, true);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalLabel;
        }
      }
    },
    () => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalLabel;
      }
      alert('Could not access your location. Please allow location permission in your browser, or enter your address manually.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function setupAddressAutocompleteInputs(prefix) {
  const addressInput = document.getElementById(`${prefix}-address`);
  if (!addressInput) return;

  const debouncedSearch = debounce((val) => fetchAddressSuggestions(prefix, val), 450, `${prefix}-addr-search`);

  addressInput.addEventListener('input', () => {
    setVerifiedState(prefix, false);
    debouncedSearch(addressInput.value);
  });

  addressInput.addEventListener('focus', () => {
    if (addressInput.value.trim().length >= 4) fetchAddressSuggestions(prefix, addressInput.value);
  });

  document.addEventListener('click', (e) => {
    const box = document.getElementById(`${prefix}-address-suggestions`);
    if (box && !box.contains(e.target) && e.target !== addressInput) {
      box.classList.remove('active');
    }
  });

  ['city', 'state', 'zip'].forEach((field) => {
    const el = document.getElementById(`${prefix}-${field}`);
    if (el) el.addEventListener('change', () => setVerifiedState(prefix, false));
  });
}

async function resolveDeliveryCoords(prefix, street, city, state, zip) {
  if (isAddressVerified(prefix)) {
    return getVerifiedCoords(prefix);
  }

  const geo = await geocodeAddressStrict(street, city, state, zip);
  showPinConfirmation(prefix, geo.lat, geo.lng, geo.precise);

  if (!geo.precise) {
    const proceed = confirm(
      'We could not find that exact address — the pin shown is only an approximate area (' + geo.formatted + ').\n\n' +
      'For an accurate route, toll and fuel calculation, click "Cancel" and drag the pin on the map to your exact spot before submitting.\n\n' +
      'Continue anyway with this approximate location?'
    );
    if (!proceed) return null;
  }

  setVerifiedState(prefix, true);
  return { lat: geo.lat, lng: geo.lng };
}

async function processPayment(e) {
  e.preventDefault();

  const chkName = document.getElementById('chk-name').value;
  const chkAddress = document.getElementById('chk-address').value;
  const chkCity = document.getElementById('chk-city').value;
  const chkState = document.getElementById('chk-state').value;
  const chkZip = document.getElementById('chk-zip') ? document.getElementById('chk-zip').value : '40470';
  const deliveryMethod = document.getElementById('chk-delivery-method') ? document.getElementById('chk-delivery-method').value : 'instant';

  const addressValidation = validateRealAddress({
    street: chkAddress,
    city: chkCity,
    postcode: chkZip,
    state: chkState
  });

  if (!addressValidation.isValid) {
    alert("Location Error: " + addressValidation.message);
    return;
  }

  if (deliveryMethod === 'standard' && !PENINSULAR_STATES.includes(chkState)) {
    alert('Standard Delivery is only available within Peninsular Malaysia. Please choose Instant Delivery for East Malaysia addresses.');
    return;
  }

  const geoRes = await resolveDeliveryCoords('chk', chkAddress, chkCity, chkState, chkZip);
  if (!geoRes) return; 

  cart.forEach(item => {
    let p = products.find(prod => prod.id === item.id);
    if (p) {
      if (p.sizeStock && item.size) {
        p.sizeStock[item.size] = Math.max(0, (parseInt(p.sizeStock[item.size]) || 0) - item.qty);
      } else {
        p.stock = Math.max(0, (p.stock || 0) - item.qty); 
      }
    }
  }); 
  saveProductsToCloud();

  let pricing = calculateOrderPricing(cart, deliveryMethod);
  let totalAmount = pricing.total;
  let orderItemsDetail = cart.map((i) => ({ id: i.id, name: i.name, size: i.size || null, qty: i.qty, price: i.price }));
  let orderItemsText = cart.map((i) => `${i.name}${i.size ? ` (Size ${i.size})` : ''} (x${i.qty})`).join(', ');

  let newOrder = {
    orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName: chkName,
    customerEmail: currentUser ? currentUser.email : '',
    customerUid: currentUser?.uid || window.VoidFirebaseStore?.currentAuthUser()?.uid || null,
    trackingNo: null, 
    address: `${chkAddress}, ${chkZip} ${chkCity}, ${chkState}`,
    state: chkState,
    lat: geoRes.lat,
    lng: geoRes.lng,
    qty: cart.reduce((a, c) => a + c.qty, 0),
    items: orderItemsText,
    itemsDetail: orderItemsDetail,
    amount: totalAmount,
    subtotal: pricing.subtotal,
    bulkDiscount: pricing.discount, 
    instantSurcharge: pricing.instantSurcharge, 
    sstAmount: pricing.sst,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending',
    deliveryMethod: deliveryMethod,
    dispatchTime: null,
    sender: 'VOID Central Hub, Shah Alam',
    eta: 'Pending Admin Dispatch',
  };

  let confirmationMsg;
  const shippingFeeNote = pricing.freeShipping
    ? `Free Shipping applied (order RM${FREE_SHIPPING_MIN_SUBTOTAL}+).`
    : `An additional ${Math.round(SHIPPING_FEE_RATE[deliveryMethod] * 100)}% delivery fee (RM ${pricing.instantSurcharge.toFixed(2)}) was added for ${deliveryMethod === 'instant' ? 'Instant' : 'Standard'} Delivery.`;

  if (deliveryMethod === 'standard') {
    newOrder.durationSec = null;
    newOrder.courier = null;
    newOrder.vehicleType = null;
    newOrder.vehicleCategory = 'van';
    newOrder.vehicleIcon = 'fa-van-shuttle';
    newOrder.consumptionRate = null;
    newOrder.tankCapacity = null;
    newOrder.plateNo = null;

    salesHistoryData.unshift(newOrder);
    const batch = assignOrderToLorryBatch(newOrder);
    saveSalesHistory();

    const batchVehicleLabel = batch.vehicleCategory === 'lorry' ? 'lorry' : 'van';
    const batchFillText = `${batch.stops.length} order(s) / ${batch.totalItems} item(s)`;

    confirmationMsg = `Payment successful! Your order has been placed with Standard Delivery. It has joined delivery batch ${batch.batchId} for ${chkState} (${batchFillText}, by ${batchVehicleLabel}) and will dispatch within 2–4 days. ${shippingFeeNote}`;

    if (currentUser) {
      addNotification(
        currentUser.email,
        'Order Placed (Standard Delivery)',
        `Order ${newOrder.orderId} placed and added to delivery batch ${batch.batchId} for ${chkState} (${batchFillText}, by ${batchVehicleLabel}). Estimated dispatch within 2-4 days. ${shippingFeeNote}`,
        null,
        {
          orderId: newOrder.orderId,
          amount: totalAmount,
          status: 'Pending',
          items: orderItemsText
        }
      );
    }
  } else {
    const durationSec = Math.floor(Math.random() * (180 - 60 + 1)) + 60;
    const vehicleFleet = [
      { type: 'Yamaha Y15ZR Motorcycle', category: 'motorcycle', icon: 'fa-motorcycle', consumptionLperKm: 0.025, tankCapacityL: 4.2 },
      { type: 'Honda RS150R Motorcycle', category: 'motorcycle', icon: 'fa-motorcycle', consumptionLperKm: 0.028, tankCapacityL: 4.5 },
      { type: 'Perodua Myvi Car', category: 'car', icon: 'fa-car', consumptionLperKm: 0.065, tankCapacityL: 36.0 },
      { type: 'Honda Civic FC Car', category: 'car', icon: 'fa-car', consumptionLperKm: 0.075, tankCapacityL: 47.0 }
    ];
    const totalItemQty = newOrder.qty;
    const requiredCategory = totalItemQty <= 3 ? 'motorcycle' : 'car';
    const matchingVehicles = vehicleFleet.filter((v) => v.category === requiredCategory);
    const selectedVehicle = matchingVehicles[Math.floor(Math.random() * matchingVehicles.length)];

    newOrder.durationSec = durationSec;
    newOrder.courier = 'Aiman Zikri';
    newOrder.vehicleType = selectedVehicle.type;
    newOrder.vehicleCategory = selectedVehicle.category;
    newOrder.vehicleIcon = selectedVehicle.icon;
    newOrder.dispatchVehicle = selectedVehicle;
    newOrder.consumptionRate = selectedVehicle.consumptionLperKm;
    newOrder.tankCapacity = selectedVehicle.tankCapacityL;
    newOrder.plateNo = 'VAB ' + Math.floor(1000 + Math.random() * 9000);

    salesHistoryData.unshift(newOrder);
    const batch = assignOrderToLorryBatch(newOrder);
    saveSalesHistory();

    const batchFillText = `${batch.stops.length} order(s) / ${batch.totalItems} item(s)`;
    confirmationMsg = `Payment successful! Your Instant Delivery order has been added to express dispatch batch ${batch.batchId} for ${chkState} (${batchFillText}). An admin must dispatch the batch from Admin → Lorry Batches. ${shippingFeeNote}`;

    if (currentUser) {
      addNotification(
        currentUser.email,
        'Order Placed (Instant Dispatch)',
        `Order ${newOrder.orderId} was added to express dispatch batch ${batch.batchId} for ${chkState}. Awaiting admin dispatch. ${shippingFeeNote}`,
        null,
        {
          orderId: newOrder.orderId,
          batchId: batch.batchId,
          amount: totalAmount,
          status: 'Pending',
          items: orderItemsText
        }
      );
    }
  }

  cart = [];
  updateCartCount();
  renderCartItems();
  renderProducts(products);
  if (typeof renderAdminLorryBatches === 'function') renderAdminLorryBatches();

  alert(confirmationMsg);
  navigateTo('home');
}

function switchAuthView(type) {
  document.querySelectorAll('.auth-form').forEach((f) => f.classList.remove('active-form'));
  document.getElementById(type + '-form').classList.add('active-form');
}

async function handleLogin(e) {
  e.preventDefault();

  if (!verifyRecaptcha(loginRecaptchaId)) return;

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const rawPass = document.getElementById('login-pass').value;

  try {
    if (!window.firebaseAuth || typeof window.signInWithEmailAndPassword !== 'function') {
      throw new Error('Firebase Email/Password Authentication is not available.');
    }

    const credential = await window.signInWithEmailAndPassword(
      window.firebaseAuth,
      email,
      rawPass
    );

    const authUser = credential.user;
    const users = await loadUsersFromFirebase();
    const found = users.find((user) => user.uid === authUser.uid);

    if (!found) {
      throw new Error('Your Firebase account has no VOID profile record yet.');
    }

    if (found.role === 'admin') {
      await window.signOut(window.firebaseAuth);
      alert('Admin accounts must use the secure admin login page.');
      window.location.replace('admin-login.html');
      return;
    }

    if (found.blocked) {
      await window.signOut(window.firebaseAuth);
      alert('This account has been blocked by an admin. Please contact support.');
      return;
    }

    currentUser = { ...found, uid: authUser.uid };
    setSessionUser(currentUser);
    addNotification(currentUser.email, 'Account Login', 'You logged into your account successfully.');
    checkLoginState();
    navigateTo('home');
  } catch (error) {
    console.error('Firebase customer login failed:', error);
    alert('Invalid email or password, or this Firebase account has not been registered yet.');
  } finally {
    if (typeof grecaptcha !== 'undefined' && loginRecaptchaId !== null) {
      grecaptcha.reset(loginRecaptchaId);
    }
  }
}

const OTP_EXPIRY_MS = 5 * 60 * 1000;      
const OTP_RESEND_COOLDOWN_SEC = 45;

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(email, code) {
  const emailjsConfig = window.VOID_EMAILJS_CONFIG || {
    publicKey: 'xdX-B11WOlph_97qD',
    serviceId: 'service_2fmh3k8',
    templateId: 'template_bwduxni'
  };

  if (typeof emailjs === 'undefined' || typeof emailjs.send !== 'function') {
    throw new Error('EmailJS SDK is not loaded. Check the email.min.js script in index.html.');
  }

  // Signup happens before Firebase Auth exists. Do not let an unauthenticated
  // otp_logs write fail the email send. Log only when a Firebase user is already
  // authenticated; EmailJS remains the source of the OTP delivery.
  const authUser = window.firebaseAuth?.currentUser || null;
  if (window.firebaseDb && authUser && typeof window.dbRef === 'function' && typeof window.dbSet === 'function') {
    try {
      const otpRef = window.dbRef(window.firebaseDb, 'otp_logs/email_' + Date.now());
      await window.dbSet(otpRef, {
        type: 'EMAIL',
        target: email,
        otp_code: code,
        timestamp: new Date().toISOString(),
        status: 'logged_to_backend',
        uid: authUser.uid
      });
    } catch (logError) {
      console.warn('Optional Firebase OTP log was not written; continuing with EmailJS.', logError);
    }
  }

  try {
    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      {
        email: email,
        otp_code: code,
        to_email: email,
        recipient_email: email,
        reply_to: email
      },
      emailjsConfig.publicKey
    );
    console.log('Real email sent via EmailJS:', response?.status || 'OK');
    return true;
  } catch (error) {
    console.error('EmailJS Error:', error);
    const detail = error?.text || error?.message || 'Unknown EmailJS failure';
    alert(`Failed to send verification email: ${detail}`);
    return false;
  }
}

async function sendVerificationSMS(phone, code) {
  try {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+60' + formattedPhone.replace(/^0/, '');
    }

    console.log("Triggering live telco SMS to:", formattedPhone);
    const appVerifier = window.recaptchaVerifier;
    
    firebaseConfirmationResult = await window.signInWithPhoneNumber(window.firebaseAuth, formattedPhone, appVerifier);
    
    return true; 
  } catch (error) {
    console.error("Firebase SMS Error:", error);
    alert("REAL FIREBASE ERROR: " + error.message);
    return false;
  }
}

async function isEmailAlreadyRegistered(email, excludeEmail = null) {
  const users = await loadUsersFromFirebase();
  const target = (email || '').trim().toLowerCase();
  return users.some((u) => (u.email || '').toLowerCase() === target && (u.email || '').toLowerCase() !== (excludeEmail || '').toLowerCase());
}

function setFieldVerifiedState(prefix, channel, isVerified) {
  const verifiedInput = document.getElementById(`${prefix}-${channel}-verified`);
  const badge = document.getElementById(`${prefix}-${channel}-badge`);
  if (verifiedInput) verifiedInput.value = isVerified ? '1' : '0';
  if (badge) {
    badge.innerText = isVerified ? `✓ ${channel.toUpperCase()} VERIFIED` : 'NOT VERIFIED';
    badge.classList.toggle('is-verified', !!isVerified);
  }
}

function isFieldVerified(prefix, channel) {
  const el = document.getElementById(`${prefix}-${channel}-verified`);
  return !!(el && el.value === '1');
}

async function startEmailVerification(prefix, evt) {
  const input = document.getElementById(`${prefix}-email`);
  if (!input) return;
  const email = input.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address first.');
    return;
  }

  const excludeEmail = prefix === 'edit' && currentUser ? currentUser.email : null;
  if (await isEmailAlreadyRegistered(email, excludeEmail)) {
    alert('An account with this email already exists. Please log in instead, or use a different email.');
    return;
  }

  if (prefix === 'edit' && currentUser && email.toLowerCase() === currentUser.email.toLowerCase()) {
    setFieldVerifiedState('edit', 'email', true);
    return;
  }

  const btn = evt ? evt.currentTarget : null;
  await dispatchOtp(prefix, 'email', email, btn);
}

async function startPhoneVerification(prefix, evt) {
  const input = document.getElementById(`${prefix}-phone`);
  if (!input) return;
  const phone = input.value.trim();

  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    alert('Please enter a valid phone number first.');
    return;
  }

  if (prefix === 'edit' && currentUser && phone === currentUser.phone) {
    setFieldVerifiedState('edit', 'phone', true);
    return;
  }

  const btn = evt ? evt.currentTarget : null;
  await dispatchOtp(prefix, 'phone', phone, btn);
}

async function dispatchOtp(prefix, channel, target, btn) {
  const originalLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  }

  const code = generateOtpCode();
  otpState = {
    prefix,
    channel,
    target,
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    resendTimerId: otpState.resendTimerId
  };

  try {
    const sent = channel === 'email'
      ? await sendVerificationEmail(target, code)
      : await sendVerificationSMS(target, code);

    if (!sent) {
      otpState = { prefix: null, channel: null, target: null, code: null, expiresAt: null, attempts: 0, resendTimerId: otpState.resendTimerId };
      return;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  }

  openOtpModal();
  startResendCooldown();
}

function openOtpModal() {
  const modal = document.getElementById('otp-verify-modal');
  const title = document.getElementById('otp-modal-title');
  const desc = document.getElementById('otp-modal-desc');
  const demoNote = document.getElementById('otp-demo-note');
  const codeInput = document.getElementById('otp-code-input');
  const errorMsg = document.getElementById('otp-error-msg');

  const channelLabel = otpState.channel === 'email' ? 'Email' : 'Phone';
  const icon = otpState.channel === 'email' ? 'fa-envelope-circle-check' : 'fa-comment-sms';

  if (title) title.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--accent); margin-right:8px;"></i> VERIFY YOUR ${channelLabel.toUpperCase()}`;
  if (desc) desc.innerText = `We sent a 6-digit code to ${otpState.target}. Enter it below to verify.`;

  if (demoNote) {
    demoNote.classList.remove('active');
  }

  if (codeInput) codeInput.value = '';
  if (errorMsg) errorMsg.innerText = '';

  if (modal) modal.classList.add('active');
  setTimeout(() => { if (codeInput) codeInput.focus(); }, 100);
}
 
function closeOtpModal() {
  const modal = document.getElementById('otp-verify-modal');
  if (modal) modal.classList.remove('active');
  clearInterval(otpState.resendTimerId);
}

async function submitOtpCode() {
  const codeInput = document.getElementById('otp-code-input');
  const errorMsg = document.getElementById('otp-error-msg');
  const entered = codeInput ? codeInput.value.trim() : '';

  if (otpState.channel === 'phone') {
    try {
      errorMsg.innerText = "Verifying with telco server...";
      await firebaseConfirmationResult.confirm(entered);
      
      setFieldVerifiedState(otpState.prefix, otpState.channel, true);
      closeOtpModal();
      alert("Phone number successfully verified via live SMS!");
      return;
    } catch (error) {
      errorMsg.innerText = 'Incorrect SMS code. Please check your phone and try again.';
      return;
    }
  } else {
    if (entered !== otpState.code) {
      if (errorMsg) errorMsg.innerText = 'Incorrect code. Please check your email and try again.';
      return;
    }
    setFieldVerifiedState(otpState.prefix, otpState.channel, true);
    closeOtpModal();
    alert("Email successfully verified!");
  }
}

function startResendCooldown() {
  const link = document.getElementById('otp-resend-link');
  const timer = document.getElementById('otp-resend-timer');
  if (!link || !timer) return;

  clearInterval(otpState.resendTimerId);
  let secondsLeft = OTP_RESEND_COOLDOWN_SEC;
  link.classList.add('disabled');
  timer.innerText = `(${secondsLeft}s)`;

  otpState.resendTimerId = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      clearInterval(otpState.resendTimerId);
      link.classList.remove('disabled');
      timer.innerText = '';
    } else {
      timer.innerText = `(${secondsLeft}s)`;
    }
  }, 1000);
}

async function resendOtpCode() {
  const link = document.getElementById('otp-resend-link');
  if (link && link.classList.contains('disabled')) return;
  if (!otpState.prefix || !otpState.channel || !otpState.target) return;

  const code = generateOtpCode();
  otpState.code = code;
  otpState.expiresAt = Date.now() + OTP_EXPIRY_MS;
  otpState.attempts = 0;

  if (otpState.channel === 'email') {
    await sendVerificationEmail(otpState.target, code);
  } else {
    await sendVerificationSMS(otpState.target, code);
  }

  const demoNote = document.getElementById('otp-demo-note');
  if (demoNote) {
    demoNote.innerHTML = `<i class="fa-solid fa-flask"></i> Demo Mode: this project isn't connected to a live ${otpState.channel === 'email' ? 'email' : 'SMS'} provider yet, so your code is shown here instead of being delivered. Your code: <b>${otpState.code}</b>`;
  }
  const errorMsg = document.getElementById('otp-error-msg');
  if (errorMsg) errorMsg.innerText = 'A new code has been sent.';

  startResendCooldown();
}

function attachVerifyResetListener(prefix, channel) {
  const input = document.getElementById(`${prefix}-${channel}`);
  if (!input) return;
  input.addEventListener('input', () => {
    if (prefix === 'edit' && currentUser) {
      const original = channel === 'email' ? currentUser.email : currentUser.phone;
      if (original && input.value.trim() === String(original).trim()) {
        setFieldVerifiedState(prefix, channel, true);
        return;
      }
    }
    setFieldVerifiedState(prefix, channel, false);
  });
}

async function handleSignup(e) {
  e.preventDefault();

  try {
    if (!verifyRecaptcha(signupRecaptchaId)) return;

    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const rawPass = document.getElementById('reg-pass').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;
    const city = document.getElementById('reg-city').value;
    const state = document.getElementById('reg-state').value;
    const zip = document.getElementById('reg-zip') ? document.getElementById('reg-zip').value : '40470';
    const agreementCheckbox = document.getElementById('reg-agreement');

    if (!agreementCheckbox || !agreementCheckbox.checked) {
      alert('Please tick the agreement checkbox to accept the VOID Terms, Privacy Policy, and Firebase data-processing notice before creating your account.');
      agreementCheckbox?.focus();
      if (typeof grecaptcha !== 'undefined' && signupRecaptchaId !== null) grecaptcha.reset(signupRecaptchaId);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(rawPass)) {
      alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol (e.g., Secure@123).');
      if (typeof grecaptcha !== 'undefined' && signupRecaptchaId !== null) grecaptcha.reset(signupRecaptchaId);
      return;
    }

    if (!isFieldVerified('reg', 'email')) {
      alert('Please verify your email address before creating an account. Tap "VERIFY" next to the email field.');
      return;
    }

    if (!isFieldVerified('reg', 'phone')) {
      alert('Please verify your phone number before creating an account. Tap "VERIFY" next to the phone field.');
      return;
    }

    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zip)) {
      alert('Please enter a valid 5-digit postal/zip code (e.g., 40470).');
      return;
    }

    const addressValidation = validateRealAddress({
      street: address,
      city: city,
      postcode: zip,
      state: state
    });

    if (!addressValidation.isValid) {
      alert("Location Error: " + addressValidation.message);
      return;
    }

    const geo = await resolveDeliveryCoords('reg', address, city, state, zip);
    if (!geo) return; 

    let authUser = window.firebaseAuth && window.firebaseAuth.currentUser;
    const activeEmail = authUser?.email?.toLowerCase() || '';
    if (authUser && activeEmail !== email.toLowerCase()) {
      if (typeof window.signOut === 'function') await window.signOut(window.firebaseAuth);
      authUser = null;
    }
    if (!authUser && typeof window.createUserWithEmailAndPassword === 'function') {
      const credential = await window.createUserWithEmailAndPassword(window.firebaseAuth, email, rawPass);
      authUser = credential.user;
    }

    if (!authUser) {
      throw new Error('Firebase Authentication is required before creating a customer account.');
    }

    let newUser = {
      uid: authUser.uid,
      name, username, email, phone, address, city, state, zip,
      lat: geo.lat,
      lng: geo.lng,
      emailVerified: true,
      phoneVerified: true,
      agreementAccepted: true,
      agreementAcceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      role: 'customer'
    };

    const users = await loadUsersFromFirebase();
    users.push(newUser);
    await saveUsersToCloud(users);

    currentUser = newUser;
    setSessionUser(currentUser);

    addNotification(currentUser.email, 'Account Created', 'Welcome to VOID! Your email and phone were verified, and your account and shipping address are ready to go.');

    alert('Account created successfully and safely stored in Firebase Database!');

    setFieldVerifiedState('reg', 'email', false);
    setFieldVerifiedState('reg', 'phone', false);

    checkLoginState();
    navigateTo('home');

  } catch (error) {
    console.error("Signup Crash:", error);
    alert("System error during sign up: " + error.message);
  }
}

function handleForgotPassword(e) {
  e.preventDefault();

  if (!verifyRecaptcha(forgotRecaptchaId)) return;

  alert('Reset link sent!');

  if (typeof grecaptcha !== 'undefined' && forgotRecaptchaId !== null) grecaptcha.reset(forgotRecaptchaId);
}

function openPasswordVerifyModal() {
  if (!currentUser) {
    alert('Please log in first.');
    return;
  }
  const modal = document.getElementById('password-verify-modal');
  if (modal) modal.classList.add('active');
}

function closePasswordVerifyModal() {
  const modal = document.getElementById('password-verify-modal');
  if (modal) modal.classList.remove('active');
  const passInput = document.getElementById('verify-pass-input');
  if (passInput) passInput.value = '';
}

async function verifyPasswordAndOpenUpdate(e) {
  e.preventDefault();
  const passInput = document.getElementById('verify-pass-input').value;
  const authUser = window.firebaseAuth && window.firebaseAuth.currentUser;

  try {
    if (!authUser || typeof window.EmailAuthProvider !== 'function' || typeof window.reauthenticateWithCredential !== 'function') {
      throw new Error('Firebase Auth reauthentication is unavailable.');
    }

    const credential = window.EmailAuthProvider.credential(
      authUser.email,
      passInput
    );
    await window.reauthenticateWithCredential(authUser, credential);
  } catch (error) {
    console.error('Profile reauthentication failed:', error);
    alert('Incorrect password. Access denied.');
    return;
  }

  closePasswordVerifyModal();

  document.getElementById('edit-name').value = currentUser.name || '';
  document.getElementById('edit-email').value = currentUser.email || '';
  document.getElementById('edit-phone').value = currentUser.phone || '';
  document.getElementById('edit-address').value = currentUser.address || '';
  document.getElementById('edit-city').value = currentUser.city || '';
  document.getElementById('edit-state').value = currentUser.state || '';
  if (document.getElementById('edit-zip')) {
    document.getElementById('edit-zip').value = currentUser.zip || '40470';
  }

  setFieldVerifiedState('edit', 'email', true);
  setFieldVerifiedState('edit', 'phone', true);

  const editModal = document.getElementById('edit-profile-modal');
  if (editModal) editModal.classList.add('active');

  if (currentUser.lat && currentUser.lng) {
    showPinConfirmation('edit', currentUser.lat, currentUser.lng);
    setVerifiedState('edit', true);
  } else {
    setVerifiedState('edit', false);
    const wrap = document.getElementById('edit-pin-map-wrap');
    if (wrap) wrap.classList.remove('active');
  }
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.remove('active');
}

async function handleUpdateProfile(e) {
  e.preventDefault();

  const name = document.getElementById('edit-name').value;
  const email = document.getElementById('edit-email').value.trim();
  const phone = document.getElementById('edit-phone').value;
  const address = document.getElementById('edit-address').value;
  const city = document.getElementById('edit-city').value;
  const state = document.getElementById('edit-state').value;
  const zip = document.getElementById('edit-zip') ? document.getElementById('edit-zip').value : '40470';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!isFieldVerified('edit', 'email')) {
    alert('Please verify your new email address before saving. Tap "VERIFY" next to the email field.');
    return;
  }

  if (!isFieldVerified('edit', 'phone')) {
    alert('Please verify your new phone number before saving. Tap "VERIFY" next to the phone field.');
    return;
  }

  const addressValidation = validateRealAddress({
    street: address,
    city: city,
    postcode: zip,
    state: state
  });

  if (!addressValidation.isValid) {
    alert("Location Error: " + addressValidation.message);
    return;
  }

  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zip)) {
    alert('Please enter a valid 5-digit postal/zip code (e.g., 40470).');
    return;
  }

  const geo = await resolveDeliveryCoords('edit', address, city, state, zip);
  if (!geo) return; 

  const oldEmail = currentUser.email;
  const emailChanged = email.toLowerCase() !== oldEmail.toLowerCase();

  currentUser.name = name;
  currentUser.email = email;
  currentUser.phone = phone;
  currentUser.address = address;
  currentUser.city = city;
  currentUser.state = state;
  currentUser.zip = zip;
  currentUser.lat = geo.lat;
  currentUser.lng = geo.lng;
  currentUser.emailVerified = true;
  currentUser.phoneVerified = true;

  setSessionUser(currentUser);

  const users = await loadUsersFromFirebase();
  const userIndex = users.findIndex((u) => (u.email || '').toLowerCase() === oldEmail.toLowerCase());
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    await saveUsersToCloud(users);
  }

  if (emailChanged) {
    let historyChanged = false;
    salesHistoryData.forEach((o) => {
      if ((o.customerEmail || '').toLowerCase() === oldEmail.toLowerCase()) {
        o.customerEmail = email;
        historyChanged = true;
      }
    });
    if (historyChanged) {
      await saveSalesHistory();
    }

    let notifsChanged = false;
    notifications.forEach((n) => {
      if ((n.userId || '').toLowerCase() === oldEmail.toLowerCase()) {
        n.userId = email;
        notifsChanged = true;
      }
    });
    if (notifsChanged) {
      await saveNotificationsToCloud();
    }
  }

  addNotification(currentUser.email, 'Profile Updated', emailChanged
    ? `Your profile was updated. Your account email is now ${email}.`
    : 'Your profile information and shipping address were updated successfully.');

  closeEditProfileModal();
  populateProfileView();
  alert('Profile and address updated successfully!');
}

function checkAccount() {
  if (currentUser) {
    navigateTo('profile');
  } else {
    navigateTo('auth');
  }
}

function goToMyOrders() {
  if (!currentUser) {
    navigateTo('auth');
    return;
  }
  navigateTo('orders');
}

function renderMyOrders() {
  const list = document.getElementById('my-orders-list');
  if (!list) return;

  if (!currentUser) {
    list.innerHTML = `
      <div class="my-orders-empty">
        <p>Please log in to view your purchase history.</p>
        <button class="btn-full" style="max-width: 240px; margin: 1rem auto 0;" onclick="navigateTo('auth')">LOG IN</button>
      </div>`;
    return;
  }

  const statusFilter = document.getElementById('my-orders-status-filter')?.value || 'all';

  let myOrders = salesHistoryData.filter(
    (o) => (o.customerEmail || '').toLowerCase() === currentUser.email.toLowerCase()
  );

  if (statusFilter !== 'all') {
    myOrders = myOrders.filter((o) => o.status === statusFilter);
  }

  myOrders = myOrders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (myOrders.length === 0) {
    list.innerHTML = `
      <div class="my-orders-empty">
        <p>No orders found${statusFilter !== 'all' ? ' for this status' : ' yet'}.</p>
        <button class="btn-full" style="max-width: 240px; margin: 1rem auto 0;" onclick="navigateTo('home')">START SHOPPING</button>
      </div>`;
    return;
  }

  list.innerHTML = myOrders.map((order) => {
    let statusColor = '#94a3b8';
    if (order.status === 'Out for Delivery') statusColor = '#f59e0b';
    if (order.status === 'Delivered') statusColor = '#4ade80';

    const canTrack = order.trackingNo && (order.status === 'Out for Delivery' || order.status === 'Delivered');
    const actionHtml = canTrack
      ? `<button class="order-track-btn" onclick="openTrackingView('${order.trackingNo}')">TRACK ORDER →</button>`
      : `<span class="order-track-pending">Preparing for dispatch</span>`;

    return `
      <div class="order-card">
        <div class="order-card-top">
          <div>
            <div class="order-card-id">${order.orderId}</div>
            <div class="order-card-date">${order.date}</div>
          </div>
          <span class="order-status-badge" style="color:${statusColor}; border-color:${statusColor};">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-card-items">${order.items}</div>
        <div class="order-card-meta">
          <span><i class="fa-solid fa-box"></i> Qty: ${order.qty}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${order.address}</span>
          <span><i class="fa-solid ${order.batchId ? 'fa-truck' : 'fa-bolt'}"></i> ${order.batchId ? `Standard Delivery${order.status === 'Pending' ? ' — Forming Batch' : ''}` : 'Instant Delivery'}</span>
        </div>
        <div class="order-card-footer">
          <span class="order-card-amount">RM ${(order.amount || 0).toFixed(2)}</span>
          <div class="order-card-actions">
            ${order.trackingNo ? `<span class="order-tracking-no">${order.trackingNo}</span>` : ''}
            ${actionHtml}
          </div>
        </div>
        ${order.status === 'Delivered' ? renderOrderReviewSection(order) : ''}
      </div>
    `;
  }).join('');
}

function renderOrderReviewSection(order) {
  if (!currentUser) return '';
  const seen = new Set();
  const rows = (order.itemsDetail || []).map((item) => {
    const prod = findProductForItem(item);
    if (!prod || seen.has(prod.id)) return '';
    seen.add(prod.id);

    const existing = getUserReviewForProduct(prod, currentUser.email);
    const label = `${prod.name}${item.size ? ` (Size ${item.size})` : ''}`;

    if (existing) {
      return `
        <div class="order-review-row">
          <span class="order-review-item-name">${label}</span>
          <span><span class="order-review-stars">${'★'.repeat(existing.rating)}${'☆'.repeat(5 - existing.rating)}</span> <span class="order-review-done-label">REVIEWED</span></span>
        </div>`;
    }

    return `
      <div class="order-review-row">
        <span class="order-review-item-name">${label}</span>
        <button type="button" class="order-review-btn" onclick="openRateItemModal(${prod.id}, '${order.orderId}')">
          <i class="fa-solid fa-star"></i> RATE & REVIEW
        </button>
      </div>`;
  }).join('');

  if (!rows) return '';
  return `
    <div class="order-review-section">
      <div class="order-review-title">RATE YOUR ITEMS</div>
      ${rows}
    </div>`;
}

function checkLoginState() {
  if (currentUser && currentUser.role === 'admin') {
    currentUser = null;
    setSessionUser(null);
  }

  const profileBtn = document.getElementById('nav-profile-btn');
  const accountLink = document.getElementById('nav-account-link');
  const ordersLink = document.getElementById('nav-orders-li');

  if (currentUser) {
    if (profileBtn) profileBtn.style.display = 'flex';
    if (accountLink) accountLink.innerText = 'PROFILE';
    if (ordersLink) ordersLink.style.display = '';
    populateProfileView();
  } else {
    if (profileBtn) profileBtn.style.display = 'none';
    if (accountLink) accountLink.innerText = 'ACCOUNT';
    if (ordersLink) ordersLink.style.display = 'none';
  }
  renderNotifications();
}

function populateProfileView() {
  if (!currentUser) return;
  document.getElementById('prof-disp-name').innerText = currentUser.name || '--';
  document.getElementById('prof-disp-username').innerText = currentUser.username || '--';
  document.getElementById('prof-disp-email').innerText = currentUser.email || '--';
  document.getElementById('prof-disp-phone').innerText = currentUser.phone || '--';
  document.getElementById('prof-disp-address').innerText = currentUser.address || '--';
  document.getElementById('prof-disp-citystate').innerText = `${currentUser.zip || ''} ${currentUser.city || ''}, ${currentUser.state || ''}`;

}

function logout() {
  if (currentUser) {
    addNotification(currentUser.email, 'Account Logout', 'You logged out of your account.');
  }
  currentUser = null;
  setSessionUser(null);
  if (window.firebaseAuth && typeof window.signOut === 'function') {
    window.signOut(window.firebaseAuth).catch((error) => console.warn('Firebase sign-out failed:', error));
  }
  window.location.href = 'index.html'; 
}

function openTrackingView(trackingNo, origin = 'customer') {
  const order = salesHistoryData.find((o) => o.trackingNo === trackingNo) || salesHistoryData[0];
  if (!order) {
    alert('No order data is available for tracking yet.');
    return;
  }

  if (order.status !== 'Out for Delivery' && order.status !== 'Delivered') {
    const msg = order.batchId
      ? `Tracking Locked: Order status is currently "${order.status}". This order is waiting in a Standard Delivery batch (${order.batchId}) and will unlock once an admin dispatches that batch.`
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

  console.log('Firebase Connected! Syncing live data...');

  if (window.firebaseAuth && window.RecaptchaVerifier && document.getElementById('firebase-recaptcha-container')) {
    window.recaptchaVerifier = new window.RecaptchaVerifier(window.firebaseAuth, 'firebase-recaptcha-container', { size: 'invisible' });
  }

  window.VoidFirebaseStore.subscribe('products', (value) => {
    if (value) {
      products = firebaseToArray(value).map(normalizeProductImage);
      renderProducts(products);
    } else {
      products = DEFAULT_PRODUCTS.map(normalizeProductImage);
      renderProducts(products);
    }
  });

  window.VoidFirebaseStore.subscribe('sales_history', (value) => {
    salesHistoryData = value
      ? (window.VoidFirebaseStore.dedupeSalesHistory
        ? window.VoidFirebaseStore.dedupeSalesHistory(value)
        : firebaseToArray(value))
      : [];
    if (document.getElementById('my-orders-list')) renderMyOrders();
  });

  window.VoidFirebaseStore.subscribe('lorry_batches', (value) => {
    lorryBatches = value
      ? (window.VoidFirebaseStore.dedupeLorryBatches
        ? window.VoidFirebaseStore.dedupeLorryBatches(value)
        : firebaseToArray(value))
      : [];
    refreshOpenLorryTrackingFromFirebase();
    if (currentTrackingOrder && currentTrackingOrder.batchId && typeof renderLorryManifestPanel === 'function') renderLorryManifestPanel(currentTrackingOrder);
  });

  window.VoidFirebaseStore.subscribe('users', (value) => {
    registeredUsers = value ? firebaseToArray(value) : [];
    const cloudUser = currentUser && registeredUsers.find((u) => u.uid === currentUser.uid);
    if (cloudUser) {
      currentUser = cloudUser;
      setSessionUser(currentUser);
      checkLoginState();
    }
  });

  const applyCustomerNotifications = (value) => {
    const email = String(window.firebaseAuth?.currentUser?.email || currentUser?.email || '').toLowerCase();
    const scoped = value ? firebaseToArray(value) : [];
    notifications = email
      ? scoped.filter((notification) => String(notification.userId || '').toLowerCase() === email)
      : [];
    renderNotifications();
  };

  if (typeof window.VoidFirebaseStore.subscribeUserNotifications === 'function') {
    window.VoidFirebaseStore.subscribeUserNotifications(applyCustomerNotifications);
  } else {
    // Compatibility fallback for an older helper; still filter before rendering.
    window.VoidFirebaseStore.subscribe('notifications', applyCustomerNotifications);
  }

  window.VoidFirebaseStore.subscribe('hero_slides', (value) => {
    heroSlides = value
      ? firebaseToArray(value).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      : [...DEFAULT_HERO_SLIDES];
    renderHeroSlider();
  });
}

function setupIndexEventListeners() {
  ['reg', 'chk', 'edit'].forEach(setupAddressAutocompleteInputs);

  const agreementCheckbox = document.getElementById('reg-agreement');
  const agreementStatus = document.getElementById('reg-agreement-status');
  if (agreementCheckbox && agreementStatus) {
    const updateAgreementStatus = () => {
      agreementStatus.innerText = agreementCheckbox.checked ? '✓ AGREEMENT ACCEPTED' : 'Agreement is required before account creation.';
      agreementStatus.style.color = agreementCheckbox.checked ? 'var(--success)' : 'var(--danger)';
    };
    agreementCheckbox.addEventListener('change', updateAgreementStatus);
    updateAgreementStatus();
  }
  attachVerifyResetListener('reg', 'email');
  attachVerifyResetListener('reg', 'phone');
  attachVerifyResetListener('edit', 'email');
  attachVerifyResetListener('edit', 'phone');

  const cartButton = document.getElementById('cart-btn');
  const closeCartButton = document.getElementById('close-cart');
  const overlay = document.getElementById('overlay');
  if (cartButton) cartButton.addEventListener('click', toggleCart);
  if (closeCartButton) closeCartButton.addEventListener('click', toggleCart);
  if (overlay) {
    overlay.addEventListener('click', () => {
      const cartSidebar = document.getElementById('cart-sidebar');
      const notificationDropdown = document.getElementById('notif-dropdown');
      if (cartSidebar) cartSidebar.classList.remove('open');
      overlay.classList.remove('active');
      if (notificationDropdown) notificationDropdown.classList.remove('active');
      closeMobileMenu();
    });
  }

  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));

  document.addEventListener('click', (event) => {
    const nav = document.getElementById('nav-links');
    const burger = document.querySelector('.hamburger');
    if (!nav || !nav.classList.contains('active')) return;
    if (nav.contains(event.target) || (burger && burger.contains(event.target))) return;
    closeMobileMenu();
  });

  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const closeNotif = document.getElementById('close-notif');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = notifDropdown.classList.contains('active');
      notifDropdown.classList.toggle('active');
      if (!isOpen) markAllNotificationsAsRead();
    });
  }
  if (closeNotif && notifDropdown) closeNotif.addEventListener('click', () => notifDropdown.classList.remove('active'));
}

function setupEventListeners() {
  return setupIndexEventListeners();
}


function installHiddenAdminEntry() {
  if (window.__voidAdminShortcutInstalled) return;
  window.__voidAdminShortcutInstalled = true;

  const openAdminLogin = () => {
    window.location.assign('./admin-login.html');
  };

  const shortcutHandler = (event) => {
    const key = String(event.key || '').toLowerCase();
    const isSecretShortcut = (event.ctrlKey || event.metaKey) && event.altKey && (key === 'a' || event.code === 'KeyA');
    if (!isSecretShortcut) return;
    event.preventDefault();
    event.stopPropagation();
    openAdminLogin();
  };

  // Capture the event before page controls or browser-level handlers can stop it.
  window.addEventListener('keydown', shortcutHandler, true);
  document.addEventListener('keydown', shortcutHandler, true);

  // Backup secret entry: click the VOID logo five times within 1.5 seconds.
  const logo = document.querySelector('.logo');
  if (logo) {
    let clickCount = 0;
    let resetTimer = null;
    logo.addEventListener('click', (event) => {
      clickCount += 1;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { clickCount = 0; }, 1500);
      if (clickCount >= 5) {
        clickCount = 0;
        clearTimeout(resetTimer);
        event.preventDefault();
        openAdminLogin();
      }
    }, true);
  }
}

function initApp() {
  installHiddenAdminEntry();
  navigateTo('home');
  renderHeroSlider();
  updateCartCount();
  setupEventListeners();
  checkLoginState();
  if (window.reCaptchaReady && typeof grecaptcha !== 'undefined') setTimeout(onRecaptchaApiLoad, 0);
  bootFirebase();
  checkAndAutoCompleteDeliveries();
  checkAndProgressLorryBatches();
  setInterval(() => {
    checkAndAutoCompleteDeliveries();
    checkAndProgressLorryBatches();
  }, 5000);
}

function startVoidApp() {
  installHiddenAdminEntry();
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startVoidApp, { once: true });
} else {
  startVoidApp();
}
