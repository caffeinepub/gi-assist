/**
 * GI-CDSS Clinical Decision Engine
 * Source: Sleisenger & Fordtran's Gastrointestinal and Liver Disease, 10th Ed.
 *
 * Question ID reference (matches questions.ts):
 *  Q1  — Main symptom selector (pain / dysphagia / heartburn / nausea / diarrhea / constipation / blood / jaundice / other)
 *  Q10 — Pain location (upper / lower / right / left / central / all)
 *  Q11 — Pain character (burning / cramping / dull / sharp)
 *  Q12 — Pain worse after eating (yes/no)
 *  Q13 — Pain radiates to back/shoulder (yes/no)
 *  Q14 — Pain severity 1-10
 *  Q20 — Dysphagia type (solids / liquids / both)
 *  Q21 — Dysphagia progressive (yes/no)
 *  Q22 — Odynophagia (yes/no)
 *  Q23 — Food sticking sensation (yes/no)
 *  Q24 — Regurgitation of undigested food (yes/no)
 *  Q26 — Heartburn frequency (rarely / one_two / three_plus / daily)
 *  Q27 — Acid regurgitation into throat (yes/no)
 *  Q28 — Wakes from sleep (yes/no)
 *  Q29 — Positional worsening (yes/no)
 *  Q30 — Antacid response (helped / not_helped / not_tried)
 *  Q31 — Vomiting frequency (rare / daily / multiple / nausea_only)
 *  Q32 — Haematemesis / coffee-ground vomit (yes/no)
 *  Q33 — Vomiting shortly after eating (yes/no)
 *  Q34 — Vomiting associated with pain (yes/no)
 *  Q36 — Diarrhea frequency (two_three / four_six / more_six)
 *  Q37 — Blood in stool — diarrhea branch (yes/no)
 *  Q38 — Mucus in stool (yes/no)
 *  Q39 — Nocturnal diarrhea (yes/no)
 *  Q40 — Urgency (yes/no)
 *  Q41 — Diarrhea duration (less_two_weeks / two_to_four / more_four)
 *  Q42 — Travel / contaminated food (yes/no)
 *  Q43 — Constipation frequency (three_plus / one_two / less_one)
 *  Q44 — Straining (yes/no)
 *  Q45 — Incomplete evacuation (yes/no)
 *  Q46 — Stool shape change (yes/no)
 *  Q47 — Alternating diarrhea/constipation (yes/no)
 *  Q48 — Blood appearance (bright / dark / melaena / paper_only)
 *  Q49 — Blood mixed in stool (mixed / surface / dripping)
 *  Q50 — Pain with bleeding (yes/no)
 *  Q51 — Duration of bleeding (days / weeks / months)
 *  Q52 — Prior haemorrhoids/colonoscopy (yes/no)
 *  Q53 — Dark urine (yes/no)
 *  Q54 — Pale stools (yes/no)
 *  Q55 — Generalised itching (yes/no)
 *  Q56 — RUQ / right rib pain (yes/no)
 *  Q57 — Pain to right shoulder (yes/no)
 *  Q60 — Bloating / early satiety (yes/no)
 *  Q61 — Excessive gas / belching (yes/no)
 *  Q62 — Relief with defecation (yes/no)
 *  Q63 — Stress worsens symptoms (yes/no)
 *  Q64 — Impact on daily activities 1-10
 *  Q80 — Unintentional weight loss (yes/no)
 *  Q81 — Fever / chills (yes/no)
 *  Q82 — Jaundice (yes/no)
 *  Q83 — Appetite loss (yes/no)
 *  Q84 — Fatigue (yes/no)
 *  Q85 — Family history GI cancer / IBD (yes/no)
 *  Q86 — NSAID / aspirin use (yes/no)
 *  Q87 — Duration of current symptoms
 */

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

function yes(answers: [bigint, string][], id: bigint): boolean {
  return getAnswer(answers, id) === "yes";
}

