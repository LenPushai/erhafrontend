import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

interface SubTask {
  id?: number;
  taskNumber: number;
  operationType: string;
  description: string;
  assignedTo: string;
  estimatedHours: string;
  actualHours?: string;
  status: string;
  dueDate?: string;
  notes?: string;
}

interface Props {
  jobId?: number;
  initialSubTasks?: SubTask[];
  onChange: (subTasks: SubTask[]) => void;
  readOnly?: boolean;
}

export default function JobSubTasks({ jobId, initialSubTasks = [], onChange, readOnly = false }: Props) {
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialSubTasks.length > 0 ? initialSubTasks : [{
    taskNumber: 1,
    operationType: 'CUTTING',
    description: '',
    assignedTo: '',
    estimatedHours: '',
    actualHours: '',
    status: 'NOT_STARTED',
    dueDate: '',
    notes: ''
  }]);

  useEffect(() => {
    if (initialSubTasks.length > 0) {
      setSubTasks(initialSubTasks);
    }
  }, [initialSubTasks]);

  useEffect(() => {
    onChange(subTasks);
  }, [subTasks]);

  const addSubTask = () => {
    const newTask: SubTask = {
      taskNumber: subTasks.length + 1,
      operationType: 'CUTTING',
      description: '',
      assignedTo: '',
      estimatedHours: '',
      actualHours: '',
      status: 'NOT_STARTED',
      dueDate: '',
      notes: ''
    };
    setSubTasks([...subTasks, newTask]);
  };

  const removeSubTask = (index: number) => {
    if (subTasks.length === 1) return;
    const updated = subTasks.filter((_, i) => i !== index);
    updated.forEach((task, i) => task.taskNumber = i + 1);
    setSubTasks(updated);
  };

  const updateSubTask = (index: number, field: keyof SubTask, value: string) => {
    const updated = [...subTasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubTasks(updated);
  };

  const getTotalEstimatedHours = () => {
    return subTasks.reduce((sum, task) => sum + (parseFloat(task.estimatedHours) || 0), 0).toFixed(1);
  };

  const getTotalActualHours = () => {
    return subTasks.reduce((sum, task) => sum + (parseFloat(task.actualHours || '0') || 0), 0).toFixed(1);
  };

  if (readOnly) {
    return (
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Sub Tasks / Operations</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Operation</th>
                  <th width="30%">Description</th>
                  <th width="15%">Assigned To</th>
                  <th width="10%">Est. Hours</th>
                  <th width="10%">Actual Hours</th>
                  <th width="15%">Status</th>
                </tr>
              </thead>
              <tbody>
                {subTasks.map((task, index) => (
                  <tr key={index}>
                    <td>{task.taskNumber}</td>
                    <td><span className="badge bg-secondary">{task.operationType}</span></td>
                    <td>{task.description}</td>
                    <td>{task.assignedTo}</td>
                    <td>{task.estimatedHours}h</td>
                    <td className="fw-bold">{task.actualHours || '0'}h</td>
                    <td>
                      <span className={`badge ${
                        task.status === 'COMPLETED' ? 'bg-success' : 
                        task.status === 'IN_PROGRESS' ? 'bg-primary' : 
                        task.status === 'ON_HOLD' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-end fw-bold">Total Hours:</td>
                  <td className="fw-bold">{getTotalEstimatedHours()}h</td>
                  <td className="fw-bold text-primary">{getTotalActualHours()}h</td>
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
        <h5 className="mb-0">Sub Tasks / Operations</h5>
        <button type="button" className="btn btn-sm btn-success" onClick={addSubTask}>
          <Plus size={16} className="me-1" />
          Add Task
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th width="4%">#</th>
                <th width="12%">Operation *</th>
                <th width="25%">Description *</th>
                <th width="12%">Assigned To</th>
                <th width="10%">Est. Hours</th>
                <th width="10%">Actual Hours</th>
                <th width="12%">Status</th>
                <th width="10%">Due Date</th>
                <th width="3%"></th>
              </tr>
            </thead>
            <tbody>
              {subTasks.map((task, index) => (
                <tr key={index}>
                  <td className="align-middle">{task.taskNumber}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={task.operationType}
                      onChange={(e) => updateSubTask(index, 'operationType', e.target.value)}
                      required
                    >
                      <option value="CUTTING">Cutting</option>
                      <option value="WELDING">Welding</option>
                      <option value="MACHINING">Machining</option>
                      <option value="FABRICATION">Fabrication</option>
                      <option value="ASSEMBLY">Assembly</option>
                      <option value="PAINTING">Painting</option>
                      <option value="SANDBLASTING">Sandblasting</option>
                      <option value="INSPECTION">Inspection</option>
                      <option value="QC">QC</option>
                      <option value="INSTALLATION">Installation</option>
                      <option value="DELIVERY">Delivery</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={task.description}
                      onChange={(e) => updateSubTask(index, 'description', e.target.value)}
                      placeholder="Task description"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={task.assignedTo}
                      onChange={(e) => updateSubTask(index, 'assignedTo', e.target.value)}
                      placeholder="Person"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={task.estimatedHours}
                      onChange={(e) => updateSubTask(index, 'estimatedHours', e.target.value)}
                      step="0.5"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={task.actualHours}
                      onChange={(e) => updateSubTask(index, 'actualHours', e.target.value)}
                      step="0.5"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={task.status}
                      onChange={(e) => updateSubTask(index, 'status', e.target.value)}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={task.dueDate}
                      onChange={(e) => updateSubTask(index, 'dueDate', e.target.value)}
                    />
                  </td>
                  <td className="align-middle text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeSubTask(index)}
                      disabled={subTasks.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-end fw-bold">
                  <Clock size={16} className="me-2" />
                  Total Estimated Hours:
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm fw-bold"
                    value={getTotalEstimatedHours() + 'h'}
                    readOnly
                    style={{backgroundColor: '#e9ecef'}}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm fw-bold text-primary"
                    value={getTotalActualHours() + 'h'}
                    readOnly
                    style={{backgroundColor: '#d4edda'}}
                  />
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}