import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import type { InventoryFilter } from '../services/inventory.api';

interface InventoryFilterProps {
  filter: InventoryFilter;
  onFilterChange: (filter: InventoryFilter) => void;
  onSearch: () => void;
  onClear: () => void;
}

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' }
];

// Add generic static options or pass from parents for brands/categories
const categoryOptions = [
  { label: 'All', value: '' },
  { label: 'Smartphone', value: 'Smartphone' },
  { label: 'Tablet', value: 'Tablet' },
  { label: 'Accessories', value: 'Accessories' }
];

const brandOptions = [
  { label: 'All', value: '' },
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Xiaomi', value: 'Xiaomi' }
];

export const InventoryFilters: React.FC<InventoryFilterProps> = ({ filter, onFilterChange, onSearch, onClear }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center bg-white p-4 rounded-lg shadow-sm">
      <div className="p-inputgroup flex-1 min-w-[12rem]">
        <InputText 
          placeholder="Search by product name..." 
          value={filter.search || ''} 
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })} 
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <Button icon="pi pi-search" onClick={onSearch} />
      </div>

      <Dropdown 
        options={categoryOptions} 
        value={filter.category} 
        onChange={(e) => onFilterChange({ ...filter, category: e.value })} 
        placeholder="Select Category" 
        className="min-w-[10rem]"
      />

      <Dropdown 
        options={brandOptions} 
        value={filter.brand} 
        onChange={(e) => onFilterChange({ ...filter, brand: e.value })} 
        placeholder="Select Brand" 
        className="min-w-[10rem]"
      />

      <Dropdown 
        options={statusOptions} 
        value={filter.status} 
        onChange={(e) => onFilterChange({ ...filter, status: e.value })} 
        placeholder="Select Status" 
        className="min-w-[10rem]"
      />

      <Button label="Search" icon="pi pi-check" onClick={onSearch} className="p-button-primary" />
      <Button label="Clear" icon="pi pi-filter-slash" onClick={onClear} className="p-button-outlined p-button-secondary" />
    </div>
  );
};
