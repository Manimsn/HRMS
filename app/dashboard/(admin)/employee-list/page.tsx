"use client";

import React, { useEffect, useState } from "react";
import { useUserContext } from "@/app/context/UserContext";

const EmployeeList = () => {
  const { users, loading, error, fetchUsers } = useUserContext();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchUsers(1); // Fetch users when the component mounts if not already fetched
      setHasFetched(true);
    }
  }, [hasFetched, fetchUsers]);

  return (
    <div>
      <h1>User List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {users.map((user: any, index: any) => (
          <li key={index}>
            <strong>Username:</strong> {user.username}, <strong>Role:</strong>{" "}
            {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
