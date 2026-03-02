import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";

export default function PostCard({ post }) {
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-md transition-shadow duration-300">
      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10 border border-slate-100">
          <AvatarImage src={post.author_picture} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-medium">
            {getInitials(post.author_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{post.author_name}</p>
          <p className="text-xs text-slate-400">{moment(post.created_date).fromNow()}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="mt-4 rounded-xl overflow-hidden">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}
    </div>
  );
}