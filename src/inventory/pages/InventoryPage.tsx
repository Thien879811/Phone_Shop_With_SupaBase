import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { inventoryApi, type Inventory, type InventoryFilter } from '../services/inventory.api';
import { InventoryTable } from '../components/InventoryTable';
import { InventoryForm } from '../components/InventoryForm';
import { InventoryFilters } from '../components/InventoryFilter';

export const InventoryPage: React.FC = () => {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: undefined,
    sortOrder: undefined
  });
  
  const [filter, setFilter] = useState<InventoryFilter>({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    brand: '',
    status: ''
  });

  const [formVisible, setFormVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lazyParams, filter.status, filter.category, filter.brand]); // Trigger when page/filter changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getAll({
        ...filter,
        page: lazyParams.page,
        limit: lazyParams.rows,
        // Optional: add sort parameters to filter if backend supports it
      });
      setData(res.data);
      setTotalRecords(res.total);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to fetch inventory' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLazyParams({ ...lazyParams, first: 0, page: 1 });
    fetchData();
  };

  const handleClear = () => {
    setFilter({ page: 1, limit: 10, search: '', category: '', brand: '', status: '' });
    setLazyParams({ ...lazyParams, first: 0, page: 1 });
  };

  const onPageChange = (e: any) => {
    setLazyParams({
      ...lazyParams,
      first: e.first,
      rows: e.rows,
      page: e.page + 1
    });
  };

  const onSort = (e: any) => {
    setLazyParams({
      ...lazyParams,
      sortField: e.sortField,
      sortOrder: e.sortOrder
    });
  };

  const openNew = () => {
    setCurrentInventory(null);
    setIsViewMode(false);
    setFormVisible(true);
  };

  const openEdit = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setIsViewMode(false);
    setFormVisible(true);
  };

  const openView = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setIsViewMode(true);
    setFormVisible(true);
  };

  const saveInventory = async (formData: Partial<Inventory>) => {
    try {
      setSaving(true);
      if (formData.id) {
        // Edit mode
        await inventoryApi.update(formData.id, formData);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Inventory Updated' });
      } else {
        // Create mode
        await inventoryApi.create(formData);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Inventory Created' });
      }
      setFormVisible(false);
      fetchData();
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to save inventory' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (inventory: Inventory) => {
    confirmDialog({
      message: 'Are you sure you want to delete ' + inventory.productName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteInventory(inventory)
    });
  };

  const deleteInventory = async (inventory: Inventory) => {
    try {
      setLoading(true);
      await inventoryApi.delete(inventory.id);
      toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Inventory Deleted' });
      fetchData();
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to delete inventory' });
      setLoading(false);
    }
  };

  const handleExcelUpload = (e: any) => {
    const file = e.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of objects
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        // Map excel row fields to Inventory model
        const batchData = data.map((row: any) => ({
          productCode: String(row.productCode || ''),
          productName: String(row.productName || ''),
          category: String(row.category || ''),
          brand: String(row.brand || ''),
          importPrice: Number(row.importPrice) || 0,
          sellPrice: Number(row.sellPrice) || 0,
          quantity: Number(row.quantity) || 0,
          minQuantity: Number(row.minQuantity) || 0,
          warehouseLocation: String(row.warehouseLocation || ''),
          imei: row.imei ? String(row.imei) : undefined,
          description: row.description ? String(row.description) : undefined,
          status: (row.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as "ACTIVE" | "INACTIVE",
        }));

        if (batchData.length === 0) {
          toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'No data found in excel' });
          return;
        }

        await inventoryApi.createBatch(batchData);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: `Imported ${batchData.length} records` });
        fetchData();
      } catch (error: any) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to parse/import excel' });
      } finally {
        setLoading(false);
        fileUploadRef.current?.clear();
      }
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex gap-2 items-center">
          <FileUpload 
            ref={fileUploadRef}
            mode="basic" 
            accept=".xls,.xlsx" 
            maxFileSize={1000000} 
            customUpload 
            auto
            uploadHandler={handleExcelUpload} 
            chooseLabel="Import Excel" 
            className="p-button-outlined"
          />
          <Button label="Add Product" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
        </div>
      </div>

      <InventoryFilters 
        filter={filter} 
        onFilterChange={setFilter} 
        onSearch={handleSearch} 
        onClear={handleClear} 
      />

      <InventoryTable 
        data={data}
        totalRecords={totalRecords}
        loading={loading}
        lazyParams={lazyParams}
        onPageChange={onPageChange}
        onSort={onSort}
        onEdit={openEdit}
        onDelete={confirmDelete}
        onView={openView}
      />

      <InventoryForm 
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSave={saveInventory}
        inventory={currentInventory}
        loading={saving}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default InventoryPage;
