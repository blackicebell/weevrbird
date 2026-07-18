import { CandidateClassification, ContentSource, Interest, SourceCandidate } from "../types/content";

export function classifyCandidate(candidate: SourceCandidate, interests: Interest[], source?: ContentSource): CandidateClassification {
  const searchable = [
    candidate.title,
    candidate.excerpt ?? "",
    candidate.url,
    candidate.categories.join(" ")
  ].join(" ").toLowerCase();

  const matchedKeywords = new Set<string>();
  const interestIds = interests
    .filter((interest) => {
      const matched = interest.keywords.filter((keyword) => searchable.includes(keyword.toLowerCase()));
      matched.forEach((keyword) => matchedKeywords.add(keyword));
      return matched.length > 0 || source?.defaultTopics.includes(interest.id);
    })
    .map((interest) => interest.id);

  const locationMatches = interests
    .flatMap((interest) => interest.locationKeywords ?? [])
    .filter((keyword, index, all) => searchable.includes(keyword.toLowerCase()) && all.indexOf(keyword) === index);

  return {
    candidateId: candidate.id,
    interestIds,
    locationMatches,
    matchedKeywords: Array.from(matchedKeywords)
  };
}
