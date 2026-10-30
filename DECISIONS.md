# Decisions

- 2026-10-30: Gym membership as the domain, with three roles (member, staff, admin), because the spec has enough rules for roles, bookings and permissions without needing new ideas.
- 2026-10-30: Staff record payments by hand at the front desk and there is no payment gateway, so the scope stays small enough for one student.
- 2026-10-30: EXPIRED is worked out when a membership is read and is not stored, so no scheduled job is needed.
- 2026-10-30: A member who asks for another member's record gets 404 and not 403, so the record's existence is not revealed.
- 2026-10-30: Prices are stored as whole cents, and a membership copies the plan's price and duration when it is requested, so later plan changes do not alter old memberships.
- 2026-10-30: Build the member screens first and the staff screens later. Photo upload, the tag tree, internal notes and permanent member delete are Could items (see the priority table in docs/SPEC.md).
- 2026-10-30: Scaffold the frontend with create-vue using TypeScript, Router, Pinia, Vitest, ESLint and Prettier, and skip the example code, so the stack matches the guideline from the start.
- 2026-10-30: Skip the experimental create-vue options (Oxfmt, Vue 3.6 RC, tsgo) and stay on the standard tools the course uses.
- 2026-10-30: Draw wireframes in Figma in grey only, because the check needs the layout and not the visual design.