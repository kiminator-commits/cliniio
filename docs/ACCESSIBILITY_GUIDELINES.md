# Accessibility Guidelines for Cliniio 3.0

## Overview

This document outlines the accessibility standards and implementation guidelines for the Cliniio 3.0 application, with a focus on the Home page and overall user experience.

## WCAG 2.1 AA Compliance

The application aims to meet WCAG 2.1 AA standards across all pages and components.

## Key Accessibility Features

### 1. Keyboard Navigation

#### Skip Links

- **Implementation**: Skip link at the top of each page
- **Target**: Main content area (`#main-content`)
- **Usage**: Press Tab to focus, Enter to activate

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black p-2 z-50 rounded shadow-lg"
  aria-label="Skip to main content"
>
  Skip to main content
</a>
```

#### Focus Management

- **Menu Button**: Proper focus indicators with `focus:ring` classes
- **Drawer Navigation**: Focus moves to main content when drawer opens
- **Modal Dialogs**: Focus trapped within modal when open

### 2. Semantic HTML Structure

#### Landmarks

- `<main>`: Main content area
- `<header>`: Page header with navigation
- `<nav>`: Navigation menus
- `<section>`: Content sections
- `<aside>`: Sidebar content

#### ARIA Roles

- `role="application"`: Main application container
- `role="banner"`: Page header
- `role="navigation"`: Navigation menus
- `role="main"`: Main content
- `role="region"`: Content regions
- `role="status"`: Status messages

### 3. Screen Reader Support

#### ARIA Labels

- **Buttons**: Descriptive labels with context
- **Icons**: Hidden from screen readers with `aria-hidden="true"`
- **Interactive Elements**: Clear, descriptive labels

```tsx
<button
  aria-label="Open main navigation menu"
  aria-expanded={drawerOpen}
  aria-controls="drawer-menu"
  aria-haspopup="true"
>
  <FaBars aria-hidden="true" />
</button>
```

#### Live Regions

- **Status Messages**: `aria-live="polite"` for non-critical updates
- **Error Messages**: `aria-live="assertive"` for critical errors
- **Loading States**: `role="status"` for progress indicators

### 4. Color and Contrast

#### Focus Indicators

- **Visible Focus**: All interactive elements have visible focus states
- **High Contrast**: Focus rings meet 3:1 contrast ratio
- **Consistent Styling**: Focus indicators match component themes

#### Color Usage

- **Not Color-Only**: Information is not conveyed by color alone
- **Sufficient Contrast**: Text meets 4.5:1 contrast ratio
- **Large Text**: Large text meets 3:1 contrast ratio

### 5. Form Accessibility

#### Labels and Descriptions

- **Associated Labels**: All form controls have associated labels
- **Descriptive Text**: Help text and error messages are properly associated
- **Field Groups**: Related fields are grouped with `fieldset` and `legend`

#### Validation

- **Real-time Feedback**: Validation errors are announced to screen readers
- **Clear Messages**: Error messages are specific and actionable
- **Success Indicators**: Success states are clearly communicated

## Home Page Specific Guidelines

### 1. Layout Structure

```tsx
<div role="application" aria-label="Cliniio Home Dashboard">
  {/* Skip Link */}
  <a href="#main-content">Skip to main content</a>

  {/* Navigation Drawer */}
  <DrawerMenu />

  {/* Main Content */}
  <main role="main" id="main-content">
    {/* Header */}
    <header role="banner">
      <nav role="navigation" aria-label="Dashboard actions">
        {/* Action Buttons */}
      </nav>
    </header>

    {/* Content Sections */}
    <section role="region" aria-label="Dashboard content">
      {/* Task Sections */}
      {/* Metrics Sections */}
      {/* Gamification Sections */}
    </section>
  </main>
