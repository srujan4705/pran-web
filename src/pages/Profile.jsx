import React, { useState } from "react";
import api from "@/api/localClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import ProfileForm from "../components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit2, User, Mail, Phone, MapPin, Briefcase, Calendar, Droplets, GraduationCap, AlertTriangle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

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

  // Get the ID from user object (mongo_id we stored) or localStorage
  const userId = user?.mongo_id || localStorage.getItem("userId");
  
  // Debug log to see if userId is available
  console.log("Profile Page - Current userId:", userId);

  const { data: profile = null, isLoading, error, refetch } = useQuery({
    queryKey: ["myProfile", userId],
    queryFn: async () => {
      if (!userId) {
        console.warn("Profile Page - No userId found for fetch");
        return null;
      }
      try {
        console.log(`Profile Page - Fetching for ID: ${userId}`);
        const response = await api.auth.getProfileById(userId);
        console.log("Profile Page - API Response:", response);
        return response;
      } catch (err) {
        console.error("Profile Page - Fetch error:", err);
        throw err;
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 0, // Ensure we don't use old cached data
  });

  // Re-fetch if userId becomes available later
  React.useEffect(() => {
    if (userId) {
      console.log("Profile Page - userId detected, triggering refetch...");
      refetch();
    }
  }, [userId, refetch]);

  const isProfileIncomplete = !!profile && (
    !profile.fullName ||
    !profile.mobileNumber ||
    !profile.email ||
    !profile.addressForCommunication?.city ||
    !profile.qualification ||
    !profile.profession?.title
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!userId || error) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center space-y-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm inline-block">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Not Found</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            {error 
              ? "We encountered an error while loading your profile data." 
              : "It looks like your profile information hasn't been set up yet."}
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Set Up Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="rounded-xl px-8 h-12 border-slate-200 text-slate-600 font-bold"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 md:mb-8 bg-white/40 p-5 md:p-6 rounded-[2rem] border border-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/50">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Update your information across the platform</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold"
          >
            Cancel
          </Button>
        </div>
        <div className="bg-white/80 rounded-[2.5rem] border border-white/60 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <ProfileForm
            profile={profile}
            user={user}
            onSave={() => {
              setIsEditing(false);
              queryClient.invalidateQueries({ queryKey: ["myProfile"] });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {isProfileIncomplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <div className="mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Complete your profile details</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Some important fields are missing. Add your information so other alumni can know more about you.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="ml-2 border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            Update now
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 p-5 md:p-6 rounded-[2rem] border border-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6 text-center md:text-left">
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.8rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl shadow-indigo-200/50">
              <div className="w-full h-full rounded-[1.6rem] bg-white overflow-hidden flex items-center justify-center">
                {profile?.profilePhoto ? (
                  <img src={getProfilePhotoUrl(profile.profilePhoto)} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center py-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">{profile?.fullName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1.5">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[11px] uppercase tracking-wider">
                {profile?.profession?.title || "Member"}
              </span>
              {profile?.qualification && (
                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-bold text-[11px] uppercase tracking-wider">
                  {profile.qualification}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setIsEditing(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-[1.2rem] px-8 h-12 font-bold text-base shadow-xl shadow-slate-300 transition-all active:scale-95 flex items-center gap-2.5 w-full md:w-auto"
        >
          <Edit2 className="w-5 h-5" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/60 rounded-[2rem] border border-white/60 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-3.5 rounded-2xl hover:bg-white/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Email Address</p>
                  <p className="font-bold text-sm text-slate-700 break-all">{profile?.email}</p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-3.5 rounded-2xl hover:bg-white/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Phone Number</p>
                  <p className="font-bold text-sm text-slate-700">{profile?.mobileNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-3.5 rounded-2xl hover:bg-white/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Current Location</p>
                  <p className="font-bold text-sm text-slate-700">
                    {profile?.addressForCommunication?.city ? `${profile.addressForCommunication.city}, ${profile.addressForCommunication.state || ""}` : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2.5">
              <Droplets className="w-5 h-5" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mb-1.5">Blood</p>
                <p className="text-2xl font-bold tracking-tighter">{profile?.bloodGroup || "--"}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors text-center">
                <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mb-1.5">Batch</p>
                <p className="text-lg font-bold tracking-tight truncate">
                  {profile?.qualification?.match(/\d{4}/)?.[0] || "--"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/60 rounded-[2.5rem] border border-white/60 p-6 md:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-indigo-500" />
                Professional Summary
              </h3>
              <div className="bg-white/40 rounded-[1.5rem] p-6 md:p-8 border border-white/60 relative">
                <span className="absolute top-3 left-4 text-4xl text-slate-200 font-serif leading-none">“</span>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium italic relative z-10 px-3">
                  {profile?.profession?.description || "No professional summary provided yet."}
                </p>
                <span className="absolute bottom-3 right-4 text-4xl text-slate-200 font-serif leading-none rotate-180">“</span>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-indigo-500" />
                  Education
                </h3>
                <div className="space-y-2.5 bg-white/40 p-5 rounded-2xl border border-white/60">
                  <p className="font-bold text-slate-800 text-xl tracking-tight">{profile?.qualification || "Not specified"}</p>
                  <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest bg-indigo-50/50 w-fit px-2.5 py-1 rounded-full">
                    Alumni Member
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-indigo-500" />
                  Key Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-50/30 border border-pink-100/50">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Calendar className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">Birthday</p>
                      <p className="font-bold text-sm text-slate-800">
                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Not provided"}
                      </p>
                    </div>
                  </div>
                  {profile?.dateOfMarriage && profile.dateOfMarriage !== "N/A" && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50/30 border border-purple-100/50">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Anniversary</p>
                        <p className="font-bold text-sm text-slate-800">
                          {new Date(profile.dateOfMarriage).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-indigo-500" />
                Communication Address
              </h3>
              <div className="p-6 md:p-8 bg-white/40 rounded-[2rem] border border-white/60 group hover:border-indigo-100/50 transition-colors">
                <p className="text-slate-700 font-bold text-base md:text-lg leading-[1.6] tracking-tight">
                  {profile?.addressForCommunication?.street1 && <span className="block mb-0.5">{profile.addressForCommunication.street1}</span>}
                  {profile?.addressForCommunication?.street2 && <span className="block mb-0.5">{profile.addressForCommunication.street2}</span>}
                  <span className="text-indigo-600">
                    {[
                      profile?.addressForCommunication?.city,
                      profile?.addressForCommunication?.district,
                      profile?.addressForCommunication?.state,
                      profile?.addressForCommunication?.pincode,
                      profile?.addressForCommunication?.country
                    ].filter(Boolean).join(", ")}
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
