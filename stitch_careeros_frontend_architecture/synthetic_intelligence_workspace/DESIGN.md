---
name: Synthetic Intelligence Workspace
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.02em
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
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

This design system is built for a premium AI career intelligence platform. The brand personality is authoritative yet visionary, positioning the tool as an advanced "copilot" for high-stakes professional growth. The aesthetic leans into a refined **Modern SaaS** style with heavy influences from **Minimalism** and **Glassmorphism** to create a sense of depth and intelligence.

The emotional response should be one of "calm power"—the user should feel they are interacting with a sophisticated engine that distills complex data into actionable clarity. Visuals are characterized by expansive whitespace, crisp typography, and subtle luminosity to distinguish the product from generic enterprise software.

## Colors

The palette utilizes a high-end "Deep Space" foundation. The primary background is a rich, near-black slate to allow vibrant accents to pop without causing eye strain. 

- **Primary (Indigo):** Used for core actions, focus states, and primary AI indicators.
- **Secondary (Electric Blue):** Used for data visualization highlights and secondary interactive elements.
- **Neutrals:** A meticulous scale of Blue-Grays (Slate) manages information density. Avoid pure black or pure gray; every neutral has a hint of cool sapphire to maintain the premium technical feel.
- **Status Colors:** These are slightly desaturated but bright (emerald, amber, rose) to remain legible against the dark backgrounds while indicating system health and career milestones.

## Typography

The design system uses **Inter** as its primary typeface for its exceptional legibility and neutral, modern character. For technical data points and status tags, **JetBrains Mono** is used sparingly to reinforce the "intelligence" and "data-driven" nature of the platform.

Headings feature generous tracking (letter-spacing) and tight line-heights to create a sleek, editorial feel. Body text prioritizes readability with ample line-height. Use `label-sm` for metadata and non-interactive data labels to provide a distinct visual break from prose.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a max-width container for desktop viewing. 

- **Desktop:** 12-column grid, 24px gutters, 48px-80px side margins.
- **Tablet:** 8-column grid, 16px gutters, 32px side margins.
- **Mobile:** 4-column grid, 12px gutters, 16px side margins.

Spacing is aggressive in its use of whitespace to prevent the "dashboard clutter" typical of SaaS products. Sections should be separated by `xl` spacing to allow the user's eyes to rest between disparate data modules.

## Elevation & Depth

This system uses **Tonal Layers** combined with **Glassmorphism** to define hierarchy. 

1.  **Base Layer:** `#020617` (Deep Slate).
2.  **Card Layer:** A slightly lighter surface (`#0F172A`) with a 1px border of `rgba(255, 255, 255, 0.05)`.
3.  **Floating Elements (Modals/Popovers):** Use a backdrop-blur of 12px and a subtle indigo-tinted shadow (`rgba(0, 0, 0, 0.5)` with a 20px blur).

Shadows are never pitch black; they are always tinted with the primary navy to maintain color harmony. Use "Inner Glow" effects (1px stroke) on buttons to give them a tactile, physical quality.

## Shapes

The shape language is sophisticated and modern. A default `rounded-md` (0.5rem) is used for most interactive elements. 

- **Cards:** 1rem (`rounded-lg`) to create a softer, more premium container feel.
- **Buttons:** 0.5rem or full pill-shape for primary CTA buttons to make them feel "organic" and approachable.
- **Inputs:** 0.5rem to align with the core system aesthetic.

## Components

### Buttons
Primary buttons use a subtle gradient from Indigo to Electric Blue. Hover states should trigger a slight "glow" (outer shadow) rather than just a color change. Text should be medium weight with `label-sm` styling for secondary buttons.

### Elegant Cards
Cards are the core of the AI workspace. They feature 1px subtle borders. For "Featured" AI insights, apply a very faint indigo radial gradient in the background to draw the eye without breaking the grid.

### Data Tables
Tables must avoid heavy borders. Use horizontal dividers only, using `surface-mid` at 20% opacity. Headers use `label-sm` typography. Row hover states should use a subtle background shift to `surface-low`.

### Charts
Charts should utilize the primary/secondary palette with high-contrast lines. Use "Area" charts with soft gradients (Primary to Transparent) to emphasize volume.

### Micro-interactions
All transitions (hover, focus, page load) should use a `cubic-bezier(0.4, 0, 0.2, 1)` timing function for a "snappy yet smooth" professional feel. Elements should subtly scale up (1.02x) on hover to indicate interactivity.