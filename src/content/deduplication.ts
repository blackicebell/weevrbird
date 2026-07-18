import { SourceCandidate } from "../types/content";

const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];

export function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    TRACKING_PARAMS.forEach((param) => parsed.searchParams.delete(param));

    const pathname = parsed.pathname.endsWith("/") && parsed.pathname.length > 1
      ? parsed.pathname.slice(0, -1)
      : parsed.pathname;

    parsed.pathname = pathname;
    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function normalizeHeadline(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

export function getCandidateDuplicateKey(candidate: SourceCandidate) {
  return candidate.guid
    ? `guid:${candidate.sourceId}:${candidate.guid}`
    : `url:${normalizeUrl(candidate.canonicalUrl || candidate.url)}`;
}

export function markDuplicateCandidates(candidates: SourceCandidate[]) {
  const seenKeys = new Set<string>();
  const seenHeadlines = new Set<string>();

  return candidates.map((candidate) => {
    const duplicateKey = getCandidateDuplicateKey(candidate);
    const headlineKey = `${candidate.feedId}:${normalizeHeadline(candidate.title)}`;
    const duplicate = seenKeys.has(duplicateKey) || seenHeadlines.has(headlineKey);

    seenKeys.add(duplicateKey);
    seenHeadlines.add(headlineKey);

    return duplicate ? { ...candidate, state: "duplicate" as const } : candidate;
  });
}
