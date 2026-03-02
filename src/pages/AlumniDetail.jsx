import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import api from "@/api/localClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone, Calendar, Heart, Briefcase, MapPin, GraduationCap,
  Droplets, ArrowLeft, Linkedin, Instagram, BookOpen, Mail, X
} from "lucide-react";
import { format } from "date-fns";

const InfoCard = ({ icon: Icon, label, value, bgColor, iconColor }) => {
  if (!value) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-800 font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default function AlumniDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [showImage, setShowImage] = useState(false);

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

  const { data: alumni, isLoading } = useQuery({
    queryKey: ["alumni", id],
    queryFn: async () => {
      const user = await api.users.get(id);
      if (!user) return null;
      
      const addr = user.addressForCommunication || {};
      const fullAddress = [
        addr.street1,
        addr.street2,
        addr.city,
        addr.district,
        addr.state,
        addr.country
      ].filter(Boolean).join(", ");

      return {
        id: user._id,
        full_name: user.fullName,
        batch_year: user.batch_year || "",
        degree: user.qualification || user.profession?.title,
        present_profession: user.profession?.title,
        company: null, // Removed redundant mapping to description
        profile_picture: getProfilePhotoUrl(user.profilePhoto),
        city: addr.city,
        address: fullAddress,
        description: user.profession?.description,
        linkedin_url: user.socialLinks?.linkedin,
        instagram_url: user.socialLinks?.instagram,
        skills: user.skills,
        email: user.email,
        mobile_number: user.mobileNumber,
        date_of_birth: user.dateOfBirth,
        date_of_marriage: user.dateOfMarriage,
        blood_group: user.bloodGroup,
        joining_date: user.createdAt,
        year_of_teaching: user.yearOfTeaching,
        current_status: user.currentStatus,
      };
    },
    enabled: !!id,
    retry: false, // Don't retry if user not found
  });

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Alumni not found</p>
        <Link to={createPageUrl("Home")}>
          <Button variant="outline" className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to All Alumni
      </Link>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <button
            type="button"
            onClick={() => {
              if (alumni.profile_picture) {
                setShowImage(true);
              }
            }}
            className="rounded-full border-4 border-white/30 shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70"
          >
            <Avatar className="h-28 w-28">
              <AvatarImage src={alumni.profile_picture} className="object-cover" />
              <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-3xl font-bold">
                {getInitials(alumni.full_name)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{alumni.full_name}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {alumni.degree && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">{alumni.degree}</Badge>
              )}
              {alumni.batch_year && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">Batch {alumni.batch_year}</Badge>
              )}
              {alumni.blood_group && (
                <Badge className="bg-red-400/30 text-white border-0 backdrop-blur-sm">
                  <Droplets className="w-3 h-3 mr-1" />{alumni.blood_group}
                </Badge>
              )}
            </div>
            {/* Social Links */}
            <div className="flex gap-3 mt-4 justify-center sm:justify-start">
              {alumni.linkedin_url && (
                <a href={alumni.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              )}
              {alumni.instagram_url && (
                <a href={alumni.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showImage && alumni.profile_picture && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowImage(false)}
        >
          <div
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowImage(false);
              }}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={alumni.profile_picture}
                alt={alumni.full_name || "Profile image"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {alumni.description && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">About</h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{alumni.description}</p>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={Mail} label="Email Address" value={alumni.email} bgColor="bg-indigo-50" iconColor="text-indigo-500" />
        <InfoCard icon={Phone} label="Mobile Number" value={alumni.mobile_number} bgColor="bg-blue-50" iconColor="text-blue-500" />
        <InfoCard icon={Calendar} label="Date of Birth" value={alumni.date_of_birth ? format(new Date(alumni.date_of_birth), "dd MMM yyyy") : null} bgColor="bg-purple-50" iconColor="text-purple-500" />
        <InfoCard icon={Briefcase} label="Present Profession" value={alumni.present_profession ? `${alumni.present_profession}${alumni.company ? ` at ${alumni.company}` : ""}` : null} bgColor="bg-green-50" iconColor="text-green-500" />
        <InfoCard icon={MapPin} label="Communication Address" value={alumni.address} bgColor="bg-amber-50" iconColor="text-amber-500" />
        <InfoCard icon={BookOpen} label="Year of Teaching" value={alumni.year_of_teaching} bgColor="bg-orange-50" iconColor="text-orange-500" />
        <InfoCard icon={Heart} label="Date of Marriage" value={alumni.date_of_marriage ? format(new Date(alumni.date_of_marriage), "dd MMM yyyy") : null} bgColor="bg-pink-50" iconColor="text-pink-500" />
        <InfoCard icon={Droplets} label="Blood Group" value={alumni.blood_group} bgColor="bg-red-50" iconColor="text-red-500" />
      </div>
    </div>
  );
}
