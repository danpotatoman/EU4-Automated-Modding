// Compatibility import path; canonical owner: brittany_missions.
export * from './contracts/brittany_missions/mission-claim.mjs';
import { missionGeometry as sharedGeometry } from './mission-geometry.mjs';
// Historical callers omitted the Nantes mission ID. New shared API requires it.
export const missionGeometry=(mod,game,mission='bri_nantes_market')=>sharedGeometry(mod,game,mission);
