# UI/UX Guidelines

## 1. FIRST-CLASS ENGINEERING REQUIREMENT
The UI must be treated as an engineered product, not decoration added after functionality.
Before modifying UI, inspect the current interface and understand the layout hierarchy, spacing, typography, component shapes, colors, animations, responsive behavior, interaction patterns, empty states, loading states, error states, and modal behavior.

## 2. REFERENCE IMAGES ARE SPECIFICATIONS
If the user provides a screenshot, reference image, or mockup, DO NOT interpret it loosely. Analyze it as a strict design specification. Compare reference vs current implementation including relative positioning, proportions, spacing, alignment, hierarchy, component size, visual density, layering, interaction affordances, and animation behavior.
Do not replace a complex visual structure with generic cards or placeholder-looking components.

## 3. UI VERIFICATION RULE
When making meaningful visual changes, inspect the actual rendered application.
`React code looks correct != UI looks correct`.
After implementation: `run application -> open affected page -> inspect rendered UI -> compare against intended design -> fix visual discrepancies`. Use browser/devtools/screenshot capabilities whenever available.

## 4. RESPONSIVE DESIGN & ACCESSIBILITY
Do not assume desktop is the only environment. Verify responsive layouts (desktop, tablet, mobile, overflow, long text).
Avoid fixed dimensions where fluid layout is appropriate.
Consider keyboard navigation, focus states, semantic elements, ARIA, contrast, screen-reader labels, and form validation.

## 5. VISUAL DESIGN IDENTITY
Avoid generic AI-generated UI. Do not automatically produce three cards, gradient backgrounds, generic dashboards, or standard SaaS layouts unless consistent with the application's design. The existing application's identity takes priority over generic design patterns.

## 6. COMPONENT REUSE
Before creating a component, search for existing components that solve the same problem. Reuse or extend them when appropriate. Do not create five different versions of Modals, Buttons, Cards, Dropdowns, etc.
