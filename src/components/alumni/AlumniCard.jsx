import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Briefcase, GraduationCap, X } from "lucide-react";

export default function AlumniCard({ alumni }) {
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const [showImage, setShowImage] = useState(false);

  return (
    <Link
      to={createPageUrl("AlumniDetail") + `?id=${alumni._id || alumni.id}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200/60 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (alumni.profile_picture) {
                setShowImage(true);
              }
            }}
            className="shrink-0 rounded-xl border-2 border-slate-100 group-hover:border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            <Avatar className="h-14 w-14 rounded-xl">
              <AvatarImage src={alumni.profile_picture} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold rounded-xl">
                {getInitials(alumni.full_name)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                {alumni.full_name}
              </h3>
              {alumni.blood_group && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black border border-red-100">
                  {alumni.blood_group}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {alumni.degree && (
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-0 text-xs font-medium">
                  {alumni.degree}
                </Badge>
              )}
              {alumni.batch_year && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-0 text-xs font-medium">
                  Batch {alumni.batch_year}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {alumni.present_profession && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate">{alumni.present_profession}</span>
            </div>
          )}
          {alumni.city && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate">{alumni.city}{alumni.address ? `, ${alumni.address}` : ""}</span>
            </div>
          )}
          {alumni.mobile_number && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="w-3.5 h-3.5 text-green-500" />
              <span>{alumni.mobile_number}</span>
            </div>
          )}
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
    </Link>
  );
}
