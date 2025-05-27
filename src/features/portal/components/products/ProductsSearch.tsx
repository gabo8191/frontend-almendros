import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../../../shared/components/Input';

interface ProductsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductsSearch: React.FC<ProductsSearchProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="mb-6">
      <Input
        icon={<Search size={18} />}
        placeholder="Buscar productos por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default ProductsSearch;
