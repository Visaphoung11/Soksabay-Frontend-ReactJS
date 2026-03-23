import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 lg:px-12 flex items-center justify-between">
                <h1 className="text-2xl font-black text-blue-600 font-outfit tracking-tighter">Soksabay Go</h1>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm uppercase tracking-tight"
                        >
                            Go to Hub
                        </button>
                    ) : (
                        <>
                            <button onClick={() => navigate("/login")} className="text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Sign In</button>
                            <button
                                onClick={() => navigate("/login")}
                                className="px-6 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all text-sm uppercase tracking-tight shadow-xl shadow-slate-900/10"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">Discover Cambodia like never before</span>
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 font-outfit tracking-tighter leading-tight mb-8">
                    Your Gateway to <br /> <span className="text-blue-600">Authentic Adventures.</span>
                </h2>
                <p className="max-w-2xl mx-auto text-slate-500 font-medium text-lg lg:text-xl leading-relaxed mb-12">
                    Connect with verified local drivers and unlock hidden gems across the Kingdom. Effortless booking, professional service, and unforgettable memories.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 text-sm uppercase tracking-tight">
                        Explore Available Trips
                    </button>
                    <button className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-[2rem] hover:bg-slate-50 transition-all text-sm uppercase tracking-tight">
                        How it Works
                    </button>
                </div>
            </header>

            {/* Featured Trips Placeholder */}
            <section className="py-20 bg-slate-50/50">
                <div className="px-6 lg:px-12 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-2">Editor's Choice</p>
                            <h3 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter">Current Trip Openings</h3>
                        </div>
                        <button className="hidden sm:block text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]">View All Destinations ➔</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TripCard
                            title="Angkor Wat Sunrise"
                            location="Siem Reap"
                            price="$45"
                            rating="4.9"
                            img="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80"
                        />
                        <TripCard
                            title="Coastal Escape"
                            location="Sihanoukville"
                            price="$35"
                            rating="4.8"
                            img="https://images.unsplash.com/photo-1540206395-6880f9490e44?auto=format&fit=crop&w=800&q=80"
                        />
                        <TripCard
                            title="Jungle Expedition"
                            location="Mondulkiri"
                            price="$60"
                            rating="5.0"
                            img="https://images.unsplash.com/photo-144837500248-2d128652420c?auto=format&fit=crop&w=800&q=80"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 text-center text-slate-400">
                <p className="text-[10px] font-black uppercase tracking-widest">© 2026 SOKSABAY GO. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
};

const TripCard = ({ title, location, price, rating, img }: any) => (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer">
        <div className="relative h-64 overflow-hidden">
            <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                Verified Hub
            </div>
            <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                {price} / Day
            </div>
        </div>
        <div className="p-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{location}</span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-500">★ {rating}</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 font-outfit tracking-tighter group-hover:text-blue-600 transition-colors uppercase">{title}</h4>
        </div>
    </div>
);

export default Home;
