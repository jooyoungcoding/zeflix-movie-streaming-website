# Zeflix — AI Coding & Development Rules

> **IMPORTANT:** These rules are mandatory for every development task in the Zeflix project.
> Do not skip, weaken, reinterpret, or bypass these rules.

---

## 1. Core Principle

The AI must work based on the **actual Zeflix project**, its existing architecture, database design, environment configuration, coding conventions, and existing implementation.

The AI must **never guess** when information is missing, unclear, ambiguous, or potentially affects the system architecture.

### Mandatory rule

> **If you do not understand something with 100% confidence, STOP and ASK before making changes.**

Do not:

* Guess the intended behavior.
* Assume a missing environment variable.
* Assume an API endpoint.
* Assume a database column exists.
* Assume a provider supports a feature.
* Assume a library is installed.
* Assume an existing component works in a certain way.
* Create an alternative implementation without asking.
* Change architecture because it seems "better" without approval.
* Implement something based on an incomplete understanding.

---

# 2. Understand Before Implementing

Before implementing **any feature, modification, refactor, bug fix, or architectural change**, the AI must first inspect the relevant parts of the project.

The AI must understand:

1. Existing folder structure.
2. Existing architecture.
3. Relevant components.
4. Existing API flow.
5. Existing service/controller/repository flow.
6. Relevant database tables and relationships.
7. Existing environment variables.
8. Existing authentication behavior.
9. Existing external APIs/providers.
10. Existing UI patterns.
11. Existing error handling.
12. Existing loading states.
13. Existing performance considerations.

Do not modify code immediately after reading only one or two files.

### Required mindset

```text
Understand
    ↓
Verify
    ↓
Plan
    ↓
Ask if unclear
    ↓
Implement
    ↓
Verify
    ↓
Explain
```

---

# 3. Mandatory Plan Before Implementation

Before implementing a feature or making a significant change, the AI must provide a plan.

The plan must use a table similar to:

| Step | Area     | File / Location | Planned Change | Reason |
| ---- | -------- | --------------- | -------------- | ------ |
| 1    | Database | ...             | ...            | ...    |
| 2    | Backend  | ...             | ...            | ...    |
| 3    | API      | ...             | ...            | ...    |
| 4    | Frontend | ...             | ...            | ...    |
| 5    | UI/UX    | ...             | ...            | ...    |
| 6    | Testing  | ...             | ...            | ...    |

The AI must wait for confirmation when the implementation involves:

* Architecture changes.
* Database schema changes.
* New environment variables.
* New external services.
* New dependencies.
* Authentication changes.
* Playback changes.
* Significant UI/UX changes.
* Changes that may affect existing features.

For small, clearly specified changes that do not affect architecture, implementation may proceed after inspecting the relevant code.

---

# 4. Ask Immediately When Something Is Unclear

If the AI encounters something it does not understand, it must stop and ask.

Examples:

```text
I found process.env.VERCEL_URL in this implementation,
but its purpose is not explicitly defined in the current project configuration.

Before I continue, I need to confirm:

1. Is this variable intended to represent the current Vercel deployment URL?
2. Should it be used only in production?
3. Should localhost remain the development URL?
```

Do not silently decide.

---

# 5. Environment Variables — STRICT RULE

The AI must always inspect the existing `.env`, `.env.local`, `.env.example`, and relevant deployment configuration before introducing or modifying environment variables.

Never invent environment variables.

Never assume where an environment variable comes from.

Never silently add an environment variable.

---

## 5.1 When using an existing environment variable

The AI must explain:

1. What the variable is.
2. Why the code needs it.
3. Where the value comes from.
4. Whether it is development-only, production-only, or both.
5. Whether Vercel requires configuration.
6. Whether the value should be public or server-only.
7. Whether it is already configured.

### Example

If code contains:

```ts
process.env.VERCEL_URL
```

The AI must explain:

* What `VERCEL_URL` represents.
* Why the application uses it.
* Where Vercel provides it.
* Whether it exists automatically in the Vercel environment.
* How it behaves locally.
* Whether `NEXT_PUBLIC_*` is required.
* Whether the code should use another URL for local development.
* What needs to be configured before production deployment.

The AI must not simply insert:

```ts
process.env.VERCEL_URL
```

without explaining its purpose and environment behavior.

---

# 6. New Environment Variables

If a new environment variable is required, STOP and explicitly report it.

Use this format:

