import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Principal as PrincipalClass } from "@dfinity/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Stethoscope,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  useAnswerQuestion,
  useCompleteSession,
  useCreatePatientSession,
} from "../hooks/useQueries";
import { QUESTIONS, QUESTION_MAP, SCALE_NEXT } from "../questions";

export const DEMO_Q = {
  name: 900n,
  age: 901n,
  gender: 902n,
  address: 903n,
  occupation: 904n,
} as const;

type Language = "en" | "hi" | "mr";

const LANGUAGES = [
  { code: "en" as Language, label: "English", native: "English" },
  { code: "hi" as Language, label: "Hindi", native: "हिंदी" },
  { code: "mr" as Language, label: "Marathi", native: "मराठी" },
];

const UI: Record<
  Language,
  {
    title: string;
    subtitle: string;
    selectLang: string;
    startBtn: string;
    yes: string;
    no: string;
    next: string;
    progress: string;
    thankYou: string;
    thankYouMsg: string;
    errorMsg: string;
    loading: string;
    demoTitle: string;
    demoSubtitle: string;
    demoBtn: string;
    nameLabel: string;
    namePh: string;
    ageLabel: string;
    agePh: string;
    genderLabel: string;
    addressLabel: string;
    addressPh: string;
    occLabel: string;
    occPh: string;
    male: string;
    female: string;
    other: string;
  }
> = {
  en: {
    title: "GI-ASSIST",
    subtitle: "Gastroenterology Symptom Questionnaire",
    selectLang: "Select your language",
    startBtn: "Begin Questionnaire",
    yes: "Yes",
    no: "No",
    next: "Next",
    progress: "Question",
    thankYou: "Thank You!",
    thankYouMsg:
      "Your responses have been submitted. Your doctor will review your answers shortly.",
    errorMsg: "Something went wrong. Please try again.",
    loading: "Loading...",
    demoTitle: "Patient Details",
    demoSubtitle:
      "Please fill in your details before starting the questionnaire.",
    demoBtn: "Continue to Questionnaire",
    nameLabel: "Full Name",
    namePh: "Enter your full name",
    ageLabel: "Age",
    agePh: "Enter your age",
    genderLabel: "Gender",
    addressLabel: "Address / City",
    addressPh: "Enter your address or city",
    occLabel: "Occupation",
    occPh: "Enter your occupation",
    male: "Male",
    female: "Female",
    other: "Other",
  },
  hi: {
    title: "GI-ASSIST",
    subtitle: "जठरांत्र लक्षण प्रश्नावली",
    selectLang: "अपनी भाषा चुनें",
    startBtn: "प्रश्नावली शुरू करें",
    yes: "हाँ",
    no: "नहीं",
    next: "अगला",
    progress: "प्रश्न",
    thankYou: "धन्यवाद!",
    thankYouMsg:
      "आपके उत्तर सबमिट हो गए हैं। आपके डॉक्टर जल्द ही उत्तरों की समीक्षा करेंगे।",
    errorMsg: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
    loading: "लोड हो रहा है...",
    demoTitle: "रोगी की जानकारी",
    demoSubtitle: "प्रश्नावली शुरू करने से पहले कृपया अपनी जानकारी भरें।",
    demoBtn: "प्रश्नावली की ओर जारी रखें",
    nameLabel: "पूरा नाम",
    namePh: "अपना पूरा नाम दर्ज करें",
    ageLabel: "आयु",
    agePh: "अपनी आयु दर्ज करें",
    genderLabel: "लिंग",
    addressLabel: "पता / शहर",
    addressPh: "अपना पता या शहर दर्ज करें",
    occLabel: "व्यवसाय",
    occPh: "अपना व्यवसाय दर्ज करें",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
  },
  mr: {
    title: "GI-ASSIST",
    subtitle: "जठरांत्र लक्षण प्रश्नावली",
    selectLang: "तुमची भाषा निवडा",
    startBtn: "प्रश्नावली सुरू करा",
    yes: "होय",
    no: "नाही",
    next: "पुढे",
    progress: "प्रश्न",
    thankYou: "धन्यवाद!",
    thankYouMsg:
      "तुमचे उत्तर सबमिट केले गेले आहेत. तुमचे डॉक्टर लवकरच तुमच्या उत्तरांचे पुनरावलोकन करतील.",
    errorMsg: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    loading: "लोड होत आहे...",
    demoTitle: "रुग्णाची माहिती",
    demoSubtitle: "प्रश्नावली सुरू करण्यापूर्वी कृपया तुमची माहिती भरा.",
    demoBtn: "प्रश्नावली पुढे चालू ठेवा",
    nameLabel: "पूर्ण नाव",
    namePh: "तुमचे पूर्ण नाव टाका",
    ageLabel: "वय",
    agePh: "तुमचे वय टाका",
    genderLabel: "लिंग",
    addressLabel: "पत्ता / शहर",
    addressPh: "तुमचा पत्ता किंवा शहर टाका",
    occLabel: "व्यवसाय",
    occPh: "तुमचा व्यवसाय टाका",
    male: "पुरुष",
    female: "स्त्री",
    other: "इतर",
  },
};

