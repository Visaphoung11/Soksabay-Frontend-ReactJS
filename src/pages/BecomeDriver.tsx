import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadImage, applyAsDriver, reapplyAsDriver, getMyDriverApplication } from "../services/driverService";
import BecomeDriverStep1 from "../components/driver/BecomeDriverStep1";
import BecomeDriverStep2 from "../components/driver/BecomeDriverStep2";
import BecomeDriverStep3 from "../components/driver/BecomeDriverStep3";
import StatusPage from "../components/driver/BecomeDriverStatus";

interface ExtendedDriverApplication {
    id: number;
    status: string;
    nationalId: string;
    licenseNumber: string;
    vehicleType: string;
    idCardImageUrl: string;
    createdAt: string;
    rejectionReason?: string | null;
}

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
    const [existingApplication, setExistingApplication] = useState<ExtendedDriverApplication | null>(null);
    const [isReapplication, setIsReapplication] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(true);

    const [nationalId, setNationalId] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [uploadedPublicId, setUploadedPublicId] = useState("");
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        const checkExistingApplication = async () => {
            try {
                const application = await getMyDriverApplication();
                if (application) {
                    setExistingApplication(application as ExtendedDriverApplication);
                    if (application.status === "REJECTED") {
                        setIsReapplication(true);
                        setNationalId(application.nationalId);
                        setLicenseNumber(application.licenseNumber);
                        setVehicleType(application.vehicleType);
                        setUploadedUrl(application.idCardImageUrl);
                        setImagePreview(application.idCardImageUrl);
                    } else if (application.status === "PENDING") {
                        setCheckingApplication(false);
                        return;
                    }
                }
            } catch (err) {
                console.log('Application check failed');
            } finally {
                setCheckingApplication(false);
            }
        };
        checkExistingApplication();
    }, []);

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
            const payload = {
                nationalId,
                licenseNumber,
                vehicleType,
                idCardImageUrl: uploadedUrl,
                idCardPublicId: uploadedPublicId,
            };

            if (isReapplication && existingApplication) {
                await reapplyAsDriver(existingApplication.id, payload);
            } else {
                await applyAsDriver(payload);
            }
            setSuccess(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Application failed.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingApplication) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#00eb5b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Checking application status...</p>
                </div>
            </div>
        );
    }

    if (existingApplication && existingApplication.status === "PENDING") {
        return <StatusPage type="pending" createdAt={existingApplication.createdAt} onDashboard={() => navigate("/dashboard")} />;
    }

    if (success) {
        return <StatusPage type="success" isReapplication={isReapplication} onDashboard={() => navigate("/dashboard")} />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-100 h-20 flex items-center px-6 lg:px-12 sticky top-0 z-50">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-[#00ab42] font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    BACK TO HUB
                </button>
                <div className="flex-1 text-center pr-12">
                    <h1 className="text-xl font-black text-slate-900 font-outfit tracking-tighter">
                        {isReapplication ? "Reapply as Soksabay Driver" : "Become a Soksabay Driver"}
                    </h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
                {isReapplication && existingApplication?.rejectionReason && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-3xl">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-red-800 font-black text-lg mb-2">Previous Application Rejected</h3>
                                <p className="text-red-600 text-sm font-medium mb-3">Reason: {existingApplication.rejectionReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-12 px-4">
                    <StepIcon number={1} label="Identity" active={step >= 1} done={step > 1} />
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > 1 ? "bg-[#00eb5b]" : "bg-slate-200"}`} />
                    <StepIcon number={2} label="Documents" active={step >= 2} done={step > 2} />
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > 2 ? "bg-[#00eb5b]" : "bg-slate-200"}`} />
                    <StepIcon number={3} label="Review" active={step >= 3} done={success} />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#00eb5b]/10 overflow-hidden border border-white">
                    {error && (
                        <div className="px-10 pt-10">
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <BecomeDriverStep1
                                nationalId={nationalId}
                                setNationalId={setNationalId}
                                licenseNumber={licenseNumber}
                                setLicenseNumber={setLicenseNumber}
                                vehicleType={vehicleType}
                                setVehicleType={setVehicleType}
                                vehicleTypes={VEHICLE_TYPES}
                                onNext={() => {
                                    if (!nationalId || !licenseNumber) { setError("All fields are required."); return; }
                                    setError(""); setStep(2);
                                }}
                            />
                        )}
                        {step === 2 && (
                            <BecomeDriverStep2
                                imagePreview={imagePreview}
                                imageFile={imageFile}
                                uploadedUrl={uploadedUrl}
                                imageUploading={imageUploading}
                                onImageChange={handleImageChange}
                                onUploadImage={handleUploadImage}
                                onBack={() => setStep(1)}
                                onNext={() => { if (!uploadedUrl) { setError("Please upload your card first."); return; } setError(""); setStep(3); }}
                            />
                        )}
                        {step === 3 && (
                            <BecomeDriverStep3
                                user={user}
                                nationalId={nationalId}
                                licenseNumber={licenseNumber}
                                vehicleType={vehicleType}
                                imagePreview={imagePreview}
                                loading={loading}
                                onBack={() => setStep(2)}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

const StepIcon = ({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${done || active ? "bg-[#00eb5b] text-slate-900 shadow-xl" : "bg-slate-200 text-slate-400"}`}>
            {done ? "✓" : number}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
    </div>
);

export default BecomeDriver;
