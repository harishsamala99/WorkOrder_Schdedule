import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { WorkOrderBarComponent } from './work-order-bar.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderDocument } from '../../models/work-order.model';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

class MockWorkOrderService {
  openEditPanel() {}
  deleteWorkOrder() {}
}

describe('WorkOrderBarComponent', () => {
  let component: WorkOrderBarComponent;
  let fixture: ComponentFixture<WorkOrderBarComponent>;

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
});
