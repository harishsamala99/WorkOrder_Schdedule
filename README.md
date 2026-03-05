# Work Order Schedule Timeline — Angular 17+

## Tech Stack
- Angular 17+ (standalone components)
- TypeScript (strict mode)
- SCSS
- **Angular CDK (Drag & Drop)**: Used for the timeline drag-and-drop feature. It provides a robust and straightforward way to build interactive drag-and-drop functionality with minimal boilerplate.
- Reactive Forms (FormGroup, FormControl, Validators)
- ng-select (status dropdown)
- @ng-bootstrap/ng-bootstrap (ngb-datepicker)
- localStorage persistence

## Setup

```bash
# 1. Copy this folder to your machine
# 2. Install dependencies
npm install

# 3. Run
ng serve
```

Open http://localhost:4200

## Features
- Interactive Gantt-style timeline
- **Drag & Drop**: Move work orders along the timeline to reschedule them. Work orders can also be moved between different work centers.
- Day / Week / Month zoom levels
- Click empty area → create work order
- Three-dot menu on bars → Edit / Delete
- Overlap detection per work center
- Slide-in panel with reactive form validation
- Today indicator line
- ESC to close panel
- localStorage persistence
- Reset sample data button

## Architecture
- **Models**: `src/app/models/work-order.model.ts` — document pattern types
- **Service**: `src/app/services/work-order.service.ts` — state + CRUD + overlap logic
- **Utils**: `src/app/utils/date.utils.ts` — date-to-pixel math
- **Components**: All standalone, OnPush change detection, trackBy used
