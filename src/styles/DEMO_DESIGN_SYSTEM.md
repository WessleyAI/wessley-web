# Demo Design System

This design system applies **only to demo pages** (under `/demo` route) and does not affect the homepage.

## Typography

### Fonts
- **Headings (h1-h6)**: Inter (sans-serif)
- **Body text (p)**: DM Sans (sans-serif)

### Heading Styles

#### H1
- Font: Inter
- Weight: Bold (700)
- Size: `--fs-4xl` (fluid 40px → 54.4px)
- Line height: 1.2 (tight)
- Letter spacing: -0.015em

#### H2
- Font: Inter
- Weight: Semibold (600)
- Size: `--fs-3xl` (fluid 33.6px → 45.6px)
- Line height: 1.2 (tight)
- Letter spacing: -0.015em

#### H3
- Font: Inter
- Weight: Semibold (600)
- Size: `--fs-2xl` (fluid 28px → 37.6px)
- Line height: 1.25
- Letter spacing: -0.005em

#### H4
- Font: Inter
- Weight: Medium (500)
- Size: `--fs-xl` (fluid 23.2px → 31.2px)
- Line height: 1.3
- Letter spacing: Normal

### Body Text

#### Paragraph (p)
- Font: DM Sans
- Weight: Regular (400)
- Size: `--fs-sm` (fluid 14.4px → 17.6px)
- Line height: 1.35 (normal)
- Color: `--text-secondary`

#### Lead text (.lead)
- Font: DM Sans
- Weight: Regular (400)
- Size: `--fs-md` (fluid 16.8px → 21.6px)
- Line height: 1.7 (relaxed)
- Use for larger introductory paragraphs

#### Small text (.small)
- Font: DM Sans
- Size: `--fs-xs` (fluid 12px → 15.2px)
- Line height: 1.4

#### Caption (.caption)
- Font: DM Sans
- Size: `--fs-xxs` (fluid 9.6px → 12.8px)
- Line height: 1.35

## Usage

All typography styles are automatically applied within the demo layout. No additional classes needed for basic usage:

```tsx
// Headings automatically get Inter
<h1>This is a heading</h1>
<h2>This is a subheading</h2>

// Paragraphs automatically get DM Sans
<p>This is body text in DM Sans</p>

// Utility classes
<p className="lead">Larger introductory text</p>
<p className="small">Smaller text</p>
<p className="caption">Caption text</p>
<p className="muted">Muted text color</p>
```

## Utility Classes

### Text Alignment
- `.text-left`
- `.text-center`
- `.text-right`

### Font Weights
- `.font-regular` - 400
- `.font-medium` - 500
- `.font-semibold` - 600
- `.font-bold` - 700

### Colors
- `.muted` - Muted text color

## Implementation Details

The design system is:
1. Defined in `/src/styles/demo-design-system.css`
2. Imported in `/src/app/demo/layout.tsx`
3. Scoped with `.demo-typography` class to prevent affecting the homepage
4. Uses CSS variables from the global design system (`design-system.css`) for consistency

## Design Tokens

All sizes use fluid typography that scales based on viewport:
- `--fs-xxs` to `--fs-5xl` for font sizes
- `--lh-tight`, `--lh-normal`, `--lh-relaxed` for line heights
- `--trk-tight`, `--trk-normal`, `--trk-wide` for letter spacing
- `--w-reg`, `--w-med`, `--w-sb`, `--w-b` for font weights

These are all defined in the global design system and provide a consistent Minor Third (1.2) typographic scale.
