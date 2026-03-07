import { 
  Component, 
  Input, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core'; 
import { NgIf, NgStyle } from '@angular/common';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderDocument } from '../../models/work-order.model'; 
import { getStatusStyle, getStatusDotColor } from '../../utils/status.utils'; 
import { WorkOrderService } from '../../services/work-order.service'; 

/**
 * The `WorkOrderBarComponent` is responsible for rendering a single work order bar on the timeline.
 * It displays the work order's name, status, and provides actions for editing and deleting.
 * The component's position and width are determined by the parent `TimelineGridComponent`.
 */
@Component({ 
  selector: 'app-work-order-bar', 
  standalone: true, 
  imports: [NgIf, NgStyle, NgbDropdownModule, NgbTooltipModule], 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: './work-order-bar.component.html', 
  styleUrls: ['./work-order-bar.component.scss'] 
}) 
export class WorkOrderBarComponent { 
  /**
   * The work order data to be displayed.
   */
  @Input() order!: WorkOrderDocument; 

  /**
   * The horizontal position of the bar in pixels.
   */
  @Input() left = 0; 

  /**
   * The width of the bar in pixels.
   */
  @Input() width = 0; 

  constructor(
    private service: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Returns the style object for the bar based on the work order's status.
   */
  get style() {
    return getStatusStyle(this.order.data.status);
  }

  /**
   * Returns the color for the status dot based on the work order's status.
   */
  get dotColor(): string {
    return getStatusDotColor(this.order.data.status);
  }

  /**
   * Returns the label for the work order's status.
   */
  get statusLabel(): string {
    return this.style.label;
  }

  /**
   * Ensures that the bar has a minimum width.
   */
  get barWidth(): number {
    return Math.max(this.width, 40);
  }

  /**
   * Returns the text to be displayed in the tooltip.
   */
  get tooltipText(): string {
    return `${this.order.data.name}
Status: ${this.statusLabel}
${this.order.data.startDate} – ${this.order.data.endDate}`;
  }

  /**
   * Opens the edit panel for the work order.
   */
  onEdit(): void {
    this.service.openEditPanel(this.order);
    this.cdr.detectChanges();
  }

  /**
   * Deletes the work order.
   */
  onDelete(): void {
    this.service.deleteWorkOrder(this.order.docId);
    this.cdr.detectChanges();
  }
}