| Variable          | Purpose | Required In              | Value Source | Public? |
| ----------------- | ------- | ------------------------ | ------------ | ------- |
| `EXAMPLE_API_URL` | ...     | Development / Production | ...          | Yes/No  |

Then explain:

### Why is it needed?

Explain exactly what functionality requires it.

### Where does the value come from?

Explain whether it comes from:

* Vercel
* Supabase
* TMDB
* Google OAuth
* Another provider
* Local development configuration
* Another source

### What must be done in production?

Explicitly state:

```text
Local:
.env.local
→ add EXAMPLE_API_URL=...

Production:
Vercel → Project → Settings → Environment Variables
→ add EXAMPLE_API_URL
→ select Production
```

Do not assume that adding the variable locally automatically configures production.

---

# 7. Follow the Existing `.env` Configuration

The existing environment configuration is the source of truth.

Before creating a new variable, check whether an existing variable already provides the required information.

Do not create:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_APP_URL
```

if an existing variable already serves the same purpose.

Avoid duplicate environment variables.

---

# 8. Follow the Existing Architecture

The AI must follow the established Zeflix architecture.

The expected application flow is:

```text
UI
 ↓
Client API
 ↓
Next.js Route Handler
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Supabase / Database
```

### Responsibilities

#### UI

Responsible for:

* Rendering.
* User interaction.
* UI state.
* Loading state.
* Error presentation.
* User experience.

UI must not directly access Supabase when the architecture already provides an API layer.

---

#### Client API

Responsible for:

* Calling application API endpoints.
* Request/response communication.

Client API must not contain database queries.

---

#### Route Handler

Responsible for:

* HTTP request/response handling.
* Calling the controller.

Do not put business logic directly into the route handler.

---

#### Controller

Responsible for:

* Request validation.
* Checking required input.
* Handling request-level conditions.
* Calling services.
* Returning appropriate HTTP responses.

---

#### Service

Responsible for:

* Application/business flow.
* Calling repository functions.

The service must not directly write Supabase queries.

---

#### Repository

Responsible for:

* Database access.
* Supabase queries.
* CRUD operations.
* Database-specific operations.

The repository is the designated layer for database queries.

---

# 9. Database Rules

Before changing database-related code, inspect:

1. Existing schema.
2. Primary keys.
3. Foreign keys.
4. Unique constraints.
5. Indexes.
6. Nullable fields.
7. Relationships.
8. Existing triggers.
9. Existing constraints.
10. Existing data assumptions.

Do not modify the database simply because a different schema appears cleaner.

The existing database architecture must be respected unless the user explicitly requests a schema change.

---

# 10. IDs and Database Relationships

Follow the existing Zeflix ID conventions.

Use internal IDs for database relationships.

Use external IDs such as:

```text
tmdb_id
imdb_id
```

for external provider integration.

Do not replace internal relational IDs with external provider IDs unless explicitly requested.

---

# 11. Do Only What Was Requested

This is a strict rule.

> **Do not implement additional features that were not requested.**

If the user asks:

> "Fix the movie loading issue."

Do not additionally:

* Redesign the movie page.
* Change the database.
* Refactor unrelated services.
* Change the authentication flow.
* Replace the playback provider.
* Add caching.
* Change UI components unrelated to the issue.

If you discover another problem, report it separately.

Example:

```text
I found another unrelated issue in MovieCard.tsx.

I have NOT changed it because it is outside the requested task.

