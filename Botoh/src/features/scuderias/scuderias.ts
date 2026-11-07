import { Batery } from "./batery";
import { Chassis } from "./chassis";
import { Engine } from "./engine";
import { PitCrew } from "./pitstop";
import { AstonMaia } from "./scuderia/astonMaia";
import { Bracchiari } from "./scuderia/bracchiari";
import { Penshiryu } from "./scuderia/penshiryu";
import { ScuderiaColors } from "./scuderiaColours";
import { Suspension } from "./tyres";
import { Genske } from "./scuderia/genske";
import { Gorsche } from "./scuderia/gorsche";
import { Hispalis } from "./scuderia/hispalis";
import { Lotus } from "./scuderia/lotus";
import { Toyota } from "./scuderia/toyota";
import { Ferrari } from "./scuderia/ferrari";
import { Cadillac } from "./scuderia/cadillac";
import { Ligier } from "./scuderia/ligier";
import { Hrt } from "./scuderia/hrt";
import { Williams } from "./scuderia/williams";
import { Formula2 } from "./scuderia/f2";
import { Gt } from "./scuderia/gt";
import { Lmdh } from "./scuderia/lmdh";
import { Audi } from "./scuderia/audi";
import { AstonMartin } from "./scuderia/astonMartin";
import { Schmidt } from "./scuderia/schmidt";
import { Genesis } from "./scuderia/genesis";
import { Manthey } from "./scuderia/manthey";
import { JiRen } from "./scuderia/jiren";
import { Hitech } from "./scuderia/hitech";
import { Campos } from "./scuderia/campos";
import { Invicta } from "./scuderia/invicta";
import { Rodin } from "./scuderia/rodin";
import { TF } from "./scuderia/tf";
import { AF } from "./scuderia/af";
import { Garage59 } from "./scuderia/garage59";
import { TeamWRT } from "./scuderia/teamWrt";
import { Prema } from "./scuderia/prema";

export type ScuderiaSeries = "WEC" | "F2";

export interface leagueScuderia {
  name: string;
  tag: string;
  color: number;
  engine?: Engine;
  chassis?: Chassis;
  batery?: Batery;
  suspension?: Suspension;
  pitCrew?: PitCrew;
  series?: ScuderiaSeries;
}

export const leagueScuderia: { [key: string]: leagueScuderia } = {
  //  Penshiryu,
  AstonMaia,
  // McLarper,
  // Bracchiari,
  // Haax: {
  //   name: "Haax",
  //   tag: "HX",
  //   color: ScuderiaColours.HAAX,
  // },
  // MotorForce: {
  //   name: "BMW MotorForce",
  //   tag: "MF",
  //   color: ScuderiaColours.MOTORFORCE,
  // },
  // SART: {
  //   name: "SART",
  //   tag: "SA",
  //   color: ScuderiaColours.SART,
  // },
  // Konardi: {
  //   name: "Konardi",
  //   tag: "KO",
  //   color: ScuderiaColours.KONARDI,
  // },
  // LenaultMoreo: {
  //   name: "Lenaut Moreo",
  //   tag: "LM",
  //   color: ScuderiaColours.LENAULTMOREO,
  // },
  // Questi: {
  //   name: "Questi",
  //   tag: "QE",
  //   color: ScuderiaColours.QUESTI,
  // },
  // Sixdent: {
  //   name: "Sixdent",
  //   tag: "SX",
  //   color: ScuderiaColours.SIXDENT,
  // },
  // JeanBorghini: {
  //   name: "JeanBorghini",
  //   tag: "JB",
  //   color: ScuderiaColours.JEANBORGHINI,
  // },
  // Pejo: {
  //   name: "Pejo",
  //   tag: "PJ",
  //   color: ScuderiaColours.PEJO,
  // },
  // Brawndesco: {
  //   name: "Brawndesco",
  //   tag: "BW",
  //   color: ScuderiaColours.BRAWNDESCO,
  // },
  // Interforce: {
  //   name: "BMW Interforce",
  //   tag: "IF",
  //   color: ScuderiaColours.INTERFORCE,
  // },
  // Alpino: {
  //   name: "Alpino",
  //   tag: "AP",
  //   color: ScuderiaColours.ALPINO,
  // },
  // Toyossi: {
  //   name: "BMW Toyossi",
  //   tag: "TY",
  //   color: ScuderiaColours.TOYOSSI,
  // },
  // BMW: {
  //   name: "Swiss BMW",
  //   tag: "BM",
  //   color: ScuderiaColours.BMW,
  // },
  // Bracchiari: {
  //   name: "Bracchiari",
  //   tag: "SB",
  //   color: ScuderiaColours.BRACCHIARI,
  // },

  // PHM: {
  //   name: "PHM FAX",
  //   tag: "PH",
  //   color: ScuderiaColours.PHM,
  // },*/
  Genske,
  Gorsche,
  Hispalis,
  Lotus,
  Toyota,
  Ferrari,
  Cadillac,
  Ligier,
  Hrt,
  Williams,
  Formula2,
  Gt,
  Lmdh,
  Audi,
  AstonMartin,
  Schmidt,
  Genesis,
  Manthey,
  JiRen,
  Hitech,
  Campos,
  Invicta,
  Rodin,
  TF,
  AF,
  Garage59,
  TeamWRT,
  Prema,
};
