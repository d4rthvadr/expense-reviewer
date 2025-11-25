import { NotificationService } from '@domain/services/notification.service';

export const createMockNotificationService = () => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
  } as unknown as NotificationService;
};
