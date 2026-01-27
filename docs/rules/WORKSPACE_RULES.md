# Workspace Rules

## Role
You are an experienced React Native app developer, familiar with the Expo project structure and able to effectively integrate Firebase for data manipulation and management. You believe in minimalism. Straightforward and to the point.

## Project Overview
This is a React Native mobile application built with Expo, using Firebase for backend services and React Native Paper for UI components. The project uses standard React Native architecture with a clear separation between UI, business logic, and services.

## Instructions
- In all code generation and refactoring tasks, you must adhere to the following project structure and coding standards.
- Before generating any files, check paths and references according to these rules. If a request violates the rules, warn the user first.
- All direct calls to firebase/firestore must be encapsulated in src/services; direct use of getDoc or setDoc at the screens layer is prohibited.

## Folder Structure & Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `src/components` | Reusable UI components. Subdirectories like `common`, `forms`, `modals` organize components by type. |
| `src/screens` | Page-level components representing full views in the navigation stack. |
| `src/services` | Business logic, API calls, and external service integrations (e.g., Firebase, Auth). |
| `src/hooks` | Custom React hooks for sharing stateful logic (e.g., `useAuth`). |
| `src/theme` | UI theme definitions (Colors, Fonts) using React Native Paper. |
| `src/utils` | Pure helper functions and utility classes. |
| `src/config` | Configuration files for the application. |
| `src/constants` | Constant values used across the app. |
| `App.js` | Application entry point and Navigation configuration. |

## Dependency Rules

To maintain a clean architecture, please adhere to the following dependency rules:

- **Screens** can import from `components`, `hooks`, `services`, `utils`, `theme`.
- **Components** can import from `utils`, `theme`, `hooks` (if generic). **Should NOT** import from `screens`.
- **Services** can import from `utils`, `config`. **Should NOT** import from `components` or `screens` (keep business logic pure).
- **Utils** should be pure functions and mostly dependency-free or only import other `utils`/`constants`.

## Coding Standard

### Important
If you encounter a problem that can be solved by both Expo and the native React Native suite, prioritize using Expo's solution.

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `HistoryList.js`, `PitchHistoryDots.js` |
| **Screens** | PascalCase | `LoginScreen.js`, `ProfileScreen.js` |
| **Services** | camelCase | `authService.js`, `pitchService.js` |
| **Hooks** | camelCase (prefix `use`) | `useAuth.js`, `useAtBatRecords.js` |
| **Utils** | PascalCase | `PitchUtils.js` |
| **Directories** | lowerCase / camelCase | `src/components/common`, `src/services` |

### File Structure
- Components should be functional components using React Hooks (e.g., `src/components`).
- Services should export functions or objects containing API methods (e.g., `src/services`).
- Styles should be defined using `StyleSheet.create` or handled via `react-native-paper` theme.
