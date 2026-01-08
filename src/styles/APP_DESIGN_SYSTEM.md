# App Design System

This design system applies **only to internal app pages** (Chat, Project, Explore, Marketplace, Library) accessed through the Dashboard and does NOT affect the homepage/landing pages.

## Philosophy

**"Automotive Workshop"** - A unified, premium dark theme that feels technical yet approachable. Think professional garage meets modern software.

## Color Palette

### Background Layers (Progressive Depth)
```css
--app-bg-primary: #161616      /* Darkest - main background */
--app-bg-secondary: #1a1a1a    /* Cards, raised surfaces, sidebars */
--app-bg-tertiary: #2a2a2a     /* Inputs, interactive elements */
--app-bg-hover: #3a3a3a        /* Hover states */

/* Sidebar (uses secondary for visual consistency) */
--app-sidebar-bg: #1a1a1a      /* Matches app-bg-secondary */
--app-sidebar-active: rgba(255, 255, 255, 0.1)
--app-sidebar-hover: rgba(255, 255, 255, 0.05)
```

### Text Colors
Premium off-white tones for reduced eye strain and sophisticated aesthetic:

```css
--app-text-primary: #F5F5F5      /* Deep bright off-white - headings, titles */
--app-text-secondary: #E0E0E0    /* Less bright off-white - body text, descriptions */
--app-text-muted: #A8A8A8        /* Subtle gray - labels, captions, metadata */
--app-text-disabled: #6a6a6a     /* Disabled states */
--app-text-emphasis: #FFFFFF     /* Pure white - reserved for special emphasis */
```

**Usage Guidelines:**
- Use `app-text-primary` for headings and important labels
- Use `app-text-secondary` for body text and descriptions (most readable for long-form)
- Use `app-text-muted` for secondary information like timestamps, counts, helper text
- Use `app-text-emphasis` sparingly for critical information that needs maximum attention

### Accent (Unified Mint Green)
```css
--app-accent: #8BE196          /* Primary actions, highlights */
--app-accent-hover: #9DF4A8    /* Hover states */
--app-accent-subtle: rgba(139, 225, 150, 0.1)  /* Backgrounds */
--app-accent-border: rgba(139, 225, 150, 0.3)  /* Borders */
```

### Borders
```css
--app-border: rgba(128, 128, 128, 0.2)         /* Default */
--app-border-focus: rgba(128, 128, 128, 0.4)   /* Focus state */
```

## Typography

### Scale: Minor Third (1.2)
Base size: 16px (1rem)

```
--app-fs-xs:   0.694rem   (11.11px)
--app-fs-sm:   0.833rem   (13.33px)
--app-fs-base: 1rem       (16px)
--app-fs-md:   1.2rem     (19.2px)
--app-fs-lg:   1.44rem    (23.04px)
--app-fs-xl:   1.728rem   (27.65px)
--app-fs-2xl:  2.074rem   (33.18px)
--app-fs-3xl:  2.488rem   (39.81px)
--app-fs-4xl:  2.986rem   (47.78px)
```

### Font Families
- **Headings**: Inter - Geometric, modern, professional
- **Body**: DM Sans - Readable, friendly, clean
- **Code/Data**: JetBrains Mono - Technical contexts

### Font Weights
```css
--app-fw-regular: 400
--app-fw-medium: 500
--app-fw-semibold: 600
--app-fw-bold: 700
```

### Line Heights
```css
--app-lh-tight: 1.2      /* Headings */
--app-lh-normal: 1.35    /* Body text */
--app-lh-relaxed: 1.5    /* Long-form content */
```

## Usage

### Typography Classes

```tsx
// Headings (Inter font)
<h1 className="app-h1">Main Heading</h1>
<h2 className="app-h2">Section Heading</h2>
<h3 className="app-h3">Subsection</h3>

// Body Text (DM Sans)
<p className="app-body">Regular paragraph text</p>
<p className="app-body-lg">Larger body text</p>
<p className="app-body-sm">Smaller body text</p>
<p className="app-caption">Caption or helper text</p>

// Code/Mono (JetBrains Mono)
<code className="app-mono">console.log("Hello")</code>
```

### Component Classes

```tsx
// Cards
<div className="app-card">
  Static card
</div>

<div className="app-card app-card-hover">
  Interactive card with hover effect
</div>

// Buttons
<button className="app-button app-button-primary">
  Primary Action
</button>

<button className="app-button app-button-secondary">
  Secondary Action
</button>

<button className="app-button app-button-ghost">
  Ghost Button
</button>

// Inputs
<input
  className="app-input"
  placeholder="Enter text..."
/>

// Badges
<span className="app-badge app-badge-accent">
  AI Verified
</span>

<span className="app-badge app-badge-neutral">
  Optional
</span>

// Divider
<hr className="app-divider" />
```

### Utility Classes

