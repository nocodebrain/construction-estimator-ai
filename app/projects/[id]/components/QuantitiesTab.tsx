'use client';

import { useState } from 'react';

interface Quantity {
  id: string;
  description: string;
  unit: string;
  amount: number;
  category: string;
  confidence?: number;
  verified: boolean;
  source?: string;
  file?: { name: string };
}

interface QuantitiesTabProps {
  projectId: string;
  quantities: Quantity[];
  onRefresh: () => void;
}

export default function QuantitiesTab({ projectId, quantities, onRefresh }: QuantitiesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Quantity>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuantity, setNewQuantity] = useState({
    description: '',
    unit: 'm2',
    amount: 0,
    category: 'OTHER',
  });

  const categories = [
    'WALLS', 'FLOORS', 'CEILINGS', 'DOORS', 'WINDOWS',
    'ELECTRICAL', 'PLUMBING', 'HVAC', 'FINISHES', 'OTHER'
  ];

  const units = ['m2', 'm', 'each', 'kg', 'L', 'set'];

  const startEdit = (q: Quantity) => {
    setEditingId(q.id);
    setEditForm(q);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/quantities/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        alert('Failed to update quantity');
      }
    } catch (error) {
      alert('Failed to update quantity');
    }
  };

  const deleteQuantity = async (id: string) => {
    if (!confirm('Delete this quantity?')) return;

    try {
      const response = await fetch(`/api/quantities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to delete quantity');
      }
    } catch (error) {
      alert('Failed to delete quantity');
    }
  };

  const addQuantity = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/quantities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuantity),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewQuantity({ description: '', unit: 'm2', amount: 0, category: 'OTHER' });
        onRefresh();
      } else {
        alert('Failed to add quantity');
      }
    } catch (error) {
      alert('Failed to add quantity');
    }
  };

  const verifyQuantity = async (id: string) => {
    try {
      await fetch(`/api/quantities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });
      onRefresh();
    } catch (error) {
      alert('Failed to verify quantity');
    }
  };

  // Group by category
  const grouped = quantities.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Quantity[]>);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Quantities ({quantities.length})
          </h3>
          <p className="text-sm text-slate-600">
            Extracted from uploaded documents
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Add Quantity
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-slate-900 mb-4">Add Manual Quantity</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text"
                value={newQuantity.description}
                onChange={(e) => setNewQuantity({ ...newQuantity, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g., Internal walls - plasterboard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <input
                type="number"
                value={newQuantity.amount}
                onChange={(e) => setNewQuantity({ ...newQuantity, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
              <select
                value={newQuantity.unit}
                onChange={(e) => setNewQuantity({ ...newQuantity, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={newQuantity.category}
                onChange={(e) => setNewQuantity({ ...newQuantity, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addQuantity}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Add Quantity
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quantities List */}
      {quantities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h4 className="text-lg font-semibold text-slate-900 mb-2">No quantities yet</h4>
          <p className="text-slate-600 mb-6">
            Process your uploaded files or add quantities manually
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const items = grouped[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="bg-white border border-slate-200 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4">{category} ({items.length})</h4>
                <div className="space-y-3">
                  {items.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      {editingId === q.id ? (
                        <div className="flex-1 grid grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="col-span-2 px-3 py-1 border border-slate-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            value={editForm.amount || 0}
                            onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                            className="px-3 py-1 border border-slate-300 rounded text-sm"
                          />
                          <select
                            value={editForm.unit || 'm2'}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="px-3 py-1 border border-slate-300 rounded text-sm"
                          >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-slate-900">{q.description}</p>
                            {!q.verified && q.confidence && q.confidence < 1 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                AI: {Math.round(q.confidence * 100)}%
                              </span>
                            )}
                            {q.verified && (
                              <span className="text-green-600 text-sm">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            <span className="font-semibold">{q.amount} {q.unit}</span>
                            {q.source && <span className="ml-2">· {q.source}</span>}
                            {q.file && <span className="ml-2">· from {q.file.name}</span>}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {editingId === q.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-slate-300 text-slate-700 text-sm rounded hover:bg-slate-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {!q.verified && (
                              <button
                                onClick={() => verifyQuantity(q.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(q)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteQuantity(q.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
