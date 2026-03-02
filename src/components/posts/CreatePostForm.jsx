import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";

export default function CreatePostForm({ user, profile, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    let image_url = null;
    if (imageFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = file_url;
    }

    await base44.entities.Post.create({
      author_name: user?.full_name || "Anonymous",
      author_email: user?.email,
      author_picture: profile?.profile_picture || "",
      content: content.trim(),
      image_url,
    });

    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
    onPostCreated();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border border-slate-100 flex-shrink-0">
          <AvatarImage src={profile?.profile_picture} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-medium">
            {getInitials(user?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Share something with your alumni network..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 p-0 resize-none focus-visible:ring-0 text-sm placeholder:text-slate-400 min-h-[60px]"
          />

          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer text-sm transition-colors">
              <ImagePlus className="w-4 h-4" />
              Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}