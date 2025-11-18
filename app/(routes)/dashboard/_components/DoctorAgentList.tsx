"use client";

import React from "react";
import { AIDoctorAgents } from "@/shared/list";
import DoctorAgentCard from "./DoctorAgentCard";

const DoctorAgentList = () => {
  return (
    <section className="px-2 sm:px-4 lg:px-6">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4 text-center">
        Meet Our Specialist Doctors
      </h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Our highly experienced doctors are here to provide expert guidance and personalized care.
        Select your specialist and start your consultation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {AIDoctorAgents.map((doctor) => (
          <DoctorAgentCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
};

export default DoctorAgentList;
