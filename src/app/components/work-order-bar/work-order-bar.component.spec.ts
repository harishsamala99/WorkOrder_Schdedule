import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { WorkOrderBarComponent } from './work-order-bar.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderDocument } from '../../models/work-order.model';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

class MockWorkOrderService {
  openEditPanel(order: WorkOrderDocument) {}
  deleteWorkOrder(docId: string) {}
}

describe('WorkOrderBarComponent', () => {
  let component: WorkOrderBarComponent;
  let fixture: ComponentFixture<WorkOrderBarComponent>;
  let service: WorkOrderService;

  const mockOrder: WorkOrderDocument = {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Test Order',
      workCenterId: 'wc-1',
      status: 'open',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbDropdownModule, NgbTooltipModule, WorkOrderBarComponent],
      providers: [
        { provide: WorkOrderService, useClass: MockWorkOrderService },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderBarComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(WorkOrderService);
    component.order = mockOrder;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the work order name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bar__name')?.textContent).toContain('Test Order');
  });

  it('should call onEdit when the edit button is clicked', () => {
    spyOn(component, 'onEdit');
    const compiled = fixture.nativeElement as HTMLElement;
    const editButton = compiled.querySelector('.bar__dropdown-item:first-child') as HTMLElement;
    editButton.click();
    expect(component.onEdit).toHaveBeenCalled();
  });

  it('should call onDelete when the delete button is clicked', () => {
    spyOn(component, 'onDelete');
    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('.bar__dropdown-item--danger') as HTMLElement;
    deleteButton.click();
    expect(component.onDelete).toHaveBeenCalled();
  });

  it('should call the service to open the edit panel on onEdit', () => {
    spyOn(service, 'openEditPanel');
    component.onEdit();
    expect(service.openEditPanel).toHaveBeenCalledWith(mockOrder);
  });

  it('should call the service to delete the work order on onDelete', () => {
    spyOn(service, 'deleteWorkOrder');
    component.onDelete();
    expect(service.deleteWorkOrder).toHaveBeenCalledWith('wo-1');
  });

  it('should return the correct style for the open status', () => {
    expect(component.style.background).toBe('#e3f2fd');
    expect(component.style.borderColor).toBe('#bbdefb');
    expect(component.style.color).toBe('#1e88e5');
  });

  it('should return the correct dot color for the open status', () => {
    expect(component.dotColor).toBe('#1e88e5');
  });

  it('should return the correct status label for the open status', () => {
    expect(component.statusLabel).toBe('Open');
  });

  it('should return a minimum bar width of 40', () => {
    component.width = 20;
    expect(component.barWidth).toBe(40);
  });

  it('should return the correct tooltip text', () => {
    const expectedTooltip = `Test Order
Status: Open
2026-01-01 – 2026-01-02`;
    expect(component.tooltipText).toBe(expectedTooltip);
  });
});
