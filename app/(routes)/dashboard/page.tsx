import React from "react";
import HistoryList from "./_components/HistoryList";
//import { Button } from "@/components/ui/button";
import DoctorAgentList from "./_components/DoctorAgentList";
import AddNewSession from "./_components/AddNewSession";


const Dashboard = () => {
  return (
    <div className="mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-teal-800">
          My Medical Dashboard
        </h1>
        {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md transition">
          + Consult with Doctor
        </Button> */}

        <AddNewSession />
      </div>
      <div className="p-6">
        <h2 className="text-l font-semibold text-teal-700 mb-2 ">
          Consultation History
        </h2>
        <HistoryList />
      </div>



      <div>
        <DoctorAgentList />
      </div>{" "}
    </div>
  );
};

export default Dashboard;
