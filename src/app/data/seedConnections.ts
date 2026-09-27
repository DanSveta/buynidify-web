import type { ConnectionRecord } from "../context/ListingsContext";

// A brand new account starts with an empty `connections` array (see
// ListingsContext), so the Overview "Portfolio breakdown" / "Search
// breakdown" trend chart had nothing real to plot - which is exactly why
// that section shipped as flat current-total bars instead of a chart in the
// first place (see the comment above BreakdownBars in Overview.tsx: "this
// demo has no actual day-by-day history to chart"). This file is that
// missing history, built the same way exampleDeal.ts and seedThreads.ts
// already fabricate believable PAST dates for a demo fixture - a small,
// fixed set of activity, dated relative to now ONCE (not re-randomised on
// every render), spread over the last ~3 weeks so a fresh demo account still
// looks like a real, moving platform.
//
// Merged into `connections` in ListingsContext exactly like seedThreads is
// merged into `threads`: only added for an id that isn't already present in
// what's actually stored, so a real action (nudge/accept/withdraw) on one of
// these ids "graduates" it into a real persisted record instead of being
// silently ignored or duplicated.
//
// Ids are real seed listing/demand ids from mockData.ts (p1, p2, p4 are
// investor-owned seed listings; td1, td3, td5 are seed tenant demand) - not
// invented ones. Two of the six are resolved as mutual matches (one per
// side), the rest are still-pending approaches - a realistic conversion
// rate, and no more matches than the single finished deal already shown via
// exampleDeal.ts elsewhere in the app.

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export const seedConnections: ConnectionRecord[] = [
  // --- Your tenant persona approaching investor-owned listings -----------
  {
    id: "p1",
    kind: "listing",
    by: "tenant",
    at: daysAgo(18),
    nudges: 1,
    lastNudgeAt: daysAgo(15),
    accepted: true,
    acceptedAt: daysAgo(15),
  },
  { id: "p2", kind: "listing", by: "tenant", at: daysAgo(11), nudges: 0, accepted: false },
  { id: "p4", kind: "listing", by: "tenant", at: daysAgo(4), nudges: 0, accepted: false },

  // --- Your investor persona responding to tenant demand ------------------
  {
    id: "td1",
    kind: "demand",
    by: "investor",
    at: daysAgo(20),
    nudges: 1,
    lastNudgeAt: daysAgo(17),
    accepted: true,
    acceptedAt: daysAgo(17),
  },
  { id: "td3", kind: "demand", by: "investor", at: daysAgo(9), nudges: 0, accepted: false },
  { id: "td5", kind: "demand", by: "investor", at: daysAgo(2), nudges: 0, accepted: false },
];
