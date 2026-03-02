import React, { useState } from "react";
import api from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileForm({ profile, user, onSave }) {
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.fullName || user?.full_name || "",
    mobileNumber: profile?.mobileNumber || "",
    email: profile?.email || user?.email || "",
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
    dateOfMarriage: profile?.dateOfMarriage || "",
    professionTitle: profile?.profession?.title || "",
    professionDescription: profile?.profession?.description || "",
    street1: profile?.addressForCommunication?.street1 || "",
    street2: profile?.addressForCommunication?.street2 || "",
    city: profile?.addressForCommunication?.city || "",
    district: profile?.addressForCommunication?.district || "",
    state: profile?.addressForCommunication?.state || "",
    country: profile?.addressForCommunication?.country || "",
    profilePhoto: profile?.profilePhoto || "",
    bloodGroup: profile?.bloodGroup || "",
    qualification: profile?.qualification || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [zoom, setZoom] = useState(1);

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setZoom(1);
    setIsCropping(true);
  };

  const cropImage = (imageSrc, zoomLevel) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const size = 400;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const { width, height } = image;
        const baseScale = Math.max(size / width, size / height);
        const scale = baseScale * zoomLevel;
        const cropWidth = size / scale;
        const cropHeight = size / scale;
        const sx = (width - cropWidth) / 2;
        const sy = (height - cropHeight) / 2;
        ctx.drawImage(
          image,
          sx,
          sy,
          cropWidth,
          cropHeight,
          0,
          0,
          size,
          size
        );
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      };
      image.onerror = reject;
      image.src = imageSrc;
    });
  };

  const handleCancelCrop = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setIsCropping(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setZoom(1);
  };

  const handleConfirmCrop = async () => {
    if (!selectedFile || !previewUrl) return;
    const userId = user?.mongo_id || localStorage.getItem("userId");
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    setUploading(true);
    try {
      const blob = await cropImage(previewUrl, zoom);
      const file = new File([blob], selectedFile.name || "profile-photo.jpg", {
        type: blob.type || "image/jpeg",
      });
      const response = await api.auth.uploadProfilePhotoById(userId, file);
      const photoUrl = response.profilePhoto || response.data?.profilePhoto || response.url || "";
      if (photoUrl) {
        handleChange("profilePhoto", photoUrl);
        toast.success("Profile photo updated");
      } else {
        toast.error("Profile photo upload failed");
      }
      handleCancelCrop();
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to upload photo"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { 
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        dateOfMarriage: formData.dateOfMarriage || "N/A",
        profession: {
          title: formData.professionTitle,
          description: formData.professionDescription,
        },
        addressForCommunication: {
          street1: formData.street1,
          street2: formData.street2,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          country: formData.country,
        },
        profilePhoto: formData.profilePhoto,
        bloodGroup: formData.bloodGroup,
        qualification: formData.qualification,
      };

      console.log("ProfileForm - Submitting data:", data);
      const userId = user?.mongo_id || localStorage.getItem("userId");

      if (userId) {
        await api.auth.updateProfileById(userId, data);
        toast.success("Profile updated successfully!");
        onSave(); // Call onSave only on success
      } else {
        toast.error("User ID not found. Please log in again.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
            <AvatarImage src={getProfilePhotoUrl(formData.profilePhoto)} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-2xl font-semibold">
              {getInitials(formData.fullName)}
            </AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <p className="text-sm text-slate-500 mt-2">Click to change photo</p>
      </div>

      {isCropping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Adjust profile photo
            </h2>
            <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Zoom</Label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCrop}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCrop}
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Crop &amp; Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Info */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={formData.email} disabled className="bg-slate-50 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input value={formData.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value)} placeholder="e.g. 9876543210" />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(v) => handleChange("bloodGroup", v)}>
              <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date of Marriage</Label>
            <Input value={formData.dateOfMarriage} onChange={(e) => handleChange("dateOfMarriage", e.target.value)} placeholder="e.g. 2010-01-01 or N/A" />
          </div>
        </div>
      </div>

      {/* Academic & Professional */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">Academic & Professional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input value={formData.qualification} onChange={(e) => handleChange("qualification", e.target.value)} placeholder="e.g. B.Tech" />
          </div>
          <div className="space-y-2">
            <Label>Profession Title</Label>
            <Input value={formData.professionTitle} onChange={(e) => handleChange("professionTitle", e.target.value)} placeholder="e.g. student" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Profession Description</Label>
          <Textarea
            value={formData.professionDescription}
            onChange={(e) => handleChange("professionDescription", e.target.value)}
            placeholder="Tell us about your work..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Street 1</Label>
            <Input value={formData.street1} onChange={(e) => handleChange("street1", e.target.value)} placeholder="e.g. VASAVI COLONY" />
          </div>
          <div className="space-y-2">
            <Label>Street 2</Label>
            <Input value={formData.street2} onChange={(e) => handleChange("street2", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="e.g. Miryalaguda" />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input value={formData.district} onChange={(e) => handleChange("district", e.target.value)} placeholder="e.g. Nalgonda" />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={formData.state} onChange={(e) => handleChange("state", e.target.value)} placeholder="e.g. Telangana" />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={formData.country} onChange={(e) => handleChange("country", e.target.value)} placeholder="e.g. India" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 py-2.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
}
