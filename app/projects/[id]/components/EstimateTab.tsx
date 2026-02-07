'use client';

import { useState, useEffect } from 'react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  laborRate: number;
  materialRate: number;
  totalRate: number;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  rate?: {
    description: string;
    source: string;
  };
}

interface EstimateSummary {
  totalLabor: number;
  totalMaterial: number;
  subtotal: number;
  totalCost: number;
  itemCount: number;
}

interface EstimateTabProps {
  projectId: string;
  lineItems: LineItem[];
  project: any;
  onRefresh: () => void;
}

export default function EstimateTab({ projectId, lineItems: initialLineItems, project, onRefresh }: EstimateTabProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [summary, setSummary] = useState<EstimateSummary | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (lineItems.length > 0) {
      fetchEstimate();
    }
  }, [projectId]);

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/estimate`);
      const data = await response.json();
      
      if (data.success) {
        setLineItems(data.lineItems);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch estimate:', error);
    }
  };

  const generateEstimate = async () => {
    if (!confirm('Generate estimate from verified quantities? This will create line items with industry rates.')) {
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/estimate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Generated ${data.stats.lineItemsCreated} line items!\n\nSubtotal: $${data.stats.subtotal.toLocaleString()}\nMarkup (${project.markupPercent || 20}%): $${data.stats.markup.toLocaleString()}\nTotal: $${data.stats.totalCost.toLocaleString()}`);
        fetchEstimate();
        onRefresh();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to generate estimate');
    } finally {
      setGenerating(false);
    }
  };

  if (lineItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h4 className="text-lg font-semibold text-slate-900 mb-2">No estimate yet</h4>
        <p className="text-slate-600 mb-6">
          Generate an estimate from your verified quantities
        </p>
        <button
          onClick={generateEstimate}
          disabled={generating}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? 'Generating...' : '🤖 Generate Estimate'}
        </button>
        <p className="text-sm text-slate-500 mt-4">
          Tip: Verify your quantities first for accurate estimates
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Estimate ({lineItems.length} items)
          </h3>
          <p className="text-sm text-slate-600">
            Line items with rates applied
          </p>
        </div>
        <button
          onClick={generateEstimate}
          disabled={generating}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {generating ? 'Regenerating...' : '↻ Regenerate'}
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Labor</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              ${summary.totalLabor.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Materials</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              ${summary.totalMaterial.toLocaleString()}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Subtotal</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              ${summary.subtotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total Cost</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              ${summary.totalCost.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900">Description</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Unit</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Rate</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Labor</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Material</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.description}</p>
                    {item.rate && (
                      <p className="text-xs text-slate-500 mt-1">
                        Rate: {item.rate.description} ({item.rate.source})
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 text-sm">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    ${item.totalRate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ${item.laborCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ${item.materialCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    ${item.totalCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Markup & Totals */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6">
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-slate-700">
            <span>Subtotal (Labor + Materials):</span>
            <span className="font-semibold">${summary?.subtotal.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Markup ({project.markupPercent || 20}%):</span>
            <span className="font-semibold">
              ${((summary?.totalCost || 0) - (summary?.subtotal || 0)).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-300">
            <span>Total Estimate:</span>
            <span>${summary?.totalCost.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 mt-6">
        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          📄 Export PDF
        </button>
        <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
          📊 Export Excel
        </button>
        <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
          ✉️ Send to Client
        </button>
      </div>
    </div>
  );
}
