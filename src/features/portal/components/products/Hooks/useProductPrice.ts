import { useState, useEffect } from 'react';
import { priceService } from '../../../api/product';

interface PriceData {
  purchasePrice: number | null;
  sellingPrice: number | null;
  loading: boolean;
  error: string | null;
}

export function useProductPrice(productId: number): PriceData {
  const [priceData, setPriceData] = useState<PriceData>({
    purchasePrice: null,
    sellingPrice: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchPrice = async () => {
      if (!productId) return;
      
      try {
        const currentPrice = await priceService.getCurrentPrice(productId);
        
        if (isMounted) {
          const purchasePrice = currentPrice.purchasePrice ? Number(currentPrice.purchasePrice) : null;
          const sellingPrice = currentPrice.sellingPrice ? Number(currentPrice.sellingPrice) : null;
          
          setPriceData({
            purchasePrice,
            sellingPrice,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setPriceData({
            purchasePrice: null,
            sellingPrice: null,
            loading: false,
            error: 'Error al cargar los precios'
          });
        }
      }
    };

    fetchPrice();
    
    return () => {
      isMounted = false;
    };
  }, [productId]);

  return priceData;
}
