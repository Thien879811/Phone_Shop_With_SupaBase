import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import type { Inventory } from '../services/inventory.api';

interface InventoryTableProps {
  data: Inventory[];
  totalRecords: number;
  loading: boolean;
  lazyParams: any;
  onPageChange: (e: any) => void;
  onSort: (e: any) => void;
  onEdit: (data: Inventory) => void;
  onDelete: (data: Inventory) => void;
  onView: (data: Inventory) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  totalRecords,
  loading,
  lazyParams,
  onPageChange,
  onSort,
  onEdit,
  onDelete,
  onView
}) => {
  const imageBodyTemplate = (rowData: Inventory) => {
    return (
      <img 
        src={rowData.image || 'https://via.placeholder.com/50'} 
        alt={rowData.productName} 
        className="w-12 h-12 object-cover rounded shadow-sm"
      />
    );
  };

  const statusBodyTemplate = (rowData: Inventory) => {
    return (
      <Badge 
        value={rowData.status} 
        severity={rowData.status === 'ACTIVE' ? 'success' : 'danger'} 
      />
    );
  };

  const quantityBodyTemplate = (rowData: Inventory) => {
    const isLowStock = rowData.quantity <= rowData.minQuantity;
    return (
      <div className="flex flex-col items-center">
        <span className={`font-bold ${isLowStock ? 'text-red-500' : ''}`}>
          {rowData.quantity}
        </span>
        {isLowStock && (
          <Badge value="Low Stock" severity="danger" className="mt-1 text-[10px]" />
        )}
      </div>
    );
  };

  const priceBodyTemplate = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const actionBodyTemplate = (rowData: Inventory) => {
    return (
      <div className="flex gap-2 justify-center">
        <Button icon="pi pi-eye" rounded outlined severity="info" onClick={() => onView(rowData)} />
        <Button icon="pi pi-pencil" rounded outlined severity="warning" onClick={() => onEdit(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => onDelete(rowData)} />
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <DataTable 
        value={data} 
        lazy 
        paginator 
        first={lazyParams.first} 
        rows={lazyParams.rows} 
        totalRecords={totalRecords} 
        onPage={onPageChange} 
        onSort={onSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        loading={loading}
        dataKey="id"
        emptyMessage="No inventories found."
        className="p-datatable-sm"
        stripedRows
      >
        <Column body={imageBodyTemplate} header="Image" />
        <Column field="productCode" header="Code" sortable />
        <Column field="productName" header="Name" sortable />
        <Column field="category" header="Category" sortable />
        <Column field="brand" header="Brand" sortable />
        <Column field="importPrice" header="Import Price" body={(row) => priceBodyTemplate(row.importPrice)} sortable />
        <Column field="sellPrice" header="Sell Price" body={(row) => priceBodyTemplate(row.sellPrice)} sortable />
        <Column field="quantity" header="Quantity" body={quantityBodyTemplate} sortable align="center" />
        <Column field="minQuantity" header="Min Qty" sortable align="center" />
        <Column field="warehouseLocation" header="Location" />
        <Column field="status" header="Status" body={statusBodyTemplate} align="center" />
        <Column body={actionBodyTemplate} exportable={false} align="center" style={{ minWidth: '10rem' }} />
      </DataTable>
    </div>
  );
};
