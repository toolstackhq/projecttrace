# Users and Auth

ProjectTrace uses a simple role model.

## Roles

- `ADMIN`
- `EDITOR`

## What admins can do

- create users
- delete records
- unlink requirements from test cases or bugs
- manage the workspace safely

## What editors can do

- create and update projects, planning items, test cases, test runs, bugs, and comments
- view user and ownership information
- use the app without delete permissions

## Create the first user

If no users exist yet, the login screen becomes a bootstrap screen.

Steps:

1. Open the login page.
2. Enter a name, email, and password.
3. Submit the form.
4. The first account becomes an admin automatically.

## Create more users

Once an admin exists:

1. Log in as an admin.
2. Open `System -> Users`.
3. Click `Create user`.
4. Enter a name, email, password, and role.

## Notes

- The frontend stores the JWT token locally.
- If the session expires, the UI logs out automatically after the next unauthorized request.
