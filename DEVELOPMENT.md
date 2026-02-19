# Development Guide

## Running the Development Server

### First Time Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# Then start the dev server
pnpm dev
```

### Daily Development

```bash
pnpm dev
```

The server will start at http://localhost:3000 (or next available port)

## Common Issues & Solutions

### Port Already in Use

If you see "Port 3000 is in use", either:

1. Stop the existing server (Ctrl+C in the terminal running it)
2. Or use the next available port (Next.js will suggest one)

### Lock File Error

If you see "Unable to acquire lock":

```bash
# Remove the lock file
rm -rf .next/dev/lock

# Or remove entire .next folder
rm -rf .next

# Then restart
pnpm dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Project Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## File Structure for Development

### Adding New Pages

Create files in `/app/[page-name]/page.js`

### Adding New Components

Create files in `/src/components/[ComponentName].js`

### Updating Translations

Edit files in `/public/locales/[language]/common.json`

### Styling

- Global styles: `/app/globals.css`
- Tailwind config: `/tailwind.config.js`
- Use Tailwind utility classes in components

## Testing Checklist

Before committing changes, test:

- [ ] Desktop view (1920px+)
- [ ] Tablet view (768px - 1024px)
- [ ] Mobile view (< 768px)
- [ ] All three languages (EN, 中文, BM)
- [ ] Navbar hamburger menu on mobile
- [ ] Admin login functionality
- [ ] All links work correctly
- [ ] Smooth animations
- [ ] No console errors

## Code Style

- Use functional components with hooks
- Add JSDoc comments for components
- Use descriptive variable names
- Keep components focused and reusable
- Follow the existing code structure

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add new announcement section"

# Push to remote
git push origin main
```

## Deployment

See README.md for deployment instructions to Vercel or other platforms.
