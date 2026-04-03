import React from "react";

interface BecomeDriverStep1Props {
    nationalId: string;
    setNationalId: (v: string) => void;
    licenseNumber: string;
    setLicenseNumber: (v: string) => void;
    vehicleType: string;
    setVehicleType: (v: string) => void;
    vehicleTypes: string[];
    onNext: () => void;
    error?: string;
}

const FieldWrapper = ({ label, helper, children }: { label: string; helper: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
        <div>
            <label className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</label>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">/ {helper}</p>
        </div>
        {children}
    </div>
);

const BecomeDriverStep1: React.FC<BecomeDriverStep1Props> = ({
    nationalId,
    setNationalId,
    licenseNumber,
    setLicenseNumber,
    vehicleType,
    setVehicleType,
    vehicleTypes,
    onNext,
}) => {
    return (
        <div className="p-10 lg:p-14">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Basic Credentials</h2>
                <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Step 1 of 3</p>
            </div>

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
                        {vehicleTypes.map((v) => (
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
                    onClick={onNext}
                    className="w-full py-5 bg-[#00eb5b] hover:bg-[#00ab42] hover:text-white text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00eb5b]/20 transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight"
                >
                    Continue to Documents →
                </button>
            </div>
        </div>
    );
};

export default BecomeDriverStep1;
