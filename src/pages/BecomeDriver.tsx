import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadImage, applyAsDriver } from "../services/driverService";

const VEHICLE_TYPES = [
    "Sedan / 4-Seater",
    "SUV / 7-Seater",
    "Van / 9-Seater",
    "Minibus / 12-Seater",
    "Motorcycle",
    "Tuk-tuk",
];

type Step = 1 | 2 | 3;

const BecomeDriver: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Form fields
    const [nationalId, setNationalId] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);

    // Image upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [uploadedPublicId, setUploadedPublicId] = useState("");
    const [imageUploading, setImageUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadedUrl("");
        setUploadedPublicId("");
    };

    const handleUploadImage = async () => {
        if (!imageFile) return;
        setImageUploading(true);
        setError("");
        try {
            const res = await uploadImage(imageFile);
            setUploadedUrl(res.secure_url);
            setUploadedPublicId(res.public_id);
        } catch (err: any) {
            setError("Image upload failed. Please try again.");
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadedUrl) {
            setError("Please upload your ID card image first.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await applyAsDriver({
                nationalId,
                licenseNumber,
                vehicleType,
                idCardImageUrl: uploadedUrl,
                idCardPublicId: uploadedPublicId,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Application failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Application Submitted!</h2>
                    <p className="text-white/50 mb-8">
                        Your driver application is under review. You'll receive a notification once it's approved.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8">
                        <p className="text-amber-400 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Status: <span className="font-semibold">PENDING</span> — Awaiting admin review
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
            {/* Background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-2xl mx-auto pt-8">
                {/* Back button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Become a Driver</h1>
                    <p className="text-white/50 mt-2">Join our network of professional touring drivers</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {([1, 2, 3] as Step[]).map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${step >= s ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg" : "bg-white/10 text-white/30"
                                }`}>{s}</div>
                            {i < 2 && <div className={`w-12 h-0.5 rounded-full transition-all ${step > s ? "bg-gradient-to-r from-purple-500 to-indigo-600" : "bg-white/10"}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: Basic Info */}
                        {step === 1 && (
                            <div className="p-8">
                                <h2 className="text-lg font-semibold text-white mb-1">Basic Information</h2>
                                <p className="text-white/40 text-sm mb-6">Enter your driver credentials</p>

                                {error && <ErrorAlert message={error} />}

                                <div className="space-y-4">
                                    <FormField label="National ID" icon="🪪">
                                        <input
                                            type="text"
                                            value={nationalId}
                                            onChange={(e) => setNationalId(e.target.value)}
                                            placeholder="NID-XXXXXX"
                                            required
                                            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        />
                                    </FormField>
                                    <FormField label="License Number" icon="📄">
                                        <input
                                            type="text"
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value)}
                                            placeholder="LIC-XXXXXX"
                                            required
                                            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        />
                                    </FormField>
                                    <FormField label="Vehicle Type" icon="🚗">
                                        <select
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                            style={{ colorScheme: "dark" }}
                                        >
                                            {VEHICLE_TYPES.map((v) => <option key={v} value={v} className="bg-slate-800">{v}</option>)}
                                        </select>
                                    </FormField>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!nationalId || !licenseNumber) { setError("Please fill all fields."); return; }
                                        setError(""); setStep(2);
                                    }}
                                    className="w-full mt-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
                                >
                                    Next Step →
                                </button>
                            </div>
                        )}

                        {/* STEP 2: ID Card Upload */}
                        {step === 2 && (
                            <div className="p-8">
                                <h2 className="text-lg font-semibold text-white mb-1">ID Card Upload</h2>
                                <p className="text-white/40 text-sm mb-6">Upload a clear photo of your national ID card</p>

                                {error && <ErrorAlert message={error} />}

                                {/* Upload Zone */}
                                <label className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${imagePreview ? "border-purple-500/50 bg-purple-500/5" : "border-white/20 bg-white/5 hover:border-purple-500/40 hover:bg-white/10"
                                    }`}>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="ID Preview" className="h-44 object-contain rounded-xl" />
                                    ) : (
                                        <div className="text-center">
                                            <svg className="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-white/40 text-sm">Click to select image</p>
                                            <p className="text-white/20 text-xs mt-1">JPG, PNG up to 10MB</p>
                                        </div>
                                    )}
                                </label>

                                {imageFile && !uploadedUrl && (
                                    <button
                                        type="button"
                                        onClick={handleUploadImage}
                                        disabled={imageUploading}
                                        className="w-full mt-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {imageUploading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading...</span> : "⬆ Upload Image"}
                                    </button>
                                )}

                                {uploadedUrl && (
                                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-emerald-400 text-sm font-medium">Image uploaded successfully!</span>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl transition-all font-medium">
                                        ← Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { if (!uploadedUrl) { setError("Please upload your ID card image first."); return; } setError(""); setStep(3); }}
                                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all"
                                    >
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Review & Submit */}
                        {step === 3 && (
                            <div className="p-8">
                                <h2 className="text-lg font-semibold text-white mb-1">Review & Submit</h2>
                                <p className="text-white/40 text-sm mb-6">Confirm your application details</p>

                                {error && <ErrorAlert message={error} />}

                                <div className="space-y-3 mb-8">
                                    <ReviewRow label="Applicant" value={user?.fullName || user?.email || "—"} />
                                    <ReviewRow label="National ID" value={nationalId} />
                                    <ReviewRow label="License Number" value={licenseNumber} />
                                    <ReviewRow label="Vehicle Type" value={vehicleType} />
                                    {imagePreview && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-white/40 text-xs mb-2">ID Card Image</p>
                                            <img src={imagePreview} alt="ID Card" className="h-32 object-contain rounded-lg" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl transition-all font-medium">
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</span> : "Submit Application ✓"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

const FormField = ({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) => (
    <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-white/60 mb-1.5">
            <span>{icon}</span> {label}
        </label>
        {children}
    </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <span className="text-white/40 text-sm">{label}</span>
        <span className="text-white text-sm font-medium">{value}</span>
    </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {message}
    </div>
);

export default BecomeDriver;
