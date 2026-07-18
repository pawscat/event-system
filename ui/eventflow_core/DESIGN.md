---
name: Event Ku Core
colors:
  surface: '#fbf8fc'
  surface-dim: '#dbd9dc'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e4e2e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#303033'
  inverse-on-surface: '#f2f0f3'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e81'
  primary: '#031635'
  on-primary: '#ffffff'
  primary-container: '#1a2b4b'
  on-primary-container: '#8293b8'
  inverse-primary: '#b6c6ef'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#231400'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e2700'
  on-tertiary-container: '#b08d5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6ef'
  on-primary-fixed: '#081b3a'
  on-primary-fixed-variant: '#364768'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#ffddb1'
  tertiary-fixed-dim: '#e8c08a'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5d4217'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e2e5'
  success: '#10B981'
  warning: '#F59E0B'
  danger: '#EF4444'
  background-subtle: '#F9FAFB'
  border-light: '#E5E7EB'
  text-main: '#111827'
  text-muted: '#6B7280'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-page: 24px
  container-max: 1280px
  sidebar-width: 260px
  sidebar-collapsed: 80px
---

## Brand & Style

The design system is a professional B2B SaaS framework tailored for high-stakes event logistics. It balances the rigor required for enterprise management with the speed necessary for on-site event operations.

The brand personality is **Precise, Reliable, and Efficient**. It avoids decorative flourishes in favor of utility and clarity, ensuring that event organizers can manage thousands of participants without cognitive overload.

**Design Style: Corporate / Modern**
This system utilizes a "Soft Enterprise" aesthetic—relying on a structured grid, high-contrast typography, and subtle depth to create a sense of trust.
- **Precision:** Tight alignment and consistent spacing to handle data-heavy tables.
- **Clarity:** A "function-first" approach where primary actions are unmistakable.
- **Tactility:** While primarily flat, it uses subtle shadows and rounded corners to make the interface feel modern and approachable rather than cold or institutional.
- **Localized Presence:** All system text, micro-interactions, and feedback loops are natively in Indonesian (*Bahasa Indonesia*) to ensure maximum clarity for local administrative teams.

## Colors

The palette is anchored by **Deep Navy (#1A2B4B)**, providing an authoritative foundation for sidebars and headers. **Indigo (#4F46E5)** serves as the interactive accent, guiding users toward primary actions and progress indicators.

### Semantic Intent
- **Primary (Navy):** Used for structural elements, navigation, and high-level branding. It signifies stability.
- **Secondary (Indigo):** Used for buttons, active states, and focus indicators.
- **Success (Green):** Specifically reserved for "Check-in Berhasil" (Successful Check-in) and "Email Terkirim" (Email Sent) states.
- **Warning (Amber):** Used for "Sudah Check-in" (Already Checked-in) warnings and "Menunggu Pembayaran" (Pending) states.
- **Danger (Red):** Strictly for destructive actions like "Batalkan Registrasi" or system errors.

The background uses a very light gray (**#F9FAFB**) to reduce eye strain during long-term administrative use, providing enough contrast for white cards to pop.

## Typography

The design system uses **Inter** exclusively to ensure maximum legibility across different resolutions and languages. As a B2B SaaS tool, the typography must handle dense data tables and complex forms.

- **Headlines:** Use tighter letter spacing and semi-bold/bold weights to establish a clear hierarchy.
- **Body Text:** Optimized for reading participant lists and configuration settings. Standard size is 16px for comfort, with 14px used for denser data views.
- **Labels:** Use a medium-to-semibold weight for form fields and status badges to distinguish metadata from content.
- **Mobile Considerations:** Headline sizes are aggressively scaled down on mobile to ensure that event titles (e.g., "Seminar Nasional Transformasi Digital 2026") do not wrap excessively or break the layout.

## Layout & Spacing

This design system follows a **12-column fluid grid** for desktop dashboards, transitioning to a single-column layout for mobile registration forms and scanner views.

- **Rhythm:** An 8px/4px base unit ensures consistent alignment across all components.
- **Sidebars:** The left navigation is fixed and collapsible. When expanded, it maintains a width of 260px to accommodate Indonesian menu labels like "Riwayat Kehadiran."
- **Content Areas:** Dashboard cards use a 24px internal padding. Tables use a compact 12px vertical padding per row to maximize visible data.
- **Breakpoints:**
  - **Desktop (1024px+):** Full sidebar + multi-column grid.
  - **Tablet (768px - 1023px):** Collapsed sidebar + fluid cards.
  - **Mobile (Up to 767px):** Bottom navigation for scanners, full-width inputs for registration forms, and stacked cards instead of tables.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layers** and **Ambient Shadows**.

1. **Background:** The base layer is `#F9FAFB`. 
2. **Surface (Card):** White containers (`#FFFFFF`) with a `1px` border of `#E5E7EB` and a very soft, diffused shadow (e.g., `0 1px 3px rgba(0,0,0,0.1)`).
3. **Interactive/Floating:** Modals and dropdowns use a more pronounced shadow to indicate they are "closer" to the user, with a slightly darker overlay (`rgba(17, 24, 39, 0.5)`) to dim the background.
4. **QR Code Scanning:** The scanner interface uses a "Cut-out" effect—a semi-transparent dark overlay with a clear, sharp-edged center frame to focus the user's attention on the scan area.

## Shapes

The shape language is **Rounded**, using a 0.5rem (8px) base radius.

- **Cards & Inputs:** 8px corners provide a modern, professional feel that isn't too rigid.
- **Buttons:** Match the 8px radius for consistency.
- **Badges/Status Chips:** Utilize a "Full Pill" shape (9999px radius) to differentiate them from interactive buttons.
- **Selection Indicators:** Checkboxes and radio buttons use a smaller 4px radius or full circles to align with standard UI patterns.

## Components

### Buttons
- **Primary:** Solid Indigo background with white text. High-contrast and clear.
- **Secondary:** White background, Indigo border, and text.
- **Tertiary:** No border, ghost style for "Batal" or secondary navigation.
- **Loading State:** Replace button text with a spinner while maintaining button width.

### Status Badges (Lencana Status)
- **Hadir (Checked-in):** Green background (soft tint) with dark green text.
- **Belum Hadir (Not Checked-in):** Gray background with dark gray text.
- **Dibatalkan (Cancelled):** Red background (soft tint) with dark red text.

### Input Fields
- Standard fields use a 1px gray border that shifts to Indigo on focus.
- Labels are always positioned above the field for accessibility.
- Error states show a red border and a small text hint below the input.

### QR Scanner Component
- **Frame:** A square overlay with glowing corner markers.
- **Manual Input:** A clear button below the scanner frame labeled "Input Kode Manual" for backup entry.
- **Feedback:** Immediate full-screen color flash (Green/Amber/Red) upon successful or failed scan for peripheral visual confirmation.

### Data Tables
- Header uses a subtle gray background (`#F3F4F6`).
- Row hover states are enabled to help users track data across wide screens.
- Actions (Edit, Resend, Delete) are grouped in a final "Aksi" column using icon buttons.

### Modals
- Confirmation modals for destructive actions (e.g., "Hapus Admin") must require a secondary confirmation or explicit text entry to prevent accidental data loss.