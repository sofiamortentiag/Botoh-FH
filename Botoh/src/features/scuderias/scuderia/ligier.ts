import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const LigierEngine: Engine = {
  name: 'Ligier Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const LigierChassis: Chassis = {
  name: 'Ligier Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const LigierBatery: Batery = {
  name: 'Ligier Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const LigierSuspension: Suspension = {
  name: 'Ligier Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const LigierPitCrew: PitCrew = {
  name: 'Ligier Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Ligier: leagueScuderia = {
  name: 'Ligier',
  tag: 'LIG',
  color: ScuderiaColors.LIGIER,
  engine: LigierEngine,
  chassis: LigierChassis,
  batery: LigierBatery,
  suspension: LigierSuspension,
  pitCrew: LigierPitCrew,
};
