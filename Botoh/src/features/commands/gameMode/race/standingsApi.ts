import fetch from "node-fetch";
import { positionList } from "./positionList";
import { playerList } from "../../../changePlayerState/playerList";
import { getBestPit } from "../../../tires&pits/trackBestPit";
import { getBestLap } from "../../../zones/laps/trackBestLap";
import { Tires } from "../../../tires&pits/tires";
import { getPlayersOrderedByQualiTime } from "../qualy/playerTime";

export interface ApiStandingsData {
  timestamp: string;
  standings: {
    position: number;
    name: string;
    team: string | null;
    laps: number;
    pits: number;
    bestLap: number;
    gap: string;
    totalTime: number;
    active: boolean;
    currentTire: string;
    tireWear: number;
    lapsOnCurrentTire: number;
  }[];
  bestLap?: {
    playerName: string;
    lapTime: number;
    lapNumber: number;
  };
  bestPit?: {
    playerName: string;
    pitTime: number;
    pitNumber: number;
  };
}

export interface ApiQualyData {
  timestamp: string;
  sessionType: "qualy";
  standings: {
    position: number;
    name: string;
    team: string | null;
    bestLap: number;
    gap: string;
    active: boolean;
    currentTire: string;
  }[];
  bestLap?: {
    playerName: string;
    lapTime: number;
    lapNumber?: number;
  };
}

/**
 * Calculate race gap based on position list order
 * Gap considers laps, sectors, and total time differences
 */
function calculateRaceGap(currentIndex: number): string {
  if (currentIndex === 0) {
    return "+0.00";
  }

  const currentPlayer = positionList[currentIndex];
  const previousPlayer = positionList[currentIndex - 1];

  if (!currentPlayer || !previousPlayer) {
    return "+0.00";
  }

  // Calculate lap difference
  const lapDiff = previousPlayer.lap - currentPlayer.lap;
  
  if (lapDiff > 0) {
    // Player is laps behind
    return `-${lapDiff} lap${lapDiff > 1 ? 's' : ''}`;
  }

  // Same lap, calculate time gap
  if (currentPlayer.lap === previousPlayer.lap) {
    const sectorDiff = previousPlayer.currentSector - currentPlayer.currentSector;
    
    if (sectorDiff > 0) {
      // Player is sectors behind
      return `+${sectorDiff * 2.5}s`; // Approximate sector time
    }
    
    // Same lap and sector, calculate time gap
    const timeGap = currentPlayer.totalTime - previousPlayer.totalTime;
    return `+${Math.abs(timeGap).toFixed(3)}s`;
  }

  return "+0.00";
}

/**
 * Send qualification standings to the haxball-league API (simplified data)
 */
export function createQualyStandingsData(): ApiQualyData {
  const qualyPlayers = getPlayersOrderedByQualiTime();
  return {
    timestamp: new Date().toISOString(),
    sessionType: "qualy",
    standings: qualyPlayers.map((p, idx) => ({
      position: idx + 1,
      name: p.name,
      team: p.team ?? null,
      bestLap: p.time,
      gap:
        idx === 0
          ? "+0.000s"
          : `+${(p.time - qualyPlayers[0].time).toFixed(3)}s`,
      active: true,
      currentTire: playerList[p.id]?.tires ?? Tires.SOFT,
    })),
    bestLap: qualyPlayers[0]
      ? {
          playerName: qualyPlayers[0].name,
          lapTime: qualyPlayers[0].time,
        }
      : undefined,
  };
}

export async function sendQualyToApi(
  qualyData: ApiQualyData = createQualyStandingsData(),
): Promise<boolean> {
  try {
    const response = await fetch("https://haxball-league.vercel.app/api/posiciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(qualyData),
    });

    if (!response.ok) {
      console.error(`Qualy API request failed with status ${response.status}: ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log("Qualy standings sent successfully to API:", result);
    return true;

  } catch (error) {
    console.error("Error sending qualy standings to API:", error);
    return false;
  }
}

/**
 * Send qualification standings to API with retry logic
 */
export async function sendQualyToApiWithRetry(
  maxRetries: number = 3,
  qualyData: ApiQualyData = createQualyStandingsData(),
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendQualyToApi(qualyData);
      if (success) {
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retrying qualy API call... Attempt ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    } catch (error) {
      console.error(`Qualy attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error(`Failed to send qualy standings to API after ${maxRetries} attempts`);
  return false;
}

/**
 * Send race standings to the haxball-league API
 */
export function createRaceStandingsData(): ApiStandingsData {
  const bestLap = getBestLap();
  const bestPit = getBestPit();
  return {
    timestamp: new Date().toISOString(),
    standings: positionList.map((p, idx) => {
      const playerData = playerList[p.id];
      return {
        position: idx + 1,
        name: p.name,
        team: p.team ?? null,
        laps: playerData?.currentLap ?? 0,
        pits: p.pits,
        bestLap: p.time,
        gap: calculateRaceGap(idx),
        totalTime: p.totalTime,
        active: p.active,
        currentTire: playerData?.tires ?? Tires.SOFT,
        tireWear: playerData?.wear ?? 0,
        lapsOnCurrentTire: playerData?.lapsOnCurrentTire ?? 0,
      };
    }),
    bestLap: bestLap ? {
      playerName: bestLap.playerName,
      lapTime: bestLap.lapTime,
      lapNumber: bestLap.lapNumber,
    } : undefined,
    bestPit: bestPit ? {
      playerName: bestPit.playerName,
      pitTime: bestPit.pitTime,
      pitNumber: bestPit.pitNumber,
    } : undefined,
  };
}

export async function sendStandingsToApi(
  standingsData: ApiStandingsData = createRaceStandingsData(),
): Promise<boolean> {
  try {
    const response = await fetch("https://haxball-league.vercel.app/api/posiciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(standingsData),
    });

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}: ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log("Standings sent successfully to API:", result);
    return true;

  } catch (error) {
    console.error("Error sending standings to API:", error);
    return false;
  }
}

/**
 * Send standings to API with retry logic
 */
export async function sendStandingsToApiWithRetry(
  maxRetries: number = 3,
  standingsData: ApiStandingsData = createRaceStandingsData(),
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendStandingsToApi(standingsData);
      if (success) {
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retrying API call... Attempt ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error(`Failed to send standings to API after ${maxRetries} attempts`);
  return false;
}
