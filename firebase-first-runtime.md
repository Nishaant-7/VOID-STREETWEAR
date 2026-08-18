Firebase-first runtime checkpoint — 2026-08-18

index.html loaded successfully with the customer navigation and storefront content. The console reported `Firebase Connected! Syncing live data...` and no uncaught JavaScript exception in the captured output. The storefront still renders its initial in-memory product/slide seed while Firebase subscriptions load; shared business data is not read from localStorage.

The secret admin route remains implemented in index.js as Ctrl+Alt+A and direct admin-login.html navigation. Admin/customer sessions now use sessionStorage; products, hero slides, users, sales history, notifications, and lorry batches use Firebase subscriptions and writes through firebase-store.js.
Secret route verification — 2026-08-18

After reloading index.html, pressing Control+Alt+A (mapped to Meta+Alt+A by the browser harness) redirected successfully to http://127.0.0.1:8000/admin-login.html. The storefront therefore has a working discreet admin entry without a visible admin navigation item.
Authenticated admin verification — 2026-08-18

A temporary role=admin session in sessionStorage allowed admin.html to load successfully. The dashboard rendered Analytics, Transport Costs, Products, Hero Slides, Users, Sales History, Lorry Batches, and CREATE ADMIN ACCOUNT. The console reported `Firebase Connected! Syncing live admin data...` without an uncaught JavaScript exception in the captured output.

The dashboard showed TOTAL USERS 0 in this test because the Firebase user read returned no available records in the test environment; this is expected when the database path is empty or restricted. No localStorage cache was used.
