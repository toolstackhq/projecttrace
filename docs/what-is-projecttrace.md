# What is ProjectTrace?

ProjectTrace is an enterprise-style QA and delivery tracker.

It is meant to feel like the kind of internal tool a product team would use to keep planning work, test execution, and defect tracking connected.

## Why it exists

The app gives you:

- a real relational data model
- lots of list and detail views
- pagination, search, and filtering
- role-based access for provisioning users
- many-to-many traceability links
- a large seeded dataset for load testing

That makes it useful for learning:

- CRUD workflows
- dashboard aggregation
- linked entity navigation
- API measurement with k6
- browser or API flow simulation with JMeter

## Domain hierarchy

`Project -> Epic -> Feature -> Requirement -> Test Case -> Test Run -> Bug`

## Main areas

- Planning: projects, epics, features, requirements
- Testing: test cases, test runs
- Defects: bugs and comments
- System: users and activity logs

## Authentication model

- The first admin can be created from the login page if the database is empty.
- Admins can provision users.
- Editors can work with day-to-day data but cannot delete records.
- The frontend uses JWT bearer tokens.
