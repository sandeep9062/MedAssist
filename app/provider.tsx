"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

export type UserDetails = {
  name: string,
  email: string,
  credits: number
};



const Provider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<any>();

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log(result.data, "Result data");
      setUserDetail(result.data);
    } catch (error) {
      console.error("Failed to create/fetch user:", error);
    }
  };

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  return (


    <div>
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>


    </div>

  );
};

export default Provider;
