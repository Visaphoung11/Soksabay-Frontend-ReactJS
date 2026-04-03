import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../services/driverService";
import { updateMe } from "../services/userService";

const Profile: React.FC = () => {
  const { user, setUserAndPersist } = useAuth();

  const [editing, setEditing] = useState(false);

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

    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    setImageFile(f);
  };

  const handlePickBanner: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 10 * 1024 * 1024) {
      toast.error("Banner too large (max 10MB)");
      return;
    }
    setBannerFile(f);
  };

  const uploadProfileImageIfNeeded = async () => {
    if (!imageFile) return profileImage;
    setUploading(true);
    try {
      const res = await uploadImage(imageFile);
      const url = res.secure_url || res.url;
      setProfileImage(url);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const uploadBannerIfNeeded = async () => {
    if (!bannerFile) return bannerUrl;
    setUploading(true);
    try {
      const res = await uploadImage(bannerFile);
      const url = res.secure_url || res.url;
      setBannerUrl(url);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const img = await uploadProfileImageIfNeeded();
      const banner = await uploadBannerIfNeeded();

      const updated = await updateMe({
        fullName,
        contactNumber,
        gender,
        profileImage: img,
        bannerUrl: banner,
        bio,
      });

      setUserAndPersist({
        ...user,
        ...updated,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });

      toast.success("Profile updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Profile">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER (LinkedIn Style) */}
        <div className="bg-white rounded-3xl border overflow-hidden">
          {/* Banner */}
          <div className="h-56 bg-slate-200 relative">
            {bannerPreviewUrl && (
              <img src={bannerPreviewUrl} className="w-full h-full object-cover" />
            )}

            {editing && (
              <label className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full text-sm cursor-pointer shadow">
                Change cover
                <input type="file" onChange={handlePickBanner} hidden />
              </label>
            )}
          </div>

          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="-mt-16 flex items-end gap-4 relative z-10">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-100">
                {previewUrl && (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                )}
              </div>

              {editing && (
                <label className="bg-black text-white px-4 py-2 rounded-full text-sm cursor-pointer">
                  Change photo
                  <input type="file" onChange={handlePickImage} hidden />
                </label>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold">{fullName || "Your Name"}</h1>
              <p className="text-slate-500">{user?.email}</p>

              {user?.ratingCount && (
                <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ {user.ratingCount} ratings
                </span>
              )}

              <p className="mt-3 text-slate-700">{bio || "No bio yet"}</p>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditing(!editing)}
              className="mt-4 px-6 py-2 bg-[#00eb5b] rounded-full font-bold"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-bold mb-2">Contact</h2>
            <p className="text-sm text-slate-600">
              {contactNumber || "Not set"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h2 className="font-bold mb-2">Details</h2>
            <p className="text-sm text-slate-600">
              {gender || "Not set"}
            </p>
          </div>
        </div>

        {/* EDIT FORM */}
        {editing && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border space-y-4">
            <Field label="Full Name" value={fullName} onChange={setFullName} />
            <Field label="Contact" value={contactNumber} onChange={setContactNumber} />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border rounded-xl"
              placeholder="Bio..."
            />

            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-[#00eb5b] rounded-xl font-bold"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {/* LOADING OVERLAY */}
        {saving && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center text-white font-bold">
            Saving...
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const Field = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-sm font-semibold">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-xl mt-1"
    />
  </div>
);

export default Profile;