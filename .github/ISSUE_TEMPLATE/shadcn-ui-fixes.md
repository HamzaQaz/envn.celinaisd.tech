---
name: Shadcn UI Component Verification and Fixes
about: Verify and fix shadcn/ui component implementations
title: '[UI] Verify and fix shadcn/ui components'
labels: ['ui', 'shadcn', 'components', 'bug']
assignees: ''
---

## Issue Description

After the React migration, shadcn/ui components need to be verified for completeness and correctness. Some components may be missing, improperly configured, or not following shadcn conventions.

## Current State

The following shadcn/ui components are currently implemented:
- ✅ `Button` (`client/src/components/ui/button.tsx`)
- ✅ `Card` family (`client/src/components/ui/card.tsx`)
- ✅ `Input` (`client/src/components/ui/input.tsx`)

## Issues to Address

### 1. Missing Components

Several common shadcn/ui components may be needed but are not yet installed:

- [ ] **Dialog** - For modals (Admin panel uses modals)
- [ ] **Alert/AlertDialog** - For confirmation dialogs (delete operations)
- [ ] **Select** - For dropdown selections (location filters, campus filters)
- [ ] **Label** - For form labels
- [ ] **Badge** - For status indicators (device status, alarm status)
- [ ] **Table** - For data tables (history view, admin tables)
- [ ] **Tabs** - If needed for organizing content
- [ ] **Toast/Sonner** - For notifications
- [ ] **Dropdown Menu** - For navigation or actions

### 2. Component Installation

Components should be installed using the shadcn CLI:

```bash
cd client
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add toast
```

### 3. Configuration Verification

Check that shadcn is properly configured:

**`client/src/lib/utils.ts`**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`client/tailwind.config.js`**
Should include shadcn theme configuration:
```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... other theme colors
      },
    },
  },
}
```

**`client/src/index.css`**
Should include CSS variables:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other CSS variables */
  }
}
```

### 4. Component Usage Issues

Check pages for proper component usage:

**Admin Page (`client/src/pages/Admin.tsx`)**
- [ ] Verify modals use Dialog component
- [ ] Verify delete confirmations use AlertDialog
- [ ] Verify forms use proper Label and Input components

**Dashboard Page (`client/src/pages/Dashboard.tsx`)**
- [ ] Verify status badges use Badge component
- [ ] Verify device cards use Card component properly
- [ ] Verify filters use Select component

**History Page (`client/src/pages/History.tsx`)**
- [ ] Verify data table uses Table component
- [ ] Verify date picker is properly implemented

**Login Page (`client/src/pages/Login.tsx`)**
- [ ] Verify form uses proper Input and Label components
- [ ] Verify error messages use appropriate components

### 5. TypeScript Issues

Ensure all components have proper TypeScript types:
- [ ] Check for `React.forwardRef` usage where needed
- [ ] Verify all props are properly typed
- [ ] Check for missing or incorrect `displayName` properties

### 6. Accessibility

shadcn components should be accessible by default, but verify:
- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Focus management is correct
- [ ] Color contrast meets WCAG standards

## Acceptance Criteria

- [ ] All necessary shadcn/ui components are installed
- [ ] All components follow official shadcn conventions
- [ ] TypeScript types are correct and complete
- [ ] Components render correctly in all pages
- [ ] No console errors related to component props
- [ ] Accessibility standards are met
- [ ] Components are properly styled with Tailwind classes
- [ ] Theme colors are consistent throughout the app

## Testing Checklist

Test each page after implementing fixes:

**Login Page**
- [ ] Input fields render correctly
- [ ] Button has proper hover states
- [ ] Error messages display properly

**Dashboard**
- [ ] Cards render with proper styling
- [ ] Status badges show correct colors
- [ ] Filters work with Select component
- [ ] Real-time updates don't break UI

**Admin Panel**
- [ ] Modals open and close correctly
- [ ] Forms validate and submit properly
- [ ] Delete confirmations work
- [ ] Tables display data correctly

**History Page**
- [ ] Table renders historical data
- [ ] Date picker functions correctly
- [ ] Data filters work

## Related Files

- `client/src/components/ui/*` - All UI components
- `client/src/lib/utils.ts` - Utility functions
- `client/tailwind.config.js` - Tailwind configuration
- `client/src/index.css` - Global styles
- `client/src/pages/*` - All page components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/) (used by shadcn)

## Additional Notes

- Components should be installed via the shadcn CLI rather than copied manually
- Keep component customizations minimal - leverage shadcn defaults
- Use the `cn()` utility for merging Tailwind classes
- Consider adding dark mode support if not already present
