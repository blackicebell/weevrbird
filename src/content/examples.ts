import { runLocalContentIngestion } from "./ingestion";

export function getExampleGeneratedSmartfeedEdition() {
  const result = runLocalContentIngestion();
  return result.editions[0];
}

export function runContentSourceSelfCheck() {
  const result = runLocalContentIngestion();
  const selectedItems = result.editions.flatMap((edition) => edition.items);

  return {
    importedCandidates: result.candidates.length,
    classifiedCandidates: result.classifications.length,
    scoredCandidates: result.scores.length,
    generatedEditions: result.editions.length,
    selectedItems: selectedItems.length,
    firstSelectedTitle: selectedItems[0]?.title ?? null
  };
}
