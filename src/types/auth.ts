export interface Role {
  authority: string;
}

export interface User {
  email: string;
  roles: string[]; // Change this from any or Object to string[]
}
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}