const INV = {
  OGD: "Upper GI Endoscopy (OGD)",
  BARIUM: "Barium Swallow / Meal",
  PH_METRY: "Ambulatory 24-hour pH-Impedance Monitoring",
  MANOMETRY: "Oesophageal Manometry",
  HP_UBT: "Urea Breath Test (H. pylori)",
  HP_BIOPSY: "Rapid Urease Test / Biopsy (H. pylori)",
  CT_ABD: "CT Abdomen & Pelvis with contrast",
  CT_CHEST: "CT Chest",
  COLONOSCOPY: "Colonoscopy + Biopsy",
  CT_COLON: "CT Colonography (virtual colonoscopy)",
  CALPROTECTIN: "Faecal Calprotectin",
  CRP_ESR: "CRP, ESR (inflammatory markers)",
  FBC: "Full Blood Count (FBC)",
  LFT: "Liver Function Tests (LFTs)",
  CEA: "CEA Tumour Marker",
  CA19: "CA 19-9 Tumour Marker",
  USS_ABD: "Abdominal Ultrasound",
  USS_LIVER: "Liver Ultrasound / Fibroscan",
  MRCP: "MRCP (Magnetic Resonance Cholangiopancreatography)",
  ERCP: "ERCP (Endoscopic Retrograde Cholangiopancreatography)",
  STOOL_MC: "Stool Microscopy, Culture & Sensitivity",
  STOOL_OCP: "Stool Ova, Cysts & Parasites",
  TFT: "Thyroid Function Tests (TFTs)",
  COELIAC: "Anti-TTG IgA / Coeliac Screen",
  COLONBIOPSY: "Colonoscopy + random biopsies (microscopic colitis)",
  CAPSULE: "Wireless Capsule Endoscopy",
  CT_ENTERO: "CT Enterography",
  SMEAR: "Proctoscopy / Sigmoidoscopy",
  HAEMO_PANEL: "Iron studies, B12, Folate, Ferritin",
  ROME_REVIEW: "Rome IV criteria clinical review",
  HIDA: "HIDA scan (hepatobiliary scintigraphy)",
  EUS: "Endoscopic Ultrasound (EUS)",
  PUSH_ENTERO: "Push Enteroscopy",
} as const;

