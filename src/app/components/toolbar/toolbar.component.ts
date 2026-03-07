import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ZoomLevel } from '../../models/work-order.model';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="toolbar">
      <div class="toolbar__left">
        <div class="toolbar__dot"></div>
        <h1 class="toolbar__title">Work Order Schedule</h1>
      </div>

      <div class="toolbar__right">
        <button class="toolbar__btn" (click)="todayClick.emit()">
          📅 Today
        </button>

        <select
          class="toolbar__select"
          [value]="zoom"
          (change)="onZoomChange($event)"
        >
          <option *ngFor="let opt of zoomOptions" [value]="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <button class="toolbar__btn toolbar__btn--icon" (click)="resetData.emit()" title="Reset sample data">
          ↻
        </button>
      </div>
    </header>
  `,
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Input() zoom: ZoomLevel = 'day';
  @Output() zoomChange = new EventEmitter<ZoomLevel>();
  @Output() todayClick = new EventEmitter<void>();
  @Output() resetData = new EventEmitter<void>();

  zoomOptions = [
    { value: 'hour' as ZoomLevel, label: 'Hour' },
    { value: 'day' as ZoomLevel, label: 'Day' },
    { value: 'week' as ZoomLevel, label: 'Week' },
    { value: 'month' as ZoomLevel, label: 'Month' },
  ];

  onZoomChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ZoomLevel;
    this.zoomChange.emit(value);
  }
}
