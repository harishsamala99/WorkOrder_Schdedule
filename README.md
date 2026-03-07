# Work Order Schedule Timeline — Angular 17+

This project is an interactive Gantt-style timeline for scheduling work orders, built with Angular 17+. It allows users to manage a production schedule by dragging and dropping work orders, changing their status, and editing details in a slide-in panel. The timeline view supports day, week, and month zoom levels, and it automatically saves the data to `localStorage`.

## Tech Stack

- **Angular 17+**: Core framework, utilizing standalone components for a modular architecture.
- **TypeScript**: Strict mode is enabled for improved code quality and maintainability.
- **SCSS**: Used for styling the application, with a component-based approach.
- **Angular CDK (Drag & Drop)**: Provides the core functionality for moving work orders on the timeline.
- **Reactive Forms**: Manages form state and validation for creating and editing work orders.
- **ng-select**: A flexible and powerful dropdown component for selecting the work order status.
- **@ng-bootstrap/ng-bootstrap**: Used for the date picker in the work order form.
- **localStorage**: Provides simple persistence of work order data in the browser.

## Features

- **Infinite Horizontal Scroll**: The timeline dynamically loads past and future dates as you scroll, allowing for seamless navigation across any time range without performance degradation.
- **Smooth UI Animations**: The create/edit panel uses a smooth slide-in/out animation for a modern user experience.
- **Hover Tooltips**: Hovering over any work order bar displays a tooltip with its full details, including name, status, and dates.
- **Interactive Gantt-Style Timeline**: Visual representation of work orders over time.
- **Drag & Drop**: Easily reschedule work orders by dragging them along the timeline or moving them between different work centers.
- **Zoom Levels**: Switch between day, week, and month views to get a better overview of the schedule.
- **Create Work Orders**: Click on an empty area of the timeline to open a panel and create a new work order.
- **Edit & Delete**: A three-dot menu on each work order bar allows for quick editing or deletion.
- **Overlap Detection**: The system prevents scheduling conflicts by detecting and highlighting overlapping work orders within the same work center.
- **Slide-In Panel**: A modern, non-blocking UI for creating and editing work order details.
- **Reactive Form Validation**: Ensures data integrity with real-time feedback on the input fields.
- **"Today" Indicator**: A vertical line on the timeline marks the current date for easy reference.
- **Keyboard Shortcuts**: Press `ESC` to quickly close the slide-in panel.
- **Data Persistence**: The application state is automatically saved to `localStorage`, so your work is not lost on page refresh.
- **Sample Data**: A "Reset" button is available to restore the initial sample data for demonstration purposes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm) installed on your machine.

### Setup

1. **Clone the repository or copy the folder to your machine.**

2. **Install the dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   ng serve
   ```

   The application will be available at `http://localhost:4200`.

## Development

### Running Tests

To run the unit tests, use the following command:

```bash
ng test
```

### Building the Project

To build the project for production, use the following command:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

The project follows a standard Angular architecture with a few key areas:

- **`src/app/models/work-order.model.ts`**: Contains the TypeScript interfaces for the data models, such as `WorkOrder`.
- **`src/app/services/work-order.service.ts`**: The core service that manages the state of the work orders, including all CRUD (Create, Read, Update, Delete) operations and the overlap detection logic.
- **`src/app/utils/date.utils.ts`**: A utility file with helper functions for date calculations and converting dates to pixel values for positioning on the timeline.
- **`src/app/components`**: This directory contains all the standalone components, each with its own template, styles, and logic. The main components include:
  - **`timeline-grid`**: The background grid of the timeline.
  - **`work-order-bar`**: Represents a single work order on the timeline.
  - **`work-order-panel`**: The slide-in panel for creating and editing work orders.
  - **`toolbar`**: The top bar with zoom controls and the "Reset" button.
- **`OnPush` Change Detection**: All components are configured with `OnPush` change detection to optimize performance.
- **`trackBy`**: Used in `*ngFor` loops to improve rendering performance when the data changes.