export function analyzeSession(answers: [bigint, string][]): ClinicalReport {
  const a = (id: bigint) => getAnswer(answers, id);
  const is = (id: bigint) => yes(answers, id);

  // ── Main symptom(s) selected ─────────────────────────────────────────────
  const mainSymptom = a(1n) ?? "";
  const hasPain = mainSymptom.includes("pain");
  const hasDysphagia = mainSymptom.includes("dysphagia");
  const hasHeartburn = mainSymptom.includes("heartburn");
  const _hasNausea = mainSymptom.includes("nausea");
  const hasDiarrhea = mainSymptom.includes("diarrhea");
  const hasConstipation = mainSymptom.includes("constipation");
  const hasBloodMain = mainSymptom.includes("blood");
  const hasJaundice = mainSymptom.includes("jaundice");
  const _hasOther = mainSymptom.includes("other");

  // ── Abdominal pain branch ────────────────────────────────────────────────
  const painLocation = a(10n); // upper / lower / right / left / central / all
  const painCharacter = a(11n); // burning / cramping / dull / sharp
  const painPostPrandial = is(12n);
  const painRadiates = is(13n);
  const painSeverity = Number(a(14n) ?? "0");

  // ── Dysphagia branch ────────────────────────────────────────────────────
  const dysphagiaType = a(20n); // solids / liquids / both
  const dysphagiaProgressive = is(21n);
  const odynophagia = is(22n);
  const _foodSticking = is(23n);
  const regurgitation = is(24n);

  // ── Heartburn / GERD branch ──────────────────────────────────────────────
  const heartburnFreq = a(26n); // rarely / one_two / three_plus / daily
  const acidRegurg = is(27n);
  const wakesFromSleep = is(28n);
  const positional = is(29n);
  const antacidHelped = a(30n) === "helped";

  // ── Nausea / vomiting branch ─────────────────────────────────────────────
  const haematemesis = is(32n);
  const _earlyVomiting = is(33n);
  const _vomitingWithPain = is(34n);

  // ── Diarrhea branch ─────────────────────────────────────────────────────
  const bloodInStoolDia = is(37n);
  const mucusInStool = is(38n);
  const nocturnalDia = is(39n);
  const _urgency = is(40n);
  const diachronic = a(41n) === "more_four";
  const travelHistory = is(42n);

  // ── Constipation branch ─────────────────────────────────────────────────
  const _straining = is(44n);
  const _incompleteEvac = is(45n);
  const stoolShapeChange = is(46n);
  const alternating = is(47n);

  // ── Rectal bleeding branch ───────────────────────────────────────────────
  const bloodAppearance = a(48n); // bright / dark / melaena / paper_only
  const _bloodMixed = a(49n) === "mixed";
  const _painWithBleed = is(50n);
  const _bleedingDuration = a(51n);

  // ── Jaundice / liver branch ──────────────────────────────────────────────
  const darkUrine = is(53n);
  const paleStools = is(54n);
  const _generalItching = is(55n);
  const ruqPain = is(56n);
  const shoulderPain = is(57n);

  // ── Functional / general symptoms ────────────────────────────────────────
  const bloating = is(60n);
  const excessGas = is(61n);
  const reliefDefecation = is(62n);
  const stressWorsens = is(63n);

  // ── Red-flag / systemic ───────────────────────────────────────────────────
  const weightLoss = is(80n);
  const fever = is(81n);
  const jaundice = is(82n) || hasJaundice;
  const appetiteLoss = is(83n);
  const _fatigue = is(84n);
  const familyHistory = is(85n);
  const nsaidUse = is(86n);

  // Derived convenience flags
  const anyBlood =
    hasBloodMain ||
    bloodInStoolDia ||
    haematemesis ||
    (bloodAppearance !== undefined && bloodAppearance !== "");

  // ═══════════════════════════════════════════════════════════════════════
  // RED FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  const redFlags: RedFlag[] = [];

  if (hasDysphagia && dysphagiaProgressive) {
    redFlags.push({
      label: "Progressive Dysphagia",
      severity: "critical",
      rationale:
        "Progressive difficulty swallowing (especially to solids) is a high-risk alarm feature for oesophageal malignancy or stricture — requires urgent OGD.",
    });
  } else if (hasDysphagia) {
    redFlags.push({
      label: "Dysphagia",
      severity: "warning",
      rationale:
        "Difficulty swallowing requires endoscopic evaluation to exclude structural oesophageal pathology.",
    });
  }

  if (haematemesis) {
    redFlags.push({
      label: "Haematemesis (blood/coffee-ground vomit)",
      severity: "critical",
      rationale:
        "Haematemesis indicates upper GI bleeding — requires urgent OGD and haemodynamic assessment.",
    });
  }

  if (anyBlood && bloodAppearance === "melaena") {
    redFlags.push({
      label: "Melaena (black tarry stools)",
      severity: "critical",
      rationale:
        "Melaena indicates proximal GI bleeding, most commonly peptic ulcer disease — urgent upper GI endoscopy required.",
    });
  }

  if (hasBloodMain || (bloodAppearance && bloodAppearance !== "paper_only")) {
    redFlags.push({
      label: "Rectal Bleeding",
      severity: "critical",
      rationale:
        "Rectal bleeding is an alarm feature requiring urgent investigation to exclude colorectal neoplasm, IBD, or upper GI haemorrhage.",
    });
  }

  if (weightLoss) {
    redFlags.push({
      label: "Unintentional Weight Loss",
      severity: "critical",
      rationale:
        "Unexplained weight loss is a red-flag symptom for malignancy, malabsorption, or chronic inflammatory disease.",
    });
  }

  if (hasDysphagia && weightLoss) {
    redFlags.push({
      label: "Dysphagia + Weight Loss — Suspect Malignancy",
      severity: "critical",
      rationale:
        "The combination of dysphagia and weight loss is highly suspicious for oesophageal or gastric malignancy (Sleisenger & Fordtran 10th Ed).",
    });
  }

  if (painSeverity >= 8 && hasPain) {
    redFlags.push({
      label: `Severe Abdominal Pain (${painSeverity}/10)`,
      severity: "critical",
      rationale: `Reported pain severity of ${painSeverity}/10 warrants urgent evaluation for acute surgical or serious organic pathology.`,
    });
  }

  if (nocturnalDia) {
    redFlags.push({
      label: "Nocturnal Diarrhea",
      severity: "warning",
      rationale:
        "Diarrhea that wakes the patient from sleep is an organic alarm feature, inconsistent with a purely functional diagnosis.",
    });
  }

  if (stoolShapeChange) {
    redFlags.push({
      label: "Change in Stool Calibre / Shape",
      severity: "warning",
      rationale:
        "Narrow or ribbon-like stools may indicate a colorectal mass effect and warrant colonoscopic evaluation.",
    });
  }

  if (familyHistory) {
    redFlags.push({
      label: "Family History of GI Malignancy or IBD",
      severity: "warning",
      rationale:
        "A family history of colorectal cancer, stomach cancer, or IBD significantly elevates the patient's risk and lowers the threshold for investigation.",
    });
  }

  if (jaundice) {
    redFlags.push({
      label: "Jaundice",
      severity: "critical",
      rationale:
        "Jaundice with or without RUQ pain or pale stools suggests biliary obstruction, hepatocellular disease, or pancreatic malignancy.",
    });
  }

  if (appetiteLoss && weightLoss) {
    redFlags.push({
      label: "Anorexia with Weight Loss",
      severity: "critical",
      rationale:
        "Combined anorexia and weight loss strongly suggests an underlying malignancy or serious systemic disease.",
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIFFERENTIAL DIAGNOSES
  // ═══════════════════════════════════════════════════════════════════════
  const differentials: Differential[] = [];

  // ── Oesophageal / Upper GI ────────────────────────────────────────────
  if (hasDysphagia && weightLoss) {
    differentials.push({
      condition: "Oesophageal / Gastric Malignancy",
      confidence: "High",
      rationale:
        "Progressive dysphagia combined with weight loss is a high-risk alarm combination for upper GI malignancy per Sleisenger & Fordtran 10th Ed.",
      icdHint: "C15–C16",
    });
  }

  if (hasDysphagia && !weightLoss && dysphagiaType === "solids") {
    differentials.push({
      condition: "Oesophageal Stricture / Schatzki Ring",
      confidence: dysphagiaProgressive ? "High" : "Moderate",
      rationale:
        "Dysphagia limited to solids with or without progressive worsening suggests a mechanical oesophageal obstruction (stricture, web, or ring).",
      icdHint: "K22.2",
    });
  }

  if (hasDysphagia && dysphagiaType === "both") {
    differentials.push({
      condition: "Achalasia / Oesophageal Motility Disorder",
      confidence: regurgitation ? "High" : "Moderate",
      rationale:
        "Dysphagia to both solids and liquids, especially with regurgitation of undigested food, suggests a motility disorder such as achalasia.",
      icdHint: "K22.0",
    });
  }

  if (
    (hasHeartburn || acidRegurg || positional || wakesFromSleep) &&
    !hasDysphagia
  ) {
    const freq = heartburnFreq;
    const highConf = (freq === "three_plus" || freq === "daily") && acidRegurg;
    differentials.push({
      condition: "Gastro-oesophageal Reflux Disease (GERD)",
      confidence: highConf ? "High" : antacidHelped ? "High" : "Moderate",
      rationale:
        "Classic symptoms of frequent heartburn, acid regurgitation, positional worsening, and/or nocturnal symptoms are pathognomonic of GERD (Sleisenger & Fordtran).",
      icdHint: "K21",
    });
  }

  if (hasDysphagia && odynophagia && !weightLoss) {
    differentials.push({
      condition: "Eosinophilic Oesophagitis (EoE)",
      confidence: "Moderate",
      rationale:
        "Dysphagia with odynophagia in the absence of alarm features, especially in younger patients, raises the possibility of eosinophilic oesophagitis.",
      icdHint: "K20.0",
    });
  }

  // ── Peptic / Gastric ─────────────────────────────────────────────────
  if (
    hasPain &&
    painLocation === "upper" &&
    painPostPrandial &&
    !hasHeartburn
  ) {
    differentials.push({
      condition: "Peptic Ulcer Disease (Gastric / Duodenal Ulcer)",
      confidence: nsaidUse || painCharacter === "burning" ? "High" : "Moderate",
      rationale:
        "Post-prandial upper abdominal burning or gnawing pain, especially with NSAID use, is characteristic of peptic ulcer disease.",
      icdHint: "K25–K27",
    });
  }

  if (haematemesis || bloodAppearance === "melaena") {
    differentials.push({
      condition:
        "Upper GI Haemorrhage (Peptic Ulcer / Mallory–Weiss / Varices)",
      confidence: "High",
      rationale:
        "Haematemesis or melaena indicates an upper GI bleeding source — peptic ulcer is most common; varices if liver disease history.",
      icdHint: "K92.1",
    });
  }

  if (hasPain && painRadiates && painLocation === "upper") {
    differentials.push({
      condition: "Acute Pancreatitis / Chronic Pancreatitis",
      confidence: painSeverity >= 7 ? "High" : "Moderate",
      rationale:
        "Upper abdominal pain radiating to the back is the classic presentation of pancreatitis.",
      icdHint: "K85–K86",
    });
  }

  if (
    hasPain &&
    painLocation === "upper" &&
    bloating &&
    !hasHeartburn &&
    stressWorsens
  ) {
    differentials.push({
      condition: "Functional Dyspepsia",
      confidence: "Moderate",
      rationale:
        "Upper abdominal discomfort with postprandial fullness, bloating, and stress-related worsening in the absence of alarm features meets Rome IV criteria for functional dyspepsia.",
      icdHint: "K30",
    });
  }

  // ── Biliary / Hepatic ────────────────────────────────────────────────
  if (jaundice || (darkUrine && paleStools)) {
    differentials.push({
      condition:
        "Obstructive Jaundice (Choledocholithiasis / Pancreatic Head Mass)",
      confidence: ruqPain || paleStools ? "High" : "Moderate",
      rationale:
        "Jaundice with dark urine and pale stools indicates biliary obstruction — gallstones and pancreatic malignancy are the leading causes.",
      icdHint: "K80–K83",
    });
  }

  if (ruqPain && fever) {
    differentials.push({
      condition: "Acute Cholecystitis / Cholangitis",
      confidence: shoulderPain ? "High" : "Moderate",
      rationale:
        "RUQ pain with fever (Charcot's triad if also jaundice) is the hallmark of biliary infection — cholecystitis or ascending cholangitis.",
      icdHint: "K81–K83",
    });
  }

  // ── Bowel / Lower GI ────────────────────────────────────────────────
  if (hasDiarrhea && (bloodInStoolDia || anyBlood) && (fever || nocturnalDia)) {
    differentials.push({
      condition:
        "Inflammatory Bowel Disease (Crohn's Disease / Ulcerative Colitis)",
      confidence: diachronic ? "High" : "Moderate",
      rationale:
        "Bloody diarrhea with nocturnal symptoms, fever, and chronicity is the classic presentation of IBD — UC is more common with bloody stools, Crohn's with pain and diarrhea.",
      icdHint: "K50–K51",
    });
  } else if (hasDiarrhea && bloodInStoolDia) {
    differentials.push({
      condition: "Inflammatory Bowel Disease (IBD)",
      confidence: "Moderate",
      rationale:
        "Diarrhea with blood in stool requires exclusion of IBD via colonoscopy and biopsy.",
      icdHint: "K50–K51",
    });
  }

  if (
    hasBloodMain ||
    (bloodAppearance && bloodAppearance !== "melaena" && bloodAppearance !== "")
  ) {
    differentials.push({
      condition: "Colorectal Neoplasm (Cancer / Polyp)",
      confidence:
        weightLoss || familyHistory || stoolShapeChange ? "High" : "Moderate",
      rationale:
        "Any rectal bleeding, especially with altered bowel habit, weight loss, or family history, warrants urgent exclusion of colorectal carcinoma.",
      icdHint: "C18–C20",
    });
  }

  if (
    hasBloodMain &&
    bloodAppearance === "paper_only" &&
    !weightLoss &&
    !stoolShapeChange
  ) {
    differentials.push({
      condition: "Haemorrhoids / Anal Fissure",
      confidence: "Moderate",
      rationale:
        "Blood only on toilet paper without pain or weight loss, especially with straining, is more consistent with haemorrhoids or anal fissure.",
      icdHint: "K64",
    });
  }

  if (hasDiarrhea && travelHistory && !bloodInStoolDia) {
    differentials.push({
      condition: "Infective Gastroenteritis / Traveller's Diarrhea",
      confidence: fever ? "High" : "Moderate",
      rationale:
        "Acute diarrhea following travel or potentially contaminated food suggests infectious aetiology (bacterial, viral, or parasitic).",
      icdHint: "A09",
    });
  }

  if (hasDiarrhea && mucusInStool && !bloodInStoolDia && !anyBlood) {
    const ibsConf: "High" | "Moderate" | "Low" =
      stressWorsens && reliefDefecation ? "High" : "Moderate";
    differentials.push({
      condition: "Irritable Bowel Syndrome — Diarrhea-Predominant (IBS-D)",
      confidence: ibsConf,
      rationale:
        "Diarrhea with mucus, absence of blood, stress association, and relief with defecation meets Rome IV criteria for IBS-D.",
      icdHint: "K58.0",
    });
  }

  if (hasConstipation && mucusInStool && !anyBlood) {
    differentials.push({
      condition: "Irritable Bowel Syndrome — Constipation-Predominant (IBS-C)",
      confidence: stressWorsens && reliefDefecation ? "High" : "Moderate",
      rationale:
        "Constipation with mucus passage, stress exacerbation, and relief with defecation is consistent with IBS-C per Rome IV criteria.",
      icdHint: "K58.1",
    });
  }

  if (alternating && !anyBlood && !weightLoss) {
    differentials.push({
      condition: "Irritable Bowel Syndrome — Mixed (IBS-M)",
      confidence: stressWorsens ? "Moderate" : "Low",
      rationale:
        "Alternating diarrhea and constipation without alarm features is consistent with mixed-type IBS.",
      icdHint: "K58.2",
    });
  }

  if (hasConstipation && stoolShapeChange && !anyBlood) {
    differentials.push({
      condition: "Colorectal Obstruction / Mass",
      confidence: weightLoss || familyHistory ? "High" : "Moderate",
      rationale:
        "New-onset constipation with change in stool calibre warrants exclusion of a colorectal mass causing luminal narrowing.",
      icdHint: "K56",
    });
  }

  if (
    hasDiarrhea &&
    diachronic &&
    !bloodInStoolDia &&
    !mucusInStool &&
    !travelHistory
  ) {
    differentials.push({
      condition: "Microscopic Colitis / Malabsorption (Coeliac Disease)",
      confidence: "Moderate",
      rationale:
        "Chronic watery diarrhea without blood or mucus may indicate microscopic colitis or small bowel malabsorption including coeliac disease.",
      icdHint: "K52.8 / K90.0",
    });
  }

  // ── Fallback: functional / general ───────────────────────────────────
  if (
    differentials.length === 0 &&
    (bloating || stressWorsens || excessGas || reliefDefecation)
  ) {
    differentials.push({
      condition: "Functional Bowel Disorder / IBS (General)",
      confidence: stressWorsens && reliefDefecation ? "Moderate" : "Low",
      rationale:
        "Bloating, gas, and stress-exacerbated symptoms without alarm features or identifiable organic pathology are consistent with a functional bowel disorder.",
      icdHint: "K58",
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════════════
  const hasCriticalFlag = redFlags.some((f) => f.severity === "critical");
  const organicSignals =
    anyBlood ||
    weightLoss ||
    jaundice ||
    fever ||
    nocturnalDia ||
    stoolShapeChange ||
    haematemesis ||
    hasCriticalFlag;
  const functionalSignals =
    !anyBlood &&
    !weightLoss &&
    !fever &&
    !jaundice &&
    (stressWorsens || reliefDefecation || bloating) &&
    redFlags.length === 0;

  let classification: Classification;
  let classificationRationale: string;

  if (organicSignals) {
    classification = "Organic";
    classificationRationale =
      "Presence of one or more alarm features (rectal bleeding, weight loss, fever, jaundice, nocturnal symptoms, or haematemesis) indicates a likely organic aetiology requiring structural investigation.";
  } else if (functionalSignals) {
    classification = "Functional";
    classificationRationale =
      "Absence of alarm features combined with stress-related exacerbation, relief with defecation, and/or bloating suggests a functional GI disorder (IBS or functional dyspepsia) per Rome IV criteria.";
  } else {
    classification = "Indeterminate";
    classificationRationale =
      "The symptom pattern does not clearly favour organic or functional aetiology. Further clinical assessment and targeted investigations are recommended.";
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUGGESTED INVESTIGATIONS
  // ═══════════════════════════════════════════════════════════════════════
  const rawInv: string[] = [];

  for (const diff of differentials) {
    const c = diff.condition;

    if (c.includes("Malignancy") || c.includes("Oesophageal / Gastric")) {
      rawInv.push(INV.OGD, INV.CT_ABD, INV.CT_CHEST, INV.BARIUM);
    }
    if (c.includes("Stricture") || c.includes("Schatzki")) {
      rawInv.push(INV.OGD, INV.BARIUM);
    }
    if (c.includes("Achalasia") || c.includes("Motility")) {
      rawInv.push(INV.MANOMETRY, INV.OGD, INV.BARIUM);
    }
    if (c.includes("GERD") || c.includes("Reflux")) {
      rawInv.push(INV.OGD, INV.PH_METRY);
    }
    if (c.includes("Eosinophilic")) {
      rawInv.push(INV.OGD, INV.FBC);
    }
    if (c.includes("Peptic Ulcer") || c.includes("Gastric")) {
      rawInv.push(INV.OGD, INV.HP_UBT, INV.HP_BIOPSY);
    }
    if (c.includes("Upper GI Haemorrhage")) {
      rawInv.push(INV.OGD, INV.FBC, INV.HAEMO_PANEL);
    }
    if (c.includes("Pancreatitis")) {
      rawInv.push(INV.CT_ABD, INV.MRCP, INV.CA19, INV.LFT);
    }
    if (c.includes("Functional Dyspepsia")) {
      rawInv.push(INV.OGD, INV.HP_UBT, INV.TFT);
    }
    if (c.includes("Obstructive Jaundice")) {
      rawInv.push(INV.USS_LIVER, INV.LFT, INV.MRCP, INV.EUS, INV.CA19);
    }
    if (c.includes("Cholecystitis") || c.includes("Cholangitis")) {
      rawInv.push(INV.USS_ABD, INV.LFT, INV.FBC, INV.HIDA);
    }
    if (c.includes("Inflammatory Bowel") || c.includes("IBD")) {
      rawInv.push(
        INV.COLONOSCOPY,
        INV.CALPROTECTIN,
        INV.CRP_ESR,
        INV.FBC,
        INV.CT_ENTERO,
      );
    }
    if (
      c.includes("Colorectal Neoplasm") ||
      c.includes("Colorectal Obstruction")
    ) {
      rawInv.push(INV.COLONOSCOPY, INV.CEA, INV.CT_COLON, INV.FBC);
    }
    if (c.includes("Haemorrhoids") || c.includes("Anal Fissure")) {
      rawInv.push(INV.SMEAR);
    }
    if (c.includes("Infective") || c.includes("Traveller")) {
      rawInv.push(INV.STOOL_MC, INV.STOOL_OCP, INV.FBC);
    }
    if (c.includes("IBS") || c.includes("Irritable")) {
      rawInv.push(INV.ROME_REVIEW, INV.TFT, INV.FBC, INV.COELIAC);
    }
    if (
      c.includes("Microscopic Colitis") ||
      c.includes("Coeliac") ||
      c.includes("Malabsorption")
    ) {
      rawInv.push(INV.COLONBIOPSY, INV.COELIAC, INV.FBC, INV.HAEMO_PANEL);
    }
    if (c.includes("Functional Bowel")) {
      rawInv.push(INV.ROME_REVIEW, INV.TFT, INV.FBC);
    }
  }

  // Always add basic bloods for any presentation
  rawInv.push(INV.FBC);

  const suggestedInvestigations = [...new Set(rawInv)];

  return {
    redFlags,
    differentials,
    classification,
    classificationRationale,
    suggestedInvestigations,
  };
}
