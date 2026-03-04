import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgFor } from '@angular/common';
import { WorkCenterDocument } from '../../models/work-order.model';

@Component({
  selector: 'app-work-center-panel',
  standalone: true,
  imports: [NgFor],
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
        >
          <div class="wc-panel__dot"></div>
          <span class="wc-panel__name">{{ wc.data.name }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './work-center-panel.component.scss',
})
export class WorkCenterPanelComponent {
  @Input() workCenters: WorkCenterDocument[] = [];

  trackByDocId(_: number, item: WorkCenterDocument): string {
    return item.docId;
  }
}
