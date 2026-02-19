# Deployment Checklist

Use this checklist before deploying your Peihwa Primary School website to production.

## 📋 Pre-Deployment Checklist

### Content Review

- [ ] All text content is accurate and up-to-date
- [ ] School contact information is correct
- [ ] All three languages (EN, ZH, MS) are properly translated
- [ ] Announcements are current and relevant
- [ ] Program descriptions are accurate
- [ ] Statistics (students, teachers, years) are correct
- [ ] Social media links point to correct pages

### Visual & Design

- [ ] School logo is properly displayed
- [ ] Brand colors match school identity
- [ ] All images load correctly
- [ ] No placeholder text remains
- [ ] Footer information is complete

### Functionality Testing

- [ ] All navigation links work
- [ ] Language switcher works for all three languages
- [ ] Mobile hamburger menu opens and closes
- [ ] Admin login page is accessible at /admin
- [ ] Firebase authentication works
- [ ] All sections scroll smoothly
- [ ] Contact information is clickable (phone, email)

### Responsive Design

- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] All text is readable on small screens
- [ ] Images scale appropriately
- [ ] Buttons are easily tappable on mobile

### Performance

- [ ] Page loads in under 3 seconds
- [ ] Images are optimized
- [ ] No console errors in browser
- [ ] Animations are smooth

### Security

- [ ] Firebase credentials are in .env.local (not committed to git)
- [ ] .env.local is in .gitignore
- [ ] Admin password is strong
- [ ] Firebase security rules are configured

### SEO

- [ ] Page title is descriptive
- [ ] Meta description is compelling
- [ ] All images have alt text (if using images)
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] URLs are clean and descriptive

## 🚀 Deployment Steps (Vercel)

### 1. Prepare Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: .next

### 3. Add Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy

Click "Deploy" and wait for build to complete.

### 5. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain (e.g., peihwa.edu.my)
3. Follow DNS configuration instructions

## 🔥 Firebase Configuration

### Production Security Rules

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Update Authentication settings:

- Enable email verification (optional)
- Set up password requirements
- Configure authorized domains (add your production domain)

## 📊 Post-Deployment Verification

### Test Production Site

- [ ] Visit production URL
- [ ] Test all navigation links
- [ ] Test language switching
- [ ] Test admin login
- [ ] Test on real mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Check page load speed
- [ ] Verify all images load
- [ ] Check for console errors

### Analytics Setup (Optional)

- [ ] Add Google Analytics
- [ ] Set up Firebase Analytics
- [ ] Configure conversion tracking

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Enable Vercel Analytics

## 🎉 Launch Checklist

### Announcement

- [ ] Notify school staff about new website
- [ ] Update old website with redirect (if applicable)
- [ ] Share on social media
- [ ] Send email to parents/students
- [ ] Update Google Business listing

### Documentation

- [ ] Save admin credentials securely
- [ ] Document any custom configurations
- [ ] Create user guide for content updates
- [ ] Train staff on admin dashboard

### Maintenance Plan

- [ ] Schedule regular content updates
- [ ] Plan for announcement updates
- [ ] Set up backup schedule
- [ ] Establish update workflow

## 🔧 Troubleshooting

### Build Fails

- Check for syntax errors in code
- Verify all dependencies are installed
- Check environment variables are set

### Images Not Loading

- Ensure images are in /public folder
- Check file paths are correct
- Verify image formats are supported

### Authentication Issues

- Verify Firebase credentials
- Check authorized domains in Firebase Console
- Ensure environment variables are correct

### Styling Issues

- Clear browser cache
- Check Tailwind config is correct
- Verify CSS classes are valid

## 📞 Support Contacts

- **Technical Issues**: [Your IT contact]
- **Content Updates**: [Content manager contact]
- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support

## 🔄 Regular Maintenance

### Weekly

- [ ] Update announcements
- [ ] Check for broken links
- [ ] Review analytics

### Monthly

- [ ] Update event calendar
- [ ] Review and update content
- [ ] Check for security updates

### Quarterly

- [ ] Review and update programs
- [ ] Update statistics
- [ ] Refresh images/photos
- [ ] Performance audit

---

**Good luck with your deployment! 🚀**
