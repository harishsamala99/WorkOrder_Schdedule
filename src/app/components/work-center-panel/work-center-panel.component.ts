import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgClass, AsyncPipe } from '@angular/common';
import { WorkCenterDocument } from '../../models/work-order.model';
import { WorkOrderService } from '../../services/work-order.service';

@Component({
  selector: 'app-work-center-panel',
  standalone: true,
  imports: [NgFor, NgClass, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wc-panel">
      <div class="wc-panel__header">
        <span class="wc-panel__label">Work Centers</span>
      </div>
      <div class="wc-panel__rows">
        <div
          *ngFor="let wc of workCenters; trackBy: trackByDocId"
          class="wc-panel__row"
          [class.wc-panel__row--hover]="(service.hoveredWorkCenterId$ | async) === wc.docId"
          (mouseenter)="service.setHoveredWorkCenter(wc.docId)"
          (mouseleave)="service.setHoveredWorkCenter(null)"
        >
          <div class="wc-panel__dot"></div>
          <span class="wc-panel__name">{{ wc.data.name }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./work-center-panel.component.scss'],
})
export class WorkCenterPanelComponent {
  @Input() workCenters: WorkCenterDocument[] = [];

  constructor(public service: WorkOrderService) {}

  trackByDocId(_: number, item: WorkCenterDocument): string {
    return item.docId;
  }
}