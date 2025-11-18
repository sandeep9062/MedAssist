"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { doctorAgent } from "./DoctorAgentCard";

const AddNewSession = () => {
  const [symptomsNote, setSymptomsNote] = useState<string>("");
  const [suggestedDoctor, setSuggestedDoctor] = useState<doctorAgent | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSuggestDoctor = async () => {
    if (!symptomsNote.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/suggest-doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: symptomsNote }),
      });

      const data = await res.json();
      setSuggestedDoctor(data);
    } catch (error) {
      console.error("Error suggesting doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!suggestedDoctor) return;

    try {
      const res = await fetch("/api/session-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: symptomsNote,
          selectedDoctor: suggestedDoctor,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create session");

      window.location.href = `/dashboard/medical-agent/${data.sessionId}`;
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md px-6 py-2 shadow-md transition">
            + Start a Consultation
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full rounded-2xl border border-gray-100 shadow-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-teal-700">
              Medical Consultation
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Describe your symptoms to get a suitable doctor recommendation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Describe your symptoms or concerns here..."
              className="border-2 border-teal-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-500 rounded-md shadow-sm"
              value={symptomsNote}
              onChange={(e) => setSymptomsNote(e.target.value)}
              rows={4}
              disabled={!!suggestedDoctor}
            />

            {suggestedDoctor && (
              <div className="mt-2 text-center">
                <h3 className="text-lg font-semibold text-teal-700 mb-1">
                  Suggested Doctor
                </h3>
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 shadow-md flex flex-col items-center">
                  <Image
                    src={suggestedDoctor.image}
                    alt={suggestedDoctor.name}
                    width={160}
                    height={160}
                    className="rounded-lg shadow-sm object-fit mb-1"
                  />
                  <p className="text-base font-semibold text-gray-900">
                    {suggestedDoctor.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {suggestedDoctor.specialist}
                  </p>
               

                <Button
                  className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 font-semibold shadow"
                  onClick={handleStartSession}
                >
                  Start Session with {suggestedDoctor.name}
                </Button> </div>
              </div>
            )}
          </div>

          <div className="mt-0 flex justify-between gap-4">
            <DialogClose asChild>
              <Button className="flex-1 border border-teal-600 text-teal-700 bg-white hover:bg-teal-700 hover:text-white rounded-lg py-2 font-medium transition">
                Close
              </Button>
            </DialogClose>

            {!suggestedDoctor && (
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg py-2 font-semibold shadow-md"
                disabled={!symptomsNote.trim() || loading}
                onClick={handleSuggestDoctor}
              >
                {loading ? "Suggesting..." : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewSession;
