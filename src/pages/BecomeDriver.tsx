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

    const [nationalId, setNationalId] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);

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
            setError(err?.response?.data?.message || "Application failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl shadow-[#00eb5b]/15 border border-white">
                    <div className="w-24 h-24 rounded-full bg-[#00eb5b]/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <svg className="w-12 h-12 text-[#00ab42]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 font-outfit">Application Sent!</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                        Your application is now being reviewed by our team. We'll notify you as soon as you're cleared for the road.
                    </p>
                    <div className="bg-[#00eb5b]/10 rounded-2xl p-6 mb-10 border border-[#00eb5b]/30">
                        <p className="text-[#00ab42] text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Status: Pending Review
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-100 h-20 flex items-center px-6 lg:px-12 sticky top-0 z-50">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#00ab42] transition-colors font-bold text-sm tracking-tight"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    BACK TO HUB
                </button>
                <div className="flex-1 text-center pr-12">
                    <h1 className="text-xl font-black text-slate-900 font-outfit tracking-tighter">Become a Soksabay Driver</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
                {/* Visual Step Indicator */}
                <div className="flex items-center justify-between mb-12 px-4">
                    <StepIcon number={1} label="Identity" active={step >= 1} done={step > 1} />
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > 1 ? "bg-[#00eb5b]" : "bg-slate-200"}`} />
                    <StepIcon number={2} label="Documents" active={step >= 2} done={step > 2} />
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > 2 ? "bg-[#00eb5b]" : "bg-slate-200"}`} />
                    <StepIcon number={3} label="Review" active={step >= 3} done={success} />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#00eb5b]/10 overflow-hidden border border-white">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="p-10 lg:p-14">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Basic Credentials</h2>
                                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 1 of 3</p>
                                </div>

                                {error && <ErrorAlert message={error} />}

                                <div className="space-y-8">
                                    <FieldWrapper label="National ID Number" helper="Your government issued identity code">
                                        <input
                                            type="text"
                                            value={nationalId}
                                            onChange={(e) => setNationalId(e.target.value)}
                                            placeholder="E.g. NID0123456"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-6 py-4 font-bold focus:bg-white focus:ring-4 focus:ring-[#00eb5b]/20 focus:border-[#00ab42] transition-all outline-none"
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="Commercial License" helper="Valid driving license for transport services">
                                        <input
                                            type="text"
                                            value={licenseNumber}
                                            onChange={(e) => setLicenseNumber(e.target.value)}
                                            placeholder="E.g. DL-9988-77"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-6 py-4 font-bold focus:bg-white focus:ring-4 focus:ring-[#00eb5b]/20 focus:border-[#00ab42] transition-all outline-none"
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="Vehicle Classification" helper="Select the type of vehicle you intend to use">
                                        <div className="grid grid-cols-2 gap-3">
                                            {VEHICLE_TYPES.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setVehicleType(v)}
                                                    className={`px-4 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${vehicleType === v ? "bg-[#00eb5b]/10 border-[#00ab42] text-[#00ab42] shadow-lg shadow-[#00eb5b]/15" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </FieldWrapper>
                                </div>

                                <div className="mt-14">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!nationalId || !licenseNumber) { setError("All fields are required."); return; }
                                            setError(""); setStep(2);
                                        }}
                                        className="w-full py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00eb5b]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight"
                                    >
                                        Continue to Documents →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-10 lg:p-14">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Identity Verification</h2>
                                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 2 of 3</p>
                                </div>

                                {error && <ErrorAlert message={error} />}

                                <div
                                    className={`relative flex flex-col items-center justify-center w-full min-h-[320px] border-4 border-dashed rounded-[2.5rem] transition-all overflow-hidden ${imagePreview ? "border-[#00ab42] bg-white shadow-2xl shadow-[#00eb5b]/15" : "border-slate-200 bg-slate-50 hover:border-[#00ab42]/70 hover:bg-white"}`}
                                >
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleImageChange} />

                                    {imagePreview ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <img src={imagePreview} alt="ID Preview" className="max-h-[280px] object-contain rounded-2xl" />
                                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="bg-white py-2 px-4 rounded-full font-bold text-xs shadow-lg">Click to Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 group">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:text-[#00ab42] transition-colors">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 font-outfit">Upload National ID</p>
                                            <p className="text-slate-400 text-sm mt-1 font-medium italic">High resolution JPG or PNG only</p>
                                        </div>
                                    )}
                                </div>

                                {imageFile && !uploadedUrl && (
                                    <button
                                        type="button"
                                        onClick={handleUploadImage}
                                        disabled={imageUploading}
                                        className="w-full mt-8 py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00eb5b]/20 transition-all disabled:opacity-50 uppercase tracking-tight"
                                    >
                                        {imageUploading ? "Processing Image..." : "Confirm & Upload Identity"}
                                    </button>
                                )}

                                {uploadedUrl && (
                                    <div className="mt-8 flex items-center gap-3 px-6 py-5 bg-[#00eb5b]/10 border border-[#00eb5b]/30 rounded-2xl animate-in">
                                        <div className="bg-[#00eb5b] rounded-full p-1"><CheckIcon size={16} /></div>
                                        <span className="text-[#00ab42] text-sm font-bold tracking-tight">Identity card verified and securely stored.</span>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-12">
                                    <button type="button" onClick={() => setStep(1)} className="px-8 py-5 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-bold uppercase text-sm tracking-tight">
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { if (!uploadedUrl) { setError("Please upload your card first."); return; } setError(""); setStep(3); }}
                                        className="flex-1 py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00eb5b]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight"
                                    >
                                        Proceed to Final Review →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="p-10 lg:p-14">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Final Submission</h2>
                                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 3 of 3</p>
                                </div>

                                {error && <ErrorAlert message={error} />}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                    <div className="space-y-6">
                                        <ReviewItem label="Full Legal Name" value={user?.fullName || user?.email || "—"} />
                                        <ReviewItem label="National ID" value={nationalId} />
                                        <ReviewItem label="License Number" value={licenseNumber} />
                                        <ReviewItem label="Selected Vehicle" value={vehicleType} />
                                    </div>
                                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identity Card Document</p>
                                        <img src={imagePreview!} alt="ID Card" className="rounded-xl shadow-lg border border-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(2)} className="px-8 py-5 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-bold uppercase text-sm tracking-tight">
                                        Re-edit Info
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight shadow-slate-900/20"
                                    >
                                        {loading ? "Submitting Application..." : "Complete Application ✓"}
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

const StepIcon = ({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${done ? "bg-[#00eb5b] text-slate-900 shadow-xl shadow-[#00eb5b]/20" : active ? "bg-[#00eb5b] text-slate-900 shadow-xl shadow-[#00eb5b]/20" : "bg-slate-200 text-slate-400"}`}>
            {done ? <CheckIcon size={24} /> : number}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
    </div>
);

const FieldWrapper = ({ label, helper, children }: { label: string; helper: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
        <div>
            <label className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</label>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">/ {helper}</p>
        </div>
        {children}
    </div>
);

const ReviewItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 border-l-4 border-[#00ab42] pl-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
    </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
    <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-bold flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        </div>
        {message}
    </div>
);

const CheckIcon = ({ size = 24 }: any) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

export default BecomeDriver;
