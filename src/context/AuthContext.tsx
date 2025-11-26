import { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  loading: boolean;
  user: any;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading] = useState(false);

  // TEMP: fake login without Supabase
  const login = async (email: string, password: string) => {
    // change these if you want different credentials
    if (email === "admin@test.com" && password === "password") {
      setUser({ email });
      return {};
    }
    return { error: "Invalid login" };
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        isAdmin: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
