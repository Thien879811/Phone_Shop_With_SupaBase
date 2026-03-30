export const REPAIR_STATUS_MAP: Record<string, { label: string, color: string }> = {
  RECEIVED: { label: 'Tiếp nhận', color: 'badge-warning' },
  CHECKING: { label: 'Đang kiểm tra', color: 'badge-info' },
  WAITING_PART: { label: 'Chờ linh kiện', color: 'badge-danger' },
  REPAIRING: { label: 'Đang sửa', color: 'badge-primary' },
  COMPLETED: { label: 'Hoàn thành', color: 'badge-success' },
  DELIVERED: { label: 'Đã trả máy', color: 'badge-ghost' },
  CANCELLED: { label: 'Đã hủy', color: 'badge-danger' },
};
