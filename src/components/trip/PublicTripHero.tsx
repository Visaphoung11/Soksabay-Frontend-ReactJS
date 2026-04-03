import React from "react";

const heroSlides = [
    {
        image:
            "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=2000&q=80",
        alt: "Angkor Wat Sunrise",
    },
    {
        image: "https://vigoti.org/wp-content/uploads/2013/09/tonle-sap-lake-1.jpg",
        alt: "Tonle Sap Lake",
    },
    {
        image:
            "https://www.indochinavoyages.com/wp-content/uploads/2024/10/cambodia-beaches.jpg",
        alt: "Cambodia Beach",
    },
    {
        image:
            "https://d1bv4heaa2n05k.cloudfront.net/user-images/1449230138515/1shutterstock-223834342_main_1449230145224.jpeg",
        alt: "Cambodia Temple Ruins",
    },
];

const staticDestinations = [
    {
        name: "Angkor Wat",
        place: "Siem Reap",
        desc: "Sunrise temples, ancient Khmer wonders, and unforgettable history.",
        image:
            "https://ucarecdn.com/5e38f865-3e47-45fb-b0e9-9d8ffae0098f/-/crop/4992x2622/0,354/-/resize/1200x630/",
    },
    {
        name: "Koh Rong",
        place: "Sihanoukville",
        desc: "Crystal water, white sand beaches, and island vibes for weekend escapes.",
        image:
            "https://www.shutterstock.com/shutterstock/videos/3578514831/thumb/1.jpg?ip=x480",
    },
    {
        name: "Kampot Riverside",
        place: "Kampot",
        desc: "Relaxed riverside views, pepper farms, and scenic countryside rides.",
        image:
            "https://www.pelago.com/img/products/KH-Cambodia/bokor-national-park-private-day-trip-from-phnom-penh/38a7bd5f-dbfc-4f5c-a5fc-2dc14cf643e8_bokor-national-park-private-day-trip-from-phnom-penh.jpg",
    },
];

interface PublicTripHeroProps {
    currentSlide: number;
    heroRef: React.RefObject<HTMLDivElement | null>;
    carouselRef: React.RefObject<HTMLDivElement | null>;
    goToSlide: (index: number) => void;
}

const PublicTripHero: React.FC<PublicTripHeroProps> = ({
    currentSlide,
    heroRef,
    carouselRef,
    goToSlide,
}) => {
    return (
        <>
            <section className="mb-8 rounded-3xl overflow-hidden bg-white border border-slate-200">
                <div className="relative h-[320px] md:h-[420px] group" ref={heroRef}>
                    {/* Slides Container */}
                    <div
                        ref={carouselRef}
                        className="flex h-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {heroSlides.map((slide, index) => (
                            <div
                                key={index}
                                className="min-w-full h-full relative flex-shrink-0"
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.alt}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
                            </div>
                        ))}
                    </div>

                    {/* Content Overlay (same for all slides) */}
                    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pointer-events-none">
                        <p className="text-[#00eb5b] text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-2">
                            BOOK TOURS IN CAMBODIA
                        </p>
                        <h1 className="text-white text-3xl md:text-5xl font-black max-w-3xl leading-tight">
                            Discover Cambodia like you imagine and see style adventures
                        </h1>
                        <p className="text-white/85 mt-3 text-sm md:text-base max-w-2xl">
                            Compare routes, explore destination highlights, and book trusted
                            drivers for your journey across Cambodia.
                        </p>
                    </div>

                    {/* Navigation Dots */}
                    <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-auto ${currentSlide === index
                                        ? "bg-white scale-110"
                                        : "bg-white/50 hover:bg-white"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-slate-900">
                        Top Cambodia Destinations
                    </h2>
                    <p className="text-sm text-slate-500">
                        Cambodia is a country in Southeast Asia with a rich history and
                        diverse culture.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staticDestinations.map((d) => (
                        <div
                            key={d.name}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
                        >
                            <img
                                src={d.image}
                                alt={d.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <p className="text-[11px] font-black uppercase text-[#00ab42] tracking-widest">
                                    {d.place}
                                </p>
                                <h3 className="text-lg font-black text-slate-900 mt-1">
                                    {d.name}
                                </h3>
                                <p className="text-sm text-slate-600 mt-2">{d.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default PublicTripHero;
