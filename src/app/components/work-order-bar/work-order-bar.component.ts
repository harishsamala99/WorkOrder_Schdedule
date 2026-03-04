import {
  Component,
  Input,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { WorkOrderDocument } from '../../models/work-order.model';
import { getStatusStyle, getStatusDotColor } from '../../utils/status.utils';
import { WorkOrderService } from '../../services/work-order.service';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [NgIf, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bar"
      [ngStyle]="{
        left: left + 'px',
        width: barWidth + 'px',
        background: style.background,
        borderColor: style.borderColor
      }"
      (click)="$event.stopPropagation()"
    >
      <div class="bar__content">
        <div class="bar__dot" [ngStyle]="{ background: dotColor }"></div>
        <span *ngIf="barWidth > 80" class="bar__name" [ngStyle]="{ color: style.color }">
          {{ order.data.name }}
        </span>
      </div>

      <div class="bar__actions">
        <span
          *ngIf="barWidth > 140"
          class="bar__badge"
          [ngStyle]="{ color: style.color, background: style.borderColor }"
        >
          {{ statusLabel }}
        </span>

        <button
          class="bar__menu-btn"
          [ngStyle]="{ color: style.color }"
          (click)="toggleMenu($event)"
        >
          ⋯
        </button>
      </div>

      <!-- Dropdown menu -->
      <div *ngIf="menuOpen" class="bar__dropdown">
        <button class="bar__dropdown-item" (click)="onEdit($event)">
          ✏️ Edit
        </button>
        <button class="bar__dropdown-item bar__dropdown-item--danger" (click)="onDelete($event)">
          🗑️ Delete
        </button>
      </div>
    </div>
  `,
  styleUrl: './work-order-bar.component.scss',
})
export class WorkOrderBarComponent {
  @Input() order!: WorkOrderDocument;
  @Input() left = 0;
  @Input() width = 0;

  menuOpen = false;

  get style() {
    return getStatusStyle(this.order.data.status);
  }

  get dotColor(): string {
    return getStatusDotColor(this.order.data.status);
  }

  get statusLabel(): string {
    return getStatusStyle(this.order.data.status).label;
  }

  get barWidth(): number {
    return Math.max(this.width, 40);
  }

  constructor(
    private service: WorkOrderService,
    private elRef: ElementRef
  ) {}

  @HostListener('document:mousedown', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.menuOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.service.openEditPanel(this.order);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.service.deleteWorkOrder(this.order.docId);
  }
}
