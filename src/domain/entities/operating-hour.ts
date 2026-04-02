export interface OperatingHour {
  id: string;
  restaurantId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}