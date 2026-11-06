# Gym Membership: Proposal (M0)

Student: VUTHA DARALEAP (e20230820), group I3-GIC-B. Full specification: `docs/SPEC.md`.

## 1. Problem

Gym staff keep payments and class lists on paper or in spreadsheets, so classes get overbooked and expired members still book. Members have no simple way to see their plan, book a class, or check when their membership ends.

**Target users and roles**

| Role | What they do |
|---|---|
| Member | Registers, requests a plan, books and cancels classes |
| Staff | Confirms payments, manages classes and plans, reads the activity log |
| Admin | Does everything staff do, and can permanently delete a member |

## 2. User stories

These are the same 10 stories as in `docs/SPEC.md`.

1. **US-01** As a visitor, I want to register and log in, so that I can use the gym app as a member, and only see what my role allows.
2. **US-02** As a member, I want to see the plans and request one, so that I can start training once I pay at the desk.
3. **US-03** As a member, I want to find a class and book a seat, so that my place is held.
4. **US-04** As a member, I want to see my bookings and cancel one, so that I can free my seat when my plans change.
5. **US-05** As staff, I want to find a member, see their history and leave notes the member cannot see. As an admin, I want to permanently delete a member account that should not be kept.
6. **US-06** As staff, I want to confirm payments and cancel memberships, so that every membership is correct.
7. **US-07** As staff, I want to create and change classes and plans, so that the timetable and the price list stay correct.
8. **US-08** As staff, I want to give each class one category and optional tags, and to correct a node added by mistake, so that members can find the right class.
9. **US-09** As staff, I want to see every action taken in the system, with the old and new values, so that I can tell who changed what.
10. **US-10** As a reviewer, I want seeded accounts and clear setup steps, so that I can run and grade the app from a fresh clone.

### Acceptance criteria for the 3 most important stories

**US-02: Plans and requesting a membership**
- Members see only active plans. Staff and admins see all plans.
- A member can request a plan. The new membership has status PENDING, and no start or end date yet. It copies the plan's price and duration at that moment.
- An unknown or inactive plan returns 400.
- A member who already has a PENDING membership, or an ACTIVE one that has not expired, gets 400 with the reason.
- A member can cancel their own PENDING membership. Any other status returns 400.

**US-03: Browse classes and book**
- The timetable lists SCHEDULED classes that have not started, soonest first, with seats left and whether I have booked it.
- I can filter by category, tag and date range, and search by title. Results are paged, and an empty result shows an empty state.
- Booking needs an ACTIVE membership that has not expired and covers the class date, a class that has not started, a free seat, and no existing booking for that class.
- A broken rule returns 400 with a clear reason, for example "Class is full." A valid booking returns 201. Staff and admins get 403.
- If two members book the last seat at the same moment, one gets 201 and the other gets 400.
- Without an active membership, the Book button is disabled and the page says why.

**US-06: Memberships queue**
- Staff and admins list all memberships, filter by status, and page. The default view is PENDING.
- To confirm payment on a PENDING membership, staff choose a payment method (CASH, CARD or BANK_TRANSFER). The membership becomes ACTIVE. The start date is today, and the end date is the start date plus the duration in days minus 1. Any other status returns 400.
- Staff and admins can cancel a PENDING or ACTIVE membership. It becomes CANCELLED and stays CANCELLED. Existing bookings are not removed.
- A member trying any of these actions gets 403.

## 3. MVP scope

**Must-have (the MVP)**
- Register and log in with a JWT, with the roles member, staff and admin (US-01)
- See the plans and request a membership (US-02)
- Staff confirm payment (US-06)
- Class list with search, filters and paging, and class detail (US-03)
- Book a class, with the seat check done in one transaction (US-03)
- My bookings, and cancel up to 2 hours before the class (US-04)
- Seeded accounts, plans, categories and classes, and a README (US-10)

**Nice-to-have (after the MVP)**
- Cancel memberships and the members list (US-05, US-06)
- Create, edit and cancel classes, and add or deactivate plans (US-07)
- Activity log (US-09)
- Internal notes and permanent member delete (US-05)
- Add, rename and delete categories and tags from the screens (US-08)
- Profile photo at registration (the stretch feature)

## 4. Entities

| Entity | Main attributes | Relations |
|---|---|---|
| User | email, passwordHash, name, role (MEMBER, STAFF or ADMIN) | Has many memberships, bookings and notes as a member. Coaches many classes. |
| Plan | name, description, priceCents, durationDays, active | Has many memberships |
| Membership | status (PENDING, ACTIVE or CANCELLED), priceCents, durationDays, startDate, endDate, paidAt, paymentMethod | Belongs to one member and one plan |
| GymClass | title, description, startsAt, durationMinutes, capacity, status (SCHEDULED or CANCELLED) | Belongs to one category and one coach. Has many bookings and many tags. |
| Booking | status (BOOKED or CANCELLED), createdAt, cancelledAt | Belongs to one class and one member. Unique per class and member. |
| Category | name, parentId, active | Optional parent, many children, many classes |
| Tag | name, parentId, active | Optional parent, many children, many classes through ClassTag |
| ClassTag | classId, tagId | Joins a class and a tag |
| Note | body, createdAt, hiddenAt | Belongs to one member and one staff author |
| ActivityLog | action, entityType, entityId, oldValue, newValue, createdAt | Optionally belongs to a user |

## 5. Stretch feature

**Profile photo upload at registration (part of US-01).** A member can add one optional photo (png, jpg, jpeg or webp, at most 2 MB). The server saves it on disk under a generated name. Only that member, staff and admins can see it, and another member gets 404.

## 6. Out of scope

Online payment, refunds and invoices, email or SMS, freezing or renewing a membership, check-in with QR codes, waitlists and personal training, and real-time updates.