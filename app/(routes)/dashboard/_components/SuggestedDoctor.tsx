"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DoctorAgentCard, { doctorAgent } from "./DoctorAgentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SuggestedDoctor = () => {
  const [notes, setNotes] = useState("");
  const [suggestedDoctor, setSuggestedDoctor] = useState<doctorAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSuggestDoctor = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/suggest-doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();
      console.log("Suggested doctor:", data);
      setSuggestedDoctor(data);
    } catch (error) {
      console.error("Failed to fetch doctor suggestion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async () => {
    if (!suggestedDoctor) return;

    try {
      const res = await fetch("/api/session-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
          selectedDoctor: suggestedDoctor, // ✅ Only send name (string)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session.");
      }

      console.log("Session created:", data.sessionId);

      router.push(`/dashboard/medical-agent/${data.sessionId}`);

    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg border border-teal-200 mt-10">
      <h2 className="text-xl font-semibold text-teal-700 mb-4 text-center">
        Get Doctor Suggestion
      </h2>

      <Textarea
        placeholder="Enter your symptoms or notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
        rows={4}
      />

      <Button
        onClick={handleSuggestDoctor}
        className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white"
        disabled={loading || !notes.trim()}
      >
        {loading ? "Suggesting..." : "Suggest Doctor"}
      </Button>

      {suggestedDoctor && (
        <div className="mt-6">
          <h3 className="text-center text-teal-700 mb-2">Suggested Doctor:</h3>

          <DoctorAgentCard doctor={suggestedDoctor}/>
          <Button
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSelectDoctor}
          >
            Start Session with {suggestedDoctor.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuggestedDoctor;
