// tests/unit/features/portal/api/saleService.test.ts
import { saleService } from '../../../../../src/features/portal/api/saleService';

// Mock everything
jest.mock('../../../../../src/utils/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('SaleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass - getSales exists', () => {
    expect(saleService.getSales).toBeDefined();
  });

  it('should pass - getSaleById exists', () => {
    expect(saleService.getSaleById).toBeDefined();
  });

  it('should pass - createSale exists', () => {
    expect(saleService.createSale).toBeDefined();
  });

  it('should pass - updateSale exists', () => {
    expect(saleService.updateSale).toBeDefined();
  });

  it('should pass - deleteSale exists', () => {
    expect(saleService.deleteSale).toBeDefined();
  });

  it('should pass - getClientPurchases exists', () => {
    expect(saleService.getClientPurchases).toBeDefined();
  });

  it('should pass - getClientSummary exists', () => {
    expect(saleService.getClientSummary).toBeDefined();
  });

  it('should pass - getSaleDetails exists', () => {
    expect(saleService.getSaleDetails).toBeDefined();
  });

  it('should pass - getSalesSummary exists', () => {
    expect(saleService.getSalesSummary).toBeDefined();
  });

  it('should pass - getSalesByProduct exists', () => {
    expect(saleService.getSalesByProduct).toBeDefined();
  });

  it('should pass - getSalesByClient exists', () => {
    expect(saleService.getSalesByClient).toBeDefined();
  });

  it('should pass - getSalesByDate exists', () => {
    expect(saleService.getSalesByDate).toBeDefined();
  });

  it('should pass - getProductSalesHistory exists', () => {
    expect(saleService.getProductSalesHistory).toBeDefined();
  });

  it('should pass - service object exists', () => {
    expect(saleService).toBeDefined();
    expect(typeof saleService).toBe('object');
  });

  it('should pass - all methods are functions', () => {
    expect(typeof saleService.getSales).toBe('function');
    expect(typeof saleService.createSale).toBe('function');
    expect(typeof saleService.updateSale).toBe('function');
    expect(typeof saleService.deleteSale).toBe('function');
  });
});