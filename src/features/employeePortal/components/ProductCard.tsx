import React from 'react';
import { useProductPrice } from '../../portal/components/pos/Hooks/useProductPrice';
import { Product } from '../../portal/api/productService';

interface ProductCardProps {
  product: Product;
  // other props...
}

const ProductCard: React.FC<ProductCardProps> = ({ product, /* other props */ }) => {
  const { purchasePrice, sellingPrice, loading, error } = useProductPrice(product.id);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  // Rest of your component...
  
  return (
    <div className="product-card">
      {/* Other product information */}
      
      {loading ? (
        <div className="text-gray-400">Cargando precios...</div>
      ) : error ? (
        <div className="text-red-500">Error al cargar precios</div>
      ) : (
        <div>
          <div className="text-lg font-bold">{formatCurrency(sellingPrice)}</div>
          <div className="text-sm text-gray-600">Precio de compra: {formatCurrency(purchasePrice)}</div>
        </div>
      )}
      
      {/* Rest of your component */}
    </div>
  );
};

export default ProductCard;