If you want, I can investigate it separately.
```

---

# 12. Do Not Perform Unrequested Refactoring

Do not refactor code simply because:

* You prefer another coding style.
* Another architecture seems cleaner.
* A component could theoretically be reusable.
* A function could be shortened.
* A different library might be better.
* A different naming convention seems preferable.

Existing code should remain unchanged unless it is relevant to the requested task.

---

# 13. Code Language Rule

### Code must be 100% English.

This includes:

* Variable names.
* Function names.
* Class names.
* Component names.
* File names.
* Folder names.
* Types.
* Interfaces.
* Enum values.
* Database identifiers where applicable.
* Comments.
* Error messages inside code.
* Log messages.
* API response messages.
* UI text defined in code.

Do not write Vietnamese inside source code.

### Example

Incorrect:

```ts
const tenPhim = ...
// Lấy thông tin phim
```

Correct:

```ts
const movieTitle = ...
// Get movie information
```

---

# 14. Human ↔ AI Conversation Language

The conversation between the AI and the human developer must be in **Vietnamese**.

Therefore:

```text
Source code      → English
Comments         → English
Code identifiers → English
Conversation     → Vietnamese
```

This rule applies to every development task.

---

# 15. Success Notifications — STRICTEST RULE

> **Successful operations must NEVER use Toast notifications.**

This is a mandatory system-wide rule.

The following must NOT be used to communicate successful operations:

```text
toast.success(...)
```

```text
Toast
```

```text
Success toast
```

```text
Temporary success message
```

or any equivalent success notification system.

---

# 16. Remove the Existing Toast Success System

The AI must remove success-toast usage from the Zeflix system.

Do not simply replace:

```ts
toast.success("Movie added successfully");
```

with another toast library.

Success should normally be communicated through the UI itself.

---

# 17. Failure Notifications

Failure/error situations may use the application's custom notification component.

Examples:

```text
Network failure
API failure
Authentication failure
Invalid input
Playback failure
Database failure
Unexpected error
```

These should be communicated clearly to the user.

---

# 18. Custom Notification Component

Zeflix should use a custom notification component rather than relying on success toast notifications.

The component should be designed according to the existing Zeflix UI system.

For example:

```text
components/
└── feedback/
    └── notification/
        ├── notification.tsx
        └── ...
```

The exact location must follow the existing project structure.

The AI must inspect the project before deciding the final location.

The notification component should primarily handle:

```text
ERROR
WARNING
INFO
```

rather than success toasts.

---

# 19. How to Communicate Successful Actions

Successful operations should normally be reflected directly in the UI.

Examples:

### Favorite

Instead of:

```text
✓ Added to favorites
```

through a toast:

Change:

```text
♡
```

to:

```text
♥
```

and update the button state.

---

### Save profile

Instead of:

```text
Profile updated successfully
```

through a toast:

Update the displayed profile information immediately.

---

### Follow / Subscribe

Instead of:

```text
Successfully subscribed
```

through a toast:

Change the button:

```text
Subscribe
```

to:

```text
Subscribed
```

---

### Download

Instead of:

```text
Download started successfully
```

through a toast:

Update the UI:

```text
Downloading...
```

then:

```text
Downloaded
```

where appropriate.

---

# 20. UI/UX Is Part of Implementation

A feature is NOT considered complete merely because:

```text
The function works.
```

The implementation must also consider:

* UI quality.
* Visual consistency.
* Responsive design.
* Accessibility.
* Loading states.
* Empty states.
* Error states.
* Interaction feedback.
* Performance.
* Network behavior.
* Error recovery.
* User experience.

The implementation must fit the existing Zeflix visual language.

Do not create a technically working feature that looks disconnected from the rest of Zeflix.

---

# 21. Performance

Every implementation must consider performance.

Check where relevant:

* Unnecessary API calls.
* Duplicate requests.
* Excessive re-renders.
* Large client components.
* Server/client boundaries.
* Image loading.
* Lazy loading.
* Caching.
* Database queries.
* Query frequency.
* Pagination.
* N+1 queries.
* Unnecessary data fetching.
* Bundle size.

Do not introduce performance optimizations blindly.

If optimization changes architecture or behavior, explain it and ask before implementing.

---

# 22. User Experience

The AI must consider the complete user flow.

For every feature, consider:

```text
Initial state
     ↓
Loading
     ↓
Success
     ↓
Failure
     ↓
Retry / Recovery
```

The UI should never leave the user wondering whether an action is still running.

---

# 23. Existing Design System

Before creating new UI components, inspect existing:

* Buttons.
* Inputs.
* Cards.
* Modal/dialog components.
* Typography.
* Colors.
* Spacing.
* Icons.
* Loading states.
* Error states.
* Responsive patterns.

Reuse existing components when appropriate.

Do not create duplicate components unnecessarily.

---

# 24. Do Not Break Existing Functionality

Before changing an existing component or service, determine what currently depends on it.

Check:

```text
Who imports this?
Who calls this?
Which pages use this?
Which API uses this?
Which database operation depends on this?
```

After making changes, verify that existing functionality remains intact.

---

# 25. Implementation Progress Must Be Explained

After completing each meaningful step, explain what was done.

Example:

```text
Đã hoàn thành bước 1:

- Đã kiểm tra playback architecture.
- Đã xác định request đi qua PlaybackController.
- Đã tìm thấy provider configuration.
- Chưa thay đổi code.

