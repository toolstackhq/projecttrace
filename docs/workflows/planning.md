# Planning Workflow

Planning work in ProjectTrace follows this chain:

`Project -> Epic -> Feature -> Requirement`

## Epics

Epics group related delivery work inside a project.

Create one when you want to organize a larger business outcome.

Steps:

1. Open `Planning -> Epics`.
2. Click `Create epic`.
3. Choose the project.
4. Enter a title, description, owner, and status.

## Features

Features sit under epics and split the work into smaller deliverable chunks.

Steps:

1. Open `Planning -> Features`.
2. Click `Create feature`.
3. Select the parent epic and project.
4. Fill in the title, status, and owner.

## Requirements

Requirements are the traceable statements you later connect to test cases and bugs.

Steps:

1. Open `Planning -> Requirements`.
2. Click `Create requirement`.
3. Select the project and feature.
4. Set the priority and status.
5. Save.

## Linking behavior

- A requirement can link to many test cases.
- A requirement can link to many bugs.
- The detail view shows the linked records and activity trail.

## Practical rule

Keep the hierarchy consistent:

- Project owns the planning scope.
- Epic groups the outcome.
- Feature narrows the implementation.
- Requirement describes the behavior to validate.
