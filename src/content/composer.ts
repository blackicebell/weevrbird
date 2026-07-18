import { FeedItem, Smartfeed } from "../types/product";
import { CandidateClassification, CandidateScore, SourceCandidate, SmartfeedEdition, SmartfeedSourceRule } from "../types/content";

export function candidateToFeedItem(candidate: SourceCandidate, reason: string): FeedItem {
  return {
    id: `source-${candidate.id}`,
    itemType: candidate.suggestedItemType,
    feedId: candidate.feedId,
    sourceId: candidate.sourceId,
    sourceName: candidate.sourceName,
    title: candidate.title,
    excerpt: candidate.excerpt,
    url: candidate.url,
    publishedAt: formatPublishedAt(candidate.publishedAt),
    createdAt: candidate.publishedAt,
    imported: true,
    replies: 0,
    reactionLabel: reason
  };
}

export function composeSmartfeedEdition({
  feed,
  candidates,
  classifications,
  scores,
  rules,
  generatedAt,
  maxItems = 6,
  maxItemsPerTopic = 2
}: {
  feed: Smartfeed;
  candidates: SourceCandidate[];
  classifications: CandidateClassification[];
  scores: CandidateScore[];
  rules: SmartfeedSourceRule[];
  generatedAt: string;
  maxItems?: number;
  maxItemsPerTopic?: number;
}): SmartfeedEdition {
  const selected: FeedItem[] = [];
  const sourceCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const sortedCandidates = candidates
    .filter((candidate) => candidate.feedId === feed.id)
    .map((candidate) => ({
      candidate,
      classification: classifications.find((entry) => entry.candidateId === candidate.id),
      score: scores.find((entry) => entry.candidateId === candidate.id),
      rule: rules.find((entry) => entry.sourceId === candidate.sourceId && entry.feedId === feed.id)
    }))
    .filter((entry) => entry.classification && entry.score && entry.rule)
    .filter((entry) => ruleAllowsCandidate(entry.candidate, entry.classification!, entry.rule!))
    .filter((entry) => entry.score!.score >= entry.rule!.minimumRelevanceScore)
    .sort((a, b) => {
      const priorityDelta = b.rule!.sourcePriority - a.rule!.sourcePriority;
      if (priorityDelta !== 0) return priorityDelta;
      return b.score!.score - a.score!.score;
    });

  for (const entry of sortedCandidates) {
    if (selected.length >= maxItems) break;

    const sourceCount = sourceCounts.get(entry.candidate.sourceId) ?? 0;
    if (sourceCount >= entry.rule!.maxItemsPerEdition) continue;

    const primaryTopic = entry.classification!.interestIds[0] ?? "general";
    const topicCount = topicCounts.get(primaryTopic) ?? 0;
    if (topicCount >= maxItemsPerTopic) continue;

    selected.push(candidateToFeedItem(entry.candidate, getVisibilityReason(entry.classification!, entry.score!)));
    sourceCounts.set(entry.candidate.sourceId, sourceCount + 1);
    topicCounts.set(primaryTopic, topicCount + 1);
  }

  return {
    feed,
    generatedAt,
    items: selected
  };
}

function ruleAllowsCandidate(candidate: SourceCandidate, classification: CandidateClassification, rule: SmartfeedSourceRule) {
  if (!rule.enabled || rule.status === "paused") return false;
  if (!rule.allowedLanguages.includes(candidate.language)) return false;
  if (rule.allowedItemTypes.length > 0 && !rule.allowedItemTypes.includes(candidate.suggestedItemType)) return false;
  if (rule.excludedItemTypes.includes(candidate.suggestedItemType)) return false;
  if (classification.interestIds.some((interestId) => rule.excludedTopicIds.includes(interestId))) return false;
  if (rule.allowedTopicIds.length > 0 && !classification.interestIds.some((interestId) => rule.allowedTopicIds.includes(interestId))) return false;

  const searchable = `${candidate.title} ${candidate.excerpt ?? ""} ${candidate.categories.join(" ")}`.toLowerCase();
  if (rule.excludedKeywords.some((keyword) => searchable.includes(keyword.toLowerCase()))) return false;
  if (rule.includedKeywords.length > 0 && !rule.includedKeywords.some((keyword) => searchable.includes(keyword.toLowerCase()))) return false;

  if (rule.requiredLocationIds && rule.requiredLocationIds.length > 0) {
    return classification.locationMatches.some((location) => rule.requiredLocationIds?.includes(location.toLowerCase()));
  }

  return true;
}

function getVisibilityReason(classification: CandidateClassification, score: CandidateScore) {
  const matchedTopic = classification.interestIds[0];
  if (matchedTopic) return `Selected for ${matchedTopic}`;
  return score.reasons[0] ?? "Selected for this Smartfeed";
}

function formatPublishedAt(publishedAt: string) {
  const date = new Date(publishedAt);
  const now = new Date("2026-07-18T12:00:00.000Z");
  const ageHours = Math.max(0, (now.getTime() - date.getTime()) / 36e5);

  if (ageHours < 24) return "Today";
  if (ageHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
