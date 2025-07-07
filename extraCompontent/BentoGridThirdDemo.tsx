"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  IconHeartbeat,
  IconStethoscope,
  IconReportMedical,
  IconNotes,
  IconVaccineBottle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

type SessionItem = {
  id: number;
  notes: string;
  report: {
    chiefComplaint: string;
    medicationsMentioned: string[];
    recommendations: string[];
    summary: string;
    possibleConditions: string[];
  };
  selectedDoctor: {
    name: string;
    specialist: string;
  };
  createdOn: string;
};

export function MedAssistBentoGrid() {
  const [recentSessionData, setRecentSessionData] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessionList = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      setRecentSessionData(result.data);
    } catch (error) {
      console.error("Failed to fetch history list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionList();
  }, []);

  const items = [
    {
      title: "AI Symptom Checker",
      description: (
        <span className="text-sm">
          Get instant analysis of your health symptoms using AI.
        </span>
      ),
      header: <HealthSkeletonOne session={recentSessionData[0]} />,
      className: "md:col-span-1",
      icon: <IconHeartbeat className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Virtual Doctor Consult",
      description: (
        <span className="text-sm">
          Connect with certified AI doctors for quick consultations.
        </span>
      ),
      header: <HealthSkeletonTwo session={recentSessionData[0]} />,
      className: "md:col-span-1",
      icon: <IconStethoscope className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Health Monitoring Dashboard",
      description: (
        <span className="text-sm">
          Monitor vitals such as heart rate, BP, and oxygen levels.
        </span>
      ),
      header: <HealthSkeletonThree />,
      className: "md:col-span-1",
      icon: <IconReportMedical className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "AI Medical Reports",
      description: (
        <span className="text-sm">
          Automatically generate detailed medical reports post-consult.
        </span>
      ),
      header: <HealthSkeletonFour session={recentSessionData[0]} />,
      className: "md:col-span-2",
      icon: <IconNotes className="h-4 w-4 text-red-500" />,
    },
    {
      title: "Medication Reminders",
      description: (
        <span className="text-sm">
          Receive alerts for medication schedules and refills.
        </span>
      ),
      header: <HealthSkeletonFive session={recentSessionData[0]} />,
      className: "md:col-span-1",
      icon: <IconVaccineBottle className="h-4 w-4 text-yellow-500" />,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="animate-pulse rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-blue-900/10 dark:to-teal-900/10 p-6 h-48 shadow-inner"
            ></motion.div>
          ))}
        </div>
      ) : (
        <BentoGrid className="max-w-4xl mx-auto mb-8 md:auto-rows-[22rem]">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={cn("[&>p:text-lg]", item.className)}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      )}
    </div>
  );
}

const HealthSkeletonOne = ({ session }: { session?: SessionItem }) => (
  <motion.div className="flex flex-col w-full h-full p-4 space-y-3 bg-teal-50/30 dark:bg-blue-900/20 rounded-lg">
    <h3 className="text-blue-600 font-semibold text-sm">Symptom Analysis</h3>
    <p className="text-xs text-gray-700 dark:text-gray-300">Possible Conditions:</p>
    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
      {session?.report?.possibleConditions?.length ? (
        session.report.possibleConditions.map((cond, idx) => (
          <li key={idx}>• {cond}</li>
        ))
      ) : (
        <li>No data available</li>
      )}
    </ul>
  </motion.div>
);

const HealthSkeletonTwo = ({ session }: { session?: SessionItem }) => (
  <motion.div className="flex flex-col w-full h-full p-4 space-y-3 bg-green-50/30 dark:bg-green-900/20 rounded-lg">
    <h3 className="text-green-600 font-semibold text-sm">Current Consult</h3>
    {session ? (
      <>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Active Doctor: <strong>{session.selectedDoctor.name}</strong>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Specialization: {session.selectedDoctor.specialist}
        </p>
      </>
    ) : (
      <p className="text-xs text-gray-600 dark:text-gray-400">No session data</p>
    )}
  </motion.div>
);

const HealthSkeletonThree = () => (
  <motion.div className="flex flex-col justify-center items-center w-full h-full p-4 bg-purple-50/30 dark:bg-purple-900/20 rounded-lg space-y-3">
    <h3 className="text-purple-600 font-semibold text-sm">Vitals Overview</h3>
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-700 dark:text-gray-300">Heart Rate: 76 bpm</p>
      <p className="text-xs text-gray-700 dark:text-gray-300">
        Blood Pressure: 120/80 mmHg
      </p>
    </div>
  </motion.div>
);

const HealthSkeletonFour = ({ session }: { session?: SessionItem }) => (
  <motion.div className="flex flex-col w-full h-full p-4 space-y-2 bg-red-50/30 dark:bg-red-900/20 rounded-lg">
    <h3 className="text-red-600 font-semibold text-sm">Recent Report</h3>
    {session ? (
      <>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Summary: {session.report.summary}
        </p>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Recommendations:
          <ul className="list-disc list-inside space-y-1 mt-1">
            {session.report.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </>
    ) : (
      <p className="text-xs text-gray-600 dark:text-gray-400">No recent report data</p>
    )}
  </motion.div>
);

const HealthSkeletonFive = ({ session }: { session?: SessionItem }) => (
  <motion.div className="flex flex-col w-full h-full p-4 space-y-3 bg-yellow-50/30 dark:bg-yellow-900/20 rounded-lg">
    <h3 className="text-yellow-600 font-semibold text-sm">Today's Medications</h3>
    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
      {session?.report?.medicationsMentioned?.length ? (
        session.report.medicationsMentioned.map((med, idx) => <li key={idx}>• {med}</li>)
      ) : (
        <li>No medications mentioned</li>
      )}
    </ul>
  </motion.div>
);