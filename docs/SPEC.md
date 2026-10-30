# Gym Membership: Specification

Course: Internet Programming I. Student: VUTHA DARALEAP (e20230820). Stack: Vue 3 + TypeScript, NestJS, PostgreSQL + Prisma.

This file is the working specification. It follows the project proposal (Requirements Specification, 13 pages). Requirement numbers (FR-xx, NFR-xx) refer to that proposal.

## 1. Purpose and scope

Gym members have no simple way to see their plan, book a class, or check when their membership ends. Front-desk staff track payments and class lists on paper or in spreadsheets. Without one shared system, classes get overbooked, expired members still book classes, and nobody can tell who changed what.

There are three roles. A visitor who registers becomes a member. Staff and admin accounts come from the seed. Payment is taken at the front desk: a member requests a plan, and staff confirm the payment to start it.

### In scope

- Register and login with JWT, with one optional profile photo at registration
- Roles MEMBER, STAFF, and ADMIN
- Plans: list, add, and deactivate
- Memberships: request, confirm payment, and cancel
- Classes: create, list, filter, search, paginate, detail, edit, and cancel
- Bookings: book, cancel, and class rosters
- Internal notes on members (add and hide)
- Category tree and tag tree for classes: add, rename, deactivate, and delete
- Permanent member delete (admin only)
- Activity log with the old value and the new value
- Seeded accounts, plans, and trees, and a README with setup steps

### Out of scope

- Online payment gateways, refunds, and invoices
- Email, SMS, or push notifications
- Freezing or renewing a membership, and scheduled jobs
- Gym check-in, QR codes, and card scanners
- Waitlists, recurring class series, and personal training
- Choosing a trainer for a class, and checks for overlapping bookings
- Editing plans, deleting plans, and editing notes
- Replacing or removing a profile photo after registration
- Editing, deleting, or exporting activity log entries
- Real-time updates (WebSockets) and multiple gym branches
- Drag-and-drop reordering of category and tag nodes
- A visitor registering themselves as staff or an admin

### Assumptions

- Users have a modern desktop browser.
- PostgreSQL runs locally or in Docker.
- The seeded MEMBER, STAFF, and ADMIN accounts exist for grading.
- All dates and times use the Asia/Phnom Penh time zone (UTC+7). The API sends timestamps in ISO 8601.
- Prices are in US dollars and stored as whole cents.

## 2. Roles

| Role | What they can do |
|---|---|
| Member | Register and log in (with an optional profile photo), see active plans, request a membership, cancel a pending request, browse and filter classes, book a class while their membership is active, and cancel their own booking up to 2 hours before the class starts |
| Staff | Confirm payment and cancel memberships, see the members list, write internal notes on members, create, edit, and cancel classes, see class rosters and cancel any booking, add and deactivate plans, add, rename, deactivate, and delete category and tag nodes, and read the activity log |
| Admin | Everything staff can do, plus permanently delete a member account |

Every class has one category from a category tree and any number of tags from a separate tag tree. A category or tag can be renamed or marked inactive. An inactive node stays on old classes and is hidden when staff create or edit a class. Every change is written to an activity log that staff and admins can read.

## 3. Main screens

1. Login and register (photo field on register only)
2. Plans and my membership: active plans, "Request" button, my memberships with status and dates
3. Class timetable: list, filters (category, tag, date range), search, paging, "Book" button, seats left
4. My bookings: upcoming and past, "Cancel" button
5. Members (staff and admins): search, member detail with memberships, bookings, photo, and internal notes
6. Memberships queue (staff and admins): pending payments, confirm payment, cancel
7. Class management (staff and admins): new and edit class form with category and tag pickers (active nodes only), class roster
8. Plan, category, and tag management (staff and admins)
9. Activity log (staff and admins)
10. 404 page

Wireframes in `docs/wireframes/` cover screens 1 to 4, 6 and 7.

## 4. User stories

### US-01: Register, log in, and protected pages

As a visitor, I want to register and log in, so that I can use the gym app as a member, and only see what my role allows.

