# Workspace styling

`variable.css` holds the shared brand, surface, status, spacing, and radius tokens.
Its Tailwind aliases allow semantic utilities such as `bg-brand` and `text-panel-muted`.
`workspace.css` holds the staff layout and reusable control/table styles. Both files
are imported once by `app/globals.css`.

Use `components/workspace` for the shell, sidebar navigation, header, status tabs,
table, pagination, dialog, toast, and access messages. Keep feature-specific forms
and API actions in their management or moderation modules. `useAuthUser` provides
the shared reactive authentication snapshot.

The shell keeps the staff page within the viewport, leaving its content area
scrollable. Public page layout is unaffected by the staff layout rules. Table
pagination uses `WORKSPACE_PAGE_SIZE`; change it there rather than in each screen.
