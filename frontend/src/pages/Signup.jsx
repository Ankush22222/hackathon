import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/');
      toast.success('Account created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,5%,98%)]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Create Account</h1>
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="staff">Warehouse Staff</option>
          <option value="manager">Inventory Manager</option>
        </select>
        <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800">Sign Up</button>
        <p className="text-xs text-slate-500 mt-4 text-center">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
      </form>
    </div>
  );
}
