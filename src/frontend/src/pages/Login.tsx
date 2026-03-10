import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Shield, Stethoscope, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetDoctor, useRegisterDoctor } from "../hooks/useQueries";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    clear,
    isLoggingIn,
    isLoginSuccess,
    identity,
    isInitializing,
  } = useInternetIdentity();
  const { data: doctor, isLoading: isDoctorLoading } = useGetDoctor();
  const registerMutation = useRegisterDoctor();

  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [clinic, setClinic] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (identity && !isDoctorLoading) {
      if (doctor) {
        navigate({ to: "/dashboard" });
      } else if (isLoginSuccess) {
        setShowRegister(true);
      }
    }
  }, [identity, doctor, isDoctorLoading, isLoginSuccess, navigate]);

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !clinic.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await registerMutation.mutateAsync({ name, clinic, email });
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    }
  };

  const handleLogout = () => {
    clear();
    setShowRegister(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated background orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.14 176 / 1) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{
          duration: 11,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.18 196 / 1) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.8 0.13 75 / 1) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo area */}
        <div className="text-center mb-10">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px oklch(0.72 0.14 176 / 0.3)",
                "0 0 40px oklch(0.72 0.14 176 / 0.6)",
                "0 0 20px oklch(0.72 0.14 176 / 0.3)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-5"
          >
            <Stethoscope className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-5xl font-bold text-gradient-teal tracking-tight">
            GI-ASSIST
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            Clinical Decision Support System
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Based on Sleisenger &amp; Fordtran&apos;s 10th Edition
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-elevated overflow-hidden">
          {/* Card top accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <div className="p-8">
            {!showRegister ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Doctor Login</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Secure access for registered gastroenterologists
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-xl p-4 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="leading-relaxed">
                    Passwordless login via Internet Identity — your credentials
                    stay completely private.
                  </span>
                </div>

                <Button
                  data-ocid="login.primary_button"
                  onClick={login}
                  disabled={isLoggingIn || isInitializing}
                  className="w-full h-12 rounded-xl font-semibold text-base gap-2.5 btn-gradient"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>

                {isDoctorLoading && identity && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying credentials...
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Create Profile</h2>
                    <p className="text-muted-foreground text-sm">
                      Set up your doctor account
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="mb-5"
                    data-ocid="login.error_state"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      data-ocid="login.input"
                      placeholder="Dr. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clinic" className="text-sm font-medium">
                      Clinic / Hospital
                    </Label>
                    <Input
                      id="clinic"
                      data-ocid="login.input"
                      placeholder="Apollo Gastro Clinic, Mumbai"
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      className="h-11 bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      data-ocid="login.input"
                      type="email"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <Button
                    data-ocid="login.submit_button"
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                    className="w-full h-12 rounded-xl font-semibold text-base gap-2 btn-gradient"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      "Create Doctor Profile"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-muted-foreground hover:text-foreground rounded-xl h-10"
                  >
                    ← Back to login
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
