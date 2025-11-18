"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

type SessionDetails = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

const MedicalVoiceAgent = () => {
  const [callStarted, setCallStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionDetail, setSessionDetail] = useState<SessionDetails | null>(null);
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  const router = useRouter();
  const { sessionId } = useParams();

  const cleanupVapi = () => {
    if (vapiInstance) {
      try {
        vapiInstance.removeAllListeners?.();
        vapiInstance.stop?.();
        vapiInstance.destroy?.();
      } catch (err) {
        console.warn("Vapi cleanup error:", err);
      }
      setCallStarted(false);
      setVapiInstance(null);
    }
  };

  const fetchSessionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      setSessionDetail(response.data);
    } catch (error) {
      console.error("Session fetch error:", error);
      toast.error("Failed to load session details.");
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = () => {
    if (!sessionDetail) {
      toast.error("Session details missing.");
      return;
    }

    if (callStarted || vapiInstance) {
      toast.warning("Call already in progress.");
      return;
    }

    const { selectedDoctor } = sessionDetail;

    if (!selectedDoctor.voiceId || !selectedDoctor.agentPrompt) {
      toast.error("Doctor voice configuration missing.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      toast.error("Vapi API Key missing.");
      return;
    }

    cleanupVapi();

    const vapi = new Vapi(apiKey);
    setVapiInstance(vapi);

    try {
      vapi.start({
        name: "Medical Doctor Voice Agent",
        firstMessage: `Hi! I'm Dr. ${selectedDoctor.name}. How can I assist you today?`,
        transcriber: { provider: "assembly-ai", language: "en" },
        voice: { provider: "playht", voiceId: selectedDoctor.voiceId },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            { role: "system", content: selectedDoctor.agentPrompt },
          ],
        },
      });
    } catch (error) {
      console.error("Vapi start error:", error);
      toast.error("Failed to start the voice agent.");
      return;
    }

    vapi.on("call-start", () => setCallStarted(true));
    vapi.on("call-end", () => {
      setCallStarted(false);
      cleanupVapi();
    });

    vapi.on("message", (message) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        if (transcriptType === "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === "final") {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });

    vapi.on("speech-start", () => setCurrentRole("assistant"));
    vapi.on("speech-end", () => setCurrentRole("user"));
    vapi.on("error", (err) => {
      console.error("Vapi runtime error:", err);
      toast.error("Call error occurred.");
      cleanupVapi();
    });
  };

  const endCall = async () => {
    setIsLoading(true);
    try {
      cleanupVapi();
      await generateReport();
      toast.success("Medical report generated successfully.");
      router.replace("/dashboard");
    } catch (error) {
      console.error("End call error:", error);
      toast.error("Failed to end call or generate report.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await axios.post("/api/medical-report", {
        messages,
        sessionDetail,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Generate report error:", error);
      toast.error("Failed to generate medical report.");
      throw error;
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    return () => cleanupVapi();
  }, [sessionId]);

  return (
    <div className="md-w-full mx-auto p-6 bg-white rounded-2xl shadow-xl space-y-6 mt-10 border border-blue-100">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
          <Circle className={`w-4 h-4 rounded-2xl ${callStarted ? "bg-green-500" : "bg-red-500"}`} />
          {callStarted ? "Connected" : "Not Connected"}
        </h2>
        <span className="text-gray-400 text-xs">11:12</span>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 text-sm">
          <Loader className="mx-auto animate-spin" />
          Loading session details...
        </div>
      ) : sessionDetail ? (
        <div className="flex flex-col items-center text-center space-y-4">
          <Image
            src={sessionDetail.selectedDoctor.image}
            alt={sessionDetail.selectedDoctor.specialist}
            width={120}
            height={120}
            className="rounded-full shadow-md border-4 border-blue-100"
          />
          <div>
            <h2 className="text-blue-700 font-medium text-lg">
              {sessionDetail.selectedDoctor.specialist}
            </h2>
            <p className="text-gray-700">{sessionDetail.selectedDoctor.name}</p>
          </div>

          <div className="w-full bg-blue-50 p-4 rounded-lg space-y-2 shadow-inner border border-blue-100 max-h-40 overflow-y-auto">
            {messages.slice(-4).map((msg, index) => (
              <p key={index} className="text-gray-600 text-sm">
                <strong className="capitalize">{msg.role}:</strong> {msg.text}
              </p>
            ))}
            {liveTranscript && (
              <p className="text-blue-700 font-semibold">
                <strong className="capitalize">{currentRole}:</strong> {liveTranscript}
              </p>
            )}
          </div>

          {!callStarted ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center gap-2 px-6 py-2 transition"
              onClick={startCall}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin" /> : <Phone className="w-4 h-4" />}
              Start Call
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-md transition"
              onClick={endCall}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin" /> : <PhoneOff className="w-4 h-4" />}
              Disconnect
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-sm">No session data found.</div>
      )}

      <div className="text-xs text-gray-400 text-center">Session ID: {sessionId}</div>
    </div>
  );
};

export default MedicalVoiceAgent;
