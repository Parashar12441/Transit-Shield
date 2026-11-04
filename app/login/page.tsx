"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/context/AuthContext";
import {
  ShieldAlert,
  Radio,
  User,
  Users,
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  KeyRound,
  Terminal,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

const BOOTUP_STEPS = [
  { text: "NEXUS TRANSIT OS v2.4.1 KERNEL BOOTSTRAP...", delay: 250 },
  { text: "CALIBRATING KANPUR METROPOLITAN ROAD CORRIDOR VECTORS...", delay: 450 },
  { text: "SYNCHRONIZING KCTSL & CHALO TIMETABLES (6 ARTERIAL ROUTES)...", delay: 650 },
  { text: "INITIALIZING AIS-140 SATELLITE GPS TELEMETRY PIPELINE...", delay: 850 },
  { text: "VERIFYING BI-DIRECTIONAL SOS EMERGENCY DISPATCH INTERLOCK...", delay: 1050 },
  { text: "SUBSYSTEMS ONLINE — READY FOR OPERATOR & CITIZEN AUTHENTICATION.", delay: 1250 },
];

export default function BootupLoginPage() {
  const router = useRouter();
  const { login, userRole, switchRole } = useAuth();

  // State machine: "BOOTUP" | "LOGIN"
  const [stage, setStage] = useState<"BOOTUP" | "LOGIN">("BOOTUP");
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>("OPERATOR");

  // Form states - Operator
  const [operatorId, setOperatorId] = useState("KCTSL-DISPATCH-4902");
  const [operatorName, setOperatorName] = useState("Neha Sharma");
  const [operatorStation, setOperatorStation] = useState("Kanpur Central Command Hub (Zone 1)");
  const [operatorPin, setOperatorPin] = useState("••••••••");

  // Form states - Commuter / User
  const [userPhone, setUserPhone] = useState("+91 98390 12345");
  const [userName, setUserName] = useState("Aditya Verma");
  const [userCorridor, setUserCorridor] = useState("KE-1: Sanjeev Nagar ↔ IIT Kanpur");
  const [userOtp, setUserOtp] = useState("7821");

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  // Bootup sequence simulation
  useEffect(() => {
    if (stage !== "BOOTUP") return;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 2.5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setTimeout(() => {
          setStage("LOGIN");
        }, 500);
      }
      setBootProgress(Math.min(100, Math.round(currentProgress)));
    }, 35);

    BOOTUP_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
      }, step.delay);
    });

    return () => clearInterval(progressInterval);
  }, [stage]);

  const handleSkipBoot = () => {
    setBootProgress(100);
    setCompletedSteps(BOOTUP_STEPS.map((_, i) => i));
    setStage("LOGIN");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthNotice(
      activeRole === "OPERATOR"
        ? "AUTHENTICATING COMMAND BADGE CREDENTIALS..."
        : "VALIDATING PASSENGER SMART PASS TOKEN..."
    );

    setTimeout(() => {
      if (activeRole === "OPERATOR") {
        login({
          role: "OPERATOR",
          name: operatorName,
          badgeOrId: operatorId,
          stationOrLocation: operatorStation,
        });
      } else {
        login({
          role: "USER",
          name: userName,
          badgeOrId: userPhone,
          stationOrLocation: userCorridor,
        });
      }
      setIsSubmitting(false);
      router.push("/");
    }, 900);
  };

  // Quick Demo presets
  const fillDemoOperator = (type: "NEHA" | "ARJUN") => {
    if (type === "NEHA") {
      setOperatorId("KCTSL-DISPATCH-4902");
      setOperatorName("Neha Sharma");
      setOperatorStation("Kanpur Central Command Hub (Zone 1)");
      setOperatorPin("••••••••");
    } else {
      setOperatorId("KCTSL-SUPERVISOR-3108");
      setOperatorName("Arjun Dixit");
      setOperatorStation("Rawatpur Metro Transit Control (Zone 2)");
      setOperatorPin("••••••••");
    }
  };

  const fillDemoCommuter = (type: "ADITYA" | "PRIYA") => {
    if (type === "ADITYA") {
      setUserPhone("+91 98390 12345");
      setUserName("Aditya Verma");
      setUserCorridor("KE-1: Sanjeev Nagar ↔ IIT Kanpur");
      setUserOtp("7821");
    } else {
      setUserPhone("+91 94150 99887");
      setUserName("Priya Mishra");
      setUserCorridor("KE-4: Sanjeev Nagar ↔ Bithoor");
      setUserOtp("4432");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-tx-primary flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background futuristic grid & radar glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-nexus-cyan/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-nexus-blue/10 blur-[140px] rounded-full" />
        <div
          className="w-full h-full opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 p-5 md:px-8 border-b border-border/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-cyan/20 to-nexus-blue/30 border border-nexus-cyan/50 flex items-center justify-center text-nexus-cyan shadow-glow">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-lg text-tx-primary tracking-wider font-mono flex items-center gap-1.5">
              NEXUS<span className="text-nexus-cyan">TRANSIT</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-nexus-cyan">
                OS v2.4
              </span>
            </div>
            <div className="text-[10px] text-tx-secondary tracking-widest font-mono uppercase">
              Kanpur Metropolitan Intelligent Fleet Command
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/80 border border-border">
            <span className="w-2 h-2 rounded-full bg-nexus-safe shadow-glow-safe animate-pulse" />
            <span className="text-tx-secondary text-[11px]">KCTSL GATEWAY: ONLINE</span>
          </div>
          {stage === "BOOTUP" && (
            <button
              onClick={handleSkipBoot}
              className="px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover text-nexus-cyan border border-nexus-cyan/40 hover:border-nexus-cyan transition-all text-xs font-semibold"
            >
              Skip Bootup &rarr;
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        {stage === "BOOTUP" ? (
          /* =========================================================================
             STAGE 1: TACTICAL SYSTEM BOOTUP SEQUENCE
             ========================================================================= */
          <div className="w-full max-w-xl p-6 md:p-8 rounded-2xl bg-bg-surface/90 border border-border/80 shadow-2xl backdrop-blur-xl space-y-6 tech-card animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-nexus-cyan font-mono text-xs font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Geospatial Core Initialization</span>
              </div>
              <span className="text-xs font-mono font-bold text-tx-primary">{bootProgress}%</span>
            </div>

            {/* Glowing Boot Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-nexus-blue via-nexus-cyan to-nexus-safe transition-all duration-150 shadow-glow"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-tx-muted">
                <span>MEM_ADDR: 0x7FFE9B820</span>
                <span>CHALO &bull; AIS-140 LINK</span>
              </div>
            </div>

            {/* Console Log Lines */}
            <div className="space-y-2 font-mono text-xs bg-bg-elevated/70 p-4 rounded-xl border border-border max-h-56 overflow-y-auto">
              {BOOTUP_STEPS.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCurrent = completedSteps.length === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 transition-all duration-200 ${
                      isDone
                        ? "text-tx-secondary"
                        : isCurrent
                        ? "text-nexus-cyan font-bold"
                        : "text-tx-muted/40"
                    }`}
                  >
                    <span className="text-[10px] shrink-0 font-bold mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-nexus-safe inline" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-nexus-cyan inline-block animate-ping" />
                      ) : (
                        "&bull;"
                      )}
                    </span>
                    <span className="leading-tight">{step.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-mono text-tx-muted">
              <span>SECURITY PROTOCOL: AIS-140 LEVEL 4</span>
              <button
                onClick={handleSkipBoot}
                className="text-nexus-cyan hover:underline font-semibold"
              >
                Proceed to Login Portal &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STAGE 2: DUAL-SECTION LOGIN (OPERATOR vs USER) WITH INSTANT SWITCHER
             ========================================================================= */
          <div className="w-full max-w-xl rounded-2xl bg-bg-surface/95 border border-border shadow-2xl backdrop-blur-xl overflow-hidden tech-card animate-fade-in">
            {/* Top Section Switcher Header */}
            <div className="p-6 pb-4 border-b border-border/80 bg-gradient-to-b from-bg-elevated/60 to-transparent space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-nexus-cyan font-bold">
                  Authentication Gateway
                </span>
                <h2 className="text-xl font-bold text-tx-primary font-mono tracking-wide">
                  {activeRole === "OPERATOR"
                    ? "CENTRAL DISPATCH & FLEET COMMAND"
                    : "PUBLIC TRANSIT & COMMUTER PORTAL"}
                </h2>
                <p className="text-xs text-tx-secondary">
                  {activeRole === "OPERATOR"
                    ? "Control room access for telemetry dispatch, emergency triage & corridor security."
                    : "Citizen access for live bus tracking, route schedules, smart passes & alerts."}
                </p>
              </div>

              {/* Master Role Switcher Button / Segmented Control */}
              <div className="p-1 rounded-xl bg-bg-elevated border border-border flex items-center gap-1 font-mono text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("OPERATOR");
                    switchRole("OPERATOR");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeRole === "OPERATOR"
                      ? "bg-nexus-cyan text-black shadow-glow"
                      : "text-tx-secondary hover:text-tx-primary hover:bg-bg-hover"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>OPERATOR SECTION</span>
                  {activeRole === "OPERATOR" && (
                    <span className="w-2 h-2 rounded-full bg-black/60" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRole("USER");
                    switchRole("USER");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeRole === "USER"
                      ? "bg-nexus-safe text-black shadow-glow-safe"
                      : "text-tx-secondary hover:text-tx-primary hover:bg-bg-hover"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>USER / COMMUTER</span>
                  {activeRole === "USER" && (
                    <span className="w-2 h-2 rounded-full bg-black/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleLoginSubmit} className="p-6 md:p-8 space-y-5">
              {activeRole === "OPERATOR" ? (
                /* =======================================================
                   OPERATOR FORM FIELDS
                   ======================================================= */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-tx-muted uppercase font-bold flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-nexus-cyan" />
                      Dispatcher Credentials
                    </span>
                    <span className="text-[10px] text-nexus-cyan">ROLE: OPERATOR</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Operator ID / Dispatch Badge
                      </label>
                      <div className="relative">
                        <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="text"
                          required
                          value={operatorId}
                          onChange={(e) => setOperatorId(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-cyan"
                          placeholder="e.g. KCTSL-DISPATCH-4902"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Operator Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="text"
                          required
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-sans focus:outline-none focus:border-nexus-cyan"
                          placeholder="e.g. Neha Sharma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Command Post / Control Station
                      </label>
                      <select
                        value={operatorStation}
                        onChange={(e) => setOperatorStation(e.target.value)}
                        className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-cyan text-xs"
                      >
                        <option value="Kanpur Central Command Hub (Zone 1)">
                          Kanpur Central Command Hub (Zone 1)
                        </option>
                        <option value="Rawatpur Metro Transit Control (Zone 2)">
                          Rawatpur Metro Transit Control (Zone 2)
                        </option>
                        <option value="Chakeri Fleet HQ & Depot (Zone 3)">
                          Chakeri Fleet HQ &amp; Depot (Zone 3)
                        </option>
                        <option value="Kalyanpur West Terminal Dispatch">
                          Kalyanpur West Terminal Dispatch
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Security Clearance PIN
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="password"
                          value={operatorPin}
                          onChange={(e) => setOperatorPin(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-cyan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Demo Profiles */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-tx-muted block mb-1.5 uppercase font-semibold">
                      One-Click Demo Operators:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemoOperator("NEHA")}
                        className="flex-1 py-1 px-2 rounded bg-bg-elevated border border-border hover:border-nexus-cyan text-[11px] font-mono text-tx-secondary hover:text-nexus-cyan transition-colors"
                      >
                        Op. Neha Sharma (Lead)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoOperator("ARJUN")}
                        className="flex-1 py-1 px-2 rounded bg-bg-elevated border border-border hover:border-nexus-cyan text-[11px] font-mono text-tx-secondary hover:text-nexus-cyan transition-colors"
                      >
                        Supervisor Arjun Dixit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* =======================================================
                   USER / COMMUTER FORM FIELDS
                   ======================================================= */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-tx-muted uppercase font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-nexus-safe" />
                      Passenger Pass Credentials
                    </span>
                    <span className="text-[10px] text-nexus-safe">ROLE: CITIZEN / USER</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Registered Mobile / Citizen Number
                      </label>
                      <div className="relative">
                        <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="text"
                          required
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-safe"
                          placeholder="+91 98390 12345"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Commuter Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-sans focus:outline-none focus:border-nexus-safe"
                          placeholder="e.g. Aditya Verma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        Daily Commuter Corridor
                      </label>
                      <select
                        value={userCorridor}
                        onChange={(e) => setUserCorridor(e.target.value)}
                        className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-safe text-xs"
                      >
                        <option value="KE-1: Sanjeev Nagar ↔ IIT Kanpur">
                          KE-1: Sanjeev Nagar ↔ IIT Kanpur (23 km)
                        </option>
                        <option value="KE-4: Sanjeev Nagar ↔ Bithoor">
                          KE-4: Sanjeev Nagar ↔ Bithoor (28 km)
                        </option>
                        <option value="RT-7: Barra ↔ Jarauli">
                          RT-7: Barra ↔ Jarauli (12 km)
                        </option>
                        <option value="AC-AP: IIT Gate ↔ Kanpur Airport">
                          AC-AP: IIT Gate ↔ Kanpur Airport (21 km)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-tx-secondary mb-1 font-mono font-medium">
                        One-Time Passcode (OTP)
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                        <input
                          type="text"
                          value={userOtp}
                          onChange={(e) => setUserOtp(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-3 py-2 text-tx-primary font-mono focus:outline-none focus:border-nexus-safe tracking-widest"
                          placeholder="7821"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Demo Profiles */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-tx-muted block mb-1.5 uppercase font-semibold">
                      One-Click Demo Commuters:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCommuter("ADITYA")}
                        className="flex-1 py-1 px-2 rounded bg-bg-elevated border border-border hover:border-nexus-safe text-[11px] font-mono text-tx-secondary hover:text-nexus-safe transition-colors"
                      >
                        Aditya (IIT Daily Pass)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCommuter("PRIYA")}
                        className="flex-1 py-1 px-2 rounded bg-bg-elevated border border-border hover:border-nexus-safe text-[11px] font-mono text-tx-secondary hover:text-nexus-safe transition-colors"
                      >
                        Priya (Bithoor Line)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notice / Feedback Message */}
              {authNotice && (
                <div className="p-2.5 rounded-lg bg-bg-elevated border border-nexus-cyan/40 text-xs font-mono text-nexus-cyan flex items-center gap-2 animate-pulse">
                  <Activity className="w-4 h-4 animate-spin shrink-0" />
                  <span>{authNotice}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                  activeRole === "OPERATOR"
                    ? "bg-nexus-cyan hover:bg-nexus-cyan/90 text-black shadow-glow"
                    : "bg-nexus-safe hover:bg-nexus-safe/90 text-black shadow-glow-safe"
                } ${isSubmitting ? "opacity-75 cursor-wait" : ""}`}
              >
                <span>
                  {activeRole === "OPERATOR"
                    ? "ENTER OPERATIONS & DISPATCH CONSOLE"
                    : "ACCESS COMMUTER TRANSIT PORTAL"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Switch Helper */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = activeRole === "OPERATOR" ? "USER" : "OPERATOR";
                    setActiveRole(next);
                    switchRole(next);
                  }}
                  className="text-xs font-mono text-tx-muted hover:text-tx-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Need to switch?</span>
                  <span className="text-nexus-cyan underline font-semibold">
                    Switch to {activeRole === "OPERATOR" ? "User / Commuter Section" : "Operator Section"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 border-t border-border/50 text-[11px] font-mono text-tx-muted flex flex-col sm:flex-row items-center justify-between gap-2 px-6">
        <div>
          Kanpur City Transport Services Ltd. (KCTSL) &bull; Intelligent Transport Management System
        </div>
        <div className="flex items-center gap-4">
          <span className="text-nexus-cyan">AIS-140 COMPLIANT</span>
          <span>&bull;</span>
          <span>CHALO PARTNER NETWORK</span>
        </div>
      </footer>
    </div>
  );
}

