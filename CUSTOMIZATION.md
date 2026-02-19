# Customization Guide

This guide helps you customize the Peihwa Primary School website without deep technical knowledge.

## 🎨 Changing Colors

### Brand Colors

Edit `/tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#2a589c',  // Change main blue color
    dark: '#1f3d73',     // Change dark blue color
  },
  accent: {
    yellow: '#eeb81b',   // Change yellow accent
    red: '#ff0000',      // Change red accent
    green: '#3ca55c',    // Change green accent
  },
}
```

## 📝 Changing Text Content

### English Text

Edit `/public/locales/en/common.json`

### Chinese Text

Edit `/public/locales/zh/common.json`

### Malay Text

Edit `/public/locales/ms/common.json`

### Example: Change Welcome Message

In `/public/locales/en/common.json`:

```json
{
  "hero": {
    "welcome": "Your New Welcome Message",
    "motto": "Your New Motto"
  }
}
```

## 🏫 Updating School Information

### Contact Details

Edit all three language files in `/public/locales/[lang]/common.json`:

```json
{
  "footer": {
    "address": "Your School Address",
    "phone": "Phone: +60 X-XXXX XXXX",
    "email": "Email: youremail@school.edu.my"
  }
}
```

### School Statistics

Edit `/src/components/LandingPage.js`, find the statistics section (around line 185):

```javascript
<div className="text-3xl font-bold text-accent-yellow">500+</div>
<div className="text-sm text-gray-300 mt-1">Students</div>
```

Change the numbers to match your school.

## 📚 Updating Programs

Edit `/src/components/LandingPage.js`, find the programs array (around line 35):

```javascript
const programs = [
  {
    icon: "📚", // Change emoji icon
    titleKey: "academic", // Links to translation file
    color: "bg-primary", // Card background color
    hoverColor: "hover:bg-primary-dark", // Hover color
  },
  // Add more programs...
];
```

Then update translations in `/public/locales/[lang]/common.json`:

```json
{
  "programs": {
    "academic": {
      "title": "Your Program Title",
      "description": "Your program description"
    }
  }
}
```

## 📢 Updating Announcements

Edit `/src/components/LandingPage.js`, find announcements array (around line 55):

```javascript
const announcements = [
  {
    id: 1,
    title: "Your Announcement Title",
    date: "2026-03-15",
    badge: "Important",
    badgeColor: "bg-accent-red", // Color: bg-accent-red, bg-accent-green, bg-primary
  },
  // Add more announcements...
];
```

## 🖼️ Adding Your Logo

### Option 1: Replace Logo Circle

In `/src/components/Navbar.js` (line 67-71):

```javascript
<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
  <span className="text-white font-bold text-xl">P</span>
</div>
```

Replace with:

```javascript
<img src="/logo.png" alt="Peihwa Logo" className="w-12 h-12 rounded-full" />
```

### Option 2: Use Image in Hero

In `/src/components/LandingPage.js` (line 147-158), replace the logo circle with:

```javascript
<img
  src="/peihwa-logo.png"
  alt="Peihwa Primary School Logo"
  className="w-64 h-64 md:w-80 md:h-80 object-contain"
/>
```

Place your logo image in `/public/` folder.

## 🔗 Updating Social Media Links

Edit `/src/components/Footer.js`, find socialLinks array (around line 24):

```javascript
const socialLinks = [
  {
    name: "Facebook",
    icon: "📘",
    href: "https://facebook.com/yourpage", // Update URL
    color: "hover:text-blue-600",
  },
  // Update other social links...
];
```

## 📱 Adding New Sections

To add a new section to the landing page:

1. Open `/src/components/LandingPage.js`
2. Add a new section after existing ones:

```javascript
{
  /* Your New Section */
}
<section id="your-section" className="section bg-white">
  <div className="container-custom">
    <h2 className="section-title">Your Section Title</h2>
    <p className="section-subtitle">Your subtitle</p>

    {/* Your content here */}
    <div className="card">
      <p>Your content</p>
    </div>
  </div>
</section>;
```

3. Add link to navbar in `/src/components/Navbar.js`:

```javascript
const navLinks = [
  // ... existing links
  { href: "#your-section", label: "Your Section" },
];
```

## 🎯 Quick Customization Checklist

- [ ] Update school name and motto in translation files
- [ ] Change contact information (address, phone, email)
- [ ] Update school statistics (students, teachers, years)
- [ ] Customize programs to match your offerings
- [ ] Add current announcements
- [ ] Replace placeholder logo with actual logo
- [ ] Update social media links
- [ ] Adjust brand colors if needed
- [ ] Test all three languages
- [ ] Test on mobile, tablet, and desktop

## 💡 Tips

1. **Always test after changes**: Run `pnpm dev` and check the website
2. **Keep backups**: Copy files before making major changes
3. **Use consistent formatting**: Follow the existing code style
4. **Update all languages**: When changing text, update EN, ZH, and MS files
5. **Check responsiveness**: Test on different screen sizes

## 🆘 Need Help?

If you're stuck:

1. Check the error message in the terminal
2. Review the DEVELOPMENT.md guide
3. Make sure all JSON files have valid syntax (no missing commas or brackets)
4. Restart the dev server: Stop (Ctrl+C) and run `pnpm dev` again

## 🎨 Color Palette Reference

Current Peihwa colors:

- **Primary Blue**: #2a589c (Headers, buttons, navbar)
- **Deep Blue**: #1f3d73 (Hover states, dark sections)
- **Feather Yellow**: #eeb81b (Highlights, accents)
- **Torch Red**: #ff0000 (Alerts, important badges)
- **Friendly Green**: #3ca55c (Success, positive badges)
- **Neutral Background**: #f7f9fc (Page background)
- **Card Background**: #e2e8f0 (Cards, footer)
- **Text**: #1a202c (Main text color)