- `POST /auth/register` creates a user with a hashed password. The default role is MEMBER. The body cannot set the role.
- Register takes name, email, password, and one optional photo (png, jpg, jpeg, or webp, at most 2 MB). Without a photo the account is still created. A second file, a non-image, or a file over 2 MB returns 400 and no account is created.
- `POST /auth/login` returns a JWT for a correct email and password.
- A wrong password or unknown email returns 401 with a clear message.
- A bad body (missing field, invalid email, password under 8 characters, name not 2 to 80 characters) returns 400.
- No response includes passwordHash.
- A member can see their own photo. Staff and admins can see any member's photo. Another member's photo returns 404.
- Opening `/classes` or any other app page while logged out redirects to login.
- The member UI has no members list, memberships queue, internal notes, class or plan management, category and tag management, activity log, or delete member controls.
- The staff UI shows all of those except delete member. The admin UI shows everything the staff UI shows, plus delete member.
- API calls send `Authorization: Bearer <token>`. A missing token returns 401.

Requirements: FR-01 to FR-07.

### US-02: Plans and requesting a membership

As a member, I want to see the plans and request one, so that I can start training once I pay at the desk.

- `GET /plans` lists plans with name, description, price, and duration in days. Members see only active plans. Staff and admins see all plans.
- `POST /memberships` with `{ planId }` creates a membership with status PENDING, memberId set to the current user, and no start or end date yet. It copies the plan's price and duration at that moment.
- An unknown or inactive planId returns 400.
- A member who already has a PENDING membership, or an ACTIVE one that has not expired, gets 400 with the reason.
- My memberships shows plan name, price, status, start date, and end date, in pages. An empty list shows an empty state. An ACTIVE membership whose end date has passed is shown as EXPIRED.
- A member can cancel their own PENDING membership. Any other status returns 400 ("Only a pending membership can be cancelled by the member."). Another member's membership returns 404.

Requirements: FR-09 to FR-11.

### US-03: Browse classes and book

As a member, I want to find a class and book a seat, so that my place is held.

- The timetable lists SCHEDULED classes that have not started, soonest first. Each row shows title, coach, start time, duration, category path, tags, seats left, and whether I have booked it.
- I can filter by categoryId, tagId, and a date range (from, to). A category filter includes that category and everything under it. A tag filter matches that exact tag.
- I can search by title (case-insensitive, contains).
- Results are paged with page and pageSize, and the UI has next and previous controls. An empty result shows an empty state, not an error.
- Class detail shows title, description, category path, tags, coach, start time, duration, capacity, seats left, and status. It does not list who booked. An unknown id returns 404.
- `POST /bookings` with `{ classId }` books the current member. It needs an ACTIVE membership that has not expired and covers the class date, a SCHEDULED class that has not started, a free seat, and no existing booking for that class.
- A broken rule returns 400 with a clear reason, for example "Class is full." A valid booking returns 201. Staff and admins calling it get 403.
- If two members book the last seat at the same moment, one gets 201 and the other gets 400.
- Without an active membership, the Book button is disabled and the page says why.

Requirements: FR-12, FR-13, FR-30.

### US-04: My bookings

As a member, I want to see my bookings and cancel one, so that I can free my seat when my plans change.

- My bookings lists my own bookings with class title, start time, and status, with an upcoming and past filter and paging. An empty list shows an empty state.
- I can cancel my own booking until 2 hours before the class starts. After that the API returns 400 ("Too late to cancel."). A cancelled booking frees the seat.
- Cancelling a booking that is already cancelled returns 400. Another member's booking returns 404.

Requirements: FR-14, FR-15.

### US-05: Members, internal notes, and delete

As staff, I want to find a member and see their history, and leave notes the member cannot see. As an admin, I want to permanently delete a member account that should not be kept.

- Staff and admins can list members with `GET /users?role=MEMBER`, search by name or email (case-insensitive, contains), and page. A member calling it gets 403.
- Member detail shows profile, photo, memberships, bookings, and notes. It never includes passwordHash.
- Staff and admins can add a note to a member (1 to 1000 characters). Only staff and admins can read notes. A member calling any notes endpoint gets 403.
- Staff and admins can hide a note. The detail page then shows "Note removed". The original text is stored on the activity log entry and is not returned by the API.
- An admin can permanently delete a member with `DELETE /users/:id` after a confirmation in the UI. It returns 204 and also deletes that member's memberships, bookings, notes, and photo file.
- Delete works only on MEMBER accounts. A staff or admin account returns 400. Staff calling delete get 403. An unknown id returns 404. The activity log entries for that member remain.

