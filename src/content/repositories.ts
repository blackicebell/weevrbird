import { CandidateDecision, ContentSource, SourceCandidate, SourceHealth } from "../types/content";

export interface SourceRepository {
  listSources(): ContentSource[];
  listCandidates(): SourceCandidate[];
  saveCandidates(candidates: SourceCandidate[]): void;
  listDecisions(): CandidateDecision[];
  saveDecision(decision: CandidateDecision): void;
  listSourceHealth(): SourceHealth[];
}

export class LocalSourceRepository implements SourceRepository {
  private candidates: SourceCandidate[];
  private decisions: CandidateDecision[] = [];
  private health: SourceHealth[];

  constructor(private readonly sources: ContentSource[], seedCandidates: SourceCandidate[] = []) {
    this.candidates = seedCandidates;
    this.health = sources.map((source) => ({
      sourceId: source.id,
      status: source.status === "active" || source.status === "experimental" ? "healthy" : "degraded",
      lastFetchedAt: source.lastFetchedAt
    }));
  }

  listSources() {
    return this.sources;
  }

  listCandidates() {
    return this.candidates;
  }

  saveCandidates(candidates: SourceCandidate[]) {
    const existingById = new Map(this.candidates.map((candidate) => [candidate.id, candidate]));
    candidates.forEach((candidate) => existingById.set(candidate.id, candidate));
    this.candidates = Array.from(existingById.values());
  }

  listDecisions() {
    return this.decisions;
  }

  saveDecision(decision: CandidateDecision) {
    this.decisions = this.decisions.concat(decision);
  }

  listSourceHealth() {
    return this.health;
  }
}
