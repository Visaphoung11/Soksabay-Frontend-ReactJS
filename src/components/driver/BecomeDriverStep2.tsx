import React from "react";

interface BecomeDriverStep2Props {
    imagePreview: string | null;
    imageFile: File | null;
    uploadedUrl: string;
    imageUploading: boolean;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUploadImage: () => void;
    onBack: () => void;
    onNext: () => void;
}

const CheckIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const BecomeDriverStep2: React.FC<BecomeDriverStep2Props> = ({
    imagePreview,
    imageFile,
    uploadedUrl,
    imageUploading,
    onImageChange,
    onUploadImage,
    onBack,
    onNext,
}) => {
    return (
        <div className="p-10 lg:p-14">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Identity Verification</h2>
                <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 2 of 3</p>
            </div>

            <div
                className={`relative flex flex-col items-center justify-center w-full min-h-[320px] border-4 border-dashed rounded-[2.5rem] transition-all overflow-hidden ${imagePreview ? "border-[#00ab42] bg-white shadow-2xl shadow-[#00eb5b]/15" : "border-slate-200 bg-slate-50 hover:border-[#00ab42]/70 hover:bg-white"}`}
            >
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={onImageChange} />

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
                    onClick={onUploadImage}
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
                <button type="button" onClick={onBack} className="px-8 py-5 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-bold uppercase text-sm tracking-tight">
                    Back
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00eb5b]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight"
                >
                    Proceed to Final Review →
                </button>
            </div>
        </div>
    );
};

export default BecomeDriverStep2;
