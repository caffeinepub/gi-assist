import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FlaskConical,
  Loader2,
  Printer,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import {
  type ClinicalReport as ClinicalReportType,
  analyzeSession,
} from "../clinicalEngine";
import { useGetPatientSession } from "../hooks/useQueries";
import { QUESTION_MAP } from "../questions";

function ConfidenceBar({ confidence }: { confidence: string }) {
  const pct = confidence === "High" ? 85 : confidence === "Moderate" ? 55 : 25;
  const color =
    confidence === "High"
      ? "bg-destructive"
      : confidence === "Moderate"
        ? "bg-warning"
        : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          confidence === "High"
            ? "bg-destructive/12 text-destructive"
            : confidence === "Moderate"
              ? "bg-warning/12 text-warning"
              : "bg-muted/50 text-muted-foreground"
        }`}
      >
        {confidence}
      </span>
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: string }) {
  if (classification === "Organic") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/25">
        <XCircle className="w-4 h-4" />
        Organic
      </span>
    );
  }
  if (classification === "Functional") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-success/10 text-success border border-success/25">
        <CheckCircle2 className="w-4 h-4" />
        Functional
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-warning/10 text-warning border border-warning/25">
      <AlertTriangle className="w-4 h-4" />
      Indeterminate
    </span>
  );
}

export default function ClinicalReportPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { sessionId?: string };
  const sessionId = search.sessionId ? BigInt(search.sessionId) : undefined;
  const mainRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const { data: session, isLoading, isError } = useGetPatientSession(sessionId);

  const report: ClinicalReportType | null = useMemo(() => {
    if (!session) return null;
    return analyzeSession(session.answers);
  }, [session]);

  const handleBack = () => navigate({ to: "/dashboard" });
  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    const style = document.createElement("style");
    style.id = "gi-pdf-print-style";
    style.textContent = `
      @media print {
        body { background: #060812 !important; color: #eaecf5 !important;
               -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        header, footer, .no-print { display: none !important; }
        .print-section { break-inside: avoid; }
        @page { size: A4; margin: 12mm; }
      }
    `;
    document.head.appendChild(style);
    setTimeout(() => {
      window.print();
      const el = document.getElementById("gi-pdf-print-style");
      if (el) document.head.removeChild(el);
      setIsExportingPDF(false);
    }, 150);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No session ID provided.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-section { break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-20 no-print">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              data-ocid="report.back_button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-bold text-base text-gradient-teal">
                Clinical Report
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* More prominent Doctor Confidential badge — amber with dark text */}
            <Badge
              className="text-xs uppercase tracking-wider px-3 py-1 font-bold"
              style={{
                background: "oklch(0.78 0.14 65 / 0.90)",
                color: "oklch(0.10 0.015 240)",
                borderColor: "oklch(0.78 0.14 65 / 0.40)",
                border: "1px solid",
              }}
            >
              &#128274; Doctor Confidential
            </Badge>
            <Button
              data-ocid="report.export_pdf_button"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF || isLoading || !report}
              className="gap-2 btn-gradient rounded-xl h-9 px-4 text-xs font-bold"
            >
              {isExportingPDF ? (
                <>
                  <Loader2
                    data-ocid="report.pdf_loading_state"
                    className="w-3.5 h-3.5 animate-spin"
                  />
                  Preparing...
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  Export PDF
                </>
              )}
            </Button>
            <Button
              data-ocid="report.print_button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 border-border/50 rounded-xl hover:border-primary/30 h-9"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5"
      >
        {isLoading && (
          <div data-ocid="report.loading_state" className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div
            data-ocid="report.error_state"
            className="text-center py-20 text-muted-foreground"
          >
            <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="font-semibold text-base">Session not found</p>
            <p className="text-sm mt-2">
              This session may have been removed or the ID is invalid.
            </p>
          </div>
        )}

        {!isLoading && !isError && report && (
          <>
            {/* Red Flag Banner — left border accent, richer destructive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              data-ocid="report.red_flags_panel"
              className="print-section"
            >
              {report.redFlags.length > 0 ? (
                <div className="rounded-2xl border border-destructive/35 bg-destructive/7 overflow-hidden border-l-4 border-l-destructive/70">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-destructive text-lg">
                          Alarm Features Detected
                        </h3>
                        <p className="text-xs text-destructive/65 mt-0.5">
                          {report.redFlags.length} alarm feature
                          {report.redFlags.length !== 1 ? "s" : ""} require
                          immediate clinical attention
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {report.redFlags.map((flag, idx) => (
                        <motion.div
                          key={flag.label}
                          initial={{ opacity: 0, x: -16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${
                            flag.severity === "critical"
                              ? "bg-destructive/10 border-destructive/30"
                              : "bg-warning/8 border-warning/25"
                          }`}
                        >
                          <AlertTriangle
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              flag.severity === "critical"
                                ? "text-destructive"
                                : "text-warning"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`text-sm font-semibold ${
                                  flag.severity === "critical"
                                    ? "text-destructive"
                                    : "text-warning"
                                }`}
                              >
                                {flag.label}
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                  flag.severity === "critical"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {flag.severity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {flag.rationale}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-success/30 bg-success/6 p-5 flex items-center gap-4 border-l-4 border-l-success/50">
                  <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-success">
                      No Alarm Features Detected
                    </p>
                    <p className="text-xs text-success/65 mt-0.5">
                      No red flag symptoms identified in this session
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Classification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.07 }}
              data-ocid="report.classification_card"
              className="print-section"
            >
              <Card className="border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-glow-teal transition-all duration-300">
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2.5 font-display text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ClassificationBadge classification={report.classification} />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {report.classificationRationale}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Differentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-ocid="report.differentials_table"
              className="print-section"
            >
              <Card className="border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-glow-teal transition-all duration-300">
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2.5 font-display text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                    Differential Diagnoses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {report.differentials.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground px-6">
                      <p className="text-sm">
                        Insufficient data to generate differentials.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {report.differentials.map((diff, idx) => (
                        <motion.div
                          key={diff.condition}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.07, duration: 0.4 }}
                          className="px-6 py-4 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-sm">
                                  {diff.condition}
                                  {diff.icdHint && (
                                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                                      ({diff.icdHint})
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {diff.rationale}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pl-9">
                            <ConfidenceBar confidence={diff.confidence} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Investigations — numbered badges instead of dot bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-ocid="report.investigations_panel"
              className="print-section"
            >
              <Card className="border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-glow-teal transition-all duration-300">
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2.5 font-display text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    Suggested Investigations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.suggestedInvestigations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No investigations suggested based on current answers.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.suggestedInvestigations.map((inv, idx) => (
                        <motion.div
                          key={inv}
                          initial={{ opacity: 0, scale: 0.97 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.04, duration: 0.35 }}
                          className="flex items-center gap-3 text-sm px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/12"
                        >
                          {/* Numbered badge instead of dot */}
                          <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm">{inv}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Patient Answers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-ocid="report.answers_panel"
              className="print-section"
            >
              <Card className="border-border/40 rounded-2xl overflow-hidden hover:border-border/50 transition-all duration-300">
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-base">
                    Patient Answers Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {session?.answers.map(([qid, answer]) => {
                      const question = QUESTION_MAP.get(qid);
                      return (
                        <div
                          key={String(qid)}
                          className="flex items-start justify-between gap-4 py-2.5 border-b border-border/20 last:border-0"
                        >
                          <span className="text-sm text-muted-foreground flex-1 leading-relaxed">
                            {question?.en ?? `Question ${String(qid)}`}
                          </span>
                          <span className="text-sm font-semibold capitalize flex-shrink-0 text-foreground/80">
                            {answer}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>

      <footer className="text-center text-xs text-muted-foreground/40 py-8 no-print">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/50 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
