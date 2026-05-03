# Bugs, Comments, and Activity

Bug tracking is where ProjectTrace feels like a real QA tool.

## Bugs

Bugs capture defects found during testing or production triage.

Typical fields:

- title
- description
- severity
- status
- project
- assignee
- reporter

Severity values:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

Status values:

- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

Steps:

1. Open `Defects -> Bugs`.
2. Click `Create bug`.
3. Select the project.
4. Add severity, status, and assignee.
5. Save.

## Comments

Comments are used for triage notes and collaboration.

Steps:

1. Open a bug detail page.
2. Add a comment from the right-hand panel.
3. Review the comment history in the bug activity trail.

## Linked requirements

Bug detail pages show the requirements associated with the defect.

This helps answer:

- what behavior failed
- which planned work it belongs to
- whether the defect is covered by test cases

## Activity logs

Every important create or update action produces an activity record.

Use it to see:

- who changed a record
- when it changed
- which project it belongs to
