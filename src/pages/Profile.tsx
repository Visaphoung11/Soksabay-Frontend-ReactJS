import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../services/driverService";
import { updateMe } from "../services/userService";

const Profile: React.FC = () => {
  const { user, setUserAndPersist } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return profileImage || "";
  }, [imageFile, profileImage]);

  const bannerPreviewUrl = useMemo(() => {
    if (bannerFile) return URL.createObjectURL(bannerFile);
    return bannerUrl || "";
  }, [bannerFile, bannerUrl]);

  const handlePickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Simple file size guard (same spirit as DriverTrips page)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (f.size > maxSizeBytes) {
      toast.error("Image too large. Max size is 10MB.");
      e.target.value = "";
      return;
    }

    setImageFile(f);
  };

  const handlePickBanner: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const maxSizeBytes = 10 * 1024 * 1024;
    if (f.size > maxSizeBytes) {
      toast.error("Banner image too large. Max size is 10MB.");
      e.target.value = "";
      return;
    }
    setBannerFile(f);
  };

  const uploadProfileImageIfNeeded = async (): Promise<string> => {
    if (!imageFile) return profileImage;

    setUploading(true);
    try {
      const uploaded = await uploadImage(imageFile);
      const url = uploaded.secure_url || uploaded.url;
      if (!url) throw new Error("Upload succeeded but no URL returned");
      setProfileImage(url);
      setImageFile(null);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const uploadBannerIfNeeded = async (): Promise<string> => {
    if (!bannerFile) return bannerUrl;

    setUploading(true);
    try {
      const uploaded = await uploadImage(bannerFile);
      const url = uploaded.secure_url || uploaded.url;
      if (!url) throw new Error("Upload succeeded but no URL returned");
      setBannerUrl(url);
      setBannerFile(null);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setSaving(true);
    try {
      const uploadedUrl = await uploadProfileImageIfNeeded();
      const uploadedBannerUrl = await uploadBannerIfNeeded();

      const updated = await updateMe({
        fullName,
        contactNumber,
        gender,
        profileImage: uploadedUrl,
        bannerUrl: uploadedBannerUrl,
        bio,
      });

      // Preserve tokens from current user object (update endpoint typically doesn't return them)
      const nextUser = {
        ...user,
        ...updated,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      };

      setUserAndPersist(nextUser);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Profile" subtitle="Update your personal information">
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          {/* Banner */}
          <div className="mb-6">
            <div className="w-full h-44 md:h-52 rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200">
              {bannerPreviewUrl ? (
                <img src={bannerPreviewUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                  No Banner
                </div>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                Profile banner
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePickBanner}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00eb5b]/20 file:text-[#00ab42] hover:file:bg-[#00eb5b]/30"
                disabled={saving || uploading}
              />
              {bannerFile && (
                <p className="text-[12px] text-slate-500">Selected: {bannerFile.name}</p>
              )}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Or paste banner URL
                </label>
                <input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
                  disabled={saving || uploading}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-[220px]">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                    No Photo
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                  Profile image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePickImage}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00eb5b]/20 file:text-[#00ab42] hover:file:bg-[#00eb5b]/30"
                  disabled={saving || uploading}
                />
                {imageFile && (
                  <p className="text-[12px] text-slate-500">Selected: {imageFile.name}</p>
                )}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 gap-5">
                <Field label="Email" readOnly value={user?.email || ""} />

                {!!user?.ratingCount && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Driver stats</p>
                    <p className="text-sm font-black text-slate-900 mt-1">Ratings received: {user.ratingCount}</p>
                  </div>
                )}

                <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />

                <Field
                  label="Contact Number"
                  value={contactNumber}
                  onChange={setContactNumber}
                  placeholder="+855..."
                />

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00eb5b]/40"
                    disabled={saving}
                  >
                    <option value="">Not set</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell travelers about yourself..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00eb5b]/40 min-h-28"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-8 py-4 rounded-2xl bg-[#00eb5b] text-slate-900 font-black hover:bg-[#00ab42] hover:text-white transition-colors disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFullName(user?.fullName ?? "");
                    setContactNumber(user?.contactNumber ?? "");
                    setGender(user?.gender ?? "");
                    setProfileImage(user?.profileImage ?? "");
                    setBannerUrl(user?.bannerUrl ?? "");
                    setBio(user?.bio ?? "");
                    setImageFile(null);
                    setBannerFile(null);
                  }}
                  disabled={saving || uploading}
                  className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
      {label}
    </label>
    <input
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00eb5b]/40 ${
        readOnly ? "bg-slate-50 text-slate-500" : ""
      }`}
    />
  </div>
);

export default Profile;
