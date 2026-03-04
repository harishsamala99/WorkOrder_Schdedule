/**
 * All data follows the document pattern: { docId, docType, data }.
 */

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
  };
}

export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export type ZoomLevel = 'day' | 'week' | 'month';

export interface PanelState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  workCenterId?: string;
  workOrder?: WorkOrderDocument;
  defaultStartDate?: string;
}
