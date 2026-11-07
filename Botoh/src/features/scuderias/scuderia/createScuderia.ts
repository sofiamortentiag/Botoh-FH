import type { leagueScuderia, ScuderiaSeries } from "../scuderias";

/** Creates a neutral team profile, matching the baseline used by existing teams. */
export function createScuderia(
  name: string,
  tag: string,
  color: number,
  series: ScuderiaSeries,
): leagueScuderia {
  return {
    name,
    tag,
    color,
    series,
    engine: {
      name: `${name} Engine`,
      initialAccelerationNerf: 0,
      medialAccelerationNerf: 0,
      finalAccelerationNerf: 0,
      topSpeedBoostNerf: 0,
      confiability: 100,
    },
    chassis: {
      name: `${name} Chassis`,
      accelerationNerf: 0,
      slipstreamNerf: 0,
      dirtyAirBoost: 0,
      confiability: 100,
    },
    batery: {
      name: `${name} Batery`,
      ERSConsputionReduction: 0,
      ERSSpeedBoost: 0,
      ERSChargeBoost: 0,
      confiability: 100,
    },
    suspension: {
      name: `${name} Suspension`,
      tyreDurabilityBoost: 0,
      tyreSpeedDegradatedBoost: 0,
      peakTimeBoost: 0,
      warmUpTimeBoost: 0,
      tyreBlowoutChanceReduction: 0,
      confiability: 100,
    },
    pitCrew: {
      name: `${name} Pit Crew`,
      errorChanceReduction: 0,
      fastPitChanceBoost: 0,
      normalPitSpeedTimeBoost: 0,
    },
  };
}
