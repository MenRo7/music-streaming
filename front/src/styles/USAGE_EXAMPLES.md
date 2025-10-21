# Theme & Design Tokens - Usage Examples

This document provides practical examples of using the design system in your components.

## 🎨 Using the Theme

### Option 1: Direct Theme Import (Recommended for existing dark UI)

```typescript
import theme from '../styles/theme';

const MyComponent = () => {
  const styles = {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  };

  return <div style={styles}>Dark themed content</div>;
};
```

### Option 2: Direct Token Import (More flexible)

```typescript
import { designTokens } from '../styles/tokens';

const MyComponent = () => {
  const styles = {
    // Dark background colors
    backgroundColor: designTokens.colors.background.dark,
    color: designTokens.colors.neutral[50],

    // Or customize with specific shades
    borderColor: designTokens.colors.neutral[700],

    padding: designTokens.spacing[4],
  };

  return <div style={styles}>Custom styled content</div>;
};
```

## 💡 Real-World Examples

### Dark Card Component

```typescript
import theme from '../styles/theme';

const DarkCard = ({ children }) => {
  const cardStyle = {
    backgroundColor: theme.colors.background.secondary, // Darker shade
    color: theme.colors.text.primary, // Light text
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.border}`, // Subtle border
    boxShadow: theme.shadow.lg,
  };

  return <div style={cardStyle}>{children}</div>;
};
```

### Button with Hover State

```typescript
import { designTokens } from '../styles/tokens';

const PrimaryButton = ({ children, onClick }) => {
  const buttonStyle = {
    backgroundColor: designTokens.colors.primary[400], // Brighter for dark bg
    color: designTokens.colors.neutral[50], // White text
    padding: `${designTokens.spacing[2]} ${designTokens.spacing[6]}`,
    borderRadius: designTokens.borderRadius.md,
    border: 'none',
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: `all ${designTokens.transition.duration.base}`,
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = designTokens.colors.primary[500];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = designTokens.colors.primary[400];
      }}
    >
      {children}
    </button>
  );
};
```

### Input Field for Dark UI

```typescript
import theme from '../styles/theme';

const DarkInput = ({ placeholder, value, onChange }) => {
  const inputStyle = {
    backgroundColor: theme.colors.background.tertiary, // Neutral[900]
    color: theme.colors.text.primary, // Light text
    border: `1px solid ${theme.colors.border}`,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    width: '100%',
    outline: 'none',
  };

  const focusStyle = {
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primary}40`, // 40 = 25% opacity
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={inputStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = focusStyle.borderColor;
        e.currentTarget.style.boxShadow = focusStyle.boxShadow;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = theme.colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
};
```

### Modal/Dialog for Dark UI

```typescript
import theme from '../styles/theme';

const DarkModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
  };

  const modalStyle = {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    padding: theme.spacing[8],
    borderRadius: theme.borderRadius['2xl'],
    maxWidth: '500px',
    width: '90%',
    boxShadow: theme.shadow['2xl'],
    border: `1px solid ${theme.colors.border}`,
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
```

### Navigation Bar

```typescript
import { designTokens } from '../styles/tokens';

const Navbar = () => {
  const navStyle = {
    backgroundColor: designTokens.colors.background.darker, // Very dark
    borderBottom: `1px solid ${designTokens.colors.neutral[800]}`,
    padding: `${designTokens.spacing[4]} ${designTokens.spacing[6]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const linkStyle = {
    color: designTokens.colors.neutral[300], // Muted text
    textDecoration: 'none',
    padding: designTokens.spacing[2],
    borderRadius: designTokens.borderRadius.base,
    transition: `color ${designTokens.transition.duration.fast}`,
  };

  return (
    <nav style={navStyle}>
      <a href="/" style={linkStyle}>Home</a>
      <a href="/music" style={linkStyle}>Music</a>
      <a href="/playlists" style={linkStyle}>Playlists</a>
    </nav>
  );
};
```

## 🎯 Best Practices for Dark UI

1. **Text Contrast**: Use light text (`neutral[50-300]`) on dark backgrounds
2. **Layers**: Differentiate surfaces using different dark shades
   - Primary: `background.dark` (#111827)
   - Secondary: `background.darker` (#030712)
   - Tertiary: `neutral[900]` (#171717)
3. **Borders**: Use subtle borders (`neutral[700-800]`) to separate sections
4. **Primary Colors**: Use lighter shades (400-500) for better visibility on dark
5. **Shadows**: Still useful for depth, even in dark mode

## 🌈 Color Palette for Dark Mode

Your theme uses these optimized colors:

```typescript
// Backgrounds (darkest to lighter)
background.darker    // #030712 - Deepest
background.dark      // #111827 - Main
neutral[900]         // #171717 - Cards

// Text (lightest to darker)
text.primary         // neutral[50]  #fafafa - Main text
text.secondary       // neutral[300] #d4d4d4 - Secondary text
text.tertiary        // neutral[400] #a3a3a3 - Muted text

// Primary accent
primary[400]         // Brighter for dark backgrounds
primary[500]         // Hover state

// Borders
border              // neutral[700] #404040 - Subtle separation
```

## 📱 Responsive Example

```typescript
import theme from '../styles/theme';

const ResponsiveCard = () => {
  const cardStyle = {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[4],

    // Mobile
    fontSize: theme.typography.fontSize.sm,

    // Tablet and up
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      padding: theme.spacing[6],
      fontSize: theme.typography.fontSize.base,
    },

    // Desktop
    [`@media (min-width: ${theme.breakpoints.lg})`]: {
      padding: theme.spacing[8],
    },
  };

  return <div style={cardStyle}>Responsive content</div>;
};
```

## 🔧 With Styled Components (if you use them)

```typescript
import styled from 'styled-components';
import theme from '../styles/theme';

const DarkCard = styled.div`
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.lg};

  &:hover {
    box-shadow: ${theme.shadow.xl};
  }
`;
```

## 📚 Key Takeaways

- **Use `theme`** for consistent dark UI colors
- **Use `designTokens`** for custom colors or specific shades
- **Light text on dark backgrounds** for readability
- **Subtle borders** help define sections
- **Layering** with different dark shades creates depth
- **Accessibility** - ensure sufficient contrast (use `accessibility.ts` utils)