Tiếp theo tôi sẽ xử lý ...
```

Do not wait until the entire project is changed before explaining what happened.

---

# 26. Explain Important Technical Decisions

Whenever implementation introduces something that may not be obvious, explain:

```text
What?
Why?
Where?
How?
Production impact?
```

Example:

```text
Tôi sử dụng process.env.VERCEL_URL vì cần xác định deployment URL
của Vercel.

Local development:
- VERCEL_URL có thể không tồn tại.
- Vì vậy local cần fallback về localhost.

Production:
- Vercel cung cấp VERCEL_URL trong môi trường deployment.
- Không cần tự tạo NEXT_PUBLIC_VERCEL_URL nếu không có yêu cầu khác.
```

The exact explanation must be based on the actual project configuration and current platform behavior, not assumptions.

---

# 27. Production Checklist

Whenever a change affects production, explicitly report:

### Environment

```text
[ ] New environment variables?
[ ] Existing environment variables changed?
[ ] Vercel configuration required?
```

### Database

```text
[ ] Migration required?
[ ] New table?
[ ] New column?
[ ] New index?
[ ] New constraint?
[ ] Trigger affected?
```

### External Services

```text
[ ] Supabase configuration?
[ ] TMDB configuration?
[ ] Google OAuth configuration?
[ ] Playback provider configuration?
[ ] Other provider configuration?
```

### Deployment

```text
[ ] Build changes?
[ ] Runtime changes?
[ ] Production-only behavior?
[ ] Callback/redirect URL changes?
```

---

# 28. Never Hide Production Requirements

If a feature works locally but requires additional production configuration, the AI must explicitly state it.

Never say:

```text
Done.
```

when production configuration is still required.

Instead:

```text
Local implementation is complete.

Production still requires:
1. ...
2. ...
3. ...
```

---

# 29. Testing Before Reporting Completion

Before saying a task is complete, verify the relevant behavior.

Depending on the task:

```text
TypeScript
↓
Build
↓
API
↓
Database
↓
UI
↓
Error handling
↓
Responsive behavior
```

Do not claim something is working if it has not been verified.

If verification cannot be performed, explicitly state:

```text
Phần này chưa thể verify trong môi trường hiện tại.
```

---

# 30. Completion Report

After implementation, provide:

### What was changed

```text
- ...
- ...
- ...
```

### Files changed

```text
- ...
- ...
- ...
```

### Database changes

```text
None
```

or explain exactly what changed.

### Environment changes

```text
None
```

or explain exactly what needs to be added.

### Production requirements

```text
None
```

or provide the required deployment steps.

### Verification

```text
- Build: ...
- Feature: ...
- Error handling: ...
- UI: ...
```

---

# 31. Final Mandatory Rules

The following rules have the highest priority within this document:

### Rule 1

> **Do not guess. If you do not understand, ask immediately.**

### Rule 2

> **Read and understand the relevant project before implementing.**

### Rule 3

> **Provide a plan before significant implementation.**

### Rule 4

> **Do exactly what the user requests. Do not implement unrelated changes.**

### Rule 5

> **Follow the existing Zeflix architecture and database design.**

### Rule 6

> **Never introduce a new environment variable without explaining its purpose, source, and production configuration.**

### Rule 7

> **Code must be 100% English.**

### Rule 8

> **Human ↔ AI conversation must be Vietnamese.**

### Rule 9

> **Never use success toast notifications.**

### Rule 10

> **Success should normally be represented through UI state, not a temporary success message.**

### Rule 11

> **Errors may use the custom Zeflix notification component.**

### Rule 12

> **A feature is not complete merely because it works. UI, UX, performance, responsiveness, maintainability, and architecture must also be considered.**

### Rule 13

> **Explain important changes and production requirements.**

### Rule 14

> **Never report success before verification.**

---

# AI Development Philosophy

The AI must behave like a careful engineer working on an existing production-oriented system.

The goal is NOT:

```text
Make the feature work as quickly as possible.
```

The goal is:

```text
Understand the system
        ↓
Understand the requirement
        ↓
Identify dependencies
        ↓
Plan
        ↓
Ask when unclear
        ↓
Implement exactly the requirement
        ↓
Respect architecture
        ↓
Respect database
        ↓
Respect .env
        ↓
Consider UI / UX
        ↓
Consider performance
        ↓
Verify
        ↓
Explain
```

**Never guess.
Never silently change architecture.
Never silently add environment variables.
Never implement outside the requested scope.
Never use success toasts.
Always ask when something is unclear.**
