import React from "react";

interface StatusPageProps {
    type: "pending" | "success";
    isReapplication?: boolean;
    createdAt?: string;
    onDashboard: () => void;
}

const StatusPage: React.FC<StatusPageProps> = ({
    type,
    isReapplication,
    createdAt,
    onDashboard,
}) => {
    if (type === "pending") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl shadow-[#00eb5b]/15 border border-white">
                    <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 font-outfit">Application Under Review</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                        Your driver application is currently being reviewed by our team. We'll notify you as soon as there's an update.
                    </p>
                    <div className="bg-amber-50 rounded-2xl p-6 mb-10 border border-amber-200">
                        <p className="text-amber-700 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Status: Pending Review
                        </p>
                        {createdAt && <p className="text-amber-600 text-xs mt-2">Submitted on {new Date(createdAt).toLocaleDateString()}</p>}
                    </div>
                    <button
                        onClick={onDashboard}
                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl shadow-[#00eb5b]/15 border border-white">
                <div className="w-24 h-24 rounded-full bg-[#00eb5b]/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <svg className="w-12 h-12 text-[#00ab42]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 font-outfit">
                    {isReapplication ? "Application Re-submitted!" : "Application Sent!"}
                </h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                    {isReapplication
                        ? "Your application has been re-submitted for review. We'll evaluate your updated information and notify you soon."
                        : "Your application is now being reviewed by our team. We'll notify you as soon as you're cleared for the road."
                    }
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
                    onClick={onDashboard}
                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StatusPage;
