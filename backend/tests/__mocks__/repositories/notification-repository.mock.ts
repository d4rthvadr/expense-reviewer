import { NotificationRepository } from '@domain/repositories/notification.repository';

export const createMockNotificationRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
  } as unknown as NotificationRepository;
};
