import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  id?: number;
  lineNumber: number;
  description: string;
  quantity: string;
  unitOfMeasure: string;
  source: string;
  status: string;
  estimatedHours?: string;
  actualHours?: string;
}

interface Props {
  jobId?: number;
  initialLineItems?: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  readOnly?: boolean;
}

export default function JobLineItems({ jobId, initialLineItems = [], onChange, readOnly = false }: Props) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems.length > 0 ? initialLineItems : []);

  useEffect(() => {
    if (initialLineItems.length > 0) {
      setLineItems(initialLineItems);
    }
  }, [initialLineItems]);

  useEffect(() => {
    onChange(lineItems);
  }, [lineItems]);

  const addLineItem = () => {
    const newLine: LineItem = {
      lineNumber: lineItems.length + 1,
      description: '',
      quantity: '',
      unitOfMeasure: 'UNITS',
      source: 'ADDED',
      status: 'PENDING',
      estimatedHours: '',
      actualHours: ''
    };
    setLineItems([...lineItems, newLine]);
  };

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      lineNumber: i + 1
    }));
    setLineItems(updated);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const unitOptions = ['UNITS', 'METERS', 'KG', 'LITERS', 'HOURS', 'EACH', 'SET', 'LOT'];
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

  return (
    <div>
      {lineItems.length === 0 && !readOnly && (
        <div className="text-center py-4">
          <p className="text-muted mb-3">No line items yet. Add items for this job.</p>
          <button type="button" className="btn btn-primary" onClick={addLineItem}>
            <Plus size={18} className="me-2" />
            Add First Item
          </button>
        </div>
      )}

      {lineItems.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead className="table-light">
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ minWidth: '200px' }}>Description</th>
                <th style={{ width: '80px' }}>Qty</th>
                <th style={{ width: '100px' }}>UoM</th>
                <th style={{ width: '100px' }}>Source</th>
                <th style={{ width: '120px' }}>Status</th>
                {!readOnly && <th style={{ width: '60px' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center align-middle">{item.lineNumber}</td>
                  <td>
                    {readOnly ? item.description : (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? item.quantity : (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? item.unitOfMeasure : (
                      <select
                        className="form-select form-select-sm"
                        value={item.unitOfMeasure}
                        onChange={(e) => updateLineItem(index, 'unitOfMeasure', e.target.value)}
                      >
                        {unitOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={item.source === 'RFQ' ? 'badge bg-info' : 'badge bg-warning'}>
                      {item.source}
                    </span>
                  </td>
                  <td>
                    {readOnly ? (
                      <span className="badge bg-secondary">{item.status}</span>
                    ) : (
                      <select
                        className="form-select form-select-sm"
                        value={item.status}
                        onChange={(e) => updateLineItem(index, 'status', e.target.value)}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeLineItem(index)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!readOnly && lineItems.length > 0 && (
        <div className="mt-3">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={addLineItem}>
            <Plus size={16} className="me-1" />
            Add Line Item
          </button>
        </div>
      )}
    </div>
  );
}