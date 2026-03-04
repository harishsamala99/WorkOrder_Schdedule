import { Component } from '@angular/core';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { WorkCenterPanelComponent } from './components/work-center-panel/work-center-panel.component';
import { TimelineGridComponent } from './components/timeline-grid/timeline-grid.component';
import { WorkOrderPanelComponent } from './components/work-order-panel/work-order-panel.component';
import { WorkOrderService } from './services/work-order.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    ToolbarComponent,
    WorkCenterPanelComponent,
    TimelineGridComponent,
    WorkOrderPanelComponent,
  ],
  template: `
    <div class="app-shell">
      <app-toolbar
        [zoom]="(service.zoom$ | async)!"
        (zoomChange)="service.setZoom($event)"
        (todayClick)="onTodayClick()"
        (resetData)="service.resetData()"
      />

      <div class="main-content">
        <app-work-center-panel
          [workCenters]="(service.workCenters$ | async)!"
        />

        <app-timeline-grid
          [workCenters]="(service.workCenters$ | async)!"
          [workOrders]="(service.workOrders$ | async)!"
          [zoom]="(service.zoom$ | async)!"
        />
      </div>

      <app-work-order-panel
        [panel]="(service.panel$ | async)!"
        [workCenters]="(service.workCenters$ | async)!"
      />
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg);
    }
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class AppComponent {
  constructor(public service: WorkOrderService) {}

  onTodayClick(): void {
    // Re-trigger zoom to re-center
    const current = this.service.zoom;
    this.service.setZoom(current);
  }
}
