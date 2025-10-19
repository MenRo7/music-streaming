# Design System Documentation

## Overview

This design system provides a consistent foundation for the application's visual design. It includes:

- **Design Tokens**: Atomic design values (colors, spacing, typography)
- **Theme System**: Centralized theme configuration for the dark-themed application
- **Component Styles**: Reusable style utilities

## Design Tokens

Design tokens are located in `tokens.ts` and serve as the single source of truth for all design values.

### Colors

```typescript
import { designTokens } from './tokens';

// Primary colors (50-900 scale)
designTokens.colors.primary[500] // Main primary color
designTokens.colors.secondary[500] // Main secondary color

// Semantic colors
designTokens.colors.success.main
designTokens.colors.error.main
designTokens.colors.warning.main
designTokens.colors.info.main
```

### Typography

```typescript
// Font families
designTokens.typography.fontFamily.sans
designTokens.typography.fontFamily.mono

// Font sizes
designTokens.typography.fontSize.base // 16px
designTokens.typography.fontSize.lg // 18px
designTokens.typography.fontSize['2xl'] // 24px

// Font weights
designTokens.typography.fontWeight.normal // 400
designTokens.typography.fontWeight.bold // 700
```

### Spacing

All spacing uses a 4px grid system:

```typescript
designTokens.spacing[1] // 4px
designTokens.spacing[2] // 8px
designTokens.spacing[4] // 16px
designTokens.spacing[8] // 32px
```

### Shadows

```typescript
designTokens.shadow.sm
designTokens.shadow.base
designTokens.shadow.md
designTokens.shadow.lg
```

## Theme System

The theme is configured in `theme.ts` and provides a consistent dark theme for the application.

### Using the Theme

```typescript
import theme from './theme';

// Access theme values
const primaryColor = theme.colors.primary;
const spacing = theme.spacing[4];
const backgroundColor = theme.colors.background.primary;
```

### Theme Structure

The theme includes:
- **Colors**: Primary, secondary, background, text, semantic colors
- **Spacing**: Consistent spacing values based on 4px grid
- **Typography**: Font families, sizes, weights
- **Shadows**: Pre-defined shadow levels
- **Border Radius**: Consistent corner rounding
- **Z-index**: Layering system
- **Transitions**: Animation timing
- **Breakpoints**: Responsive design breakpoints

## Responsive Design

Breakpoints are defined in design tokens:

```typescript
designTokens.breakpoints.sm // 640px
designTokens.breakpoints.md // 768px
designTokens.breakpoints.lg // 1024px
designTokens.breakpoints.xl // 1280px
```

### Example Media Queries

```typescript
const styles = {
  container: {
    width: '100%',
    [`@media (min-width: ${designTokens.breakpoints.md})`]: {
      maxWidth: '768px',
    },
  },
};
```

## Accessibility Guidelines

### Color Contrast

All text-background combinations meet WCAG 2.1 Level AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### Focus States

Always provide visible focus indicators:

```typescript
const buttonStyle = {
  '&:focus': {
    outline: `2px solid ${theme.colors.primary}`,
    outlineOffset: '2px',
  },
};
```

### Semantic Colors

Use semantic colors for their intended purpose:
- `success`: Successful operations
- `error`: Errors and warnings
- `warning`: Cautionary messages
- `info`: Informational messages

## Best Practices

1. **Always use design tokens**: Never hardcode colors, spacing, or typography values
2. **Maintain consistency**: Use the theme system throughout the application
3. **Think responsive**: Design mobile-first and enhance for larger screens
4. **Accessibility first**: Ensure sufficient contrast and keyboard navigation
5. **Document changes**: Update this file when adding new tokens or themes

## Examples

### Button Component

```typescript
import { designTokens } from './tokens';

const buttonStyles = {
  padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
  borderRadius: designTokens.borderRadius.md,
  fontSize: designTokens.typography.fontSize.base,
  fontWeight: designTokens.typography.fontWeight.medium,
  backgroundColor: designTokens.colors.primary[500],
  color: designTokens.colors.text.inverse,
  transition: `all ${designTokens.transition.duration.base} ${designTokens.transition.timing.easeInOut}`,
  boxShadow: designTokens.shadow.sm,
  '&:hover': {
    backgroundColor: designTokens.colors.primary[600],
    boxShadow: designTokens.shadow.md,
  },
};
```

### Card Component

```typescript
const cardStyles = {
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing[6],
  boxShadow: theme.shadow.base,
  border: `1px solid ${theme.colors.border}`,
};
```
