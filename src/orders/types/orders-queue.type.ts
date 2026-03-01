export type OrdersProcessMessage = {
  messageId: string;
  orderId: string;
  createdAt: string;
  attempt: number;
  producer: string | null;
  eventName: string | null;
  testIssue?: string | null;
};
