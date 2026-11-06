# Milestones

## M0 Proposal (week 3)

### Explain: Which story did you cut from the MVP, and why?

I cut US-08, the screens for managing the category tree and the tag tree, from the MVP. The classes still need categories and tags for the filters, so I seed them in the database and members and staff only read them. Managing them needs extra rules (no loops, hiding inactive nodes, and checks before delete) and adds many screens, but the main flow of requesting a plan, paying at the desk and booking a class works without them.

### Explain: Why did you choose the profile photo as your stretch feature?

The photo upload touches the whole stack without changing the main flow: a file field in the register form, validation of the type and size on the server, saving the file on disk, and a rule about who may see it. That makes it a good test of file handling and access control. It is also safe to leave for last, because the app works without it and nothing else depends on it.

### Explain: How do your entities relate, and which one is the centre of the app?

The Membership is the centre, because it joins a User and a Plan and decides whether a member may book. A GymClass belongs to one Category and one coach, and a Booking joins one member to one class, with only one booking allowed per member and class. A Membership copies the price and duration from the Plan when it is requested, so later plan changes never alter old memberships.