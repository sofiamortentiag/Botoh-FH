import * as fs from "fs";
import * as path from "path";
import { positionList } from "./positionList";
import { playerList } from "../../../changePlayerState/playerList";
import { getBestPit } from "../../../tires&pits/trackBestPit";
import { getBestLap } from "../../../zones/laps/trackBestLap";
import {
  ApiQualyData,
  ApiStandingsData,
  createQualyStandingsData,
  createRaceStandingsData,
  sendStandingsToApiWithRetry,
  sendQualyToApiWithRetry,
} from "./standingsApi";
import { GeneralGameMode, generalGameMode } from "../../../changeGameState/changeGameModes";
import { getPlayersOrderedByQualiTime } from "../qualy/playerTime";
import { setStandingsRefreshHandler } from "./standingsRefresh";

let apiRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let apiRefreshInFlight = false;
let pendingApiUpdate:
  | { mode: GeneralGameMode.GENERAL_QUALY; data: ApiQualyData }
  | { mode: GeneralGameMode.GENERAL_RACE; data: ApiStandingsData }
  | null = null;
let lastApiRefreshAt = 0;
const LIVE_API_REFRESH_INTERVAL_MS = 1500;

export interface StandingsRow {
  position: number;
  name: string;
  pits: number;
  bestLap: number | null;
  laps: number;
  gap: string;
  team: string | null;
}

function getRaceGap(
  row: (typeof positionList)[number],
  leader: (typeof positionList)[number],
  isLeader: boolean,
) {
  if (isLeader) return "+0.000s";

  const lapsBehind = leader.lap - row.lap;
  if (lapsBehind > 0) return `+${lapsBehind} lap${lapsBehind === 1 ? "" : "s"}`;

  const sectorsBehind = leader.currentSector - row.currentSector;
  if (sectorsBehind > 0) {
    return `+${sectorsBehind} sector${sectorsBehind === 1 ? "" : "s"}`;
  }

  const timeGap = Math.max(0, row.totalTime - leader.totalTime);
  return `+${timeGap.toFixed(3)}s`;
}

/**
 * Generate HTML standings table from positionList and playerList.
 * Returns HTML string ready to write to file.
 */
