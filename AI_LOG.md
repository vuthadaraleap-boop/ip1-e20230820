# AI log

One entry per meaningful AI use.

## 2026-10-30 · Spec and priorities
Tool: Claude (claude.ai)
Asked: review my project proposal against the course guideline and the SRS checklist, and turn it into docs/SPEC.md.
Kept: the 10 user stories with their acceptance criteria, the permissions table, the data model, and a Must / Should / Could priority table at the end of SPEC.md.
Rejected: adding separate stakeholder and timeline sections, because the guideline does not ask for them in SPEC.md.
Checked by: reading SPEC.md against my proposal to check that the stories, roles and rules match.

## 2026-10-30 · Wireframes
Tool: Claude (claude.ai)
Asked: draw wireframes for the main screens, and write a prompt I can paste into Figma.
Kept: the list of six screens (log in and register, plans, class timetable, my bookings, memberships queue, class form) and the grey wireframe style. [Edit this line: say whether you kept Claude's PNG files or redrew them in Figma.]
Rejected: Balsamiq, because I already know Figma and it is free.
Checked by: comparing each wireframe with the screens listed in the spec.

## 2026-10-30 · Frontend scaffold
Tool: Claude (claude.ai)
Asked: which create-vue options to choose, and how to set up the repository structure from the guideline.
Kept: TypeScript, Router, Pinia, Vitest, Linter and Prettier, with the example code skipped; the folder layout from the guideline.
Rejected: JSX and End-to-End Testing, because the guideline uses neither; and the three experimental options (Oxfmt, Vue 3.6 Release Candidate, tsgo), because the course expects Prettier and stable Vue. I also chose to run the setup commands myself and not use a ready-made zip.
Checked by: running npm create vue myself and checking the generated files. [Edit this line: add the result of npm run type-check and npx vitest run after you run them.]