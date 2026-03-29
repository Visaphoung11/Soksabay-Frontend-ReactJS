// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  fullName: string;
  gender: string;
  contactNumber: string;
  /** Optional URL for user's avatar/profile picture */
  profileImage?: string;
  role: string[]; // e.g. ["USER"] or ["USER", "DRIVER"]
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    contactNumber: string,
    gender: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetches user profile from server and updates localStorage + state (for role refresh after approval). */
  refreshUser: () => Promise<void>;
  /** Update local cached user (localStorage + context state) */
  setUserAndPersist: (next: User) => void;
}

// ─── Driver Application ──────────────────────────────────────────────────────
export interface DriverApplication {
  id: number;
  nationalId: string;
  licenseNumber: string;
  vehicleType: string;
  idCardImageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userEmail: string;
  userFullName: string;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Media Upload ────────────────────────────────────────────────────────────
export interface MediaUploadResponse {
  secure_url: string;
  public_id: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

// ─── Trips ───────────────────────────────────────────────────────────────────
export type TripStatus = "AVAILABLE" | "FULL" | "CANCELLED";

export interface Trip {
  id: number;
  title: string;
  description: string;
  origin: string;
  destination: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  departureTime: string;
  status: TripStatus;
  images: string[];
  /** NEW: vehicle-specific photos (interior/exterior) */
  vehicleImageUrls?: string[];
  // NEW VEHICLE & PRICING FIELDS
  transportationType?: string;
  vehicleCapacity?: number;
  isWholeVehicleBooking?: boolean;
  wholeVehiclePrice?: number;

  // NEW SCHEDULING & DETAILS
  scheduleDescription?: string;
  availabilitySchedule?: string;

  // NEW OPTIONAL SERVICES
  hasTourGuide?: boolean;
  tourGuideDescription?: string;
  tourGuideImageUrl?: string;

  mealsIncluded?: boolean;
  diningDetails?: string;

  // NEW NESTED ITINERARY
  itinerary?: TripItineraryItem[];

  driverName: string;
  categoryName: string;
  categoryId?: number;
}

export interface TripItineraryItem {
  id?: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface TripPayload {
  title: string;
  description: string;
  origin: string;
  destination: string;
  pricePerSeat: number;
  totalSeats: number;
  departureTime: string; // ISO-8601
  categoryId: number;
  imageUrls: string[];
  /** NEW: vehicle-specific photos (interior/exterior) */
  vehicleImageUrls?: string[];

  // NEW VEHICLE & PRICING FIELDS
  transportationType: string;
  vehicleCapacity: number;
  isWholeVehicleBooking: boolean;
  wholeVehiclePrice?: number;

  // NEW SCHEDULING & DETAILS
  scheduleDescription?: string;
  availabilitySchedule?: string;

  // NEW OPTIONAL SERVICES
  hasTourGuide?: boolean;
  tourGuideDescription?: string;
  tourGuideImageUrl?: string;

  mealsIncluded?: boolean;
  diningDetails?: string;

  // NEW NESTED ITINERARY
  itinerary?: TripItineraryItem[];
}

export interface TripSearchParams {
  origin?: string;
  destination?: string;
  date?: string; // YYYY-MM-DD
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

// ─── Bookings ───────────────────────────────────────────────────────────────
export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export interface BookingTripInfo {
  id: number;
  title: string;
  destination: string;
  departureTime: string;
  driverName: string;
}

export interface Booking {
  id: number;
  seatsBooked: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  trip: BookingTripInfo;
  passengerName: string;
  passengerPhone: string;
}

export interface CreateBookingPayload {
  tripId: number;
  seatsBooked: number;
}
