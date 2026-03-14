import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier: '', warehouse: '', items: [{ product: '', expectedQty: 0 }] });

  useEffect(() => {
    api.get('/receipts').then(r => setReceipts(r.data));
    api.get('/warehouses').then(r => setWarehouses(r.data));
    api.get('/products').then(r => setProducts(r.data));
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { product: '', expectedQty: 0 }] });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/receipts', form);
      toast.success('Receipt created');
      setShowForm(false);
      api.get('/receipts').then(r => setReceipts(r.data));
    } catch (err) { toast.error('Failed'); }
  };

  const validate = async (id) => {
    try {
      await api.post(`/receipts/${id}/validate`);
      toast.success('Receipt validated — stock updated!');
      api.get('/receipts').then(r => setReceipts(r.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Receipts</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
          <Plus size={16} /> New Receipt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 space-y-4">
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Supplier Name" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} required />
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} required>
            <option value="">Select Warehouse</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <select className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={item.product} onChange={e => {
                const items = [...form.items]; items[i].product = e.target.value; setForm({ ...form, items });
              }}>
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
              </select>
              <input className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm" type="number" placeholder="Qty" value={item.expectedQty} onChange={e => {
                const items = [...form.items]; items[i].expectedQty = +e.target.value; setForm({ ...form, items });
              }} />
            </div>
          ))}
          <div className="flex gap-3">
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
            <button className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700">Create Receipt</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Reference</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Warehouse</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Items</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(r => (
              <tr key={r._id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{r.referenceNumber}</td>
                <td className="px-4 py-3">{r.supplier}</td>
                <td className="px-4 py-3">{r.warehouse?.name}</td>
                <td className="px-4 py-3">{r.items?.length} items</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${r.status === 'done' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status !== 'done' && r.status !== 'cancelled' && (
                    <button onClick={() => validate(r._id)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                      <CheckCircle2 size={14} /> Validate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
