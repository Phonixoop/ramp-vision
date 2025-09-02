# Personnels Dashboard Components

This directory contains the clean, organized component structure for the Personnels dashboard page, following the same pattern as the Personnel Performance table.

## Component Structure

### Main Components

- **PersonnelsTable.tsx** - Main table component with personnel management functionality
- **PersonnelsColumns.tsx** - Table column definitions with filters
- **PersonnelsFilters.tsx** - Filter components container
- **CityLevelTabs.tsx** - City level selection tabs
- **TableFilterSkeleton.tsx** - Loading skeleton components

### Filter Components

- **filter-components/cityName.tsx** - City name filter with CityLevelTabs integration

### Features

- ✅ Clean separation of concerns
- ✅ Reusable filter components
- ✅ Loading skeletons for better UX
- ✅ City level tabs for region-based filtering
- ✅ Personnel day-off management
- ✅ Excel export functionality
- ✅ User access controls

## Usage

The components are designed to work together seamlessly:

1. **PersonnelsTable** - Main entry point
2. **PersonnelsColumns** - Defines table structure and filters
3. **PersonnelsFilters** - Renders filter components
4. **CityLevelTabs** - Provides city level selection
5. **TableFilterSkeleton** - Shows loading states

## Architecture Benefits

- **Maintainable**: Each component has a single responsibility
- **Reusable**: Filter components can be shared across tables
- **Consistent**: Follows the same pattern as other dashboard tables
- **Performance**: Optimized with proper memoization and loading states
