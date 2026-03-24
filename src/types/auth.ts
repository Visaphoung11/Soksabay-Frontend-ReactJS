// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  fullName: string;
  gender: string;
  contactNumber: string;
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
  driverName: string;
  categoryName: string;
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
