import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/localClient';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        let startedAtRaw = localStorage.getItem("sessionStartedAt");

        if (!token) {
          setUser(null);
          return;
        }

        if (!startedAtRaw) {
          startedAtRaw = Date.now().toString();
          localStorage.setItem("sessionStartedAt", startedAtRaw);
        }

        const startedAt = parseInt(startedAtRaw, 10);
        if (Number.isFinite(startedAt) && Date.now() - startedAt > SESSION_TTL_MS) {
          api.auth.logout();
          localStorage.removeItem("idToken");
          localStorage.removeItem("sessionStartedAt");
          setUser(null);
          return;
        }

        const data = await api.auth.me();
        const userObj = data.user || data;
        const uid = (userObj?._id ?? userObj?.user_id ?? userObj?.id ?? localStorage.getItem("userId") ?? "").toString();
        
        if (uid) {
          localStorage.setItem("userId", uid);
          const userObj = data.profile || data.user || data;
          const name = userObj?.fullName || userObj?.full_name || userObj?.name || data.fullName || data.full_name || data.name || userObj?.display_name || "";
          
          // Pattern match exactly with userEmail storage
          const finalName = name || "Alumni User";
          localStorage.setItem("userName", finalName);
          
          setUser({ ...userObj, mongo_id: uid, full_name: finalName });
        } else {
          setUser(userObj);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        api.auth.logout();
        localStorage.removeItem("idToken");
        localStorage.removeItem("sessionStartedAt");
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    console.log("AuthContext - Raw Login Response Data:", data);
    
    // Extract token
    const token = data.token;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("sessionStartedAt", Date.now().toString());
    }

    // Extract user info
    const userObj = data.profile || data.user || data;
    const uid = (data.mongo_id || userObj?.mongo_id || data._id || userObj?._id || data.id || userObj?.id || "").toString();
    const email = data.email || userObj?.email || "";
    
    // Comprehensive name extraction based on provided response structure
    const extractedName = userObj?.fullName || 
                         userObj?.full_name || 
                         userObj?.name || 
                         data.fullName || 
                         data.full_name || 
                         data.name || 
                         "Alumni User";
    
    if (uid) localStorage.setItem("userId", uid);
    if (email) localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", extractedName);
    
    console.log("AuthContext Login - Stored Pattern:", {
      userId: uid,
      userEmail: email,
      userName: extractedName
    });
    
    const finalUser = { ...userObj, mongo_id: uid, email };
    setUser(finalUser);
    
    return data;
  };

  const signup = async (formData) => {
    const data = await api.auth.signup(formData);
    console.log("AuthContext - Raw Signup Response Data:", data);
    
    // Extract token
    const token = data.token;
    if (token) localStorage.setItem("idToken", token);

    // Extract user info
    const userObj = data.profile || data.user || data;
    const uid = (data.mongo_id || userObj?.mongo_id || data._id || userObj?._id || data.id || userObj?.id || "").toString();
    const email = data.email || userObj?.email || formData.user_name || "";
    
    // Comprehensive name extraction
    const extractedName = userObj?.fullName || 
                         userObj?.full_name || 
                         userObj?.name || 
                         data.fullName || 
                         data.full_name || 
                         data.name || 
                         formData.full_name || 
                         "Alumni User";
    
    if (uid) localStorage.setItem("userId", uid);
    if (email) localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", extractedName);
    
    console.log("AuthContext Signup - Stored Pattern:", {
      userId: uid,
      userEmail: email,
      userName: extractedName
    });
    
    const finalUser = { ...userObj, mongo_id: uid, email };
    setUser(finalUser);
    
    return data;
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.auth.googleLogin(idToken);

      if (response.success || response.token) {
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("sessionStartedAt", Date.now().toString());
        const email = response.email || result.user.email;
        const userObj = response.profile || response.user || response;
        
        // Comprehensive name extraction for Google
        const extractedName = userObj?.fullName || 
                             userObj?.full_name || 
                             userObj?.name || 
                             response.fullName || 
                             response.full_name || 
                             response.name || 
                             result.user.displayName || 
                             "Alumni User";
        
        if (email) localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", extractedName);
        
        try {
          const prof = await api.auth.getProfileByEmail(email);
          const profData = prof?.data || prof;
          // Check top-level mongo_id from response first, then from profile object
          const uid = (response.mongo_id || profData?.mongo_id || profData?._id || profData?.user_id || profData?.id || "").toString();
          
          console.log("AuthContext - Google Login UID Extracted:", uid);
          
          if (uid) {
            localStorage.setItem("userId", uid);
            setUser({ ...(response.user || response), mongo_id: uid, email });
          } else {
            setUser({ ...(response.user || response), email });
          }
        } catch (e) {
          console.error("Profile fetch error:", e);
          setUser({ ...(response.user || response), email });
        }

        return response;
      } else {
        throw new Error(response.message || "Google login failed Please Register First");
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const googleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // For signup, we just return the captured details to the component
      // so the user can fill the rest of the form.
      return {
        success: true,
        idToken,
        firebase_uid: result.user.uid,
        user: {
          email: result.user.email,
          fullName: result.user.displayName,
          profilePhoto: result.user.photoURL
        }
      };
    } catch (error) {
      console.error('Google signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      api.auth.logout();
      localStorage.removeItem("idToken");
      localStorage.removeItem("sessionStartedAt");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error("Logout failed");
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      isLoadingPublicSettings: false, 
      authError, 
      login, 
      signup,
      googleLogin,
      googleSignup,
      logout,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