Requirements: FR-16, FR-19, FR-20.

### US-06: Memberships queue

As staff, I want to confirm payments and cancel memberships, so that every membership is correct.

- Staff and admins can list all memberships with `GET /memberships`, filter by status, and page. The default view is PENDING. Each row shows the member's name and email, the plan, and the price.
- To confirm payment on a PENDING membership, staff send paymentMethod (CASH, CARD, or BANK_TRANSFER). The membership becomes ACTIVE. startDate is today and endDate is startDate plus durationDays minus 1. Any other status returns 400.
- Staff and admins can cancel a PENDING or ACTIVE membership. It becomes CANCELLED and stays CANCELLED. Cancelling does not remove the member's existing bookings.
- A member trying any of these actions gets 403. An invalid status or payment method returns 400.

Requirements: FR-17, FR-18.

### US-07: Manage classes and plans

As staff, I want to create and change classes and plans, so that the timetable and the price list stay correct.

- Staff and admins create a class with `POST /classes`. Title is 3 to 120 characters. Description is at least 10 characters. categoryId is required and must be an active category. tagIds is optional and every id must be an active tag. startsAt must be in the future. durationMinutes is 15 to 240. capacity is 1 to 100. The coach is the staff member who creates the class.
- An invalid body, or an unknown or inactive category or tag, returns 400. A valid create returns 201 with the category path and tags in the body.
- Staff and admins can edit title, description, categoryId, tagIds, capacity, startsAt, and durationMinutes, but only on a SCHEDULED class that has not started. Otherwise the API returns 400. Capacity cannot go below the number of current bookings.
- A category or tag already on the class may stay even if it is now inactive. A newly chosen one must be active. `tagIds: []` clears the tags. Leaving tagIds out keeps them.
- Staff and admins can cancel a class. It becomes CANCELLED and cannot be reopened. Its bookings no longer count for seats.
- `GET /classes/:id/bookings` returns the roster with each booked member's name and email. Staff and admins can cancel any booking. A member gets 403.
- Staff and admins create a plan with `POST /plans`: name 2 to 60 characters, description up to 300 characters (optional), priceCents 0 or more, durationDays 1 to 730. They can deactivate a plan. An inactive plan is hidden from members but stays on old memberships.
- A member calling any of these gets 403.

Requirements: FR-21 to FR-25, FR-30.

### US-08: Category tree and tag tree

As staff, I want to give each class one category and optional tags, and to correct a node that was added by mistake, so that members can find the right class.

- `GET /categories` and `GET /tags` return `{ id, name, parentId, active }` for every node. Root nodes have parentId null.
- The class create and edit pickers list a node only when that node and every ancestor are active. Lists and detail still show an inactive category that is already on a class, for example Cardio / Spin.
- Staff and admins can create a node with `POST /categories` or `POST /tags` and `{ name, parentId? }`. The name is 2 to 60 characters.
- Staff and admins can rename a node and can set active to true or false.
- Staff and admins can delete a category only when it has no child categories and no classes. Otherwise the API returns 400 and names the reason.
- Staff and admins can delete a tag that has no child tags. The tag is removed from every class that had it, and each of those classes gets a log entry. A tag that still has children returns 400.
- A member calling create, rename, deactivate, or delete gets 403. A missing token gets 401.
- A parentId that does not exist, is in the other tree, or would create a loop returns 400.
- The seeded trees have two levels or more. For example, categories Cardio > Spin, HIIT; Strength > Powerlifting, Bodyweight; Mind and Body > Yoga, Pilates; tags Level > Beginner, Intermediate, Advanced.

Requirements: FR-26 to FR-30.

### US-09: Activity log

As staff, I want to see every action taken in the system, including the old and new values, so that I can tell who changed what.

