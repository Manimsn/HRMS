"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { useTokenContext } from "@/app/context/TokenContext";
import { getCookie } from "@/utils/utils";

interface User {
  username: string;
  role: string;
}

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  fetchUsers: (page: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useTokenContext();
  console.log("useTokenContext", token);

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (page: number) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const cookies = document.cookie;
      const accessToken = getCookie("accessToken", cookies);
      console.log("useTokenContext accessToken", accessToken);

      const response = await axios.get(
        `/api/employees/list-users?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("fetchUsers", response);
      setUsers(response.data.users);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("fetchUsers", error);
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(page);
    }
  }, [page, token]);

  return (
    <UserContext.Provider
      value={{ users, loading, error, page, totalPages, fetchUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};
