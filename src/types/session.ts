export interface SessionType {
  sessionId?: string;
  name: string;
  value: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isLocked: boolean;
  createdAt?: number;
}