export function generateStandingsHtml(): string {
  const bestLap = getBestLap();
  const bestPit = getBestPit();
  const isQualy = generalGameMode === GeneralGameMode.GENERAL_QUALY;

  const rows: StandingsRow[] = isQualy
    ? getPlayersOrderedByQualiTime().map((p, idx, ordered) => ({
        position: idx + 1,
        name: p.name,
        pits: 0,
        bestLap: p.time,
        laps: 0,
        gap:
          idx === 0
            ? "+0.000s"
            : `+${(p.time - ordered[0].time).toFixed(3)}s`,
        team: p.team ?? null,
      }))
    : positionList.map((p, idx) => ({
        position: idx + 1,
        name: p.name,
        pits: p.pits,
        bestLap: p.time,
        laps: playerList[p.id]?.currentLap ?? 0,
        gap: getRaceGap(p, positionList[0], idx === 0),
        team: p.team ?? null,
      }));

  const timestamp = new Date().toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isQualy ? "Qualifying" : "Race"} Standings</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #090b10;
      --panel: #11151d;
      --panel-raised: #171d27;
      --line: #252d39;
      --muted: #929baa;
      --text: #f4f6f8;
      --accent: #ed2939;
      --accent-soft: rgba(237, 41, 57, .14);
      --green: #54d6a0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      padding: clamp(14px, 3vw, 36px);
      color: var(--text);
      background: radial-gradient(ellipse at 50% -15%, #202633 0, var(--bg) 58%);
      font-family: Inter, "Segoe UI", Arial, sans-serif;
    }
    .container { width: min(100%, 1040px); margin: 0 auto; }
    .topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .19em;
      text-transform: uppercase;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark {
      display: grid;
      width: 28px;
      height: 28px;
      place-items: center;
      border-radius: 7px;
      color: white;
      background: var(--accent);
      font-size: 14px;
      font-style: italic;
      letter-spacing: -.08em;
    }
    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 10px;
      border: 1px solid rgba(84, 214, 160, .25);
      border-radius: 999px;
      color: var(--green);
      background: rgba(84, 214, 160, .08);
      letter-spacing: .1em;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
    }
    .score-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      padding: clamp(20px, 4vw, 32px);
      overflow: hidden;
      border: 1px solid var(--line);
      border-bottom: 3px solid var(--accent);
      border-radius: 14px 14px 0 0;
      background: linear-gradient(110deg, #171c25 0%, #11151d 68%, #21151b 100%);
    }
    .eyebrow {
      margin-bottom: 7px;
      color: var(--accent);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .22em;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(22px, 4vw, 34px);
      line-height: 1;
      font-weight: 900;
      letter-spacing: -.045em;
      text-transform: uppercase;
    }
    .session-label {
      flex: 0 0 auto;
      padding: 8px 11px;
      border: 1px solid #3a424f;
      border-radius: 6px;
      color: #d9dee6;
      background: rgba(0, 0, 0, .2);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .table-card {
      padding: 8px 14px 4px;
      border: 1px solid var(--line);
      border-top: 0;
      border-radius: 0 0 14px 14px;
      background: rgba(17, 21, 29, .96);
      box-shadow: 0 22px 60px rgba(0, 0, 0, .28);
    }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 590px; border-collapse: collapse; font-size: 13px; }
    thead th {
      padding: 13px 12px;
      color: #8993a2;
      border-bottom: 1px solid var(--line);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .14em;
      text-align: left;
      text-transform: uppercase;
      white-space: nowrap;
    }
    tbody tr { transition: background .18s ease; }
    tbody tr:hover { background: #1a202b; }
    tbody td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,.055); white-space: nowrap; }
    tbody tr:last-child td { border-bottom: 0; }
    .pos { width: 54px; color: #9ba4b1; font-size: 15px; font-weight: 900; font-variant-numeric: tabular-nums; }
    .leader .pos { color: var(--accent); }
    .name { max-width: 260px; overflow: hidden; font-weight: 800; text-overflow: ellipsis; text-transform: uppercase; }
    .team { color: #c1c8d2; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
    .gap, .best-lap { color: #e1e5eb; font-variant-numeric: tabular-nums; font-weight: 700; }
    .leader .gap, .leader .best-lap { color: var(--green); }
    .laps, .pits { color: #d4dae2; text-align: center; font-variant-numeric: tabular-nums; }
    .pits { color: #ffbf69; }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
    .info-row {
      flex: 1 1 220px;
      padding: 13px 15px;
      border: 1px solid var(--line);
      border-radius: 9px;
      color: #edf0f4;
      background: var(--panel-raised);
      font-size: 12px;
      font-weight: 700;
    }
    .small { display: block; margin-bottom: 5px; color: var(--muted); font-size: 9px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; }
    .timestamp { padding: 12px 2px 2px; color: var(--muted); font-size: 10px; text-align: right; font-variant-numeric: tabular-nums; }
    .empty-state { padding: 36px 16px; color: var(--muted); text-align: center; font-size: 13px; }
    @media (max-width: 560px) {
      body { padding: 12px; }
      .topline { font-size: 9px; letter-spacing: .12em; }
      .brand { gap: 7px; }
      .brand-mark { width: 24px; height: 24px; }
      .score-header { align-items: start; flex-direction: column; gap: 14px; padding: 20px; }
      .table-card { padding: 4px 8px; }
      thead th, tbody td { padding-right: 9px; padding-left: 9px; }
      .timestamp { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="topline">
      <div class="brand"><span class="brand-mark">FH</span><span>Formula Haxball</span></div>
      <span class="live-badge"><span class="live-dot"></span>Live timing</span>
    </div>
    <header class="score-header">
      <div><div class="eyebrow">Race control · Standings</div><h1>${isQualy ? "Qualifying" : "Race"} classification</h1></div>
      <div class="session-label">${isQualy ? "Best lap" : "On track"}</div>
    </header>

    <section class="table-card" aria-label="${isQualy ? "Qualifying" : "Race"} standings">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Pos</th><th>Driver</th><th>Team</th><th>Gap</th>
              ${isQualy ? "<th>Best lap</th>" : "<th>Laps</th><th>Pits</th>"}
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `<tr><td class="empty-state" colspan="${isQualy ? 5 : 6}">Waiting for timing data</td></tr>` : rows
              .map(
                (r) => `
            <tr class="${r.position === 1 ? "leader" : ""}">
              <td class="pos">${String(r.position).padStart(2, "0")}</td>
              <td class="name">${escapeHtml(r.name)}</td>
              <td class="team">${escapeHtml(r.team ?? "—")}</td>
              <td class="gap">${r.gap}</td>
              ${
                isQualy
                  ? `<td class="best-lap">${r.bestLap === null ? "—" : `${r.bestLap.toFixed(3)}s`}</td>`
                  : `<td class="laps">${r.laps}</td><td class="pits">${r.pits}</td>`
              }
            </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="info-box">
        ${
          bestLap
            ? `<div class="info-row"><span class="small">Fastest lap · ${bestLap.lapNumber}</span>${escapeHtml(bestLap.playerName)} <span>${bestLap.lapTime.toFixed(3)}s</span></div>`
            : ""
        }
        ${
          !isQualy && bestPit
            ? `<div class="info-row"><span class="small">Fastest pit · stop ${bestPit.pitNumber}</span>${escapeHtml(bestPit.playerName)} <span>${bestPit.pitTime.toFixed(3)}s</span></div>`
            : ""
        }
      </div>
      <div class="timestamp">Last updated · ${timestamp}</div>
    </section>
  </div>

  <script>
    (function() {
      try {
        const evt = new EventSource('/events');
        evt.onmessage = function(e) { if (e.data === 'update') location.reload(); };
      } catch (err) { /* ignore */ }
    })();
  </script>
</body>
</html>
`;

  return html;
}

/**
 * Save standings HTML to a file. Default: project root standings.html
 */
export function saveStandingsHtml(destFile?: string): string {
  const out = destFile
    ? path.resolve(destFile)
    : path.resolve(__dirname, "..", "..", "..", "standings.html");

  const html = generateStandingsHtml();

  try {
    fs.writeFileSync(out, html, { encoding: "utf8" });
    console.log(`Standings saved to: ${out}`);
    return out;
  } catch (err) {
    console.error("Failed to save standings HTML:", err);
    throw err;
  }
}

function scheduleLiveApiRefresh() {
  if (
    generalGameMode !== GeneralGameMode.GENERAL_RACE &&
    generalGameMode !== GeneralGameMode.GENERAL_QUALY
  ) {
    return;
  }

  pendingApiUpdate =
    generalGameMode === GeneralGameMode.GENERAL_QUALY
      ? { mode: GeneralGameMode.GENERAL_QUALY, data: createQualyStandingsData() }
      : { mode: GeneralGameMode.GENERAL_RACE, data: createRaceStandingsData() };
  schedulePendingApiUpdate();
}

function schedulePendingApiUpdate() {
  if (!pendingApiUpdate || apiRefreshTimer || apiRefreshInFlight) return;

  const delay = Math.max(
    0,
    LIVE_API_REFRESH_INTERVAL_MS - (Date.now() - lastApiRefreshAt),
  );

  apiRefreshTimer = setTimeout(async () => {
    apiRefreshTimer = null;
    if (apiRefreshInFlight) return;

    const update = pendingApiUpdate;
    if (!update) return;

    apiRefreshInFlight = true;
    pendingApiUpdate = null;
    lastApiRefreshAt = Date.now();
    try {
      const sent =
        update.mode === GeneralGameMode.GENERAL_QUALY
          ? await sendQualyToApiWithRetry(3, update.data)
          : await sendStandingsToApiWithRetry(3, update.data);
      if (!sent) console.error("Live standings update was not accepted by Vercel");
    } catch (err) {
      console.error("Failed to send live standings to Vercel:", err);
    } finally {
      apiRefreshInFlight = false;
      if (pendingApiUpdate) schedulePendingApiUpdate();
    }
  }, delay);
}

setStandingsRefreshHandler(() => {
  try {
    saveStandingsHtml();
  } catch (err) {
    console.error("Failed to refresh standings HTML:", err);
  }
  scheduleLiveApiRefresh();
});

/**
 * Send current standings to the API without saving HTML file
 */
export async function sendStandingsToApiOnly(): Promise<boolean> {
  try {
    return generalGameMode === GeneralGameMode.GENERAL_QUALY
      ? await sendQualyToApiWithRetry()
      : await sendStandingsToApiWithRetry();
  } catch (error) {
    console.error("Failed to send standings to API:", error);
    return false;
  }
}

/**
 * Send qualification standings to the API (simplified data)
 */
export async function sendQualyStandingsToApi(): Promise<boolean> {
  try {
    return await sendQualyToApiWithRetry();
  } catch (error) {
    console.error("Failed to send qualy standings to API:", error);
    return false;
  }
}

/**
 * Escape HTML special characters to prevent injection.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>\"']/g, (m) => map[m]);
}
