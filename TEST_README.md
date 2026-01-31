# Testing Documentation

## Overview

This project uses **Vitest** as the testing framework along with **React Testing Library** for component testing. Tests are organized to cover both unit tests for utility functions and integration tests for key components.

## Test Structure

```
src/test/
├── setup.ts                 # Test configuration and global mocks
├── helpers.test.ts          # Unit tests for lib/helpers.ts
└── ContactsView.test.tsx    # Integration tests for ContactsView component
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with UI viewer
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory and include:
- Text summary in the terminal
- HTML report in `coverage/index.html`
- JSON report for CI/CD integration

## Test Categories

### Unit Tests (`helpers.test.ts`)

Tests for core utility functions in `lib/helpers.ts`:

- **ID Generation**: `generateId()`
- **Formatting Functions**: `formatCurrency()`, `formatNumber()`, `formatDate()`, `formatDateTime()`, `formatRelativeDate()`
- **Date Utilities**: `isOverdue()`, `isDueToday()`
- **Name Utilities**: `getInitials()`, `getFullName()`
- **UI Helpers**: `getStatusColor()`, `getPriorityColor()`
- **Data Manipulation**: `sortByDate()`, `filterBySearch()`
- **Calculations**: `calculateConversionRate()`
- **Validation**: `validateEmail()`, `validatePhone()`
- **Scheduling**: `calculateNextScheduledDate()`, `shouldSendRecurringEmail()`, `formatRecurrencePattern()`
- **Template Variables**: `replaceTemplateVariables()`, `getTemplateVariablePreview()`

**Total**: 60+ unit tests covering all helper functions

### Integration Tests (`ContactsView.test.tsx`)

Tests for the ContactsView component focusing on data flow and persistence:

- **Data Loading**: Verify contacts are loaded from KV store
- **Search Functionality**: Filter by name, email, company, tags
- **Contact Creation**: Add new contacts and save to KV
- **Contact Editing**: Update existing contacts
- **Contact Deletion**: Remove contacts from KV
- **Bulk Actions**: Select multiple contacts, bulk status update, bulk tag assignment
- **Data Persistence**: Verify KV store integration
- **Edge Cases**: Handle missing data, long search terms, special characters

**Total**: 35+ integration tests covering CRUD operations and data persistence

## Key Testing Patterns

### Mocking the Spark KV Hook

```typescript
vi.mock('@github/spark/hooks')

// In beforeEach:
vi.mocked(useKV).mockImplementation((key: string, defaultValue: any) => {
  if (key === 'contacts') {
    return [mockContacts, mockSetContacts, mockDeleteContacts]
  }
  return [defaultValue, vi.fn(), vi.fn()]
})
```

### Testing Data Persistence

```typescript
it('should save contact to KV store', async () => {
  // Trigger save action
  fireEvent.click(saveButton)
  
  // Verify KV setter was called
  await waitFor(() => {
    expect(mockSetContacts).toHaveBeenCalledWith(expect.any(Function))
  })
  
  // Verify data integrity
  const updateFunction = mockSetContacts.mock.calls[0][0]
  const updatedContacts = updateFunction(mockContacts)
  expect(updatedContacts.length).toBeGreaterThan(mockContacts.length)
})
```

### Testing Search and Filtering

```typescript
it('should filter contacts by name', async () => {
  render(<ContactsView />)
  
  const searchInput = screen.getByPlaceholderText(/search/i)
  fireEvent.change(searchInput, { target: { value: 'John' } })
  
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })
})
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for all helper functions
- **Integration Tests**: 80%+ coverage for critical user flows
- **Component Tests**: Focus on user interactions and data persistence

## Best Practices

1. **Descriptive Test Names**: Use clear, behavior-focused test descriptions
   ```typescript
   it('should filter contacts by email', ...)
   it('should persist changes to KV store', ...)
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   // Arrange
   const mockData = [...]
   
   // Act
   fireEvent.click(button)
   
   // Assert
   expect(result).toBe(expected)
   ```

3. **Isolation**: Each test should be independent and not rely on other tests

4. **Mock External Dependencies**: Mock Spark SDK, context providers, and external APIs

5. **Test User Behavior**: Focus on what users do, not implementation details

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```bash
# Run tests with coverage in CI mode
npm run test:ci
```

This command:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Exits with error code if tests fail

## Debugging Tests

### Run a single test file
```bash
npm test helpers.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --grep "Contact Creation"
```

### Debug mode with Chrome DevTools
```bash
npm run test:debug
```

## Future Test Additions

Consider adding tests for:
- **PipelineView**: Drag-and-drop functionality, stage transitions
- **TasksView**: Task creation, completion, filtering
- **EmailsView**: Email sending, scheduling, tracking
- **Dashboard**: Metrics calculations, data aggregation
- **CSV Import/Export**: File handling, data transformation
- **API Integration**: Webhook triggers, API authentication

## Troubleshooting

### Tests fail with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check import paths use the `@/` alias correctly

### Tests timeout
- Increase timeout in vitest.config.ts:
  ```typescript
  test: {
    testTimeout: 10000
  }
  ```

### Mock not working
- Verify mock is defined before component import
- Use `vi.mocked()` for better type safety
- Clear mocks between tests with `vi.clearAllMocks()`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
