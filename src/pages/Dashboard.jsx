import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, Truck, ArrowDownToLine, ArrowRightLeft } from 'lucide-react';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setKpis(res.data));
  }, []);

  if (!kpis) return <div className="p-8 text-sm text-slate-400">Loading...</div>;

  const cards = [
    { label: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Low Stock', value: kpis.lowStock, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Out of Stock', value: kpis.outOfStock, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: ArrowDownToLine, color: 'text-green-600 bg-green-50' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: Truck, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Transfers', value: kpis.pendingTransfers, icon: ArrowRightLeft, color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
