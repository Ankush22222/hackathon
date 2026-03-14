import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
      toast.success('Logged in!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,5%,98%)]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">CoreInventory</h1>
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Login</button>
        <p className="text-xs text-slate-500 mt-4 text-center">
          No account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link> · <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
}
