# Quick Setup Guide

## Step 1: Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create a new project called "Peihwa School"
3. Enable Authentication:
   - Click "Authentication" in left sidebar
   - Click "Get Started"
   - Enable "Email/Password" sign-in method
4. Enable Firestore:
   - Click "Firestore Database" in left sidebar
   - Click "Create database"
   - Start in "production mode"
   - Choose your region
5. Get your config:
   - Click the gear icon > Project settings
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Register app as "Peihwa Website"
   - Copy the firebaseConfig object

## Step 2: Environment Variables

1. Create `.env.local` file in project root:

   ```bash
   cp .env.example .env.local
   ```

2. Paste your Firebase config values into `.env.local`

## Step 3: Create First Admin User

1. In Firebase Console, go to Authentication
2. Click "Add user"
3. Enter:
   - Email: admin@peihwa.edu.my
   - Password: (create a secure password)
4. Click "Add user"

## Step 4: Run the Project

```bash
pnpm dev
```

Visit:

- Landing page: http://localhost:3000
- Admin login: http://localhost:3000/admin

## Step 5: Customize Content

Edit these files to customize:

- `/public/locales/en/common.json` - English text
- `/public/locales/zh/common.json` - Chinese text
- `/public/locales/ms/common.json` - Malay text
- `/src/components/LandingPage.js` - Programs, announcements, stats

## Step 6: Add Your Logo

Replace the placeholder logo in:

- `/src/components/Navbar.js` - Line 67-71
- `/src/components/LandingPage.js` - Line 147-158

You can use an image file from `/public/` folder.

## Done! 🎉

Your website is now ready. Test all features:

- ✅ Language switching
- ✅ Mobile responsive menu
- ✅ Admin login
- ✅ All sections display correctly
