import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { NgFor, NgIf, NgStyle, NgClass, AsyncPipe } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkCenterDocument, WorkOrderDocument, ZoomLevel } from '../../models/work-order.model';
import {
  getVisibleRange,
  getPixelsPerDay,
  dateToPixel,
  dateRangeToWidth,
  generateHeaderDates,
  pixelToDate,
  todayStr,
  getLoadMoreDateRange,
} from '../../utils/date.utils';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';
import { WorkOrderService } from '../../services/work-order.service';

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, NgClass, AsyncPipe, WorkOrderBarComponent, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline" #scrollContainer (scroll)="onScroll()">
      <div class="timeline__canvas" [ngStyle]="{ width: totalWidth + 'px' }">
        <!-- Header -->
        <div class="timeline__header">
          <div
            *ngFor="let col of headerDates; trackBy: trackByLabel"
            class="timeline__header-cell"
            [class.timeline__header-cell--weekend]="col.isWeekend"
            [ngStyle]="{ width: columnWidth + 'px' }"
          >
            {{ col.label }}
          </div>
        </div>

        <!-- Rows -->
        <div class="timeline__body">
          <div
            *ngFor="let wc of workCenters; trackBy: trackByDocId"
            class="timeline__row"
            [class.timeline__row--hover]="(service.hoveredWorkCenterId$ | async) === wc.docId && !isDragging"
            (mouseenter)="service.setHoveredWorkCenter(wc.docId)"
            (mouseleave)="service.setHoveredWorkCenter(null)"
            (click)="onRowClick($event, wc.docId)"
            cdkDropList
            [cdkDropListData]="wc.docId"
            (cdkDropListDropped)="onWorkOrderDropped($event)"
            cdkDropListOrientation="horizontal"
          >
            <!-- Grid columns -->
            <div
              *ngFor="let col of headerDates; trackBy: trackByLabel"
              class="timeline__cell"
              [class.timeline__cell--weekend]="col.isWeekend"
              [ngStyle]="{ width: columnWidth + 'px' }"
            ></div>

            <!-- Work order bars -->
            <app-work-order-bar
              *ngFor="let wo of getOrdersForWC(wc.docId); trackBy: trackByDocId"
              [order]="wo"
              [left]="getBarLeft(wo)"
              [width]="getBarWidth(wo)"
              cdkDrag
              [cdkDragData]="wo"
              (cdkDragStarted)="isDragging = true"
              (cdkDragEnded)="isDragging = false"
              cdkDragLockAxis="x"
            ></app-work-order-bar>
          </div>

          <!-- Today indicator -->
          <div
            *ngIf="todayPixel >= 0"
            class="timeline__today"
            [ngStyle]="{ left: todayPixel + 'px' }"
          >
            <div class="timeline__today-dot"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./timeline-grid.component.scss'],
})
export class TimelineGridComponent implements OnChanges, AfterViewInit {
  @Input() workCenters: WorkCenterDocument[] = [];
  @Input() workOrders: WorkOrderDocument[] = [];
  @Input() zoom: ZoomLevel = 'day';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  headerDates: { date: Date; label: string; isWeekend: boolean }[] = [];
  totalWidth = 0;
  columnWidth = 0;
  todayPixel = 0;
  isDragging = false;

  private workOrdersByWc = new Map<string, WorkOrderDocument[]>();
  private visibleStart!: Date;
  private visibleEnd!: Date;
  private pixelsPerDay = 60;
  private needsCenter = true;

  private isLoadingLeft = false;
  private isLoadingRight = false;
  private readonly scrollThreshold = 400;

  constructor(public service: WorkOrderService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workOrders']) {
      this.groupWorkOrders();
    }

