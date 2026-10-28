/* Where the live numbers come from. Safe to publish: nothing here is secret.
   1) Firestore (real time): fill projectId once Firestore rules allow public READ of /stats/{game}.
   2) stats.json (daily, written by the GitHub Action in .github/workflows/stats.yml).
   If both are empty the stats strips simply stay hidden. */
window.DM_STATS_CONFIG = {
  firestoreProjectId: "",        // e.g. "dusk-moon-studio"  (leave empty until the rules are in place)
  firestoreCollection: "stats",  // documents: stats/moonrope, stats/feltflight, stats/voidbrawl
  jsonUrl: "/stats.json",
  refreshSeconds: 60
};
