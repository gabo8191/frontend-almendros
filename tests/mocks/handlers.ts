import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'SALESPERSON'
        }
      });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),
  
  http.get('/sales/reports', () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          date: '2024-03-15',
          total: 1500,
          items: [
            { id: 1, name: 'Product 1', quantity: 2, price: 750 }
          ]
        }
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10
      }
    });
  })
];