    if (changes['zoom'] || changes['workOrders'] || changes['workCenters']) {
      this.recalculate();
      this.needsCenter = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.needsCenter) {
      this.centerOnToday();
      this.needsCenter = false;
    }
  }

  private groupWorkOrders(): void {
    this.workOrdersByWc.clear();
    for (const wc of this.workCenters) {
      this.workOrdersByWc.set(wc.docId, []);
    }
    for (const wo of this.workOrders) {
      const group = this.workOrdersByWc.get(wo.data.workCenterId);
      if (group) {
        group.push(wo);
      }
    }
  }

  private recalculate(): void {
    const range = getVisibleRange(this.zoom);
    this.visibleStart = range.start;
    this.visibleEnd = range.end;
    this.pixelsPerDay = getPixelsPerDay(this.zoom);

    this.headerDates = generateHeaderDates(this.visibleStart, this.visibleEnd, this.zoom);
    this.updateWidths();
    this.updateTodayMarker();
  }

  private updateWidths(): void {
    switch (this.zoom) {
      case 'hour':
      case 'day':
        this.columnWidth = this.pixelsPerDay;
        break;
      case 'week':
        this.columnWidth = this.pixelsPerDay * 7;
        break;
      case 'month':
        this.columnWidth = this.pixelsPerDay * 30.44;
        break;
    }
    this.totalWidth = this.headerDates.length * this.columnWidth;
  }

  private updateTodayMarker(): void {
    const now = new Date();
    this.todayPixel = dateToPixel(now.toISOString(), this.visibleStart, this.pixelsPerDay);
  }

  private centerOnToday(): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    if (this.todayPixel >= 0 && this.todayPixel < this.totalWidth) {
      const scrollTo = this.todayPixel - el.clientWidth / 2;
      el.scrollLeft = Math.max(0, scrollTo);
    }
  }

  getOrdersForWC(wcId: string): WorkOrderDocument[] {
    return this.workOrdersByWc.get(wcId) || [];
  }

  getBarLeft(wo: WorkOrderDocument): number {
    return dateToPixel(wo.data.startDate, this.visibleStart, this.pixelsPerDay);
  }

  getBarWidth(wo: WorkOrderDocument): number {
    return dateRangeToWidth(wo.data.startDate, wo.data.endDate, this.pixelsPerDay);
  }

  onRowClick(event: MouseEvent, workCenterId: string): void {
    if ((event.target as HTMLElement).closest('app-work-order-bar')) {
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollLeft = this.scrollContainer.nativeElement.scrollLeft;
    const clickX = event.clientX - rect.left + scrollLeft;
    const clickedDate = pixelToDate(clickX, this.visibleStart, this.pixelsPerDay);
    this.service.openCreatePanel(workCenterId, clickedDate);
  }

  onScroll(): void {
    const el = this.scrollContainer.nativeElement;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    if (!this.isLoadingRight && scrollWidth - scrollLeft - clientWidth < this.scrollThreshold) {
      this.loadFuture();
    }

    if (!this.isLoadingLeft && scrollLeft < this.scrollThreshold) {
      this.loadPast();
    }
  }

  private loadPast(): void {
    this.isLoadingLeft = true;
    const el = this.scrollContainer.nativeElement;
    const oldScrollLeft = el.scrollLeft;
    const oldWidth = el.scrollWidth;

    const range = getLoadMoreDateRange(this.visibleStart, 'past', this.zoom);
    const newDates = generateHeaderDates(range.start, range.end, this.zoom);
    this.visibleStart = range.start;
    this.headerDates = [...newDates, ...this.headerDates];
    this.updateWidths();
    this.updateTodayMarker();
    this.cdr.detectChanges(); // Manually trigger change detection

    // Use requestAnimationFrame to wait for the DOM to update
    requestAnimationFrame(() => {
      const newWidth = el.scrollWidth;
      el.scrollLeft = oldScrollLeft + (newWidth - oldWidth);
      this.isLoadingLeft = false;
    });
  }

  private loadFuture(): void {
    this.isLoadingRight = true;
    const range = getLoadMoreDateRange(this.visibleEnd, 'future', this.zoom);
    const newDates = generateHeaderDates(range.start, range.end, this.zoom);
    this.visibleEnd = range.end;
    this.headerDates = [...this.headerDates, ...newDates];
    this.updateWidths();
    this.cdr.detectChanges(); // Manually trigger change detection
    this.isLoadingRight = false;
  }

  onWorkOrderDropped(event: CdkDragDrop<string, WorkOrderDocument>): void {
    this.isDragging = false;
    const workOrder = event.item.data;
    const newWorkCenterId = event.container.data;
    const oldWorkCenterId = workOrder.data.workCenterId;

    const pixelShift = event.distance.x;
    const timeShift = (pixelShift / this.pixelsPerDay) * 24 * 60 * 60 * 1000;

    const oldStartDate = new Date(workOrder.data.startDate);
    const oldEndDate = new Date(workOrder.data.endDate);

    const newStartDate = new Date(oldStartDate.getTime() + timeShift);
    const newEndDate = new Date(oldEndDate.getTime() + timeShift);

    const updatedData: WorkOrderDocument['data'] = {
      ...workOrder.data,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    };

    if (newWorkCenterId !== oldWorkCenterId) {
      updatedData.workCenterId = newWorkCenterId;
    }

    this.service.updateWorkOrder(workOrder.docId, updatedData);
  }

  trackByDocId(_: number, item: { docId: string }): string {
    return item.docId;
  }

  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }
}