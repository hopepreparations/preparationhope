import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const LoginPage = () => {
  const [tab, setTab] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(username, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success('Login successful!');
    // After sign in, auth state change will set role, then redirect
    setTimeout(() => {
      navigate(tab === 'admin' ? '/admin' : '/student');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1a0a2e,hsl(var(--primary)),hsl(var(--accent)))] flex items-center justify-center p-5" id="login">
      <div className="bg-card rounded-3xl p-10 md:p-12 w-full max-w-[440px] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="text-center mb-6">
          <div className="font-display text-3xl font-black text-accent">HOPE</div>
          <p className="text-muted-foreground text-sm mt-1">Student & Admin Portal Login</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border-2 border-border mb-5">
          <button onClick={() => setTab('student')} className={`flex-1 py-3 text-center font-bold text-sm transition-all ${tab === 'student' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Student Login</button>
          <button onClick={() => setTab('admin')} className={`flex-1 py-3 text-center font-bold text-sm transition-all ${tab === 'admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Admin Login</button>
        </div>
        {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm font-semibold mb-4 flex items-center gap-2 border-l-4 border-destructive"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-text-dark mb-1.5"><i className="fas fa-user mr-1"></i> Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required className="w-full px-4 py-3 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-dark mb-1.5"><i className="fas fa-lock mr-1"></i> Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required className="w-full px-4 py-3 pr-12 border-2 border-border rounded-md text-sm focus:border-primary outline-none transition-colors" />
              <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-full font-bold bg-accent text-accent-foreground shadow-lg hover:bg-accent-dark transition-all disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'} <i className="fas fa-sign-in-alt ml-1"></i>
          </button>
        </form>
        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-primary font-semibold hover:text-accent transition-colors">
            <i className="fas fa-arrow-left mr-1"></i> Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
