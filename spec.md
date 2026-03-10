# GI-ASSIST UI Overhaul

## Current State
The app has a dark medical theme with teal primary color, Fraunces display + Outfit sans fonts. Pages exist for Login, Dashboard, Questionnaire, and ClinicalReport. The UI is functional but visually generic — buttons are plain, cards are flat, layout lacks visual hierarchy and depth. index.css is missing (styles are likely in a global file elsewhere).

## Requested Changes (Diff)

### Add
- Rich OKLCH design tokens: deep navy backgrounds, teal primary, amber accent, proper dark medical palette
- Polished button styles: gradient CTAs, ghost/outline variants with hover glow, icon+text layouts, smooth transitions
- Layout improvements: proper section spacing, visual grid structure, hero areas, card elevation with subtle glow/shadow
- Signature design detail: teal glow on primary actions, subtle animated gradient on the login logo
- index.css with full OKLCH token set and custom utility classes (card-glow, teal-glow, text-gradient-teal, etc.)

### Modify
- Login page: centered hero layout with atmospheric background glow, premium card with elevated styling, polished login/register buttons
- Dashboard: improved header with doctor info, better patient card grid, richer session rows with status badges
- Questionnaire: progress bar refinement, option cards with hover states, navigation buttons more prominent
- ClinicalReport: section headers with colored borders, red flag alerts with proper severity styling, differential diagnosis cards with confidence indicators
- tailwind.config.js: add box shadows, updated border radius tokens, ensure font families are set

### Remove
- Nothing functional removed — visual-only improvements only

## Implementation Plan
1. Create src/frontend/src/index.css with full OKLCH token palette (deep navy, teal, amber, red, green) and utility classes
2. Update tailwind.config.js with shadow tokens and any missing config
3. Redesign Login.tsx: atmospheric background, premium card, gradient CTA button
4. Redesign Dashboard.tsx: improved header/nav, patient session cards with richer layout
5. Redesign Questionnaire.tsx: option selection cards, progress indicator, polished nav buttons
6. Redesign ClinicalReport.tsx: section-based layout, color-coded alerts, differential cards