type Phase = "language" | "demographics" | "questions" | "complete";

interface Demographics {
  name: string;
  age: string;
  gender: string;
  address: string;
  occupation: string;
}

export default function QuestionnairePage() {
  const search = useSearch({ strict: false }) as { doctorId?: string };
  const doctorId = search.doctorId;

  const { actor, isFetching: isActorFetching } = useActor();
  const createSession = useCreatePatientSession();
  const answerQuestion = useAnswerQuestion();
  const completeSession = useCompleteSession();

  const [phase, setPhase] = useState<Phase>("language");
  const [language, setLanguage] = useState<Language>("en");
  const [demo, setDemo] = useState<Demographics>({
    name: "",
    age: "",
    gender: "Male",
    address: "",
    occupation: "",
  });
  const [demoError, setDemoError] = useState("");
  const [sessionId, setSessionId] = useState<bigint | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<bigint>(1n);
  const [answeredIds, setAnsweredIds] = useState<bigint[]>([]);
  const [scaleValue, setScaleValue] = useState<number>(5);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ui = UI[language];
  const currentQuestion = QUESTION_MAP.get(currentQuestionId);
  const progressPct = Math.round((answeredIds.length / QUESTIONS.length) * 100);

  const handleLanguageNext = () => {
    setPhase("demographics");
  };

  const handleDemoSubmit = async () => {
    if (!demo.name.trim()) {
      setDemoError("Please enter your name.");
      return;
    }
    if (
      !demo.age.trim() ||
      Number.isNaN(Number(demo.age)) ||
      Number(demo.age) < 1 ||
      Number(demo.age) > 120
    ) {
      setDemoError("Please enter a valid age (1–120).");
      return;
    }
    if (!doctorId || !actor) {
      setDemoError(
        "Invalid link. Please ask your doctor for a valid questionnaire link.",
      );
      return;
    }
    setDemoError("");
    setIsSubmitting(true);
    try {
      let principal: Principal;
      try {
        principal = PrincipalClass.fromText(doctorId) as unknown as Principal;
      } catch {
        setDemoError("Invalid doctor ID in link.");
        setIsSubmitting(false);
        return;
      }

      const id = await createSession.mutateAsync({
        doctorId: principal,
        language,
      });
      setSessionId(id);

      await answerQuestion.mutateAsync({
        sessionId: id,
        questionId: DEMO_Q.name,
        answer: demo.name.trim(),
      });
      await answerQuestion.mutateAsync({
        sessionId: id,
        questionId: DEMO_Q.age,
        answer: demo.age.trim(),
      });
      await answerQuestion.mutateAsync({
        sessionId: id,
        questionId: DEMO_Q.gender,
        answer: demo.gender,
      });
      await answerQuestion.mutateAsync({
        sessionId: id,
        questionId: DEMO_Q.address,
        answer: demo.address.trim() || "—",
      });
      await answerQuestion.mutateAsync({
        sessionId: id,
        questionId: DEMO_Q.occupation,
        answer: demo.occupation.trim() || "—",
      });

      setCurrentQuestionId(1n);
      setAnsweredIds([]);
      setPhase("questions");
    } catch (e) {
      setDemoError(e instanceof Error ? e.message : ui.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!sessionId || !currentQuestion) return;
    setIsSubmitting(true);
    setError("");
    try {
      await answerQuestion.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        answer,
      });
      setAnsweredIds((prev) => [...prev, currentQuestion.id]);

      let nextId: bigint | undefined;
      if (currentQuestion.type === "scale") {
        nextId = SCALE_NEXT[String(currentQuestion.id)];
      } else {
        nextId = currentQuestion.nextMap?.[answer];
      }

      if (nextId !== undefined) {
        setCurrentQuestionId(nextId);
        setScaleValue(5);
      } else {
        await completeSession.mutateAsync({ sessionId });
        setPhase("complete");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScaleSubmit = async () => {
    await submitAnswer(String(scaleValue));
  };

  if (!doctorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Invalid Link</p>
          <p className="text-muted-foreground mt-2 text-sm">
            This link is missing a doctor ID. Please ask your doctor for a valid
            questionnaire link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background orbs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none opacity-5"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.14 176) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.8 0.13 75) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border/40 py-4 px-4 bg-card/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-gradient-teal leading-none">
              {ui.title}
            </h1>
            <p className="text-xs text-muted-foreground">{ui.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* ── Language ── */}
            {phase === "language" && (
              <motion.div
                key="language"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-elevated overflow-hidden">
                  <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-2">
                      {ui.selectLang}
                    </h2>
                    <p className="text-muted-foreground text-sm text-center mb-8">
                      Choose your preferred language to continue
                    </p>

                    <div
                      className="grid grid-cols-3 gap-4 mb-8"
                      data-ocid="questionnaire.language_select"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          type="button"
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`relative p-5 rounded-xl border-2 text-center transition-all duration-200 ${
                            language === lang.code
                              ? "border-primary bg-primary/10 shadow-glow-teal"
                              : "border-border/40 hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          {language === lang.code && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                          )}
                          <p
                            className={`text-2xl font-bold mb-1 ${
                              language === lang.code ? "text-primary" : ""
                            }`}
                          >
                            {lang.native}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lang.label}
                          </p>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleLanguageNext}
                      disabled={isActorFetching}
                      className="w-full h-12 rounded-xl btn-gradient font-semibold text-base gap-2.5"
                      data-ocid="questionnaire.primary_button"
                    >
                      {isActorFetching ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          {ui.loading}
                        </>
                      ) : (
                        <>
                          {ui.startBtn} <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Demographics ── */}
            {phase === "demographics" && (
              <motion.div
                key="demographics"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-elevated overflow-hidden"
                  data-ocid="questionnaire.demographics_card"
                >
                  <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{ui.demoTitle}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {ui.demoSubtitle}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label
                          htmlFor="pt-name"
                          className="text-sm font-medium"
                        >
                          {ui.nameLabel}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pt-name"
                          data-ocid="questionnaire.name.input"
                          placeholder={ui.namePh}
                          value={demo.name}
                          onChange={(e) =>
                            setDemo((d) => ({ ...d, name: e.target.value }))
                          }
                          className="h-11 bg-input/50 border-border/60 focus:border-primary/60 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="pt-age" className="text-sm font-medium">
                          {ui.ageLabel}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pt-age"
                          data-ocid="questionnaire.age.input"
                          type="number"
                          min={1}
                          max={120}
                          placeholder={ui.agePh}
                          value={demo.age}
                          onChange={(e) =>
                            setDemo((d) => ({ ...d, age: e.target.value }))
                          }
                          className="h-11 bg-input/50 border-border/60 focus:border-primary/60 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          {ui.genderLabel}
                        </Label>
                        <div className="grid grid-cols-3 gap-2 h-11">
                          {(["Male", "Female", "Other"] as const).map((g) => (
                            <button
                              type="button"
                              key={g}
                              data-ocid={`questionnaire.gender.item.${g.toLowerCase()}`}
                              onClick={() =>
                                setDemo((d) => ({ ...d, gender: g }))
                              }
                              className={`h-11 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                                demo.gender === g
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/40 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {g === "Male"
                                ? ui.male
                                : g === "Female"
                                  ? ui.female
                                  : ui.other}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pt-addr"
                          className="text-sm font-medium"
                        >
                          {ui.addressLabel}
                        </Label>
                        <Input
                          id="pt-addr"
                          data-ocid="questionnaire.address.input"
                          placeholder={ui.addressPh}
                          value={demo.address}
                          onChange={(e) =>
                            setDemo((d) => ({ ...d, address: e.target.value }))
                          }
                          className="h-11 bg-input/50 border-border/60 focus:border-primary/60 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="pt-occ" className="text-sm font-medium">
                          {ui.occLabel}
                        </Label>
                        <Input
                          id="pt-occ"
                          data-ocid="questionnaire.occupation.input"
                          placeholder={ui.occPh}
                          value={demo.occupation}
                          onChange={(e) =>
                            setDemo((d) => ({
                              ...d,
                              occupation: e.target.value,
                            }))
                          }
                          className="h-11 bg-input/50 border-border/60 focus:border-primary/60 rounded-xl"
                        />
                      </div>
                    </div>

                    {demoError && (
                      <p
                        className="text-sm text-destructive mt-4 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-2.5"
                        data-ocid="questionnaire.error_state"
                      >
                        {demoError}
                      </p>
                    )}

                    <Button
                      onClick={handleDemoSubmit}
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl btn-gradient font-semibold gap-2.5 mt-6"
                      data-ocid="questionnaire.submit_button"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          {ui.loading}
                        </>
                      ) : (
                        <>
                          {ui.demoBtn} <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Questions ── */}
            {phase === "questions" && currentQuestion && (
              <motion.div
                key={`q-${String(currentQuestionId)}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-medium">
                      {ui.progress} {answeredIds.length + 1}
                    </span>
                    <span>{progressPct}% complete</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div
                  className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-elevated overflow-hidden"
                  data-ocid="questionnaire.question_card"
                >
                  <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <div className="p-8">
                    <h2 className="text-xl sm:text-2xl font-bold leading-relaxed mb-6">
                      {currentQuestion[language]}
                    </h2>

                    {error && (
                      <p
                        className="text-sm text-destructive mb-4 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-2.5"
                        data-ocid="questionnaire.error_state"
                      >
                        {error}
                      </p>
                    )}

                    {/* Yes/No */}
                    {currentQuestion.type === "yesno" && (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          data-ocid="questionnaire.yes_button"
                          onClick={() => submitAnswer("yes")}
                          disabled={isSubmitting}
                          className="h-16 rounded-xl border-2 border-primary/40 bg-primary/8 hover:bg-primary/15 hover:border-primary text-primary font-bold text-lg transition-all duration-150 disabled:opacity-50 flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            ui.yes
                          )}
                        </button>
                        <button
                          type="button"
                          data-ocid="questionnaire.no_button"
                          onClick={() => submitAnswer("no")}
                          disabled={isSubmitting}
                          className="h-16 rounded-xl border-2 border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-border font-bold text-lg transition-all duration-150 disabled:opacity-50 flex items-center justify-center"
                        >
                          {ui.no}
                        </button>
                      </div>
                    )}

                    {/* Choice */}
                    {currentQuestion.type === "choice" &&
                      currentQuestion.options && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((opt, idx) => (
                            <button
                              type="button"
                              key={opt.value}
                              data-ocid={`questionnaire.choice.item.${idx + 1}`}
                              onClick={() => submitAnswer(opt.value)}
                              disabled={isSubmitting}
                              className="w-full text-left px-5 py-4 rounded-xl border-2 border-border/40 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 font-medium text-base transition-all duration-150 disabled:opacity-50 group"
                            >
                              <span className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-md border-2 border-border/60 group-hover:border-primary/60 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  opt[language]
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                    {/* Scale */}
                    {currentQuestion.type === "scale" && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <span className="text-7xl font-bold text-gradient-teal">
                            {scaleValue}
                          </span>
                          <span className="text-muted-foreground text-xl">
                            {" "}
                            / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={scaleValue}
                          onChange={(e) =>
                            setScaleValue(Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="bg-muted/50 px-3 py-1 rounded-full">
                            1 — Mild
                          </span>
                          <span className="bg-muted/50 px-3 py-1 rounded-full">
                            10 — Severe
                          </span>
                        </div>
                        <Button
                          data-ocid="questionnaire.next_button"
                          onClick={handleScaleSubmit}
                          disabled={isSubmitting}
                          className="w-full h-12 rounded-xl btn-gradient font-semibold gap-2.5"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {ui.next} <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Complete ── */}
            {phase === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="rounded-2xl border border-primary/25 bg-card/80 backdrop-blur-md shadow-elevated text-center overflow-hidden"
                  data-ocid="questionnaire.complete_card"
                >
                  <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <div className="p-12">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-24 h-24 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center mx-auto mb-8 teal-glow"
                    >
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h2 className="font-display text-4xl font-bold text-gradient-teal mb-4">
                      {ui.thankYou}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto text-base">
                      {ui.thankYouMsg}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground/50 py-6">
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
