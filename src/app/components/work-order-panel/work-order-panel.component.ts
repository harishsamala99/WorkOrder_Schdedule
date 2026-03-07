import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  PanelState,
  WorkCenterDocument,
  WorkOrderStatus,
} from '../../models/work-order.model';
import { WorkOrderService } from '../../services/work-order.service';
import { STATUS_OPTIONS } from '../../utils/status.utils';
import { addDays } from '../../utils/date.utils';

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div *ngIf="panel.isOpen" class="panel-backdrop" (click)="close()"></div>

    <!-- Slide-in Panel -->
    <div class="panel" [@slideInOut]="panel.isOpen ? 'open' : 'closed'">
      <div class="panel__header">
        <h2 class="panel__title">{{ panel.mode === 'edit' ? 'Edit Work Order' : 'Create Work Order' }}</h2>
        <button class="panel__close" (click)="close()">✕</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="panel__form">
        <!-- Name -->
        <div class="field">
          <label class="field__label">Name *</label>
          <input class="field__input" formControlName="name" placeholder="Work order name" />
          <span *ngIf="form.get('name')?.touched && form.get('name')?.invalid" class="field__error">
            Name is required
          </span>
        </div>

        <!-- Status -->
        <div class="field">
          <label class="field__label">Status *</label>
          <ng-select
            formControlName="status"
            [items]="statusOptions"
            bindValue="value"
            bindLabel="label"
            [clearable]="false"
            placeholder="Select status"
          ></ng-select>
        </div>

        <!-- Start Date -->
        <div class="field">
          <label class="field__label">Start Date *</label>
          <div class="field__date-wrapper">
            <input
              class="field__input"
              [value]="form.get('startDate')?.value"
              (input)="onDateInput('startDate', $event)"
              placeholder="YYYY-MM-DD"
              ngbDatepicker
              #dpStart="ngbDatepicker"
              (dateSelect)="onDateSelect('startDate', $event)"
            />
            <button type="button" class="field__date-btn" (click)="dpStart.toggle()">📅</button>
          </div>
          <span *ngIf="form.get('startDate')?.touched && form.get('startDate')?.invalid" class="field__error">
            Start date is required
          </span>
        </div>

        <!-- End Date -->
        <div class="field">
          <label class="field__label">End Date *</label>
          <div class="field__date-wrapper">
            <input
              class="field__input"
              [value]="form.get('endDate')?.value"
              (input)="onDateInput('endDate', $event)"
              placeholder="YYYY-MM-DD"
              ngbDatepicker
              #dpEnd="ngbDatepicker"
              (dateSelect)="onDateSelect('endDate', $event)"
            />
            <button type="button" class="field__date-btn" (click)="dpEnd.toggle()">📅</button>
          </div>
          <span *ngIf="form.get('endDate')?.touched && form.get('endDate')?.invalid" class="field__error">
            End date is required
          </span>
        </div>

        <!-- Validation errors -->
        <div *ngIf="validationError" class="panel__error">{{ validationError }}</div>

        <!-- Actions -->
        <div class="panel__actions">
          <button
            *ngIf="panel.mode === 'edit'"
            type="button"
            class="panel__btn panel__btn--delete"
            (click)="onDelete()"
          >
            Delete
          </button>
          <button type="button" class="panel__btn panel__btn--cancel" (click)="close()">
            Cancel
          </button>
          <button type="submit" class="panel__btn panel__btn--save" [disabled]="form.invalid">
            {{ panel.mode === 'edit' ? 'Save' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrl: './work-order-panel.component.scss',
  animations: [
    trigger('slideInOut', [
      state('closed', style({ transform: 'translateX(100%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed <=> open', [animate('225ms cubic-bezier(0.4, 0, 0.2, 1)')]),
    ]),
  ],
})
export class WorkOrderPanelComponent implements OnChanges {
  @Input() panel: PanelState = { isOpen: false, mode: 'create' };
  @Input() workCenters: WorkCenterDocument[] = [];

  statusOptions = STATUS_OPTIONS;
  validationError = '';

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    status: new FormControl<WorkOrderStatus>('open', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
  });

  constructor(
    private service: WorkOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['panel'] && this.panel.isOpen) {
      this.validationError = '';
      if (this.panel.mode === 'edit' && this.panel.workOrder) {
        const d = this.panel.workOrder.data;
        this.form.setValue({
          name: d.name,
          status: d.status,
          startDate: d.startDate,
          endDate: d.endDate,
        });
      } else {
        const start = this.panel.defaultStartDate || new Date().toISOString().split('T')[0];
        this.form.setValue({
          name: '',
          status: 'open',
          startDate: start,
          endDate: addDays(start, 7),
        });
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.panel.isOpen) this.close();
  }

  close(): void {
    this.service.closePanel();
  }

  onDateSelect(field: 'startDate' | 'endDate', dateStruct: NgbDateStruct): void {
    const dateStr = `${dateStruct.year}-${String(dateStruct.month).padStart(2, '0')}-${String(dateStruct.day).padStart(2, '0')}`;
    this.form.get(field)?.setValue(dateStr);
  }

  onDateInput(field: 'startDate' | 'endDate', event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.form.get(field)?.setValue(val);
  }

  onDelete(): void {
    if (this.panel.mode !== 'edit' || !this.panel.workOrder) return;
    if (confirm('Are you sure you want to delete this work order?')) {
      this.service.deleteWorkOrder(this.panel.workOrder.docId);
      this.service.closePanel();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { name, status, startDate, endDate } = this.form.value;
    if (!name || !status || !startDate || !endDate) return;

    // Validate end > start
    if (endDate <= startDate) {
      this.validationError = 'End date must be after start date.';
      this.cdr.markForCheck();
      return;
    }

    const workCenterId = this.panel.workCenterId || '';
    const excludeDocId = this.panel.mode === 'edit' ? this.panel.workOrder?.docId : undefined;

    // Overlap check
    if (this.service.checkOverlap(workCenterId, startDate, endDate, excludeDocId)) {
      this.validationError = 'This order overlaps with an existing order on the same work center.';
      this.cdr.markForCheck();
      return;
    }

    const data = { name, status, workCenterId, startDate, endDate };

    if (this.panel.mode === 'edit' && this.panel.workOrder) {
      this.service.updateWorkOrder(this.panel.workOrder.docId, data);
    } else {
      this.service.addWorkOrder(data);
    }

    this.service.closePanel();
  }
}
