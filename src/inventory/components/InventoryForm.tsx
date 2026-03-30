import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import type { Inventory } from '../services/inventory.api';

interface InventoryFormProps {
  visible: boolean;
  onHide: () => void;
  onSave: (data: Partial<Inventory>) => void;
  inventory: Inventory | null;
  loading: boolean;
  isViewMode?: boolean;
}

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' }
];

export const InventoryForm: React.FC<InventoryFormProps> = ({
  visible,
  onHide,
  onSave,
  inventory,
  loading,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState<Partial<Inventory>>({
    productCode: '',
    productName: '',
    category: '',
    brand: '',
    importPrice: 0,
    sellPrice: 0,
    quantity: 0,
    minQuantity: 0,
    warehouseLocation: '',
    imei: '',
    image: '',
    description: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (inventory) {
      setFormData(inventory);
    } else {
      setFormData({
        productCode: '',
        productName: '',
        category: '',
        brand: '',
        importPrice: 0,
        sellPrice: 0,
        quantity: 0,
        minQuantity: 0,
        warehouseLocation: '',
        imei: '',
        image: '',
        description: '',
        status: 'ACTIVE'
      });
    }
    setErrors({});
  }, [inventory, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName?.trim()) newErrors.productName = 'Product Name is required';
    if (!formData.productCode?.trim()) newErrors.productCode = 'Product Code is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
    if ((formData.sellPrice || 0) <= 0) newErrors.sellPrice = 'Sell Price must be > 0';
    if ((formData.quantity || 0) < 0) newErrors.quantity = 'Quantity cannot be negative';
    if ((formData.minQuantity || 0) < 0) newErrors.minQuantity = 'Min Quantity cannot be negative';
    if (!formData.warehouseLocation?.trim()) newErrors.warehouseLocation = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const onChange = (e: any, name: string) => {
    const val = (e.target && e.target.value) !== undefined ? e.target.value : e.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const onImageUpload = (e: any) => {
    // In a real app, upload file to server and get URL
    // Here we'll just mock an image URL or process base64 for simplicity
    const file = e.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, image: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const renderFooter = () => {
    if (isViewMode) {
      return <Button label="Close" icon="pi pi-times" onClick={onHide} className="p-button-text" />;
    }
    return (
      <div>
        <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" disabled={loading} />
        <Button label="Save" icon="pi pi-check" onClick={handleSave} loading={loading} autoFocus />
      </div>
    );
  };

  return (
    <Dialog 
      visible={visible} 
      style={{ width: '600px' }} 
      header={isViewMode ? 'Inventory Details' : inventory ? 'Edit Inventory' : 'New Inventory'} 
      modal 
      className="p-fluid" 
      footer={renderFooter()} 
      onHide={onHide}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label htmlFor="productCode" className="font-bold block mb-2">Product Code*</label>
          <InputText 
            id="productCode" 
            value={formData.productCode} 
            onChange={(e) => onChange(e, 'productCode')} 
            required 
            autoFocus 
            readOnly={isViewMode}
            className={errors.productCode ? 'p-invalid' : ''} 
          />
          {errors.productCode && <small className="p-error">{errors.productCode}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="productName" className="font-bold block mb-2">Product Name*</label>
          <InputText 
            id="productName" 
            value={formData.productName} 
            onChange={(e) => onChange(e, 'productName')} 
            required 
            readOnly={isViewMode}
            className={errors.productName ? 'p-invalid' : ''} 
          />
          {errors.productName && <small className="p-error">{errors.productName}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="category" className="font-bold block mb-2">Category*</label>
          <InputText 
            id="category" 
            value={formData.category} 
            onChange={(e) => onChange(e, 'category')} 
            readOnly={isViewMode}
            className={errors.category ? 'p-invalid' : ''} 
          />
          {errors.category && <small className="p-error">{errors.category}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="brand" className="font-bold block mb-2">Brand*</label>
          <InputText 
            id="brand" 
            value={formData.brand} 
            onChange={(e) => onChange(e, 'brand')} 
            readOnly={isViewMode}
            className={errors.brand ? 'p-invalid' : ''} 
          />
          {errors.brand && <small className="p-error">{errors.brand}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="importPrice" className="font-bold block mb-2">Import Price</label>
          <InputNumber 
            id="importPrice" 
            value={formData.importPrice} 
            onValueChange={(e) => onChange(e, 'importPrice')} 
            mode="currency" 
            currency="VND" 
            locale="vi-VN" 
            readOnly={isViewMode}
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="sellPrice" className="font-bold block mb-2">Sell Price*</label>
          <InputNumber 
            id="sellPrice" 
            value={formData.sellPrice} 
            onValueChange={(e) => onChange(e, 'sellPrice')} 
            mode="currency" 
            currency="VND" 
            locale="vi-VN" 
            readOnly={isViewMode}
            className={errors.sellPrice ? 'p-invalid' : ''} 
          />
          {errors.sellPrice && <small className="p-error">{errors.sellPrice}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="quantity" className="font-bold block mb-2">Quantity*</label>
          <InputNumber 
            id="quantity" 
            value={formData.quantity} 
            onValueChange={(e) => onChange(e, 'quantity')} 
            min={0}
            readOnly={isViewMode}
            className={errors.quantity ? 'p-invalid' : ''} 
          />
          {errors.quantity && <small className="p-error">{errors.quantity}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="minQuantity" className="font-bold block mb-2">Min Quantity*</label>
          <InputNumber 
            id="minQuantity" 
            value={formData.minQuantity} 
            onValueChange={(e) => onChange(e, 'minQuantity')} 
            min={0}
            readOnly={isViewMode}
            className={errors.minQuantity ? 'p-invalid' : ''} 
          />
          {errors.minQuantity && <small className="p-error">{errors.minQuantity}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="warehouseLocation" className="font-bold block mb-2">Warehouse Location*</label>
          <InputText 
            id="warehouseLocation" 
            value={formData.warehouseLocation} 
            onChange={(e) => onChange(e, 'warehouseLocation')} 
            readOnly={isViewMode}
            className={errors.warehouseLocation ? 'p-invalid' : ''} 
          />
          {errors.warehouseLocation && <small className="p-error">{errors.warehouseLocation}</small>}
        </div>

        <div className="col-span-1">
          <label htmlFor="imei" className="font-bold block mb-2">IMEI (Serial)</label>
          <InputText 
            id="imei" 
            value={formData.imei} 
            onChange={(e) => onChange(e, 'imei')} 
            readOnly={isViewMode}
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="status" className="font-bold block mb-2">Status</label>
          <Dropdown 
            id="status" 
            value={formData.status} 
            onChange={(e) => onChange(e, 'status')} 
            options={statusOptions} 
            placeholder="Select a Status" 
            disabled={isViewMode}
          />
        </div>

        <div className="col-span-2">
          <label className="font-bold block mb-2">Image</label>
          {!isViewMode && (
            <FileUpload 
              mode="basic" 
              name="image" 
              accept="image/*" 
              maxFileSize={1000000} 
              onSelect={onImageUpload} 
              auto 
              chooseLabel="Browse Image" 
            />
          )}
          {formData.image && (
            <img src={formData.image} alt={formData.productName} className="mt-3 block mx-auto max-w-[200px] h-auto rounded shadow" />
          )}
        </div>

        <div className="col-span-2">
          <label htmlFor="description" className="font-bold block mb-2">Description</label>
          <InputTextarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => onChange(e, 'description')} 
            required 
            rows={3} 
            readOnly={isViewMode}
            autoResize 
          />
        </div>
      </div>
    </Dialog>
  );
};
