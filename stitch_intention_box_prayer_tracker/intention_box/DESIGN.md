---
name: Intention Box
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c8c7be'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#919189'
  outline-variant: '#474741'
  surface-tint: '#c8c7bf'
  primary: '#ffffff'
  on-primary: '#30312c'
  primary-container: '#e4e3db'
  on-primary-container: '#65655f'
  inverse-primary: '#5f5f59'
  secondary: '#e6c364'
  on-secondary: '#3d2e00'
  secondary-container: '#785d00'
  on-secondary-container: '#fdd977'
  tertiary: '#ffffff'
  on-tertiary: '#30321d'
  tertiary-container: '#e4e4c6'
  on-tertiary-container: '#65664d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e4e3db'
  primary-fixed-dim: '#c8c7bf'
  on-primary-fixed: '#1b1c17'
  on-primary-fixed-variant: '#474742'
  secondary-fixed: '#ffe08f'
  secondary-fixed-dim: '#e6c364'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#e4e4c6'
  tertiary-fixed-dim: '#c8c8ab'
  on-tertiary-fixed: '#1b1d0a'
  on-tertiary-fixed-variant: '#474832'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-mobile: 24px
  gutter-md: 16px
  section-gap: 48px
  unit: 8px
---

## Brand & Style
The design system is built upon the concept of "Quiet Majesty." It is designed for a contemplative, sacred experience that honors the weight of prayer and intention. The aesthetic blends **Minimalism** with **Royal** editorial cues to evoke a sense of reverence, stillness, and timelessness.

The target audience seeks a sanctuary from digital noise. The UI must feel like a physical ritual—akin to opening a high-end stationery box or entering a quiet chapel. Every element is intentionally spaced to provide "the breath of space," ensuring the user's intentions remain the focal point without visual competition.

## Colors
The palette is rooted in a deep, "Infinite Black" (#1A1A1A) which provides the necessary depth for spiritual focus. 

- **Primary (Ivory):** Used for all primary reading text and core icons, offering a softer, more historic feel than pure white.
- **Secondary (Muted Gold):** Reserved for moments of "divine" interaction—active states, primary buttons, and ornamental highlights. It should be used sparingly to maintain its value.
- **Surface:** A slightly lifted grey-black for container backgrounds to create subtle layering without breaking the dark-mode immersion.

## Typography
The typography follows an editorial hierarchy. **Playfair Display** serves as the emotional anchor, used for headlines and titles to provide a regal, authoritative voice. The use of italics for sub-headlines is encouraged to add a touch of personal, handwritten grace.

**DM Sans** provides a clean, functional contrast for body text and metadata, ensuring that the app remains highly legible and modern. Tracking should be increased for labels (`label-caps`) to emphasize the premium, spacious feel of the design system.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for mobile, prioritizing generous side margins (24px) to frame content like a page in a book. 

The vertical rhythm is intentionally loose. Elements are separated by large gaps (`section-gap`) to prevent the interface from feeling cluttered or urgent. For intention lists, use a single-column layout to allow each prayer enough vertical height to feel significant. Components should never feel "packed"; when in doubt, add 8px of additional padding.

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Levels:** The base is #1A1A1A. Interactive cards or "boxes" use #242424.
- **Borders:** Use 1px solid strokes for containers. For standard cards, use a subtle dark grey stroke. For "Featured" or "Active" intentions, use a 1px Gold (#C9A84C) stroke.
- **Glassmorphism:** Use a subtle backdrop blur on top navigation bars (80% opacity #1A1A1A with 10px blur) to maintain a sense of layered transparency as the user scrolls.

## Shapes
The shape language is **Soft** (Level 1). UI elements use a 4px (0.25rem) base radius.

This choice is deliberate: sharp corners (0px) feel too aggressive and technical, while pill-shapes (3) feel too casual and "app-like." A subtle radius mimics the corners of a leather-bound journal or a high-quality gift box, maintaining a formal but approachable character.

## Components
- **Buttons:** Primary buttons are Gold (#C9A84C) with Ivory text. Secondary buttons should be Ghost-style (Ivory 1px border) or Text-only with an Ivory underline.
- **Intention Cards:** Use the Surface color (#242424) with a 1px border. Padding inside cards should be at least 20px. 
- **Input Fields:** Use a "Minimalist Ledger" style—no background, just a 1px Ivory bottom border that turns Gold on focus.
- **Chips/Tags:** Small, rectangular with 2px radius. Ivory text on a subtle dark stroke; avoid filled backgrounds for tags to maintain lightness.
- **Progress Indicators:** Use thin, elegant gold lines rather than thick bars.
- **The "Votive" Toggle:** A custom switch component using a Gold circular handle and an Ivory track, signifying the lighting of a candle.