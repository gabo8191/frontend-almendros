# 📜 Registro de Cambios - SIGMA

## [unreleased]

### Feat

- Add tests for dashboard child components and login form
- Implement tests for core features and fix supplier tests

### Fix

- Remove failing dashboard and dashboard hook tests
- Resolve TS warnings for unused variables
- Sale creation error display and supplier module enhancements

### Refactor

- Standardize table components and loading spinners, adjusted pdf designs for reports
- Move test files to dedicated tests/ directory

### Feat

- Update the version project

### Fix

- Correct props for SaleDetailsModal to ensure it opens
- Resolve responsive layout issues for all app tables. Applied consistent strategy: mobileBreakpoint='lg', whitespace-normal for wide cells, and compact Card parent. This prevents premature layout breaks and ensures proper mobile card view switching.

### Refactor

- Extract EmployeesTable component and fix role display
- Extract SuppliersTable and align loading behavior with clients
- Extract SalesTable component for better separation of concerns
- Align ProductsTable structure and pagination with other sections

## [2.0.0] - 2025-05-27

### Chore

- Update project version to 2.0.0

### Docs

- Actualizar CHANGELOG.md para versión main
- Actualizar CHANGELOG.md para versión main

### Feat

- Add the lock to npmrc
- Add the lock to npmrc
- Add the lock to npmrc
- Add the lock to npmrc
- Implement login portal and customer management system
- Implement login portal and customer management system
- Update the version
- Add the sonar analysis
- Comprehensive update of core components including sales, POS, stock, reports, customers, employees, and suppliers - Implementation of basic CRUD operations and data fetching functionality
- ✨ initialize testing environment with Jest and Playwright
- Improve app workflows for sales, products, and other areas
- Implement reports functionality
- Core functionality stable, pending refactor for SOLID and debugging
- Employees module ready for review
- Inventory module ready for review
- Implement protected routes and authenticated user flow
- Improve auth context and token management

### Fix

- Update the changelog
- Update the changelog
- Activate employee
- Improve sales creation and client handling logic
- Adjust components to align with backend expectations
- Resolve report generation issues and update file names
- Improve sales and clients workflow
- Improve validations (WIP)
- Address supplier related issues
- Resolve issues in clients and auth modules
- Ensure new sale sends correct data to backend
- UI enhancements for sidebar, main dashboard, and other areas
- Update UI elements in login forms and header components
- Update dependencies to reduce vulnerabilities and remove console logs

### Refactor

- Reorganize project structure and remove unused files
- Reorganize products, employees, inventory, and clients modules

## [0.0.0] - 2025-05-03

### Chore

- Initial setup project

### Feat

- Add github actions workflows
- Add the lock to npmrc


---
_Sigue el estándar [Keep a Changelog](https://keepachangelog.com/)._
_🔗 Enlace al repositorio: [github.com/gabo8191/fleet-management-system](https://github.com/gabo8191/fleet-management-system)_
