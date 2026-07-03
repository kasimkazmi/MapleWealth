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

---

# Backend Architecture Rules (MapleWealth)

## Development & Structure Guidelines

* **NestJS Module Separation:** Strictly isolate domains by feature modules (e.g., `ProfileModule`, `AccountsModule`, `TransactionsModule`, `InvestmentsModule`, `ContributionsModule`, `ProjectionsModule`, `RulesModule`, `ImportsModule`, `ReportsModule`, `UsersModule`).
* **Controllers vs. Services:** Controllers must only handle routing, payload validation (DTOs), and returning clean HTTP responses. All calculations, database mutations, third-party calls, and business logic must reside within injectable NestJS Services.
* **Database Access:** Database calls must be made via the global `PrismaService` from `@maplewealth/db`. Avoid raw database queries unless highly optimized indexing requires it.
* **Transactional Integrity:** Any operation that alters account balances, records transactions, or updates contribution metrics must execute inside a database transaction block (`this.prisma.$transaction`) to prevent partial failures and keep states in sync.

## Financial Calculations & Decimals

* **No Floating-Point Math:** Never calculate or accumulate monetary values using Javascript floating-point numbers (`number`) in critical code paths.
* **Decimal Library:** Use Prisma `Decimal` types or a robust library like `Decimal.js` to ensure rounding accuracy and prevent floating-point leaks.
* **Currency Formatting:** Keep money fields matched with their corresponding currency codes (default `CAD`).

## Security & Protection Guidelines

* **DTO Payload Validation:** Validate incoming request payloads strictly by defining classes as DTO parameters.
* **Global Rate Limiting:** Enforce API request limits globally utilizing throttler interceptors to block brute-force and scraping attacks.
* **Cascading Purges:** GDPR/PIPEDA compliance deletion requests must clean up all user-associated records across profiles, transactions, and account details in a safe cascading database transaction.
* **Audit Trail Logs:** Every creation, update, or deletion of financial records (e.g., transactions, manual contributions, account updates) must write a non-repudiable log entry to the `AuditLog` table containing before/after states.

## Code Quality & Readability

* **Strong Types:** Declare strict return types on all controller handlers and service methods. Avoid typing variables as `any`.
* **Async/Await Safety:** Always use structured async/await patterns for promise resolutions. Wrap async blocks with try/catch to throw standard NestJS HttpExceptions (e.g. `NotFoundException`, `BadRequestException`) with descriptive error messages.
* **Unused Code:** Strip unused NestJS decorators, providers, or mock handlers before committing backend source files.

