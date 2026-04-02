// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  fullName: string;
  gender: string;
  contactNumber: string;
  /** Optional URL for user's avatar/profile picture */
  profileImage?: string;
  /** Optional URL for profile banner/header image */
  bannerUrl?: string;
  /** Optional bio/about text */
  bio?: string;
  /** For drivers: number of ratings received */
  ratingCount?: number;
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

  /** NEW: driver id when backend includes it */
  driverId?: number;
  driverName: string;
  categoryName: string;
  categoryId?: number;

  /** Review summary (if backend provides it; otherwise computed client-side in list pages) */
  averageRating?: number; // 1..5 (may be float)
  totalReviews?: number;
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
  driverId?: number;
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
  rejectionReason?: string;
}

export interface CreateBookingPayload {
  tripId: number;
  seatsBooked: number;
}

// ─── Reviews ────────────────────────────────────────────────────────────────
export type TravelerType = "BUSINESS" | "COUPLES" | "FAMILY" | "FRIENDS" | "SOLO";

export interface Review {
  id: number;
  tripId: number;
  driverId?: number;
  rating: number; // 1..5
  title: string;
  comment: string;
  travelerType: TravelerType;
  visitDate: string; // e.g. "March 2026"
  imageUrls: string[];
  createdAt?: string;

  // optional author fields if backend returns them
  userId?: number;
  userFullName?: string;
  userProfileImage?: string;
}

export interface CreateReviewPayload {
  tripId: number;
  rating: number; // 1..5
  title: string;
  comment: string;
  travelerType: TravelerType;
  visitDate: string;
  imageUrls: string[];
}