</div>
```

### 2. Interactive Elements

#### Menu Button

- **Keyboard Accessible**: Tab navigation and Enter/Space activation
- **ARIA Attributes**: Proper state management
- **Focus Management**: Focus moves appropriately when drawer opens

#### Feature Buttons

- **Descriptive Labels**: Include both action and purpose
- **Keyboard Navigation**: Full keyboard support
- **Visual Feedback**: Clear hover and focus states

#### Task Items

- **Checkbox Labels**: Associated with task descriptions
- **Status Indicators**: Clear completion status
- **Priority Indicators**: Visual and text-based priority levels

### 3. Content Organization

#### Task Sections

- **Clear Headings**: Proper heading hierarchy (h1, h2, h3)
- **Grouped Content**: Related tasks are visually and semantically grouped
- **Status Announcements**: Changes are announced to screen readers

#### Metrics Display

- **Data Tables**: Proper table markup for data presentation
- **Chart Alternatives**: Text descriptions for chart data
- **Progress Indicators**: Clear progress communication

## Testing Guidelines

### 1. Automated Testing

#### Jest-Axe Integration

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Testing Library Queries

- **Role-based Queries**: Use `getByRole`, `getAllByRole`
- **Label-based Queries**: Use `getByLabelText`, `getByText`
- **Semantic Queries**: Use `getByHeading`, `getBySection`

### 2. Manual Testing

#### Keyboard Navigation

1. **Tab Navigation**: All interactive elements are reachable
2. **Enter/Space Activation**: All buttons respond to keyboard
3. **Arrow Key Navigation**: Lists and menus support arrow keys
4. **Escape Key**: Modals and menus can be closed

#### Screen Reader Testing

1. **NVDA (Windows)**: Test with NVDA screen reader
2. **VoiceOver (Mac)**: Test with VoiceOver
3. **JAWS (Windows)**: Test with JAWS screen reader

#### Visual Testing

1. **High Contrast Mode**: Test in Windows high contrast mode
2. **Zoom Testing**: Test at 200% zoom
3. **Color Blindness**: Test with color blindness simulators

## Common Accessibility Issues and Solutions

### 1. Missing ARIA Labels

**Issue**: Interactive elements lack descriptive labels
**Solution**: Add `aria-label` or associate with visible labels

### 2. Poor Focus Management

**Issue**: Focus moves unexpectedly or gets lost
**Solution**: Implement proper focus management with `useEffect` and refs

### 3. Color-Only Information

**Issue**: Information conveyed only through color
**Solution**: Add text labels, icons, or patterns

### 4. Insufficient Contrast

**Issue**: Text doesn't meet contrast requirements
**Solution**: Use color contrast checkers and adjust colors

### 5. Missing Keyboard Support

**Issue**: Interactive elements not keyboard accessible
**Solution**: Add `onKeyDown` handlers and proper `tabIndex`

## Development Workflow

### 1. Component Development

1. **Plan Accessibility**: Consider accessibility during design
2. **Implement Semantics**: Use proper HTML elements and ARIA
3. **Test Keyboard Navigation**: Ensure full keyboard support
4. **Add Tests**: Include accessibility tests in component tests

### 2. Code Review

1. **Accessibility Checklist**: Review against accessibility checklist
2. **Screen Reader Testing**: Test with screen reader
3. **Keyboard Testing**: Verify keyboard navigation
4. **Automated Testing**: Run jest-axe tests

### 3. Continuous Integration

1. **Automated Tests**: Include accessibility tests in CI
2. **Linting**: Use ESLint accessibility plugins
3. **Monitoring**: Monitor accessibility violations

## Resources

### Tools

- **axe-core**: Automated accessibility testing
- **jest-axe**: Jest integration for axe-core
- **@testing-library/jest-dom**: Additional matchers
- **Lighthouse**: Performance and accessibility auditing

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

### Testing Tools

- **NVDA**: Free screen reader for Windows
- **VoiceOver**: Built-in screen reader for Mac
- **Color Contrast Analyzer**: Tool for checking contrast ratios

## Maintenance

### Regular Audits

- **Monthly Reviews**: Conduct accessibility audits
- **User Feedback**: Collect feedback from users with disabilities
- **Tool Updates**: Keep accessibility testing tools updated

### Training

- **Developer Training**: Regular accessibility training for developers
- **Design Reviews**: Include accessibility in design reviews
- **Documentation Updates**: Keep guidelines current

This document should be reviewed and updated regularly to ensure continued compliance with accessibility standards and best practices.
