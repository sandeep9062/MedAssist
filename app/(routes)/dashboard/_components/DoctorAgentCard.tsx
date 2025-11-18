"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type doctorAgent = {
  id: number;
  name: string;
  image: string;
  specialist: string;
  voiceId: string;
  description: string;
  agentPrompt: string;
};

type Props = {
  doctor: doctorAgent;
};

const DoctorAgentCard = ({ doctor }: Props) => {
  const router = useRouter();

  const handleCallRequest = async () => {
    toast.success("Consultation started");

    try {
      const res = await fetch("/api/session-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDoctor: doctor,
          notes:doctor.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create session.");

      router.push(`/dashboard/medical-agent/${data.sessionId}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log("agenet card",error)
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-teal-300 rounded-xl shadow-md transition-transform duration-300 hover:scale-[1.02] hover:shadow-teal-500/30 hover:shadow-xl overflow-hidden max-w-sm w-full">
      <div className="p-1">
        <Image
          src={doctor.image}
          alt={`Doctor ${doctor.name}`}
          width={300}
          height={200}
          className="rounded-lg object-fit w-full h-52"
        />
        <div className="text-center mt-4">
          <h3 className="text-lg font-bold text-teal-700">{doctor.name}</h3>
          <p className="text-gray-600 font-semibold text-sm mt-1">{doctor.specialist}</p>
          <p className="text-gray-700 text-sm mt-2">{doctor.description}</p>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm transition-all duration-200"
          onClick={handleCallRequest}
        >
          Start Consultation
        </Button>
      </div>

      {/* Hover Effect - Medical glow */}
      <div className="absolute inset-0 bg-teal-50 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default DoctorAgentCard;
