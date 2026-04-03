import type { User } from "../../types/auth";
import React from "react";

interface BecomeDriverStep3Props {
    user: User | null;
    nationalId: string;
    licenseNumber: string;
    vehicleType: string;
    imagePreview: string | null;
    loading: boolean;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ReviewItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 border-l-4 border-[#00ab42] pl-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
    </div>
);

const BecomeDriverStep3: React.FC<BecomeDriverStep3Props> = ({
    user,
    nationalId,
    licenseNumber,
    vehicleType,
    imagePreview,
    loading,
    onBack,
}) => {
    return (
        <div className="p-10 lg:p-14">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Final Submission</h2>
                <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 3 of 3</p>
            </div>

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
                <button type="button" onClick={onBack} className="px-8 py-5 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-bold uppercase text-sm tracking-tight">
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
    );
};

export default BecomeDriverStep3;
