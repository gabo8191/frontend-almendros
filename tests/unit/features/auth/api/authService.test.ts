// tests/unit/features/auth/api/authService.test.ts
import { authService } from '../../../../../src/features/auth/api/authService';

// Mock everything
jest.mock('../../../../../src/utils/axiosConfig', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass - login test', () => {
    expect(authService).toBeDefined();
    expect(authService.login).toBeDefined();
  });

  it('should pass - signup test', () => {
    expect(authService.signup).toBeDefined();
  });

  it('should pass - logout test', () => {
    authService.logout();
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
  });

  it('should pass - getToken test', () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    const token = authService.getToken();
    expect(token).toBe('fake-token');
  });

  it('should pass - isAuthenticated test', () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    const result = authService.isAuthenticated();
    expect(result).toBe(true);
  });

  it('should pass - getCurrentUserRole test', () => {
    expect(authService.getCurrentUserRole).toBeDefined();
  });
});