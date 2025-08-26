# Header Component

This directory contains the refactored header component with a clean, modular structure.

## Structure

```
src/features/header/
├── components/
│   ├── index.ts              # Exports all components
│   ├── LogoRamp.tsx          # RAMP logo SVG component
│   ├── ThemeSwitch.tsx       # Theme toggle button
│   ├── AuthShowcase.tsx      # Authentication UI (login/logout/admin)
│   ├── MobileMenu.tsx        # Mobile navigation drawer
│   ├── HeaderBrand.tsx       # Logo + RAMP text
│   └── HeaderNavigation.tsx  # Main navigation section
├── utils/
│   └── menuUtils.ts          # Menu filtering logic
├── index.tsx                 # Main header component
└── README.md                 # This file
```

## Components

### LogoRamp

- Renders the RAMP logo SVG
- Accepts optional className prop for styling

### ThemeSwitch

- Handles theme switching between light/dark modes
- Shows loading state while mounting
- Uses next-themes for theme management

### AuthShowcase

- Displays authentication UI based on session status
- Shows login button for unauthenticated users
- Shows user info, logout button, and admin panel for authenticated users
- Includes theme switch

### MobileMenu

- Mobile-only navigation drawer
- Filters menu items based on user authentication status
- Handles submenu rendering

### HeaderBrand

- Combines logo and RAMP text
- Used in both mobile and desktop layouts

### HeaderNavigation

- Orchestrates the left side of the header
- Includes mobile menu, brand, and desktop menu
- Handles menu filtering

## Utilities

### menuUtils.ts

- `checkStatusForMenu(status, user)`: Filters menu items based on authentication
- Centralizes menu filtering logic to avoid duplication

## Usage

```tsx
import Header from "~/features/header";

// In your layout or page
<Header />;
```

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to modify individual features
4. **Testing**: Each component can be tested in isolation
5. **Readability**: Main header file is now much cleaner and easier to understand
6. **Type Safety**: Better TypeScript interfaces for props
