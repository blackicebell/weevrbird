const path = require("path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTsModule(module, filename) {
  const source = require("fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: filename
  });

  module._compile(output.outputText, filename);
};

const {
  DEFAULT_USER_APP_STATE,
  hydrateUserAppState,
  normalizeActiveFilter,
  normalizeActiveTab,
  normalizeIssuePace,
  normalizeOnboardingStep,
  normalizeSelectedAvatar
} = require(path.join(__dirname, "../src/app/appState.ts"));

const recovered = hydrateUserAppState({
  onboarded: true,
  onboardingStep: "missing",
  selectedCity: 12,
  selectedInterests: ["Tech", "", "Tech", 4],
  selectedAvatar: 99,
  activeTab: "Explore",
  activeFilter: "Popular",
  issuePace: "Fast",
  draftType: "Hot Take",
  draft: 47,
  savedItemIds: ["a", "a", "", 2],
  openedItemIds: Array.from({ length: 40 }, (_, index) => `item-${index}`),
  submittedContributions: [{ id: "bad" }]
});

const assertions = [
  ["invalid onboarding step recovers", recovered.onboardingStep === DEFAULT_USER_APP_STATE.onboardingStep],
  ["invalid city recovers", recovered.selectedCity === DEFAULT_USER_APP_STATE.selectedCity],
  ["interest list is unique strings", recovered.selectedInterests.length === 1 && recovered.selectedInterests[0] === "Tech"],
  ["invalid avatar recovers", recovered.selectedAvatar === DEFAULT_USER_APP_STATE.selectedAvatar],
  ["invalid tab recovers", recovered.activeTab === DEFAULT_USER_APP_STATE.activeTab],
  ["invalid filter recovers", recovered.activeFilter === DEFAULT_USER_APP_STATE.activeFilter],
  ["invalid pace recovers", recovered.issuePace === DEFAULT_USER_APP_STATE.issuePace],
  ["invalid draft type recovers", recovered.draftType === DEFAULT_USER_APP_STATE.draftType],
  ["invalid draft recovers", recovered.draft === ""],
  ["saved item ids are unique strings", recovered.savedItemIds.length === 1 && recovered.savedItemIds[0] === "a"],
  ["opened history is capped", recovered.openedItemIds.length === 30],
  ["invalid contributions are removed", recovered.submittedContributions.length === 0],
  ["valid onboarding step passes", normalizeOnboardingStep("profile") === "profile"],
  ["valid active tab passes", normalizeActiveTab("Library") === "Library"],
  ["valid active filter passes", normalizeActiveFilter("Reading") === "Reading"],
  ["valid issue pace passes", normalizeIssuePace("Deep") === "Deep"],
  ["valid avatar passes", normalizeSelectedAvatar(1) === 1]
];

const failures = assertions.filter(([, passed]) => !passed);

console.log(JSON.stringify({
  checked: assertions.length,
  failed: failures.map(([label]) => label),
  valid: failures.length === 0
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
