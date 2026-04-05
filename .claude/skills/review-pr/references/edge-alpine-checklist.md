# Edge & Alpine.js Review Checklist

Load this checklist when the PR touches files in `resources/views/` or
`resources/js/`. Pass to agents reviewing template and frontend code.

## Edge Templates

### XSS Prevention

- [ ] User data rendered with `{{ }}` (escaped) not `{{{ }}}` (raw) unless intentional
- [ ] Any use of `{{{ }}}` is justified and the data is sanitized before rendering
- [ ] URL parameters and query strings escaped before insertion into templates
- [ ] Data attributes containing user input are properly escaped

### Component Structure

- [ ] Components use `@component` tag with proper slot patterns
- [ ] Props passed to components are typed or documented
- [ ] Layouts extend properly with `@layout` and `@section`
- [ ] Partials used for repeated markup (`@include`)

### Data Binding

- [ ] Data passed to `view.render('page', data)` matches what the template expects
- [ ] Missing data handled gracefully — no crashes on undefined properties
- [ ] Conditional rendering uses `@if` / `@unless` for optional data
- [ ] Loops use `@each` with proper empty-state handling:
  ```edge
  @each(item in items)
    {{-- render item --}}
  @else
    {{-- empty state --}}
  @end
  ```

### Forms

- [ ] Forms include CSRF token: `@csrfField()`
- [ ] Form `action` attributes use route helpers: `{{ route('name') }}`
- [ ] Validation errors displayed with `@inputError` or flash messages
- [ ] Form values preserved on validation failure (old input)
- [ ] Method spoofing for PUT/DELETE: `@methodField('PUT')`

### Performance

- [ ] Large lists use pagination, not rendering entire collections
- [ ] Static partials that don't change per-request could use caching
- [ ] Images have appropriate sizing/lazy loading attributes

## Alpine.js

### Reactivity

- [ ] `x-data` components have clear, minimal state
- [ ] Complex state logic extracted to reusable Alpine stores or components
- [ ] `x-init` used for async initialization, not `x-data` directly
- [ ] No stale closures in event handlers — Alpine re-evaluates expressions

### Directives

- [ ] `x-show` vs `x-if` used appropriately:
  - `x-show`: toggle visibility, element stays in DOM (good for frequent toggles)
  - `x-if`: conditional render, element removed from DOM (good for heavy content)
- [ ] `x-for` includes `:key` binding for list rendering
- [ ] `x-model` used for two-way binding on form inputs
- [ ] `x-transition` used for meaningful state changes (not decorative noise)

### Event Handling

- [ ] `@click` handlers are concise — complex logic belongs in methods
- [ ] `@submit.prevent` used on forms to prevent default submission
- [ ] Debounce/throttle applied to high-frequency events (scroll, resize, input)
- [ ] Event modifiers used correctly: `.stop`, `.prevent`, `.outside`, `.window`

### Security

- [ ] No inline `eval()` or dynamic code execution
- [ ] User input not interpolated into Alpine expressions
- [ ] `x-html` directive avoided unless data is trusted and sanitized
- [ ] External data fetched via controlled endpoints, not arbitrary URLs

### Accessibility

- [ ] Interactive elements use semantic HTML (`<button>`, `<a>`, not `<div @click>`)
- [ ] Toggle states reflected in `aria-expanded`, `aria-hidden`
- [ ] Focus management on modals/dropdowns (trap focus, restore on close)
- [ ] Keyboard navigation works for custom interactive components
