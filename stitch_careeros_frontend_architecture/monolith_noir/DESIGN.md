---
name: Monolith Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#303031'
  tertiary-container: '#e3e2e2'
  on-tertiary-container: '#646464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
  glass-white: rgba(255, 255, 255, 0.05)
  border-subtle: '#262626'
  surface-high: '#111111'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system embodies a "Classy Black and White" aesthetic, pivoting from a technical workspace to a high-fashion, premium intelligence platform. The brand personality is unapologetically sophisticated, minimalist, and authoritative. It draws heavily from **Minimalism** and **Modern Corporate** styles, utilizing stark contrasts to evoke a sense of clarity and "quiet luxury."

The emotional response is one of absolute precision. By stripping away color, the focus shifts entirely to form, typography, and content. The interface should feel like a bespoke digital atelier—refined, expensive, and curated. All visual noise is eliminated in favor of a monochromatic spectrum that prioritizes legibility and structural elegance.

## Colors

The palette is strictly achromatic, relying on the extreme ends of the value scale to establish hierarchy.

- **Primary Background:** Pure Black (`#000000`) is used for the foundational canvas to create an infinite depth.
- **Primary Action/Text:** Pure White (`#FFFFFF`) provides maximum contrast against the black base.
- **Surfaces:** Tonal separation is achieved through a "Refined Grey" scale. Primary containers use a deep charcoal (`#111111`), while borders and dividers utilize a subtle mid-grey (`#262626`).
- **States:** Hover and active states are managed through value shifts. Interactive elements transition from white to a light grey or from deep grey to a more luminous tone. No chromatic hues (blue, indigo, or red) are permitted.

## Typography

This design system retains **Inter** for its functional clarity but implements it with tighter tracking in headlines to mimic high-fashion editorial layouts. **JetBrains Mono** remains the secondary typeface for metadata and technical labels, providing a structural, "engineered" counterpoint to the humanist curves of Inter.

Legibility is maintained through strict adherence to high-contrast pairings: white text on black backgrounds for primary information, and mid-grey text for secondary/de-emphasized content. For display sizes, letter spacing is reduced to create a "locked-in" visual density. Labels and small caps use increased letter spacing to ensure airiness and clarity at small scales.

## Layout & Spacing

The layout utilizes a **Fixed Grid** philosophy to maintain a structured, intentional composition. The 12-column grid is centered within a maximum container width of 1440px, surrounded by generous margins that frame the content like a gallery piece.

- **Desktop:** 12-columns with 24px gutters. The layout favors large, asymmetrical whitespace blocks to emphasize key insights.
- **Tablet:** 8-columns with 16px gutters and reduced margins.
- **Mobile:** 4-columns with 12px gutters and 16px margins.

The spacing rhythm is "Atmospheric," meaning margins and paddings are typically larger than industry standards to prevent information density from feeling cluttered. The use of `xl` spacing (80px) between major sections is mandatory to preserve the minimalist feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Crisp Outlines** rather than traditional shadows. 

1. **Base:** Pure Black (`#000000`).
2. **Plates (Cards):** Dark Grey (`#111111`) surfaces with a 1px solid border of `#262626`.
3. **Overlays (Modals):** These use a high-contrast white border (1px) and a heavy backdrop blur (20px) to separate from the background. 

Shadows, when used, are strictly "Ambient Shadows"—extremely low opacity (`15-20%`) with large blur radii, intended to provide a subtle "lift" rather than a directional light source. No colored tints or gradients are permitted; the depth must feel architectural and flat.

## Shapes

The shape language is "Soft" yet disciplined. While the previous system used larger radii, this system moves to a more architectural **0.25rem (4px)** default to feel sharper and more precise.

- **Interactive Elements:** 0.25rem (`rounded-sm`) for buttons and inputs to maintain a crisp, professional edge.
- **Containers:** Large cards and modules may use up to 0.5rem (`rounded-md`) to slightly soften the layout without appearing "bubbly."
- **Icons:** Geometric, line-based icons with consistent stroke weights that match the typography's weight.

## Components

### Buttons
Primary buttons are stark white with black text. Hover states invert this (black button, white border, white text) or shift to a very light grey. Secondary buttons are outlined in `#FFFFFF` with no fill. All transitions are immediate or use a very fast linear ease.

### Input Fields
Inputs are defined by a bottom-border only or a subtle 1px `#262626` wrap. On focus, the border transitions to pure white. Placeholder text is mid-grey to ensure the active text is the focal point.

### Cards & Modules
Cards must not have shadows. They are defined by their background color (`#111111`) and a subtle grey border. For "Featured" content, use a 1px white border to make the element "pop" against the black canvas.

### Lists & Tables
Rows are separated by 1px dividers (`#262626`). Hovering over a row should change the background to a slightly lighter grey (`#1A1A1A`) without adding shadows or glows.

### Data Visualization
Charts are rendered in high-contrast monochrome. Use pure white for primary data lines, mid-grey for secondary data, and dotted/dashed lines for projections. Avoid fills; favor strokes and "empty" space.