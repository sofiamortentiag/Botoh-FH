import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const ToyotaEngine: Engine = {
  name: 'Toyota Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const ToyotaChassis: Chassis = {
  name: 'Toyota Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const ToyotaBatery: Batery = {
  name: 'Toyota Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const ToyotaSuspension: Suspension = {
  name: 'Toyota Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const ToyotaPitCrew: PitCrew = {
  name: 'Toyota Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Toyota: leagueScuderia = {
  name: 'Toyota',
  tag: 'TOY',
  color: ScuderiaColors.TOYOSSI,
  engine: ToyotaEngine,
  chassis: ToyotaChassis,
  batery: ToyotaBatery,
  suspension: ToyotaSuspension,
  pitCrew: ToyotaPitCrew,
};