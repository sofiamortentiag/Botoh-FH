import { playerList } from "../../../changePlayerState/playerList";
import { getRunningPlayers, vectorSpeed } from "../../../utils";

export interface LiveTelemetryDriver {
  id: number;
  name: string;
  team: string | null;
  speed: number;
  currentLap: number;
  currentSector: number;
  currentLapTime: number;
  currentSectorTime: number;
  lastLapTime: number | null;
  bestLapTime: number | null;
  bestSectorTimes: number[];
  tire: string;
  tireWear: number;
  lapsOnCurrentTire: number;
  drs: boolean;
  ers: number;
  fuel: number;
  inPitlane: boolean;
}

export interface RadioTarget {
  id: number;
  name: string;
  team: string | null;
  spectator: boolean;
}

export type RaceControlBannerKind = "hotlap" | "record" | "yellow" | "green";

export interface RaceControlBanner {
  id: string;
  kind: RaceControlBannerKind;
  title: string;
  detail: string;
  createdAt: number;
  expiresAt: number | null;
}

export interface RaceRadioMessage {
  id: string;
  sender: string;
  target: string;
  message: string;
  createdAt: number;
}

let telemetry: LiveTelemetryDriver[] = [];
let radioTargets: RadioTarget[] = [];
let currentBanner: RaceControlBanner | null = null;
let latestRadio: RaceRadioMessage | null = null;

export function captureLiveRaceData(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject | null }[],
  room: RoomObject,
) {
  telemetry = getRunningPlayers(
    playersAndDiscs.filter(
      (player): player is { p: PlayerObject; disc: DiscPropertiesObject } =>
        player.disc !== null,
    ),
  ).flatMap(({ p, disc }) => {
    const data = playerList[p.id];
    if (!data) return [];

    return [{
      id: p.id,
      name: p.name,
      team: data.leagueScuderia,
      speed: vectorSpeed(disc.xspeed, disc.yspeed),
      currentLap: data.currentLap,
      currentSector: data.currentSector,
      currentLapTime: data.lapTime,
      currentSectorTime: data.sectorTimeCounter,
      lastLapTime: data.lapTimes.length ? data.lapTimes[data.lapTimes.length - 1] : null,
      bestLapTime:
        Number.isFinite(data.bestTime) && data.bestTime < Number.MAX_VALUE
          ? data.bestTime
          : null,
      bestSectorTimes: data.bestSectorTimes.map((time) =>
        Number.isFinite(time) && time < Number.MAX_VALUE ? time : 0,
      ),
      tire: String(data.tires),
      tireWear: data.wear,
      lapsOnCurrentTire: data.lapsOnCurrentTire,
      drs: data.drs,
      ers: data.kers,
      fuel: data.gas,
      inPitlane: data.inPitlane,
    }];
  });

  radioTargets = room.getPlayerList()
    .filter((player) => player.id > 0)
    .map((player) => ({
      id: player.id,
      name: player.name,
      team: playerList[player.id]?.leagueScuderia ?? null,
      spectator: player.team === 0,
    }));
}

export function getLiveTelemetry() {
  return telemetry;
}

export function getRadioTargets() {
  return radioTargets;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function publishRaceControlBanner(
  kind: RaceControlBannerKind,
  title: string,
  detail: string,
) {
  const now = Date.now();

  // A yellow flag occupies the broadcast banner until green is called.
  if (currentBanner?.kind === "yellow" && kind !== "green" && kind !== "yellow") {
    return;
  }

  currentBanner = {
    id: makeId(),
    kind,
    title,
    detail,
    createdAt: now,
    expiresAt: kind === "yellow" ? null : now + 10_000,
  };
}

export function clearRaceControlBanner() {
  currentBanner = null;
}

export function publishRaceRadio(
  sender: string,
  target: string,
  message: string,
) {
  latestRadio = {
    id: makeId(),
    sender,
    target,
    message,
    createdAt: Date.now(),
  };
}

export function getRaceControlState() {
  if (currentBanner?.expiresAt && Date.now() >= currentBanner.expiresAt) {
    currentBanner = null;
  }

  return {
    banner: currentBanner,
    lastRadio: latestRadio,
  };
}
