import { launchFeeds } from "../data/mockData";
import { CandidateClassification, CandidateScore, SmartfeedEdition, SourceCandidate, UserInterestPreference } from "../types/content";
import { classifyCandidate } from "./classification";
import { composeSmartfeedEdition } from "./composer";
import { markDuplicateCandidates } from "./deduplication";
import {
  contentSources,
  defaultUserInterestPreference,
  interests,
  smartfeedSourceRules,
  sourceCandidateFixtures
} from "./fixtures";
import { scoreCandidate } from "./relevance";
import { LocalSourceRepository, SourceRepository } from "./repositories";

export interface IngestionResult {
  candidates: SourceCandidate[];
  classifications: CandidateClassification[];
  scores: CandidateScore[];
  editions: SmartfeedEdition[];
}

export function createLocalSourceRepository() {
  return new LocalSourceRepository(contentSources, sourceCandidateFixtures);
}

export function runLocalContentIngestion({
  repository = createLocalSourceRepository(),
  preference = defaultUserInterestPreference,
  now = new Date("2026-07-18T12:00:00.000Z")
}: {
  repository?: SourceRepository;
  preference?: UserInterestPreference;
  now?: Date;
} = {}): IngestionResult {
  const candidates = markDuplicateCandidates(repository.listCandidates()).map((candidate) => ({
    ...candidate,
    state: candidate.state === "duplicate" ? candidate.state : "classified" as const
  }));

  repository.saveCandidates(candidates);

  const sources = repository.listSources();
  const classifications = candidates.map((candidate) => classifyCandidate(
    candidate,
    interests,
    sources.find((source) => source.id === candidate.sourceId)
  ));
  const scores = candidates.map((candidate) => {
    const source = sources.find((entry) => entry.id === candidate.sourceId);
    if (!source) return { candidateId: candidate.id, score: 0, reasons: ["Unknown source"] };

    const classification = classifications.find((entry) => entry.candidateId === candidate.id);
    if (!classification) return { candidateId: candidate.id, score: 0, reasons: ["Missing classification"] };

    return scoreCandidate({ candidate, classification, source, preference, now });
  });

  const editions = launchFeeds
    .filter((feed) => feed.joined)
    .map((feed) => composeSmartfeedEdition({
      feed,
      candidates,
      classifications,
      scores,
      rules: smartfeedSourceRules,
      generatedAt: now.toISOString()
    }))
    .filter((edition) => edition.items.length > 0);

  return {
    candidates,
    classifications,
    scores,
    editions
  };
}
