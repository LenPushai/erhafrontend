import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface LineItem {
  id?: number;
  lineNumber: number;
  description: string;
  quantity: string;
  unitOfMeasure: string;
  estimatedUnitPrice: string;
  estimatedLineTotal: string;
  drawingReference?: string;
  notes?: string;
}

interface Props {
  rfqId?: number;
  initialLineItems?: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  readOnly?: boolean;
}

export default function RFQLineItems({ rfqId, initialLineItems = [], onChange, readOnly = false }: Props) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems.length > 0 ? initialLineItems : [{
    lineNumber: 1,
    description: '',
    quantity: '',
    unitOfMeasure: 'UNITS',
    estimatedUnitPrice: '',
    estimatedLineTotal: '',
    drawingReference: '',
    notes: ''
  }]);

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
      estimatedUnitPrice: '',
      estimatedLineTotal: '',
      drawingReference: '',
      notes: ''
    };
    setLineItems([...lineItems, newLine]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const updated = lineItems.filter((_, i) => i !== index);
    // Renumber
    updated.forEach((item, i) => item.lineNumber = i + 1);
    setLineItems(updated);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate line total
    if (field === 'quantity' || field === 'estimatedUnitPrice') {
      const qty = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
      const price = parseFloat(field === 'estimatedUnitPrice' ? value : updated[index].estimatedUnitPrice) || 0;
      updated[index].estimatedLineTotal = (qty * price).toFixed(2);
    }

    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.estimatedLineTotal) || 0), 0).toFixed(2);
  };

  if (readOnly) {
    return (
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Line Items</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="35%">Description</th>
                  <th width="10%">Qty</th>
                  <th width="10%">Unit</th>
                  <th width="15%">Unit Price</th>
                  <th width="15%">Line Total</th>
                  <th width="10%">Drawing</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.lineNumber}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitOfMeasure}</td>
                    <td>R {parseFloat(item.estimatedUnitPrice || '0').toFixed(2)}</td>
                    <td className="fw-bold">R {parseFloat(item.estimatedLineTotal || '0').toFixed(2)}</td>
                    <td><small className="text-muted">{item.drawingReference}</small></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-end fw-bold">Total Estimated Value:</td>
                  <td className="fw-bold text-success">R {calculateTotal()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Line Items</h5>
        <button type="button" className="btn btn-sm btn-success" onClick={addLineItem}>
          <Plus size={16} className="me-1" />
          Add Line
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th width="3%">#</th>
                <th width="30%">Description *</th>
                <th width="8%">Qty</th>
                <th width="10%">Unit</th>
                <th width="12%">Unit Price</th>
                <th width="12%">Line Total</th>
                <th width="15%">Drawing Ref</th>
                <th width="5%"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="align-middle">{item.lineNumber}</td>
                  <td>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.unitOfMeasure}
                      onChange={(e) => updateLineItem(index, 'unitOfMeasure', e.target.value)}
                    >
                      <option value="UNITS">Units</option>
                      <option value="HOURS">Hours</option>
                      <option value="KG">Kg</option>
                      <option value="TONS">Tons</option>
                      <option value="METERS">Meters</option>
                      <option value="SQM">Sqm</option>
                      <option value="LITRES">Litres</option>
                    </select>
                  </td>
                  <td>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">R</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.estimatedUnitPrice}
                        onChange={(e) => updateLineItem(index, 'estimatedUnitPrice', e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">R</span>
                      <input
                        type="text"
                        className="form-control form-control-sm fw-bold"
                        value={item.estimatedLineTotal}
                        readOnly
                        style={{backgroundColor: '#e9ecef'}}
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.drawingReference}
                      onChange={(e) => updateLineItem(index, 'drawingReference', e.target.value)}
                      placeholder="DWG-001"
                    />
                  </td>
                  <td className="align-middle text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-end fw-bold">
                  <Calculator size={16} className="me-2" />
                  Total Estimated Value:
                </td>
                <td>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text fw-bold">R</span>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-bold text-success"
                      value={calculateTotal()}
                      readOnly
                      style={{backgroundColor: '#d4edda', fontSize: '1.1rem'}}
                    />
                  </div>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}