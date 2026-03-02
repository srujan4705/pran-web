import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Award, 
  Droplets, 
  Camera,
  Loader2,
  ChevronRight,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Email, 2: Full Form
  const [isLoading, setIsLoading] = useState(false);
  const { signup, googleSignup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    user_name: '',
    pass_key: '',
    fullName: '',
    mobileNumber: '',
    dateOfBirth: '',
    dateOfMarriage: '',
    profession: {
      title: '',
      description: ''
    },
    addressForCommunication: {
      street1: '',
      street2: '',
      city: '',
      district: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    profilePhoto: '',
    bloodGroup: '',
    qualification: '',
    firebase_uid: null, // Track if signed up with Google
  });

  useEffect(() => {
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const photo = searchParams.get('photo');

    if (email || name || photo) {
      setFormData(prev => ({
        ...prev,
        user_name: email || prev.user_name,
        fullName: name || prev.fullName,
        profilePhoto: photo || prev.profilePhoto,
      }));
      setStep(2);
      toast.success('Google details captured!');
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!formData.user_name) {
      toast.error('Please enter your email');
      return;
    }
    setStep(2);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const response = await googleSignup();
      const googleUser = response.user;
      setFormData(prev => ({
        ...prev,
        user_name: googleUser.email || prev.user_name,
        fullName: googleUser.fullName || prev.fullName,
        profilePhoto: googleUser.profilePhoto || prev.profilePhoto,
        firebase_uid: response.firebase_uid, // Store firebase_uid to trigger Case 2 in API
      }));
      toast.success('Google details captured! Please complete your profile.');
      setStep(2);
    } catch (error) {
      console.error("Google Signup error:", error);
      const message = error.message?.toLowerCase() || "";
      if (message.includes("already registered") || message.includes("exists")) {
        toast.error('Email already registered. Login directly!');
      } else {
        toast.error(error.message || 'Google signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error("Signup error:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message?.toLowerCase() || "";
      
      if (status === 409 || message.includes("already") || message.includes("exists")) {
        toast.error('Email already registered. Login directly!');
      } else {
        toast.error(error.response?.data?.message || 'Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] overflow-hidden w-full max-w-md shadow-2xl border border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200')] bg-cover bg-center opacity-10" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-white/80 font-medium">Join our alumni community today</p>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Enter your email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    placeholder="Ex. you@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                Sign up
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">Or continue with:</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <div className="pt-4 flex items-center text-sm font-bold">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Already have an account?</span>
                <Link to="/Login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-8 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200')] bg-cover bg-center opacity-10" />
            <div className="flex items-center gap-4 relative z-10">
              <button 
                onClick={() => setStep(1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
                <p className="text-white/80 font-medium text-sm">Just a few more details to get started</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-8 h-2 rounded-full bg-white" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-100">
                  <User className="w-5 h-5 text-indigo-600" /> Personal Details
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Ex. John Doe"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      name="user_name"
                      value={formData.user_name}
                      readOnly
                      className="pl-10 h-12 bg-slate-100 border-slate-200 rounded-xl font-medium text-slate-500"
                    />
                  </div>
                </div>

                {!formData.firebase_uid && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="password"
                        name="pass_key"
                        value={formData.pass_key}
                        onChange={handleInputChange}
                        placeholder="Ex. ••••••••"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required={!formData.firebase_uid}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="Ex. 9876543210"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Blood Group</label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        placeholder="Ex. O+"
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Date of Marriage</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="date"
                        name="dateOfMarriage"
                        value={formData.dateOfMarriage}
                        onChange={handleInputChange}
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Qualification</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      placeholder="Ex. B.Tech"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional & Address */}
              <div className="space-y-8">
                {/* Professional */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-100">
                    <Briefcase className="w-5 h-5 text-indigo-600" /> Professional Info
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Job Title</label>
                    <Input
                      name="profession.title"
                      value={formData.profession.title}
                      onChange={handleInputChange}
                      placeholder="Ex. Software Engineer"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">Description</label>
                    <Input
                      name="profession.description"
                      value={formData.profession.description}
                      onChange={handleInputChange}
                      placeholder="Ex. Full Stack Developer"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-100">
                    <MapPin className="w-5 h-5 text-indigo-600" /> Communication Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Street 1</label>
                      <Input
                        name="addressForCommunication.street1"
                        value={formData.addressForCommunication.street1}
                        onChange={handleInputChange}
                        placeholder="Ex. 123 Main St"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Street 2</label>
                      <Input
                        name="addressForCommunication.street2"
                        value={formData.addressForCommunication.street2}
                        onChange={handleInputChange}
                        placeholder="Ex. Apt 4B"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">City</label>
                      <Input
                        name="addressForCommunication.city"
                        value={formData.addressForCommunication.city}
                        onChange={handleInputChange}
                        placeholder="Ex. Hyderabad"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">District</label>
                      <Input
                        name="addressForCommunication.district"
                        value={formData.addressForCommunication.district}
                        onChange={handleInputChange}
                        placeholder="Ex. Hyderabad"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">State</label>
                      <Input
                        name="addressForCommunication.state"
                        value={formData.addressForCommunication.state}
                        onChange={handleInputChange}
                        placeholder="Telangana"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Country</label>
                      <Input
                        name="addressForCommunication.country"
                        value={formData.addressForCommunication.country}
                        onChange={handleInputChange}
                        placeholder="India"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600">Pincode</label>
                      <Input
                        name="addressForCommunication.pincode"
                        value={formData.addressForCommunication.pincode}
                        onChange={handleInputChange}
                        placeholder="500001"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold">
                <Camera className="w-5 h-5" />
                <span>You can upload your profile photo later on the Profile page.</span>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>Create Account <ChevronRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
