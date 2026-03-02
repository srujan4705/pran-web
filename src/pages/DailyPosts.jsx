import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/api/localClient";
import { useAuth } from "@/lib/AuthContext";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Send, 
  User as UserIcon, 
  UserX, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X,
  LayoutGrid,
  UserCircle,
  PlusCircle,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function DailyPosts() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  
  // Blog form state
  const [isCreating, setIsCreating] = useState(false);
  const [blogData, setBlogData] = useState({
    description: "",
    imageUrl: "",
    isAnonymous: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Edit state
  const [editingBlog, setEditingBlog] = useState(null);

  // Queries
  const currentUserEmail = authUser?.email || localStorage.getItem("userEmail");

  const { data: allBlogs = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["blogs", "all"],
    queryFn: () => api.blogs.list(),
  });

  const { data: myBlogs = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ["blogs", "user", currentUserEmail],
    queryFn: () => api.blogs.getByUser(currentUserEmail),
    enabled: !!currentUserEmail,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newBlog) => api.blogs.create(newBlog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setBlogData({ description: "", imageUrl: "", isAnonymous: false });
      clearImages();
      setIsCreating(false);
      toast.success("Blog posted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to post blog");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.blogs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setEditingBlog(null);
      toast.success("Blog updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update blog");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.blogs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const clearImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setSelectedImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    let uploadedUrls = [];
    if (selectedImages.length > 0) {
      try {
        setUploadingImages(true);
        const res = await api.blogs.uploadImages(selectedImages);
        uploadedUrls = res.urls || [];
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to upload images");
        setUploadingImages(false);
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    const payload = {
      email: authUser?.email || localStorage.getItem("userEmail"),
      name:
        authUser?.full_name ||
        authUser?.fullName ||
        authUser?.name ||
        localStorage.getItem("userName") ||
        "User",
      description: blogData.description,
      images: uploadedUrls,
      isAnonymous: blogData.isAnonymous
    };

    createMutation.mutate(payload);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingBlog.description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    updateMutation.mutate({
      id: editingBlog._id,
      data: {
        description: editingBlog.description,
        images: editingBlog.imageUrl ? [editingBlog.imageUrl] : editingBlog.images,
        isAnonymous: editingBlog.isAnonymous
      }
    });
  };

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "Just now";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Just now";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Just now";
    }
  };

  const BlogList = ({ blogs, loading, isMyBlogs }) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      );
    }

    if (blogs.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-700">No blogs found</h3>
          <p className="text-sm text-slate-500">Share your first update!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {blogs.map(blog => (
          <div key={blog._id} className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${blog.isAnonymous ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                  {blog.isAnonymous ? (
                    <UserX className="w-5 h-5 text-slate-500" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {blog.isAnonymous ? "Anonymous User" : (blog.name || "Alumni User")}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(blog.postDate)}</span>
                  </div>
                </div>
              </div>

              {isMyBlogs && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                    onClick={() => setEditingBlog({ ...blog, imageUrl: blog.images?.[0] || "" })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this blog?")) {
                        deleteMutation.mutate(blog._id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 text-slate-600 leading-relaxed text-sm">
              {blog.description}
            </div>

            {blog.images && blog.images.length > 0 && blog.images[0] && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
                <img 
                  src={blog.images[0]} 
                  alt="Blog attachment" 
                  className="w-full max-h-80 object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Daily Blogs</h1>
          <p className="text-sm text-slate-500 font-medium">Connect and share with the alumni community</p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-xl shadow-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Create New Blog
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={blogData.description}
              onChange={(e) => setBlogData({ ...blogData, description: e.target.value })}
              placeholder="What's on your mind today?"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all min-h-[120px] text-slate-700 font-medium"
              required
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={src}
                      alt={`Selected ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-sm text-slate-600 font-medium">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Select images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
              <div 
                className={`flex items-center justify-between px-4 py-2 border-2 rounded-xl cursor-pointer transition-all ${blogData.isAnonymous ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                onClick={() => setBlogData({ ...blogData, isAnonymous: !blogData.isAnonymous })}
              >
                <div className="flex items-center gap-2">
                  {blogData.isAnonymous ? <UserX className="w-4 h-4 text-indigo-600" /> : <UserIcon className="w-4 h-4 text-slate-400" />}
                  <span className={`text-sm font-bold ${blogData.isAnonymous ? 'text-indigo-700' : 'text-slate-500'}`}>
                    Post Anonymously
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${blogData.isAnonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${blogData.isAnonymous ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100"
              disabled={createMutation.isPending || uploadingImages}
            >
              {createMutation.isPending || uploadingImages ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
              Post Blog
            </Button>
          </form>
        </div>
      )}

      {/* Edit Modal (Simple overlay) */}
      {editingBlog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Edit Your Blog</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingBlog(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <textarea
                value={editingBlog.description}
                onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all min-h-[150px] text-slate-700 font-medium"
                required
              />
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 block ml-1">Update Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={editingBlog.imageUrl}
                    onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    placeholder="New image URL..."
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="w-full">
        <div className="w-full grid grid-cols-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 mb-6">
          <button 
            onClick={() => setActiveTab("all")}
            className={`rounded-xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "all" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Blogs
          </button>
          <button 
            onClick={() => setActiveTab("my")}
            className={`rounded-xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "my" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            My Blogs
          </button>
        </div>

        <div className="mt-0 outline-none">
          {activeTab === "all" ? (
            <BlogList blogs={allBlogs} loading={isLoadingAll} isMyBlogs={false} />
          ) : (
            <BlogList blogs={myBlogs} loading={isLoadingMy} isMyBlogs={true} />
          )}
        </div>
      </div>
    </div>
  );
}
