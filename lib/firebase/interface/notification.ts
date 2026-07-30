export type NotificationType =
  | "payment"
  | "booking"
  | "request"
  | "system";

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt?: any;
  relatedId?: string;
  amount?: number;
}

export interface CreateNotification
  extends Omit<Notification, "id" | "read" | "createdAt"> {}