Migration audit — 2026-08-18

The current split system already has a secret Ctrl+Alt+A shortcut in index.js that routes to admin-login.html. The storefront and admin HTML files expose Firebase Realtime Database helpers globally, including firebaseDb, dbRef, dbSet, dbOnValue, and dbGet.

The current source is not Firebase-only. Major datasets initialize from localStorage: currentUser, notifications, lorryBatches, products, heroSlides, salesHistoryData, and admin users. Save helpers write to Firebase but also mirror to localStorage. Customer auth, signup, profile updates, admin auth, product/slide mutations, user blocking, and cross-tab refresh still use localStorage directly.

The old admin page confirms the intended admin dashboard tabs: Analytics, Transport Costs, Products, Hero Slides, Users, Sales History, and Lorry Batches. The Firebase paths already used by the code are products, hero_slides, sales_history, users, notifications, and lorry_batches.

The migration must preserve localStorage only for non-authoritative browser session/cart/OTP state if necessary, while making Firebase the source of truth for shared business data. Firebase Realtime Database rules currently return permission_denied for some writes, so production cloud persistence also requires rules/authentication that permit these paths; code changes alone cannot override Firebase security rules.
