import { WorkOrderStatus } from '../models/work-order.model';

export interface StatusStyle {
  background: string;
  borderColor: string;
  color: string;
  label: string;
}

const STATUS_MAP: Record<WorkOrderStatus, StatusStyle> = {
  open: {
    background: 'hsla(221, 83%, 53%, 0.12)',
    borderColor: 'hsla(221, 83%, 53%, 0.35)',
    color: 'hsl(221, 83%, 53%)',
    label: 'Open',
  },
  'in-progress': {
    background: 'hsla(263, 70%, 50%, 0.12)',
    borderColor: 'hsla(263, 70%, 50%, 0.35)',
    color: 'hsl(263, 70%, 50%)',
    label: 'In Progress',
  },
  complete: {
    background: 'hsla(142, 71%, 45%, 0.12)',
    borderColor: 'hsla(142, 71%, 45%, 0.35)',
    color: 'hsl(142, 71%, 45%)',
    label: 'Complete',
  },
  blocked: {
    background: 'hsla(32, 95%, 44%, 0.12)',
    borderColor: 'hsla(32, 95%, 44%, 0.35)',
    color: 'hsl(32, 95%, 44%)',
    label: 'Blocked',
  },
};

export function getStatusStyle(status: WorkOrderStatus): StatusStyle {
  return STATUS_MAP[status];
}

export function getStatusDotColor(status: WorkOrderStatus): string {
  return STATUS_MAP[status].color;
}

export const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
];
