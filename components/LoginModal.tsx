import React, { useState } from 'react';
import { X, Github } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      onLoginSuccess({
        name: 'Demo User',
        email: `user@${provider.toLowerCase()}.com`,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        provider
      });
      setLoading(false);
    }, 1000);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleSocialLogin('email');
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity animate-fade-in" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative z-10 inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-[0_40px_100px_-24px_rgba(0,0,0,.55)] ring-1 ring-black/5 transform transition-all animate-scale-in sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
            <div className="absolute top-4 right-4">
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="font-display text-[1.75rem] font-semibold tracking-[-0.04em] text-gray-950">Welcome back</h3>
              <p className="text-[0.9375rem] text-gray-500 mt-2.5">Log in to your account to continue</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-white text-[0.875rem] font-medium tracking-[-0.01em] text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {/* Simple Circle placeholder for Google G or use a generic icon */}
                <div className="w-5 h-5 rounded-full bg-linear-to-tr from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-[10px] text-white font-bold">G</div>
                Continue with Google
              </button>
              
              <button 
                onClick={() => handleSocialLogin('GitHub')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-gray-950 text-[0.875rem] font-medium tracking-[-0.01em] text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-eyebrow text-gray-400">or with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[0.8125rem] font-semibold tracking-[-0.01em] text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-3 border border-gray-200 rounded-2xl shadow-sm text-[0.875rem] placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                  placeholder="you@example.com"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-[0.9375rem] font-display font-semibold tracking-tight text-white bg-red-600 hover:bg-red-500 shadow-[0_12px_30px_-12px_rgba(220,38,38,.7)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-[0.875rem] text-gray-500">
              Don't have an account?{' '}
              <button className="font-medium text-red-600 hover:text-red-500">
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;