import { lapPositions } from "../handleLapChange";

export function registerLapPosition(
  p: PlayerObject,
  lapIndex: number,
  currentLap: number,
  lapTime: number
): number {
  // WEC sessions are time-based and can exceed the configured lap target.
  // Grow the per-lap history as drivers complete additional laps.
  lapPositions[lapIndex] ??= [];
  return lapPositions[lapIndex].push({
    id: p.id,
    name: p.name,
    currentLap,
    time: lapTime,
  });
}
