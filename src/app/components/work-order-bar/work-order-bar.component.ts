import { 
  Component, 
  Input, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core'; 
import { NgIf, NgStyle } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderDocument } from '../../models/work-order.model'; 
import { getStatusStyle, getStatusDotColor } from '../../utils/status.utils'; 
import { WorkOrderService } from '../../services/work-order.service'; 
 
@Component({ 
  selector: 'app-work-order-bar', 
  standalone: true, 
  imports: [NgIf, NgStyle, NgbDropdownModule], 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: './work-order-bar.component.html', 
  styleUrls: ['./work-order-bar.component.scss'] 
}) 
export class WorkOrderBarComponent { 
  @Input() order!: WorkOrderDocument; 
  @Input() left = 0; 
  @Input() width = 0; 

  constructor(
    private service: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  get style() {
    return getStatusStyle(this.order.data.status);
  }

  get dotColor(): string {
    return getStatusDotColor(this.order.data.status);
  }

  get statusLabel(): string {
    return this.style.label;
  }

  get barWidth(): number {
    return Math.max(this.width, 40);
  }

  onEdit(): void {
    this.service.openEditPanel(this.order);
    this.cdr.detectChanges();
  }

  onDelete(): void {
    this.service.deleteWorkOrder(this.order.docId);
    this.cdr.detectChanges();
  }
}