- Each of these actions adds one log entry: register, login, failed login, membership request, payment confirmed, membership cancel, booking create, booking cancel, class create, class edit, class cancel, note create, note hide, member delete, plan create, plan deactivate, and category or tag create, rename, deactivate, and delete.
- An entry shows who did it (or the email tried, for a failed login), the action, what it was done to, the old value, the new value, and the time.
- Hiding a note stores the original note text in that log entry.
- `GET /activity-logs` returns entries newest first, with paging and a filter by action and by user. Staff and admins can call it. A member gets 403. A missing token gets 401.
- Entries cannot be edited or deleted through the API or the UI.
- No entry contains a password, a token, or passwordHash.
- Entries for a deleted member or class are still there afterwards.

Requirements: FR-31 to FR-33.

### US-10: Seeded accounts and README

As a reviewer, I want seeded accounts and clear setup steps, so that I can run and grade the app from a fresh clone.

- `npx prisma db seed` creates at least one MEMBER, one STAFF, one ADMIN, three plans (Monthly 30 days, Quarterly 90 days, Annual 365 days), a category tree, a tag tree, and a few upcoming classes. Each tree has at least two levels.
- The README lists the env vars, how to run the frontend and backend, and the test commands.
- `.env` is gitignored and both apps have a `.env.example`.

Requirements: FR-08.

## 5. Permissions (guard table)

