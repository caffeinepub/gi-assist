export interface RedFlag {
  label: string;
  severity: "critical" | "warning";
  rationale: string;
}

export interface Differential {
  condition: string;
  confidence: "High" | "Moderate" | "Low";
  rationale: string;
  icdHint?: string;
}

export type Classification = "Organic" | "Functional" | "Indeterminate";

export interface ClinicalReport {
  redFlags: RedFlag[];
  differentials: Differential[];
  classification: Classification;
  classificationRationale: string;
  suggestedInvestigations: string[];
}

function getAnswer(
  answers: [bigint, string][],
  id: bigint,
): string | undefined {
  const pair = answers.find(([qid]) => qid === id);
  return pair ? pair[1] : undefined;
}

const INVESTIGATIONS = {
  GERD: ["Upper GI Endoscopy (OGD)", "24-hour pH-metry"],
  Malignancy: ["Urgent OGD + Biopsy", "CT Chest/Abdomen", "Barium Swallow"],
  PUD: ["OGD + Helicobacter pylori testing", "Urea Breath Test"],
  IBD: [
    "Colonoscopy + Biopsy",
    "CRP, ESR, Faecal Calprotectin",
    "CT Enterography",
  ],
  Colorectal: ["Urgent Colonoscopy", "CEA tumour marker", "CT Colonography"],
  IBS: [
    "Rome IV criteria review",
    "Thyroid function tests",
    "Full blood count",
  ],
  FD: ["OGD to exclude organic cause", "H. pylori testing"],
} as const;

