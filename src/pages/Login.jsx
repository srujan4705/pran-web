import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    user_name: '',
    pass_key: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const rawUserName = formData.user_name.trim();
      const normalizedUserName = rawUserName.includes('@')
        ? rawUserName
        : `${rawUserName}@pran.com`;

      await login({ 
        user_name: normalizedUserName,
        pass_key: formData.pass_key 
      });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message?.toLowerCase() || "";
      const errorData = error.response?.data;
      
      // Specific handling for different failure reasons
      if (status === 404 || message.includes("not found") || message.includes("user does not exist")) {
        toast.error('User not found. Please register first!');
      } else if (status === 401 || message.includes("password") || message.includes("credentials") || message.includes("unauthorized")) {
        toast.error('Invalid login credentials');
      } else if (message.includes("disabled") || message.includes("locked")) {
        toast.error('Account is disabled. Please contact support.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        // Fallback to the server's specific message if available, otherwise a generic one
        toast.error(error.response?.data?.message || 'Invalid login credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
      toast.success('Welcome back with Google!');
    } catch (error) {
      console.error("Google Login error:", error);
      const message = error.response?.data?.message?.toLowerCase() || error.message?.toLowerCase() || "";
      
      if (message.includes("not found") || message.includes("not registered")) {
        toast.error('Google account not registered. Please sign up first!');
      } else {
        toast.error('Google sign in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] overflow-hidden w-full max-w-md shadow-2xl border border-slate-100">
        {/* Header Section - Themed to match Home page */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200')] bg-cover bg-center opacity-10" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80 font-medium">Sign in to your alumni account</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="pass_key"
                  value={formData.pass_key}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end px-1">
                <Link 
                  to="/ForgotPassword" 
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              Sign in
            </button>
          </form>

          {/* Social Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium">Or continue with:</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          {/* Footer Links */}
          <div className="pt-4 flex items-center text-sm font-bold">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">New here?</span>
              <Link to="/Signup" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
