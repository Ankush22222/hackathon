import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unitOfMeasure: 'units', reorderLevel: 10 });

  const fetchProducts = () => {
    api.get('/products', { params: { search } }).then(res => setProducts(res.data));
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      toast.success('Product created');
      setShowForm(false);
      setForm({ name: '', sku: '', category: '', unitOfMeasure: 'units', reorderLevel: 10 });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
          <Plus size={16} /> New Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 grid grid-cols-2 gap-4">
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="SKU Code" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Unit (kg, units...)" value={form.unitOfMeasure} onChange={e => setForm({ ...form, unitOfMeasure: e.target.value })} />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: +e.target.value })} />
          <button className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">Save Product</button>
        </form>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Total Stock</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const total = p.totalStock ?? p.stock?.reduce((s, e) => s + e.quantity, 0) ?? 0;
              const status = total === 0 ? 'Out of Stock' : total <= p.reorderLevel ? 'Low Stock' : 'In Stock';
              const statusColor = total === 0 ? 'text-red-600 bg-red-50' : total <= p.reorderLevel ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';
              return (
                <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums">{total} {p.unitOfMeasure}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>{status}</span></td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
