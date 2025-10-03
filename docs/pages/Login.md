# Login Module

## Overview

The Login module provides user authentication functionality, including form state management, client-side validation, error handling, loading state, and navigation upon successful login.

## Components

- **LoginForm**: Main form component for rendering the login UI
- **useLoginForm**: Hook for encapsulating form logic
- **LoginErrorBoundary**: Error handling for login failures

## Features

- User authentication with form validation
- Integration with UIContext for loading state
- API submission via submitLoginForm
- Accessibility features (ARIA labels, skip links)
- Unit tests covering validation, loading, error, and navigation scenarios

## File Structure

```
src/pages/Login/
├─ index.tsx        # Entry point rendering LoginForm
├─ LoginForm.tsx    # Main form component
├─ styles.css       # Module-specific styles
```

## LoginForm Component

### Responsibilities

- Render email and password fields with ARIA labels and icons
- Display validation errors and submission errors
- Manage "Remember me" and "Remember device" checkboxes
- Handle form submission, loading state, and navigation

### Key Hooks & State

- `useLoginForm` for `formData`, `errors`, `loading`, `handleChange`, `handleSubmit`
- `UIContext` for `loading` state

## useLoginForm Hook

### API

```ts
const { formData, errors, loading, handleChange, handleSubmit } =
  useLoginForm();
```

- `formData`: contains `email`, `password`, `rememberMe`, `rememberDevice`
- `errors`: object with possible `email`, `password`, `submit` messages
- `loading`: boolean, indicates API call in progress
- `handleChange`: function to update form fields
- `handleSubmit`: function to validate and submit form

## Validation Rules

- Email is required and must match pattern `/\S+@\S+\.\S+/`
- Password is required and must be at least 8 characters

## Testing

Tests located in `src/__tests__/login/login.test.tsx`:

- Validation errors for empty fields and short passwords
- Loading state disables button and shows loading text
- Submission error displays retry option
- Successful submission navigates to `/home`

## Integration

The login page integrates with the authentication system and redirects users to the main application upon successful login.
