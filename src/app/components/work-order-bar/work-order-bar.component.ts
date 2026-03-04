import { 
  Component, 
  Input, 
  HostListener, 
  ElementRef, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
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
  templateUrl: './work-order-bar.component.html', 
  styleUrls: ['./work-order-bar.component.scss'] 
}) 
export class WorkOrderBarComponent { 
  @Input() order!: WorkOrderDocument; 
  @Input() left = 0; 
  @Input() width = 0; 

  menuOpen = false; 

  constructor(
    private service: WorkOrderService,
    private elRef: ElementRef,
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

  @HostListener('document:mousedown', ['$event'])
  onDocClick(event: MouseEvent): void {
    // Close menu if clicked outside
    if (this.menuOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    this.cdr.detectChanges();
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.service.openEditPanel(this.order);
    this.cdr.detectChanges();
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = false;
    this.service.deleteWorkOrder(this.order.docId);
    this.cdr.detectChanges();
  }
}