import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import api from "@/api/localClient";
import { useAuth } from "@/lib/AuthContext";
import { Home, User, FileText, Menu, X, LogOut, Settings, Trash2, Shield, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { name: "Home", page: "Home", icon: Home },
  { name: "Profile", page: "Profile", icon: User },
  { name: "Daily Posts", page: "DailyPosts", icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getProfilePhotoUrl = (rawUrl) => {
    if (!rawUrl) return "";
    const trimmed = rawUrl.trim().replace(/^`|`$/g, "");
    try {
      const url = new URL(trimmed);
      if (url.hostname.includes("drive.google.com")) {
        const idFromParam = url.searchParams.get("id");
        const parts = url.pathname.split("/");
        const dIndex = parts.indexOf("d");
        const idFromPath = dIndex !== -1 ? parts[dIndex + 1] : null;
        const fileId = idFromParam || idFromPath;
        if (fileId) {
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }
      return trimmed;
    } catch {
      const match = trimmed.match(/id=([^&\s]+)/);
      if (match) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
      return trimmed;
    }
  };

  const handleDeleteProfile = async () => {
    // Try to get ID from authUser (mongo_id) or user state or localStorage
    const userId = authUser?.mongo_id || authUser?._id || localStorage.getItem("userId");
    
    console.log("Layout - Attempting delete for userId:", userId);

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete your profile? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Layout - Calling delete API...");
      // Use api.auth.deleteProfileById which we added to localClient.js
      await api.auth.deleteProfileById(userId);
      console.log("Layout - Delete API success");
      toast.success("Profile deleted successfully");
      logout();
      window.location.href = createPageUrl("Login");
    } catch (err) {
      console.error("Layout - Delete error:", err);
      toast.error("Failed to delete profile: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      const mappedProfile = {
        id: authUser._id,
        full_name: authUser.fullName,
        batch_year: authUser.batch_year || "",
        degree: authUser.qualification || authUser.profession?.title,
        present_profession: authUser.profession?.title,
        company: authUser.profession?.description,
        profile_picture: getProfilePhotoUrl(authUser.profilePhoto),
        city: authUser.addressForCommunication?.city,
        description: authUser.profession?.description,
        email: authUser.email,
      };
      setUser({ full_name: authUser.fullName, email: authUser.email });
      setProfile(mappedProfile);
    }
  }, [authUser]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --gradient-start: #667eea;
          --gradient-mid: #764ba2;
          --gradient-end: #f093fb;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-11 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-bold text-sm">PRAN</span>
              </div>
              <span className="font-semibold text-slate-800 text-lg hidden sm:block tracking-tight">PRAN</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-0.5 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-100 group-hover:shadow-indigo-200 transition-all">
                      <div className="w-full h-full rounded-[0.5rem] bg-white overflow-hidden flex items-center justify-center">
                        {profile?.profile_picture ? (
                          <img src={profile.profile_picture} alt={user?.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] border-slate-200/60 shadow-2xl shadow-slate-200/50">
                  <div className="px-4 py-4 mb-1 bg-slate-50/50 rounded-2xl">
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{user?.full_name}</p>
                    <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="mx-2 mb-1" />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Profile")} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-slate-600 focus:text-slate-900 focus:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Logout</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteProfile}
                    disabled={isDeleting}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 transition-colors mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Delete Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
            <nav className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
