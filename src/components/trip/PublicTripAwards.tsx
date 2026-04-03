import React from "react";

const PublicTripAwards: React.FC = () => {
    return (
        <section>
            {/* FULL WIDTH + WIDE Travelers' Choice Banner - Edge to Edge */}
            <div className="relative bg-[#003d1f] text-white overflow-hidden py-16 md:py-20 mt-12 w-full">
                <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                        {/* Left Content */}
                        <div className="lg:w-5/12 space-y-6 text-center lg:text-left">
                            {/* 2026 Badge */}
                            <div className="inline-flex items-center gap-3">
                                <div className="w-14 h-14 bg-[#ffd700] rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-3xl">🏆</span>
                                </div>
                                <div className="text-[#ffd700] font-bold text-2xl tracking-widest">
                                    2026
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                                Travelers' Choice Awards
                                <br />
                                Best of the Best
                            </h2>

                            <p className="text-lg md:text-xl text-white/90 max-w-md mx-auto lg:mx-0">
                                Among our top 1% of places, stays, eats, and experiences —
                                decided by you.
                            </p>

                            <a
                                href="/travelers-choice"
                                className="inline-block mt-6 px-10 py-4 bg-white text-[#003d1f] font-semibold text-lg rounded-full hover:bg-gray-100 active:scale-95 transition-all shadow-xl"
                            >
                                See the winners
                            </a>
                        </div>

                        {/* Right Visual */}
                        <div className="lg:w-7/12 relative flex justify-center lg:justify-end">
                            {/* Yellow Circle */}
                            <div className="absolute -top-10 right-6 md:right-12 w-64 h-64 md:w-80 md:h-80 bg-[#ffd700] rounded-full z-0"></div>

                            {/* Green Circle */}
                            <div className="absolute bottom-10 -right-4 md:bottom-14 md:-right-8 w-52 h-52 md:w-64 md:h-64 bg-[#00eb5b] rounded-full z-0"></div>

                            {/* Circular Photo */}
                            <div className="relative z-10 w-full max-w-[400px] lg:max-w-[480px] aspect-square rounded-full overflow-hidden border-8 border-white shadow-2xl">
                                <img
                                    src="https://blog.windstarcruises.com/content/uploads/2019/11/bayon-temple.jpg"
                                    alt="Happy travelers in Cambodia"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#00ab42] via-[#00c74d] to-[#00eb5b]"></div>
            </div>
        </section>
    );
};

export default PublicTripAwards;
