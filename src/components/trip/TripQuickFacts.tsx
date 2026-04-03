import React from "react";
import { InfoCard } from "../common";
import type { Trip } from "../../types/auth";

interface TripQuickFactsProps {
    trip: Trip;
}

const TripQuickFacts: React.FC<TripQuickFactsProps> = ({ trip }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="From" value={`${trip.pricePerSeat}`} subValue="per seat" />
            <InfoCard
                label="Departure"
                value={new Date(trip.departureTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                subValue={new Date(trip.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            />
            <InfoCard label="Seats left" value={String(trip.availableSeats)} subValue={`of ${trip.totalSeats}`} variant="highlight" />
        </div>
    );
};

export default TripQuickFacts;
