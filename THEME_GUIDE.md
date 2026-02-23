# Theme System Guide

## Overview
The application now supports both light and dark themes with a smooth transition between them.

## Features
- **Theme Toggle Button**: Located in the navbar (desktop and mobile)
- **Persistent Theme**: User's theme preference is saved in localStorage
- **Smooth Transitions**: All color changes animate smoothly
- **CSS Variables**: Centralized theme management using CSS custom properties

## How to Use

### For Users
1. Click the sun/moon icon in the navbar to toggle between light and dark mode
2. On mobile, open the menu and click the theme toggle button
3. Your preference is automatically saved and will persist across sessions

### For Developers

#### Theme Context
The theme is managed by `ThemeContext` located in `frontend/src/context/ThemeContext.jsx`:

```jsx
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

#### CSS Variables
All theme colors are defined in `frontend/src/index.css`:

**Light Theme:**
- `--bg-primary`: #f9fafb
- `--bg-secondary`: #ffffff
- `--bg-tertiary`: #f1f5f9
- `--text-primary`: #1f2937
- `--text-secondary`: #6b7280
- `--text-tertiary`: #9ca3af
- `--border-color`: #e5e7eb

**Dark Theme:**
- `--bg-primary`: #0f172a
- `--bg-secondary`: #1e293b
- `--bg-tertiary`: #334155
- `--text-primary`: #f1f5f9
- `--text-secondary`: #cbd5e1
- `--text-tertiary`: #94a3b8
- `--border-color`: #334155

#### Using Theme Variables in CSS
```css
.my-component {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## Implementation Details

### Files Modified
1. **frontend/src/context/ThemeContext.jsx** - Theme state management
2. **frontend/src/App.jsx** - Wrapped app with ThemeProvider
3. **frontend/src/components/Navbar.jsx** - Added theme toggle button
4. **frontend/src/index.css** - Added CSS variables for both themes
5. **All CSS files** - Updated to use CSS variables:
   - frontend/src/App.css
   - frontend/src/components/Home.css
   - frontend/src/components/Navbar.css
   - frontend/src/components/Sidebar.css
   - frontend/src/components/Dashboard.css
   - frontend/src/components/Auth.css
   - frontend/src/components/Products.css
   - frontend/src/components/VerifyEmail.css
   - frontend/src/components/ResetPassword.css
   - frontend/src/components/dashboard/Settings.css
   - frontend/src/components/dashboard/Products.css
   - frontend/src/components/dashboard/AllUsers.css

### Theme Detection
The theme is determined in this order:
1. User's saved preference in localStorage
2. Defaults to 'light' if no preference is saved

### Browser Support
The theme system uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- `data-theme` attribute on `<html>` element
- localStorage API

All features are supported in modern browsers (Chrome, Firefox, Safari, Edge).
