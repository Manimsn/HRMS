"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: { username: string; role: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const router = useRouter();

  const login = async (username: string, password: string) => {
    console.log("login username", username);
    console.log("login password", password);
    try {
      const response = await axios.post("/api/login", { username, password });
      const data = response.data;
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      document.cookie = `refreshToken=${data.refreshToken}; path=/`;
      setUser({ username, role: data.role });
      router.push("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    document.cookie = "accessToken=; Max-Age=0; path=/";
    document.cookie = "refreshToken=; Max-Age=0; path=/";
    setUser(null);
    router.push("/");
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("refreshToken="))
        ?.split("=")[1];
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post("/api/refresh-token", { refreshToken });
      const data = response.data;
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      return data.accessToken;
    } catch (error) {
      logout();
      throw new Error("Failed to refresh access token");
    }
  };

  const checkUser = async () => {
    let accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      logout();
      return;
    }

    try {
      const response = await axios.get("/api/protected", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
      setUser({ username: data.username, role: data.role });
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          accessToken = await refreshAccessToken();
          const response = await axios.get("/api/protected", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = response.data;
          setUser({ username: data.username, role: data.role });
        } catch (refreshError) {
          logout();
        }
      } else {
        logout();
      }
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
