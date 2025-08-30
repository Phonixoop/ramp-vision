# Personnel Performance Components

This directory contains the modular components for the Personnel Performance page, organized for better maintainability and reusability.

## Component Structure

### 1. PersonnelPerformanceTable.tsx

**Main table component** that orchestrates all other components and manages the overall state.

**Responsibilities:**

- Manages API queries and data fetching
- Handles state management for filters and data
- Coordinates between different components
- Renders the main table with all its features

**Props:**

- `sessionData`: User session information

### 2. PersonnelPerformanceColumns.tsx

**Table columns configuration** that defines all columns, their filters, and formatting.

**Responsibilities:**

- Defines all table columns with their properties
- Implements column-specific filters
- Handles column formatting and calculations
- Manages footer calculations for numeric columns

**Key Features:**

- Performance metrics columns (Total, Direct, Indirect)
- Document processing columns
- Date and reporting period columns
- Interactive filters for each column type

### 3. PersonnelPerformanceFilters.tsx

**Date and period filters** component for selecting reporting periods.

**Responsibilities:**

- Date picker for selecting report periods
- Report period type selection (Daily, Weekly, Monthly)
- Handles date formatting and validation

**Props:**

- `filters`: Current filter state
- `reportPeriod`: Current report period
- `setReportPeriod`: Function to update report period
- `setDataFilters`: Function to update filters
- `getLastDate`: API query for last available date

### 4. PersonnelPerformanceExport.tsx

**CSV export functionality** for downloading data in different formats.

**Responsibilities:**

- Complete data export (all records)
- Filtered data export (current view)
- Handles date formatting for different period types
- Generates proper CSV headers

**Props:**

- `flatRows`: Current filtered rows
- `columns`: Table column definitions
- `personnelPerformance`: Performance data
- `filters`: Current filter state
- `toggleDistinctData`: Data view mode
- `distincedData`: Distinct data set

### 5. PersonnelPerformanceSummary.tsx

**Summary charts and statistics** component displaying performance insights.

**Responsibilities:**

- Role distribution bar chart
- Performance gauge visualization
- Data view toggle (Distincted vs Pure)
- Performance metrics calculations

**Props:**

- `flatRows`: Current filtered rows
- `toggleDistinctData`: Current data view mode
- `onToggleDataView`: Function to toggle data view

## Usage

```tsx
import { PersonnelPerformanceTable } from "./components/PersonnelPerformanceTable";

export default function PersonnelPerformancePage() {
  const { data: sessionData } = useSession();

  return (
    <div>
      <PersonnelPerformanceTable sessionData={sessionData} />
    </div>
  );
}
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Reusability**: Components can be easily reused in other parts of the application
3. **Maintainability**: Easier to debug and modify specific functionality
4. **Testing**: Individual components can be tested in isolation
5. **Performance**: Better code splitting and lazy loading opportunities
6. **Type Safety**: Clear interfaces and prop definitions
7. **Documentation**: Self-documenting component structure

## State Management

The main state is managed in `PersonnelPerformanceTable` and passed down to child components as props. This creates a clear data flow and makes the component hierarchy easy to understand.

## API Integration

All API calls are centralized in the main table component, making it easier to manage loading states, error handling, and data transformations.
