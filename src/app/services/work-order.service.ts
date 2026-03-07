import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  WorkCenterDocument,
  WorkOrderDocument,
  WorkOrderStatus,
  ZoomLevel,
  PanelState,
} from '../models/work-order.model';

const STORAGE_KEY = 'erp-work-orders';

// ── Sample Data ──
const WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-1', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
  { docId: 'wc-2', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
  { docId: 'wc-3', docType: 'workCenter', data: { name: 'Assembly Station' } },
  { docId: 'wc-4', docType: 'workCenter', data: { name: 'Quality Control' } },
  { docId: 'wc-5', docType: 'workCenter', data: { name: 'Packaging Line' } },
  { docId: 'wc-6', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-7', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-8', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-9', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-10', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-11', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-12', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-13', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-14', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-15', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-16', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-17', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-18', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-19', docType: 'workCenter', data: { name: '' } },
  { docId: 'wc-20', docType: 'workCenter', data: { name: '' } },
];

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildInitialOrders(): WorkOrderDocument[] {
  const today = todayStr();
  return [
    { docId: 'wo-1', docType: 'workOrder', data: { name: 'Aluminium Profile Run', workCenterId: 'wc-1', status: 'in-progress', startDate: addDays(today, -3), endDate: addDays(today, 4) } },
    { docId: 'wo-2', docType: 'workOrder', data: { name: 'Steel Shaft Batch', workCenterId: 'wc-2', status: 'open', startDate: addDays(today, 1), endDate: addDays(today, 6) } },
    { docId: 'wo-3', docType: 'workOrder', data: { name: 'PCB Assembly #42', workCenterId: 'wc-3', status: 'complete', startDate: addDays(today, -10), endDate: addDays(today, -4) } },
    { docId: 'wo-4', docType: 'workOrder', data: { name: 'Final Inspection Lot 7', workCenterId: 'wc-4', status: 'blocked', startDate: addDays(today, -1), endDate: addDays(today, 3) } },
    { docId: 'wo-5', docType: 'workOrder', data: { name: 'Box Packaging Run', workCenterId: 'wc-5', status: 'open', startDate: addDays(today, 2), endDate: addDays(today, 8) } },
    { docId: 'wo-6', docType: 'workOrder', data: { name: 'Copper Tube Extrusion', workCenterId: 'wc-1', status: 'open', startDate: addDays(today, 6), endDate: addDays(today, 12) } },
    { docId: 'wo-7', docType: 'workOrder', data: { name: 'Gear Housing Milling', workCenterId: 'wc-2', status: 'in-progress', startDate: addDays(today, -5), endDate: addDays(today, -1) } },
    { docId: 'wo-8', docType: 'workOrder', data: { name: 'Sensor Module Assembly', workCenterId: 'wc-3', status: 'open', startDate: addDays(today, -2), endDate: addDays(today, 5) } },
  ];
}

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private workCentersSubject = new BehaviorSubject<WorkCenterDocument[]>(WORK_CENTERS);
  private workOrdersSubject = new BehaviorSubject<WorkOrderDocument[]>(this.loadOrders());
  private zoomSubject = new BehaviorSubject<ZoomLevel>('day');
  private panelSubject = new BehaviorSubject<PanelState>({ isOpen: false, mode: 'create' });
  private hoveredWorkCenterIdSubject = new BehaviorSubject<string | null>(null);

  workCenters$ = this.workCentersSubject.asObservable();
  workOrders$ = this.workOrdersSubject.asObservable();
  zoom$ = this.zoomSubject.asObservable();
  panel$ = this.panelSubject.asObservable();
  hoveredWorkCenterId$ = this.hoveredWorkCenterIdSubject.asObservable();

  get workCenters(): WorkCenterDocument[] {
    return this.workCentersSubject.value;
  }

  get workOrders(): WorkOrderDocument[] {
    return this.workOrdersSubject.value;
  }

  get zoom(): ZoomLevel {
    return this.zoomSubject.value;
  }

  // ── Persistence ──

  private loadOrders(): WorkOrderDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return buildInitialOrders();
  }

  private saveOrders(orders: WorkOrderDocument[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }

  // ── Zoom ──

  setZoom(zoom: ZoomLevel): void {
    this.zoomSubject.next(zoom);
  }

  // ── CRUD ──

  addWorkOrder(data: WorkOrderDocument['data']): void {
    const newOrder: WorkOrderDocument = {
      docId: `wo-${Date.now()}`,
      docType: 'workOrder',
      data,
    };
    const updated = [...this.workOrders, newOrder];
    this.workOrdersSubject.next(updated);
    this.saveOrders(updated);
  }

  updateWorkOrder(docId: string, data: WorkOrderDocument['data']): void {
    const updated = this.workOrders.map((wo) =>
      wo.docId === docId ? { ...wo, data } : wo
    );
    this.workOrdersSubject.next(updated);
    this.saveOrders(updated);
  }

  deleteWorkOrder(docId: string): void {
    const updated = this.workOrders.filter((wo) => wo.docId !== docId);
    this.workOrdersSubject.next(updated);
    this.saveOrders(updated);
  }

  resetData(): void {
    localStorage.removeItem(STORAGE_KEY);
    const initial = buildInitialOrders();
    this.workOrdersSubject.next(initial);
    this.saveOrders(initial);
  }

  // ── Overlap Detection ──

  /**
   * Overlap exists when: newStart < existingEnd AND newEnd > existingStart.
   * Only checks orders on the same workCenterId, excluding excludeDocId (for edits).
   */
  checkOverlap(workCenterId: string, startDate: string, endDate: string, excludeDocId?: string): boolean {
    return this.workOrders
      .filter((wo) => wo.data.workCenterId === workCenterId && wo.docId !== excludeDocId)
      .some((wo) => startDate < wo.data.endDate && endDate > wo.data.startDate);
  }

  getOrdersForWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders.filter((wo) => wo.data.workCenterId === workCenterId);
  }

  // ── Panel ──

  openCreatePanel(workCenterId: string, defaultStartDate: string): void {
    this.panelSubject.next({ isOpen: true, mode: 'create', workCenterId, defaultStartDate });
  }

  openEditPanel(workOrder: WorkOrderDocument): void {
    this.panelSubject.next({
      isOpen: true,
      mode: 'edit',
      workOrder,
      workCenterId: workOrder.data.workCenterId,
    });
  }

  closePanel(): void {
    this.panelSubject.next({ isOpen: false, mode: 'create' });
  }

  // ── Hover ──

  setHoveredWorkCenter(id: string | null): void {
    this.hoveredWorkCenterIdSubject.next(id);
  }
}
