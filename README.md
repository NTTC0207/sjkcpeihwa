# Peihwa Primary School Website

A modern, professional, and fully responsive primary school landing page built with Next.js, Firebase, and Tailwind CSS.

## 🎨 Design Features

- **Educational & Friendly Design**: Clean, approachable interface perfect for a primary school
- **Brand Colors**: Based on Peihwa logo
  - Primary Blue: `#2a589c` - Headers, buttons, navbar
  - Deep Blue: `#1f3d73` - Hover states, cards, section backgrounds
  - Feather Yellow: `#eeb81b` - Highlights, icons, decorations
  - Torch Red: `#ff0000` - Callout elements, badges, alerts
  - Friendly Green: `#3ca55c` - Success messages, badges
- **Fully Responsive**: Mobile-first design that works on all devices
- **Smooth Animations**: Engaging hover effects and transitions
- **Modern Typography**: Inter and Outfit fonts from Google Fonts

## 🌍 Multi-Language Support (i18n)

The website supports three languages:

- **English (en)** - Default
- **Chinese (zh)** - 中文
- **Malay (ms)** - Bahasa Melayu

Translation files are located in `/public/locales/[language]/common.json`

## 🏗️ Project Structure

```
sjkcpeihwa/
├── app/
│   ├── admin/
│   │   └── page.js          # Admin dashboard with Firebase auth
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.js            # Root layout with metadata
│   └── page.js              # Home page
├── src/
│   ├── components/
│   │   ├── Navbar.js        # Responsive navbar with hamburger menu
│   │   ├── Footer.js        # Footer with contact info
│   │   └── LandingPage.js   # Main landing page component
│   └── lib/
│       └── firebase.js      # Firebase configuration
├── public/
│   └── locales/
│       ├── en/
│       │   └── common.json  # English translations
│       ├── zh/
│       │   └── common.json  # Chinese translations
│       └── ms/
│           └── common.json  # Malay translations
├── tailwind.config.js       # Tailwind configuration with brand colors
├── next-i18next.config.js   # i18n configuration
└── .env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or later
- pnpm (recommended) or npm
- Firebase account

### Installation

1. **Clone the repository** (if not already done)

   ```bash
   cd /Users/haoyangchee/sjkcpeihwa
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication > Email/Password
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings

4. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Firebase credentials:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📄 Pages & Components

### Landing Page (`/`)

- **Hero Section**: Welcome message, school motto, and logo
- **About Section**: School mission, vision, and statistics
- **Programs Section**: Academic, Arts, Sports, and Character programs
- **Announcements Section**: Latest school news and events
- **Contact Section**: Contact information cards
- **Footer**: Comprehensive footer with links and social media

### Admin Dashboard (`/admin`)

- **Firebase Authentication**: Secure email/password login
- **Dashboard**: Management cards for announcements, events, programs, gallery, users, and settings
- **Statistics**: Quick overview of site content
- **Protected Route**: Only accessible to authenticated users

### Components

#### Navbar

- Sticky navigation on scroll
- Responsive hamburger menu for mobile
- Language switcher (EN/中文/BM)
- Smooth animations
- Brand color scheme

#### Footer

- Contact information
- Quick links
- Social media links
- Responsive grid layout

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
colors: {
  primary: {
    DEFAULT: '#2a589c',
    dark: '#1f3d73',
  },
  accent: {
    yellow: '#eeb81b',
    red: '#ff0000',
    green: '#3ca55c',
  },
  // ... more colors
}
```

### Translations

Edit files in `/public/locales/[language]/common.json` to update text content.

### Content

Modify `/src/components/LandingPage.js` to update:

- Programs
- Announcements
- Statistics
- Section content

## 🔒 Admin Setup

### Creating Admin Users

1. **Using Firebase Console**:
   - Go to Firebase Console > Authentication
   - Click "Add user"
   - Enter email and password
   - User can now login at `/admin`

2. **Using Firebase CLI** (optional):
   ```bash
   firebase auth:import users.json --project your-project-id
   ```

### Admin Features

- Secure authentication with Firebase
- Dashboard overview
- Content management placeholders (ready for implementation)
- User management
- Settings configuration

## 📱 Responsive Design

The website is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components adapt gracefully to different screen sizes.

## 🌐 SEO Optimization

- Semantic HTML5 structure
- Meta tags for title, description, keywords
- Open Graph tags for social sharing
- Proper heading hierarchy
- Descriptive alt texts (add to images)
- Fast page load times

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The project can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Google Cloud Platform
- Self-hosted with Node.js

## 📝 Code Comments

All code files include comprehensive comments explaining:

- Component functionality
- Props and parameters
- Design decisions
- Customization points

## 🛠️ Built With

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Firebase 12** - Authentication and database
- **next-i18next** - Internationalization
- **Google Fonts** - Inter & Outfit typography

## 📄 License

© 2026 Peihwa Primary School. All rights reserved.

## 🤝 Support

For questions or support, contact:

- Email: dbc2185@moe.edu.my
- Phone: +60 9-9751046

---

**Built with ❤️ for Peihwa Primary School**
