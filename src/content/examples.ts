import { runLocalContentIngestion } from "./ingestion";

export function getExampleGeneratedSmartfeedEdition() {
  const result = runLocalContentIngestion();
  return result.editions[0];
}

export function runContentSourceSelfCheck() {
  const result = runLocalContentIngestion();
  const selectedItems = result.editions.flatMap((edition) => edition.items);
  const inactiveSourceCandidateIds = result.scores
    .filter((score) => score.reasons.includes("Source is not active"))
    .map((score) => score.candidateId);
  const selectedSourceIds = Array.from(new Set(selectedItems.map((item) => item.sourceId).filter((sourceId): sourceId is string => !!sourceId)));

  return {
    importedCandidates: result.candidates.length,
    classifiedCandidates: result.classifications.length,
    scoredCandidates: result.scores.length,
    generatedEditions: result.editions.length,
    selectedItems: selectedItems.length,
    selectedSourceIds,
    inactiveSourceCandidateIds,
    firstSelectedTitle: selectedItems[0]?.title ?? null
  };
}