export function analyzeSession(answers: [bigint, string][]): ClinicalReport {
  const a = (id: bigint) => getAnswer(answers, id);

  const hasAbdPain = a(1n) === "yes";
  const hasDysphagia = a(2n) === "yes";
  const hasBlood = a(3n) === "yes";
  const painLocation = a(4n);
  const postPrandial = a(5n) === "yes";
  const painSeverityRaw = a(6n);
  const painSeverity = painSeverityRaw ? Number(painSeverityRaw) : 0;
  const hasHeartburn = a(7n) === "yes";
  const hasRegurgitation = a(8n) === "yes";
  const hasWeightLoss = a(9n) === "yes";
  const hasDiarrhea = a(10n) === "yes";
  const hasConstipation = a(11n) === "yes";
  const hasMucus = a(13n) === "yes";
  const hasBloating = a(14n) === "yes";
  const stressWorsens = a(15n) === "yes";

  // --- Red flags ---
  const redFlags: RedFlag[] = [];

  if (hasDysphagia) {
    redFlags.push({
      label: "Dysphagia",
      severity: "warning",
      rationale:
        "Difficulty swallowing may indicate oesophageal pathology requiring urgent evaluation.",
    });
  }
  if (hasBlood) {
    redFlags.push({
      label: "Rectal Bleeding",
      severity: "critical",
      rationale:
        "Blood in stool is an alarm feature requiring urgent investigation to exclude colorectal neoplasm or IBD.",
    });
  }
  if (hasWeightLoss) {
    redFlags.push({
      label: "Unintentional Weight Loss",
      severity: "warning",
      rationale:
        "Unexplained weight loss is a red flag for underlying malignancy or malabsorptive disease.",
    });
  }
  if (painSeverity >= 8 && hasAbdPain) {
    redFlags.push({
      label: "Severe Abdominal Pain",
      severity: "critical",
      rationale: `Patient reported pain severity of ${painSeverity}/10. Severe pain warrants prompt evaluation for acute surgical pathology.`,
    });
  }
  if (hasDysphagia && hasWeightLoss) {
    redFlags.push({
      label: "Dysphagia with Weight Loss \u2014 Suspect Malignancy",
      severity: "critical",
      rationale:
        "The combination of dysphagia and weight loss is highly suspicious for oesophageal or gastric malignancy per Sleisenger & Fordtran 10th Ed.",
    });
  }

  // --- Differentials ---
  const differentials: Differential[] = [];

  if (
    (hasHeartburn || hasRegurgitation || hasDysphagia) &&
    !(hasDysphagia && hasWeightLoss)
  ) {
    differentials.push({
      condition: "Gastro-oesophageal Reflux Disease (GERD)",
      confidence: hasHeartburn && hasRegurgitation ? "High" : "Moderate",
      rationale:
        "Classic symptoms of heartburn and/or regurgitation with or without dysphagia.",
      icdHint: "K21",
    });
  }

  if (hasDysphagia && hasWeightLoss) {
    differentials.push({
      condition: "Oesophageal / Gastric Malignancy",
      confidence: "High",
      rationale:
        "Progressive dysphagia combined with weight loss is a high-risk alarm combination for upper GI malignancy.",
      icdHint: "C15",
    });
  }

  if (painLocation === "upper" && postPrandial && !hasHeartburn) {
    differentials.push({
      condition: "Peptic Ulcer Disease / Gastritis",
      confidence: "Moderate",
      rationale:
        "Post-prandial upper abdominal pain without heartburn suggests gastric or duodenal ulcer disease.",
      icdHint: "K25-K29",
    });
  }

  if (hasBlood && (hasDiarrhea || hasConstipation)) {
    differentials.push({
      condition: "Inflammatory Bowel Disease (Crohn's / Ulcerative Colitis)",
      confidence: "High",
      rationale:
        "Rectal bleeding with altered bowel habit (diarrhea or constipation) is characteristic of IBD.",
      icdHint: "K50-K51",
    });
  }

  if (hasBlood) {
    differentials.push({
      condition: "Colorectal Neoplasm",
      confidence: "Moderate",
      rationale:
        "Any rectal bleeding warrants exclusion of colorectal carcinoma or polyp.",
      icdHint: "C18-C20",
    });
  }

  if (hasDiarrhea && hasMucus && !hasBlood) {
    differentials.push({
      condition: "Irritable Bowel Syndrome \u2014 Diarrhea-Predominant (IBS-D)",
      confidence: "Moderate",
      rationale:
        "Diarrhea with mucus in the absence of blood is consistent with IBS-D per Rome IV criteria.",
      icdHint: "K58.0",
    });
  }

  if (hasConstipation && hasMucus && !hasBlood) {
    differentials.push({
      condition:
        "Irritable Bowel Syndrome \u2014 Constipation-Predominant (IBS-C)",
      confidence: "Moderate",
      rationale:
        "Constipation with mucus passage in the absence of blood is consistent with IBS-C per Rome IV criteria.",
      icdHint: "K58.1",
    });
  }

  const hasBothFunctional = hasBloating && stressWorsens;
  if ((hasBloating || stressWorsens) && !hasBlood && !hasWeightLoss) {
    const noSpecificIBSPattern =
      !(hasDiarrhea && hasMucus) && !(hasConstipation && hasMucus);
    if (noSpecificIBSPattern) {
      differentials.push({
        condition: "Irritable Bowel Syndrome (Mixed / General)",
        confidence: hasBothFunctional ? "Moderate" : "Low",
        rationale:
          "Bloating and/or stress-exacerbated symptoms without organic features are consistent with functional bowel disorder.",
        icdHint: "K58",
      });
    }
  }

  if (
    painLocation === "upper" &&
    hasBloating &&
    stressWorsens &&
    !hasBlood &&
    !hasWeightLoss
  ) {
    differentials.push({
      condition: "Functional Dyspepsia",
      confidence: "Moderate",
      rationale:
        "Upper abdominal discomfort with bloating and stress-related worsening in the absence of alarm features meets Rome IV criteria for functional dyspepsia.",
      icdHint: "K30",
    });
  }

  // --- Classification ---
  const hasCriticalFlag = redFlags.some((f) => f.severity === "critical");
  let classification: Classification;
  let classificationRationale: string;

  if (hasCriticalFlag || hasBlood || hasWeightLoss) {
    classification = "Organic";
    classificationRationale =
      "Presence of alarm features (rectal bleeding, weight loss, or severe pain) indicates a likely organic aetiology requiring structural investigation.";
  } else if (
    !redFlags.length &&
    (hasBloating || stressWorsens) &&
    !hasBlood &&
    !hasWeightLoss
  ) {
    classification = "Functional";
    classificationRationale =
      "Absence of alarm features with symptoms exacerbated by stress and/or bloating suggests a functional GI disorder (e.g. IBS or functional dyspepsia).";
  } else {
    classification = "Indeterminate";
    classificationRationale =
      "The symptom pattern does not clearly favour organic or functional aetiology. Further clinical assessment and investigations are recommended.";
  }

  // --- Investigations ---
  const rawInvestigations: string[] = [];

  for (const diff of differentials) {
    const c = diff.condition;
    if (c.includes("GERD") || c.includes("Reflux"))
      rawInvestigations.push(...INVESTIGATIONS.GERD);
    if (c.includes("Malignancy"))
      rawInvestigations.push(...INVESTIGATIONS.Malignancy);
    if (c.includes("Peptic Ulcer") || c.includes("Gastritis"))
      rawInvestigations.push(...INVESTIGATIONS.PUD);
    if (c.includes("Inflammatory Bowel"))
      rawInvestigations.push(...INVESTIGATIONS.IBD);
    if (c.includes("Colorectal"))
      rawInvestigations.push(...INVESTIGATIONS.Colorectal);
    if (c.includes("IBS") || c.includes("Irritable"))
      rawInvestigations.push(...INVESTIGATIONS.IBS);
    if (c.includes("Functional Dyspepsia"))
      rawInvestigations.push(...INVESTIGATIONS.FD);
  }

  const suggestedInvestigations = [...new Set(rawInvestigations)];

  return {
    redFlags,
    differentials,
    classification,
    classificationRationale,
    suggestedInvestigations,
  };
}