| Action | Member | Staff | Admin | Not logged in |
|---|---|---|---|---|
| Register / log in | yes | yes | yes | register and login only |
| See plans | active plans only | all plans | all plans | 401 |
| Request a membership | yes | 403 | 403 | 401 |
| List own memberships | yes | 403 | 403 | 401 |
| Open a membership (someone else's) | 404 | yes | yes | 401 |
| Cancel a PENDING membership | own | any | any | 401 |
| Cancel an ACTIVE membership | 403 | yes | yes | 401 |
| List all memberships and confirm payment | 403 | yes | yes | 401 |
| List and search members | 403 | yes | yes | 401 |
| Open a member profile or photo | own only, others 404 | any | any | 401 |
| Add or hide an internal note | 403 | yes | yes | 401 |
| Delete a member account | 403 | 403 | yes | 401 |
| List and open classes | upcoming scheduled only | all | all | 401 |
| Create, edit, or cancel a class | 403 | yes | yes | 401 |
| View a class roster | 403 | yes | yes | 401 |
| Book a class | yes | 403 | 403 | 401 |
| Cancel a booking | own, until 2 hours before the class | any | any | 401 |
| Add or deactivate a plan | 403 | yes | yes | 401 |
| Add, rename, or deactivate a category or tag | 403 | yes | yes | 401 |
| Delete a category with no children and no classes | 403 | yes | yes | 401 |
| Delete a tag that has no child tags | 403 | yes | yes | 401 |
| Read the activity log | 403 | yes | yes | 401 |

A member who asks for another member's membership, booking, profile, or photo gets 404, not 403, so the record's existence is not revealed.

## 6. Statuses

The stored membership status moves only in these ways. CANCELLED is final.

| From | To | Who |
|---|---|---|
| PENDING | ACTIVE | Staff or admin confirms payment |
| PENDING | CANCELLED | The member, staff, or admin |
| ACTIVE | CANCELLED | Staff or admin |

EXPIRED is not stored. The API shows an ACTIVE membership as EXPIRED when its endDate is before today. A class is SCHEDULED or CANCELLED, and SCHEDULED moves to CANCELLED only. A booking is BOOKED or CANCELLED, and it can go back from CANCELLED to BOOKED when the member books the same class again.

## 7. Data model

| Entity | Main fields | Relations |
|---|---|---|
| User | email, passwordHash, name, role (MEMBER, STAFF, or ADMIN), photoFileName?, photoOriginalName?, photoMimeType?, createdAt | Has many memberships, bookings, and notes as a member. Has many classes as coach and many activity log entries. |
| Plan | name, description?, priceCents, durationDays, active | Has many memberships |
| Membership | memberId, planId, status (PENDING, ACTIVE, or CANCELLED), priceCents, durationDays, startDate?, endDate?, requestedAt, paidAt?, paymentMethod? | Belongs to a member and a plan |
| GymClass | title, description, categoryId, trainerId, startsAt, durationMinutes, capacity, status (SCHEDULED or CANCELLED), createdAt, updatedAt | Belongs to a category and a coach. Has many tags (through ClassTag) and many bookings. |
| Booking | classId, memberId, status (BOOKED or CANCELLED), createdAt, cancelledAt? | Belongs to a class and a member |
| Note | memberId, authorId, body, createdAt, hiddenAt?, hiddenById? | Belongs to a member and a staff author. A hidden note's text is not returned by the API. |
| Category | name, parentId?, active | Optional parent, many children, many classes |
| Tag | name, parentId?, active | Optional parent, many children, many classes (through ClassTag) |
| ClassTag | classId, tagId | Joins a class and a tag |
| ActivityLog | userId?, action, entityType, entityId?, oldValue?, newValue?, createdAt | Optionally belongs to a user. entityId is a plain value, not a foreign key, so an entry survives when its member or class is deleted. |

## 8. Data rules

- A membership always has a valid memberId and planId. priceCents and durationDays are copied from the plan when it is requested and never change after that.
- startDate and endDate are null while a membership is PENDING. After payment, endDate is startDate plus durationDays minus 1.
- A member has at most one PENDING membership, and at most one ACTIVE membership that has not expired.
- A class always has a valid categoryId and trainerId. The coach is a user with role STAFF or ADMIN.
- A class has capacity from 1 to 100, and its BOOKED bookings never exceed capacity.
- Booking is unique on (classId, memberId). Booking again after a cancel sets the same row back to BOOKED.
- photoFileName is null, or it names one image file on disk that matches photoMimeType.
- A note needs a non-empty body of at most 1000 characters, a valid memberId, and a staff or admin author.
- Category.parentId and Tag.parentId are null or a node in the same tree, and a node cannot be its own ancestor.
- ClassTag is unique on (classId, tagId).
- A category delete is rejected while that category has a child or a class. A tag delete is rejected while that tag has a child. A successful tag delete removes its ClassTag rows.
- Permanent member delete is admin only. It removes the member's memberships, bookings, notes, and photo file. Plans, classes, categories, and tags stay.
- ActivityLog rows are never updated or deleted by the app. entityId is not a foreign key.

## 9. Non-functional requirements

| ID | Area | Requirement | How to check |
|---|---|---|---|
| NFR-01 | Security | Passwords are hashed and secrets are not committed. | No plaintext passwords. `.env` is gitignored. |
| NFR-02 | Security | Every protected membership, booking, note, photo, delete, and log action checks role and ownership. | Matches the permissions table. Another member's membership or booking returns 404. |
| NFR-03 | Usability | The UI shows validation errors and empty states clearly. | Forms show field errors. An empty list shows an empty state. A rejected booking or category delete shows the reason. |
| NFR-04 | Reliability | Bad input does not crash the API. | Responses are consistently 400, 401, 403, or 404. |
| NFR-05 | Performance | List endpoints, including the activity log, are paged. | The client sends page and pageSize. The UI has paging controls. |
| NFR-06 | Maintainability | Setup is documented. | The README and `.env.example` are enough to run a fresh clone. |
| NFR-07 | Compatibility | Runs on current Chrome, Firefox, and Safari. | Login and the main booking flows work in each. |
| NFR-08 | Auditability | Every data-changing action leaves a log entry with the old and new values. | After each action in FR-31, one new entry exists. Hiding a note leaves its text in that entry. |
| NFR-09 | Data integrity | A class never has more BOOKED bookings than its capacity, even with simultaneous requests. | A test sends two bookings for the last seat at once: one gets 201 and one gets 400. |

## 10. Build priority

One student builds this, so each part has a priority. Must parts are built first. Could parts are built only if time remains.

| Priority | What |
|---|---|
| Must | Register and login (FR-01 to FR-04, FR-06, FR-07), seed data and README (FR-08), plans and requesting a membership (FR-09 to FR-11), confirming payment (FR-17), class list with filters and paging (FR-12, FR-30), booking with the seat transaction (FR-13), my bookings and cancel (FR-14, FR-15) |
| Should | Members list (FR-16), cancelling memberships (FR-18), class and plan management (FR-21 to FR-25), activity log (FR-31 to FR-33) |
| Could | Profile photo (FR-05), internal notes (FR-19), permanent member delete (FR-20), category and tag management (FR-26 to FR-29) |

The Must items need categories and tags to exist as seeded data, so `GET /categories` and `GET /tags` (read only, from FR-26) belong with the class list.