// UserAuthContext.tsx — shim that re-exports from the unified AuthContext
// All functionality has been merged into AuthContext.tsx
export { useAuth as useUserAuth, AuthProvider as UserAuthProvider } from "./AuthContext";
