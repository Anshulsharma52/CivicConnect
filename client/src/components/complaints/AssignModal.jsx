import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import Modal from '../common/Modal';
import { departmentService } from '../../services/departmentService';
import { PRIORITIES } from '../../utils/constants';

const AssignModal = ({ isOpen, onClose, onAssign, initialPriority = 'MEDIUM', submitting = false }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priority, setPriority] = useState(initialPriority);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDept) {
      loadStaffForDept(selectedDept);
    } else {
      setStaffList([]);
      setSelectedStaff('');
    }
  }, [selectedDept]);

  const loadDepartments = async () => {
    try {
      setLoadingDepts(true);
      const res = await departmentService.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
        if (res.departments?.length > 0) {
          setSelectedDept(res.departments[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadStaffForDept = async (deptId) => {
    try {
      setLoadingStaff(true);
      const res = await departmentService.getDepartmentStaff(deptId);
      if (res.success) {
        setStaffList(res.staff || []);
        if (res.staff?.length > 0) {
          setSelectedStaff(res.staff[0]._id);
        } else {
          setSelectedStaff('');
        }
      }
    } catch (err) {
      console.error('Error fetching department staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedStaff) {
      alert('Please select both a department and an active staff member.');
      return;
    }
    onAssign({
      departmentId: selectedDept,
      assignedStaffId: selectedStaff,
      priority,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Complaint">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Department *
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            disabled={loadingDepts}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Assign Staff Member *
          </label>
          {loadingStaff ? (
            <p className="text-xs text-slate-400 py-2">Loading department staff...</p>
          ) : staffList.length === 0 ? (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
              No staff members registered in this department yet. Please add staff in Manage Staff page.
            </div>
          ) : (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {staffList.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Priority Level
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedStaff}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            {submitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignModal;
