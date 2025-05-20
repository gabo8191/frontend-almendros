import { useState, useEffect } from 'react';
import { productService } from '../../../api/productService';

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
        const currentPrice = await productService.getCurrentPrice(productId);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Convert string prices to numbers
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
        console.error(`Error fetching price for product ${productId}:`, error);
        
        // Only update state if component is still mounted
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
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [productId]);

  return priceData;
}