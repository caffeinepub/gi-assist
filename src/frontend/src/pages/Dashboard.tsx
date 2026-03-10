import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Link2,
  LogOut,
  MapPin,
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { PatientSession } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetDoctor, useGetSessionsByDoctor } from "../hooks/useQueries";
import { DEMO_Q } from "./Questionnaire";

const LANG_LABEL: Record<string, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
};

function formatDate(timestamp?: bigint) {
  if (!timestamp) return "—";
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDemo(session: PatientSession, key: bigint): string {
  const entry = session.answers.find(([qId]) => qId === key);
  return entry?.[1] ?? "—";
}

function SessionRow({
  session,
  index,
}: { session: PatientSession; index: number }) {
  const navigate = useNavigate();
  const isComplete = session.completedAt !== undefined;
  const ocid = `dashboard.session.item.${index}` as const;

  const ptName = getDemo(session, DEMO_Q.name);
  const ptAge = getDemo(session, DEMO_Q.age);
  const ptGender = getDemo(session, DEMO_Q.gender);
  const ptAddr = getDemo(session, DEMO_Q.address);
  const ptOcc = getDemo(session, DEMO_Q.occupation);

  const hasDemo = ptName !== "—";
  const initials = hasDemo
    ? ptName
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : `#${String(session.id)}`;

  const handleViewReport = () => {
    if (!isComplete) return;
    navigate({ to: "/report", search: { sessionId: String(session.id) } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-ocid={ocid}
      onClick={handleViewReport}
      className={`relative group rounded-xl border transition-all duration-200 overflow-hidden ${
        isComplete
          ? "border-border/40 hover:border-primary/40 hover:shadow-card cursor-pointer bg-card/60 hover:bg-card/80"
          : "border-border/30 cursor-default bg-card/40"
      }`}
    >
      {/* Left status bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
          isComplete ? "bg-primary" : "bg-warning"
        }`}
      />

      <div className="pl-5 pr-4 py-4 flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
            isComplete
              ? "bg-primary/15 text-primary border border-primary/25"
              : "bg-warning/10 text-warning border border-warning/20"
          }`}
        >
          {initials}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {hasDemo ? (
            <>
              <p className="font-semibold text-sm truncate">{ptName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ptAge} yrs &middot; {ptGender}
                {ptOcc !== "—" && <> &middot; {ptOcc}</>}
              </p>
              {ptAddr !== "—" && (
                <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{ptAddr}</span>
                </p>
              )}
            </>
          ) : (
            <p className="font-medium text-sm">Session #{String(session.id)}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-1">
            {LANG_LABEL[session.language] ?? session.language} &middot;{" "}
            {formatDate(session.completedAt)}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isComplete
                ? "bg-primary/12 text-primary border border-primary/20"
                : "bg-warning/12 text-warning border border-warning/20"
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {isComplete ? "Completed" : "In Progress"}
          </span>
          {isComplete && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity, clear, isLoginSuccess, isLoginIdle } =
    useInternetIdentity();
  const { data: doctor, isLoading: isDoctorLoading } = useGetDoctor();
  const { data: sessions, isLoading: isSessionsLoading } =
    useGetSessionsByDoctor();

  useEffect(() => {
    if ((isLoginIdle || isLoginSuccess) && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isLoginIdle, isLoginSuccess, navigate]);

  const handleCopyLink = () => {
    if (!identity) return;
    const principal = identity.getPrincipal().toString();
    const link = `${window.location.origin}/questionnaire?doctorId=${principal}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Patient link copied!", {
        description:
          "Share this link with your patient to start the questionnaire.",
      });
    });
  };

  const handleLogout = () => {
    clear();
    navigate({ to: "/login" });
  };

  const completedCount =
    sessions?.filter((s) => s.completedAt !== undefined).length ?? 0;
  const totalCount = sessions?.length ?? 0;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-20">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-gradient-teal leading-none block">
                GI-ASSIST
              </span>
              {!isDoctorLoading && doctor && (
                <span className="text-xs text-muted-foreground leading-none">
                  {doctor.clinic}
                </span>
              )}
            </div>
          </div>
          <Button
            data-ocid="dashboard.logout_button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative rounded-2xl border border-border/40 bg-card/70 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                {isDoctorLoading ? (
                  <>
                    <Skeleton className="h-8 w-56 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      Welcome back,{" "}
                      <span className="text-gradient-teal">
                        {doctor?.name ?? "Doctor"}
                      </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {doctor?.clinic ?? ""}
                    </p>
                  </>
                )}
              </div>
              <Button
                data-ocid="dashboard.copy_link_button"
                onClick={handleCopyLink}
                className="btn-gradient gap-2.5 px-6 h-11 rounded-xl font-semibold shrink-0"
              >
                <Link2 className="w-4 h-4" />
                Copy Patient Link
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {/* Total */}
          <Card className="border-border/40 bg-card/60 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </p>
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              {isSessionsLoading ? (
                <Skeleton className="h-9 w-14" />
              ) : (
                <p className="text-3xl font-bold">{totalCount}</p>
              )}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-primary/20 bg-primary/5 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                  Done
                </p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              </div>
              {isSessionsLoading ? (
                <Skeleton className="h-9 w-14" />
              ) : (
                <p className="text-3xl font-bold text-primary">
                  {completedCount}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="border-warning/20 bg-warning/5 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-warning/70 uppercase tracking-wider">
                  Active
                </p>
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-warning" />
                </div>
              </div>
              {isSessionsLoading ? (
                <Skeleton className="h-9 w-14" />
              ) : (
                <p className="text-3xl font-bold text-warning">
                  {pendingCount}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          <Card className="border-border/40 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Patient Sessions</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click a completed session to view the clinical report
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isSessionsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.session_list">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-2.5" data-ocid="dashboard.session_list">
                  {sessions.map((session, i) => (
                    <SessionRow
                      key={String(session.id)}
                      session={session}
                      index={i + 1}
                    />
                  ))}
                </div>
              ) : (
                <div data-ocid="dashboard.session_list" className="py-16">
                  <div
                    data-ocid="dashboard.session.empty_state"
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="font-semibold text-foreground/70">
                      No sessions yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Copy your patient link and share it to start collecting
                      questionnaire responses.
                    </p>
                    <Button
                      onClick={handleCopyLink}
                      className="mt-5 btn-gradient gap-2 h-10 px-5 rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="text-center text-xs text-muted-foreground/50 py-8">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/60 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
