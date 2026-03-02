import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import api from "@/api/localClient";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../components/alumni/SearchBar";
import AlumniCard from "../components/alumni/AlumniCard";
import { Users, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");

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

  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["alumni", search],
    queryFn: async () => {
      let users;
      if (search.trim()) {
        // Use the server-side search API
        users = await api.users.search(search);
      } else {
        // Fetch all users if search is empty
        users = await api.users.list();
      }

      return (users || [])
        .filter(u => u && u._id)
        .map(user => ({
          id: user._id,
          full_name: user.fullName,
          batch_year: user.batch_year || "",
          degree: user.qualification || user.profession?.title,
          present_profession: user.profession?.title,
          company: user.profession?.description,
          profile_picture: getProfilePhotoUrl(user.profilePhoto),
          city: user.addressForCommunication?.city,
          description: user.profession?.description,
          blood_group: user.bloodGroup,
          mobile_number: user.mobileNumber,
        }));
    },
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium tracking-wide uppercase">Pandiri Raveender Alumni Network</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl">
            Connect with your fellow alumni, discover what they're up to, and stay in touch.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/80">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">{alumni.length} Alumni</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            {search ? `Results for "${search}"` : "All Alumni"}
          </h2>
          <span className="text-sm text-slate-500">{alumni.length} members</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No alumni found</h3>
            <p className="text-sm text-slate-500">Try searching with a different term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumni.map(a => (
              <AlumniCard key={a.id} alumni={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
