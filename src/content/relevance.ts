import { CandidateClassification, CandidateScore, ContentSource, SourceCandidate, UserInterestPreference } from "../types/content";

export function scoreCandidate({
  candidate,
  classification,
  source,
  preference,
  now
}: {
  candidate: SourceCandidate;
  classification: CandidateClassification;
  source: ContentSource;
  preference: UserInterestPreference;
  now: Date;
}): CandidateScore {
  const exclusion = getHardExclusion(candidate, classification, source, preference);
  if (exclusion) return { candidateId: candidate.id, score: 0, reasons: [exclusion] };

  const reasons: string[] = [];
  let score = 0;

  const primaryMatches = classification.interestIds.filter((interestId) => preference.primaryInterestIds.includes(interestId));
  const secondaryMatches = classification.interestIds.filter((interestId) => preference.secondaryInterestIds.includes(interestId));

  if (primaryMatches.length > 0) {
    score += 34;
    reasons.push(`Primary interest match: ${primaryMatches.join(", ")}`);
  }

  if (secondaryMatches.length > 0) {
    score += 16;
    reasons.push(`Secondary interest match: ${secondaryMatches.join(", ")}`);
  }

  if (classification.locationMatches.map((value) => value.toLowerCase()).includes(preference.location.toLowerCase())) {
    score += 18;
    reasons.push(`Location match: ${preference.location}`);
  }

  if (preference.preferredItemTypes.includes(candidate.suggestedItemType)) {
    score += 10;
    reasons.push(`Preferred content type: ${candidate.suggestedItemType}`);
  }

  score += getSourceQualityScore(source.trustLevel);
  reasons.push(`Source trust: ${source.trustLevel}`);

  const ageHours = Math.max(0, (now.getTime() - new Date(candidate.publishedAt).getTime()) / 36e5);
  if (ageHours <= 48) {
    score += 12;
    reasons.push("Fresh within 48 hours");
  } else if (ageHours <= 168) {
    score += 5;
    reasons.push("Fresh within a week");
  }

  if (preference.openedCandidateUrls.includes(candidate.canonicalUrl)) {
    score -= 18;
    reasons.push("Already opened penalty");
  }

  return {
    candidateId: candidate.id,
    score: Math.max(0, score),
    reasons
  };
}

function getHardExclusion(
  candidate: SourceCandidate,
  classification: CandidateClassification,
  source: ContentSource,
  preference: UserInterestPreference
) {
  if (!source.enabled || source.status === "paused" || source.status === "rejected") return "Source is not active";
  if (preference.mutedSourceIds.includes(source.id)) return "Muted source";
  if (candidate.language !== preference.language) return "Unsupported language";
  if (classification.interestIds.some((interestId) => preference.mutedInterestIds.includes(interestId))) return "Muted topic";
  if (candidate.state === "duplicate") return "Duplicate candidate";
  return null;
}

function getSourceQualityScore(trustLevel: ContentSource["trustLevel"]) {
  if (trustLevel === "known") return 12;
  if (trustLevel === "community") return 7;
  return 3;
}
