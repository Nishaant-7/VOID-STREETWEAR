# VOID Local Testing and Netlify Redeployment

## Part A — Replace the repaired files locally

Copy these three files into the same project folder and overwrite the old versions:

```text
admin.js
admin.html
firebase-store.js
```

Keep the rest of the already repaired project files in the same folder, especially `index.html`, `index.js`, `style.css`, `admin-login.html`, `admin-create.html`, and `assets/`.

## Part B — Start the local site correctly

Do not open the HTML files by double-clicking them with a `file://` URL. Use a local HTTP server.

With Visual Studio Code Live Server:

1. Open the `void-system-fixed` folder in Visual Studio Code.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.
4. Open the URL shown by Live Server, such as `http://127.0.0.1:5500/`.

The local HTTP server already used by this project is also valid:

```bash
cd /home/ubuntu/void-system-fixed
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

## Part C — Reset stale local admin state

Because the earlier version stored the admin role in `sessionStorage`, clear the old browser session before testing the repaired version.

In Chromium:

1. Open the local site.
2. Press `F12`.
3. Open **Application → Storage → Clear site data**.
4. Close Developer Tools.
5. Open `admin-login.html` through the same local host.
6. Sign in with the Firebase administrator account.
7. Wait for the dashboard to load.

Do not open `admin.html` directly with an old session. Always enter through `admin-login.html` after clearing the session.

## Part D — Confirm the Firebase administrator record

In Firebase Console, open:

```text
Authentication → Users
```

Copy the UID of the administrator account.

Then open:

```text
Realtime Database → Data → users → <administrator-uid>
```

The record must contain:

```text
uid: <the same Firebase Auth UID>
role: admin
```

The browser session role alone is not enough. The Firebase Rules also check the authenticated Firebase UID and its `role` field.

## Part E — Test Hero Slides locally

1. Open local `admin-login.html` and sign in.
2. Open **Hero Slides**.
3. Wait for the status line to show `FIREBASE SYNCED` or the latest Firebase time.
4. Add a slide or delete a slide.
5. Open Firebase Console → Realtime Database → `hero_slides`.
6. Confirm that slide children contain `slideId`, `sortOrder`, and `updatedAt`.
7. Open the storefront in a second local tab using the same host.
8. The hero slider should reflect the Firebase change automatically.

If the admin page displays a Firebase sync failure, open `F12 → Console` and check whether the error is `permission_denied`, `auth/unauthorized-domain`, or a network failure.

## Part F — Test the dynamic Analytics page locally

Open **Admin → Analytics**. Confirm that the dashboard shows:

```text
LIVE FIREBASE SYNC
MONTHLY SALES
YEARLY SALES
TOTAL USERS
TOTAL ORDERS
PENDING ORDERS
DELIVERED ORDERS
ACTIVE BATCHES
```

Then change a Firebase-backed value, such as placing a test order or changing a dispatch status. The Firebase subscription should refresh the KPI cards and charts without requiring a full page reload.

## Part G — Redeploy to Netlify by drag and drop

Use this method if your Netlify site is not connected to GitHub:

1. Log in to Netlify.
2. Open your existing site, `void-street-wear`.
3. Open the **Deploys** tab.
4. Find the manual deploy area, usually labelled **Deploy manually** or **Drag and drop your site folder here**.
5. Drag the complete `/home/ubuntu/void-system-fixed/` folder into that area.
6. Wait until the deploy status becomes **Published**.
7. Open `https://void-street-wear.netlify.app/`.
8. Use `Ctrl + F5` to bypass the previous browser cache.

Do not drag only the changed JavaScript files. Netlify should receive the complete project folder so that HTML, CSS, JavaScript, Firebase bridge files, and `assets/windbreaker.jpg` remain together.

## Part H — Redeploy through GitHub if the site is Git-connected

If Netlify is connected to a GitHub repository, copy the changed files into the repository and run:

```bash
git add admin.js admin.html firebase-store.js
git commit -m "Fix Firebase Hero Slides sync and admin auth readiness"
git push
```

Netlify will build and publish the new commit automatically. Check the **Deploys** tab for the commit status.

## Part I — Production verification after Netlify deploy

Use the production URL and test the following sequence:

1. Open `https://void-street-wear.netlify.app/`.
2. Open `admin-login.html` and sign in.
3. Confirm the Hero Slides status becomes `FIREBASE SYNCED`.
4. Add one temporary test slide.
5. Open the storefront in a private window and confirm the slide appears.
6. Delete the temporary slide.
7. Open Analytics and confirm the live Firebase timestamp and KPI cards.
8. Open customer signup and confirm that the agreement checkbox is still required.

## Meaning of the previous alert

The previous alert appeared because the page had a valid administrator role in `sessionStorage`, but Firebase Auth had not finished restoring the authenticated UID, or the Firebase database role/rules did not accept that UID. The repaired files now wait for Firebase Auth restoration, prevent repeated startup writes, and show a non-blocking synchronization status instead of repeatedly freezing the page with alerts.
