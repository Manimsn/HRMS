"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import React from "react";

const Logout = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push("/");
  };

  return (
    <>
      {user && (
        <div onClick={logout} style={{ cursor: "pointer" }}>
          Logout
        </div>
      )}
    </>
  );
};

export default Logout;
