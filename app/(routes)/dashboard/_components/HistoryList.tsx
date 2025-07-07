"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AddNewSession from "./AddNewSession";
//import SuggestedDoctor from "./SuggestedDoctor";

type SessionItem = {
  id: number;
  notes: string;
  report: {
    chiefComplaint: string;
  };
  selectedDoctor: {
    name: string;
    specialist: string;
  };
  createdOn: string;
};

const HistoryList = () => {
  const [historyList, setHistoryList] = useState<SessionItem[]>([]);

  
  const fetchHistoryList = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      console.log("History List Result:", result.data);
      setHistoryList(result.data);
    } catch (error) {
      console.error("Failed to fetch history list:", error);
    }
  };

  useEffect(() => {
    fetchHistoryList();
  }, []);

  return (
    <div className="space-y-4">
      {historyList.length === 0 ? (
        <div className="text-center space-y-4">
          <Image
            src="/medical-assistance.png"
            alt="empty list"
            width={200}
            height={200}
            className="mx-auto"
          />
          <h2 className="text-lg font-semibold text-red-500">
            No Recent Consultations
          </h2>
          <p className="text-gray-600">
            It looks like you have not consulted with any doctor yet.
          </p>
          <AddNewSession />
        </div>
      ) : (
        
        historyList.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-md shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-teal-700 font-semibold">
                {item.selectedDoctor?.name || "Unknown Doctor"}
              </h3>
              <span className="text-teal-500 text-sm">
                {new Date(item.createdOn).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-teal-600 text-sm">
              {item.report?.chiefComplaint}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryList;
