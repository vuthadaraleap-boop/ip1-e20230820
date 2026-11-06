# Gym Membership

## Problem
Gym members and front-desk staff have no shared place to see plans, payments and class bookings, because staff track them on paper or in spreadsheets. This matters because classes get overbooked, expired members still book, and nobody can tell who changed what.

## Users and roles
- Member: registers, requests a plan, pays at the front desk, books classes and cancels bookings
- Staff: confirms payments, manages classes and plans, looks up members and reads the activity log
- Admin: does everything staff do, and can permanently delete a member account

## User stories
1. As a visitor, I want to register and log in so that I can use the app as a member and only see what my role allows.
   Accepted when: registering creates a MEMBER with a hashed password and the role cannot be set in the request; a correct email and password returns a JWT and a wrong one returns 401; a bad body (missing field, invalid email, password under 8 characters) returns 400.
2. As a member, I want to see the plans and request one so that I can start training once I pay at the desk.
   Accepted when: members see only active plans; a request creates a PENDING membership with no dates that copies the plan's price and duration; a member with a PENDING or unexpired ACTIVE membership gets 400 with the reason; a member can cancel only their own PENDING membership.
3. As a member, I want to find a class and book a seat so that my place is held.
   Accepted when: the timetable lists scheduled classes that have not started, soonest first, with seats left, and can be filtered by category, tag and date range and searched by title, with paging; booking needs an active membership that covers the class date, a free seat and no existing booking, and a broken rule returns 400 with the reason (for example "Class is full."); if two members book the last seat at the same moment, one gets 201 and the other gets 400; without an active membership the Book button is disabled and the page says why.
4. As a member, I want to see my bookings and cancel one so that I can free my seat when my plans change.
   Accepted when: My bookings lists only my bookings, with an upcoming and past filter and paging; I can cancel until 2 hours before the class and later returns 400 ("Too late to cancel."); a cancelled booking frees the seat, and another member's booking returns 404.
5. As staff, I want to find a member, see their history and leave notes the member cannot see, and as an admin I want to permanently delete a member account so that data that should not be kept is removed.
   Accepted when: staff can search members by name or email and open a member's memberships and bookings; staff can add and hide internal notes, and a member calling a notes endpoint gets 403; only an admin can delete a member (204) and staff get 403.
6. As staff, I want to confirm payments and cancel memberships so that every membership is correct.
   Accepted when: staff list memberships by status, with PENDING as the default; confirming a PENDING membership with a payment method (cash, card or bank transfer) makes it ACTIVE with the start date today and the end date start plus duration minus 1; cancelling a PENDING or ACTIVE membership makes it CANCELLED, which is final, and existing bookings stay; a member trying any of this gets 403.
7. As staff, I want to create and change classes and plans so that the timetable and the price list stay correct.
   Accepted when: staff create a class with a valid title, description, category, future start time, duration and capacity, and an invalid body returns 400; staff edit or cancel only a scheduled class that has not started; staff add and deactivate plans, and a member gets 403.
8. As staff, I want to give each class one category and optional tags, and to correct a node added by mistake, so that members can find the right class.
   Accepted when: categories and tags are returned as trees with parentId and active; staff can create, rename, deactivate and delete nodes, and deleting a node that has children (or a category with classes) returns 400; the class form offers only active nodes.
9. As staff, I want to see every action taken in the system, with the old and new values, so that I can tell who changed what.
   Accepted when: each listed action adds one log entry with who, what, the old value, the new value and the time; staff read the log newest first with paging and filters, and a member gets 403; entries cannot be edited or deleted.
10. As a reviewer, I want seeded accounts and clear setup steps so that I can run and grade the app from a fresh clone.
    Accepted when: the seed creates one account per role, three plans, the category and tag trees and upcoming classes; the README explains the env vars, how to run both apps and the test commands; .env is gitignored and a .env.example exists.

## MVP scope
Must have: story 1, 2, 3, 4, 6, 10
Nice to have: story 5, 7, 8, 9
(Stories 6 and 7 start small. The MVP needs only confirming a payment. Cancelling memberships, creating classes from the screens and plan management come after, and classes and plans are seeded for the MVP.)

## Entities
| Entity | Main attributes | Relations |
|---|---|---|
| User | name, email, passwordHash, role (MEMBER, STAFF or ADMIN) | has many Memberships, Bookings and Notes; coaches many GymClasses |
| Plan | name, description, priceCents, durationDays, active | has many Memberships |
| Membership | status (PENDING, ACTIVE or CANCELLED), priceCents, durationDays, startDate, endDate, paidAt, paymentMethod | belongs to one User and one Plan |
| GymClass | title, description, startsAt, durationMinutes, capacity, status (SCHEDULED or CANCELLED) | belongs to one Category and one coach (User); has many Bookings and many Tags |
| Booking | status (BOOKED or CANCELLED), createdAt, cancelledAt | belongs to one GymClass and one User; unique per class and member |
| Category | name, parentId, active | optional parent, many children, many GymClasses |
| Tag | name, parentId, active | optional parent, many children, many GymClasses through ClassTag |
| ClassTag | classId, tagId | joins a GymClass and a Tag |
| Note | body, createdAt, hiddenAt | belongs to one member (User) and one staff author (User) |
| ActivityLog | action, entityType, entityId, oldValue, newValue, createdAt | optionally belongs to a User |

## Stretch feature
File upload.
What it does in this app: at registration a member can add one optional profile photo (png, jpg, jpeg or webp, at most 2 MB). The server saves it on disk under a generated name. Only that member, staff and admins can see it, and another member gets 404.

## Repository
https://github.com/vuthadaraleap-boop/ip1-e20230820