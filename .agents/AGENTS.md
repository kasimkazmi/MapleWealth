# Frontend Architecture Rules (MapleWealth)

## Development Guidelines

* Never use emojis. Use proper icons from the project's icon library instead.
* Always separate concerns by keeping **types**, **interfaces**, **business logic**, and **utility functions** outside of frontend `.tsx` files.
* Keep `.tsx` components focused on UI rendering only.
* Create reusable custom components whenever the same component or UI pattern is used in more than one place.
* Avoid code duplication by sharing common logic through reusable hooks, utility functions, and components.
* Follow a clean, modular, and maintainable project structure at all times.

## Architecture

- Component size: No component or page file should exceed 500 lines. Split files before they become oversized.
- Feature structure: Keep UI, types, business logic, and validation in separate files within each feature folder.
- UI ownership: Keep page and client components focused on rendering and minimal local interaction state.
- Business logic: Move data mapping, workflow logic, and side effects into hooks, logic modules, or helpers.
- Data flow: Frontend must never call the database directly. Use backend API routes under `/api/*` or approved client SDK wrappers.
- API integration: Use shared API hooks or centralized fetch client functions for network access. Do not place raw fetch logic inside presentational components.
- Domain boundaries: Keep different modules separated by route groups and feature folders.

## File Organization

- Types and interfaces: Use feature-local types files (`types.ts` or `Feature.types.ts`) or shared types folder.
- Logic and helpers: Use custom hooks, logic modules, or helper utilities instead of inline logic in components.
- Validation: Keep schema and field rules in validation files near the feature.
- Reuse first: Promote repeated UI into shared components before duplicating markup.

## UI and Design Patterns

- Design system: Use shared tokens and primitives for spacing, typography, color, borders, and interactive states.
- Styling: Use Tailwind utility classes. No inline styles unless there is no viable Tailwind option.
- Hierarchy: Prioritize clear typography and spacing rhythm over decorative effects.
- Accessibility: Maintain visible focus states, semantic markup, and keyboard-safe interactions.
- Modal UX: App modals must support keyboard navigation, escape-to-close, and correct focus behavior.
- Loading and error states: Every API-driven view must render clear loading and error states.
- Icons: Use icon components (for example, `lucide-react`). Do not use emojis in product UI.

## Code Quality Rules

- No any: Do not use `any` in type annotations. Define explicit interfaces, unions, or generics.
- Dead code: Remove unused imports, stale constants, and unreachable branches.
- Linting: Run linter checks after changes and resolve reported issues in touched files.
- Maintainability: Prefer small, testable units and avoid deeply nested component logic.
- Predictable state: Keep derived values in memoized selectors/helpers instead of duplicating state.
- Safer effects: Keep effect dependencies explicit and avoid effect-driven chains that hide business flow.