```tsx
// Text Colors
<p className="app-text-primary">Primary text - Deep bright off-white</p>
<p className="app-text-secondary">Secondary text - Less bright off-white</p>
<p className="app-text-muted">Muted text - Subtle gray</p>
<p className="app-text-disabled">Disabled text</p>
<p className="app-text-emphasis">Emphasis text - Pure white</p>
<p className="app-text-accent">Accent text - Mint green</p>

// Background Colors
<div className="app-bg-primary">Primary background</div>
<div className="app-bg-secondary">Secondary background</div>
<div className="app-bg-tertiary">Tertiary background</div>

// Font Weights
<span className="app-fw-regular">Regular</span>
<span className="app-fw-medium">Medium</span>
<span className="app-fw-semibold">Semibold</span>
<span className="app-fw-bold">Bold</span>

// Text Alignment
<p className="app-text-left">Left aligned</p>
<p className="app-text-center">Center aligned</p>
<p className="app-text-right">Right aligned</p>

// Truncate
<p className="app-truncate">Long text that will be truncated...</p>
```

### CSS Variables

```tsx
// Direct CSS variable usage
<div style={{
  backgroundColor: 'var(--app-bg-secondary)',
  color: 'var(--app-text-primary)',
  padding: 'var(--app-sp-md)',
  borderRadius: 'var(--app-radius-lg)',
  border: '1px solid var(--app-border)'
}}>
  Custom component
</div>
```

## Spacing Scale (Minor Third)

```css
--app-sp-xs:   0.694rem   (11.11px)
--app-sp-sm:   0.833rem   (13.33px)
--app-sp-base: 1rem       (16px)
--app-sp-md:   1.2rem     (19.2px)
--app-sp-lg:   1.44rem    (23.04px)
--app-sp-xl:   1.728rem   (27.65px)
--app-sp-2xl:  2.074rem   (33.18px)
--app-sp-3xl:  2.488rem   (39.81px)
```

## Border Radius

```css
--app-radius-sm: 0.375rem  (6px)
--app-radius-md: 0.5rem    (8px)
--app-radius-lg: 0.75rem   (12px)
--app-radius-xl: 1rem      (16px)
--app-radius-full: 9999px  (pill shape)
```

## Transitions

```css
--app-transition-fast: 150ms ease-in-out
--app-transition-base: 200ms ease-in-out
--app-transition-slow: 300ms ease-in-out
```

## Shadows

```css
--app-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3)
--app-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4)
--app-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5)
--app-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6)
```

## Z-Index Scale

```css
--app-z-base: 0
--app-z-dropdown: 1000
--app-z-sticky: 1100
--app-z-fixed: 1200
--app-z-modal-backdrop: 1300
--app-z-modal: 1400
--app-z-popover: 1500
--app-z-tooltip: 1600
```

## Status Colors

```css
--app-status-success: #8BE196  /* Same as accent */
--app-status-error: #ff6b6b
--app-status-warning: #ffa726
--app-status-info: #42a5f5
```

## Best Practices

1. **Always use CSS variables** instead of hardcoding colors
2. **Use utility classes** for common patterns
3. **Follow the spacing scale** - don't create custom spacing values
4. **Maintain the typescale** - don't create intermediate font sizes
5. **Use Inter for headings**, DM Sans for body, JetBrains Mono for code
6. **Layer backgrounds** using primary → secondary → tertiary → hover
7. **Use accent color sparingly** for important actions and highlights
8. **Keep borders subtle** at 20% opacity by default

## Examples

### Marketplace Card
```tsx
<div className="app-card app-card-hover">
  <h4 className="app-h4">Alternator</h4>
  <p className="app-body-sm app-text-muted">BOSCH 0-123-520-017</p>
  <div className="flex items-center gap-2 mt-2">
    <span className="app-badge app-badge-accent">AI Verified</span>
    <span className="app-body-sm app-text-accent">$145</span>
  </div>
  <button className="app-button app-button-primary mt-4">
    Add to Cart
  </button>
</div>
```

### Chat Message
```tsx
<div style={{
  backgroundColor: 'var(--app-bg-secondary)',
  padding: 'var(--app-sp-md)',
  borderRadius: 'var(--app-radius-lg)'
}}>
  <p className="app-body">
    Based on the diagnostic data, I recommend checking the alternator voltage output.
  </p>
  <code className="app-mono block mt-2">
    Voltage: 12.8V @ idle (Expected: 14.2V)
  </code>
</div>
```

### Project Header
```tsx
<div style={{
  backgroundColor: 'var(--app-bg-secondary)',
  borderBottom: '1px solid var(--app-border)',
  padding: 'var(--app-sp-lg)'
}}>
  <h2 className="app-h2">2000 Hyundai Galloper</h2>
  <p className="app-body-sm app-text-muted">VIN: KMHJN81WPYU034521</p>
</div>
```

## Implementation

This design system is automatically loaded when using the `Dashboard` component. No additional imports needed in individual page components.

```tsx
// In your page component
export default function ChatPage() {
  return (
    <Dashboard>
      {/* Design system automatically available */}
      <div className="app-bg-primary">
        <h1 className="app-h1">Your Content</h1>
      </div>
    </Dashboard>
  )
}
```
