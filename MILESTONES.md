# Milestones

## M0 Proposal (week 3)

### Explain: Which story did you cut from the MVP, and why?

I cut story 8, the screens for managing the category tree and the tag tree, from the MVP. The classes still need categories and tags for the filters, so I seed them in the database and members and staff only read them. Managing them needs extra rules (no loops, hiding inactive nodes, and checks before delete) and adds many screens, but the main flow of requesting a plan, paying at the desk and booking a class works without them.

### Explain: Why did you choose file upload as your stretch feature?

The profile photo upload touches the whole stack without changing the main flow: a file field in the register form, validation of the type and size on the server, saving the file on disk, and a rule about who may see it. That makes it a good test of file handling and access control. It is also safe to leave for last, because the app works without it and nothing else depends on it.

### Explain: How do your entities relate, and which one is the centre of the app?

The Membership is the centre, because it joins a User and a Plan and decides whether a member may book. A GymClass belongs to one Category and one coach, and a Booking joins one member to one class, with only one booking allowed per member and class. A Membership copies the price and duration from the Plan when it is requested, so later plan changes never alter old memberships.

## M1 Frontend prototype (week 5)

Tag: `m1`

To run it: `cd frontend`, `npm install`, `npm run dev`, then open http://localhost:5173. The test accounts are `member@gym.test` (active membership), `new@gym.test` (no membership), `staff@gym.test` and `admin@gym.test`. The mock accepts any password of 8 or more characters.


### Explain: What state lives in the store and what stays inside a component? Why?

The stores hold the state that more than one screen needs, or that must survive a change of page. The auth store holds the logged-in user and role, because the top bar, the route guard and the other stores all read it. The classes store holds the timetable and its search and category filter, so the filters are still set when I come back from a class page. The memberships and bookings stores hold my memberships and bookings, because the class page needs them to decide if the Book button is enabled, and the plans and bookings pages list them. Values that can be worked out from this state, such as the current active membership, are computed from it and not copied.

A component keeps the state that only matters while its screen is open: the text typed in a form, its validation messages, the "submitting" flag, the message after a button click such as "Class is full.", and the payment method chosen in each row of the staff table. Nobody else needs these, and they should disappear when the page is closed. My rule is that if a value must be shared between screens or must survive navigation it goes in a store, and if it dies with the screen it stays in the component. The stores never fetch data themselves. They call the service layer, so in M3 only the services change when the real API replaces the mock.

I kept the mock login simple on purpose: any password of 8 or more characters works for a known email, and no passwords are stored. The real hashing and JWT come in M2 and M3, and I will choose where to store the token then.