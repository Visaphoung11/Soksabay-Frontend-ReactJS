import React from "react";
import type { Trip } from "../../types/auth";
import DriverTripCard from "./DriverTripCard";

interface DriverTripListProps {
    loading: boolean;
    trips: Trip[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onDetail: (id: number) => void;
}

const DriverTripList: React.FC<DriverTripListProps> = ({
    loading,
    trips,
    onEdit,
    onDelete,
    onDetail,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="py-12 text-center text-slate-500 border-2 border-dashed rounded-3xl">
                No trips created yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
                <DriverTripCard
                    key={trip.id}
                    trip={trip}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDetail={onDetail}
                />
            ))}
        </div>
    );
};

export default DriverTripList;
