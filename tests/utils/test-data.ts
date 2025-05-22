export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'SALESPERSON',
  isActive: true
};

export const mockSale = {
  id: 1,
  saleDate: '2024-03-15T10:00:00Z',
  clientId: 1,
  client: {
    name: 'Test Client',
    email: 'client@example.com',
    documentNumber: '123456789'
  },
  details: [
    {
      productId: 1,
      productName: 'Test Product',
      quantity: 2,
      unitPrice: 750,
      discountAmount: 0
    }
  ],
  totalAmount: 1500,
  notes: 'Test sale'
};

export const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  minQuantity: 5,
  maxQuantity: 100,
  currentStock: 50,
  purchasePrice: 500,
  sellingPrice: 750,
  isActive: true
};