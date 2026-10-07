# American Century

Owner: mod/american_century
Documentation ownership updated: 2026-10-06

Design adoption and implementation authorization remain as recorded below. Current
implementation/coverage belong in [status](STATUS.md) and [testing](testing/README.md).

Status: adopted design; first vertical slice implemented and bounded native
contracts verified, 2026-10-04. Branch expansion and natural campaign remain active.
The user's 2026-10-04 request authorizes implementation within this direction.
Execution state: [plan](../../../.agent/plans/2026-10-04-american-century.md).

## Goal, compatibility and campaign

English colonization -> American colonies -> independence -> continental republic
-> industrial powerhouse -> hemispheric hegemon -> global superpower. Aim for
**55 USA missions across five columns**, plus three colonial missions and two
English preparation decisions. Only the slice marked below is initially production
content; the remaining rows are implementation specifications, not shipped missions.

Target installed EU4 **1.37.5.0 Inca (491d)**, normal map, non-Ironman tests and
[default 18 DLC](../../testing/environment.md). Descriptor metadata uses `1.37.*`;
other versions, minimal DLC, multiplayer and random New World are unverified.
American Dream is not required: its American/Federal Republic reforms and
`usa_dlc` events are not dependencies. Optional vanilla events remain untouched.
Native slice saves recorded 21 enabled DLC, including all required 18 plus Art of
War, Common Sense and Rights of Man. Exactly-18-only compatibility is still open.

Start England in 1444. Use its existing DLC-dependent English/British missions,
Exploration/Expansion and ordinary colonization to create an eastern-American CN.
Our additive decisions reward a foothold and sponsor a mature colonial society;
they do not overwrite England's large Domination/Rule Britannia mission grids.
The CN receives three origin missions, retained after independence until formation.
Play it through vanilla release-and-play (peaceful transition) or the supported
colonial play/independence-war route. Both are valid; an independence war is not
mandatory for recognition. Native historical rebellion is a later alternative,
not a 1750 gate imposed by this mod.

Form USA using the **unchanged vanilla decision**: ADM 10, independent and at peace,
ten eastern-American cities, core capital there, USA absent. Vanilla changes tag,
American culture where British, national ideas offer, rank and mission swap. The
custom USA tree replaces only `USA_Missions.txt` with a comment-only override and
five non-generic USA series. No vanilla formation/event files are replaced.

## Geography, tone and architecture

Area/region membership follows installed `map/area.txt`, `map/region.txt` and
`common/colonial_regions/00_colonial_regions.txt`. Continental objectives count
owned/core cities and selected areas; never demand all uncolonized wasteland or
Canadian/Alaskan/Mexican provinces merely because a broad EU4 region includes them.
California uses California/Central Valley/Northern California areas, Oregon uses
Oregon/Columbia River, Florida uses Florida/North Florida. Mississippi is an
integrated basin rather than a literal Louisiana Purchase border.

Native nations remain actors. A diplomacy/accepted-culture route accompanies
expansion goals; there is no reward for extermination or converting every native
province. Text explicitly acknowledges disputed sovereignty and displacement.
Political liberty does not imply historical equality: constitutional and immigration
flavor acknowledges exclusion, and a later emancipation event addresses slavery.

Unique prefix `amc_`, event namespace `amc`, ASCII script/UTF-8 BOM English YAML.
Explicit grid positions, readable vanilla icons, all `required_missions` declared.
Use scripted triggers for reused readiness predicates and conditional effects for
choices; simple rewards stay inline. AI can complete missions; political options
have weights. No AI testing claim until native observation.

## Colonial runway (first slice)

| ID / name | Conditions / parent | Reward |
| --- | --- | --- |
| `amc_atlantic_foothold` decision, An Atlantic Foothold | ENG/GBR; peace; 3 owned or subject-held eastern-American cities | 15 years +20 settlers/year; once-only flag |
| `amc_sponsor_assembly` decision, Sponsor Colonial Assemblies | Foothold; eastern-American CN with 10 cities | CN capital +1 tax/+1 manpower; 20-year -10% development cost for eligible CNs; flag; release/play and formation instructions |
| `amc_new_shores`, New Shores | British-culture eastern-American CN/former CN; 5 cities | 15-year +20 settlers/year |
| `amc_colonial_ports`, Ports of the Atlantic | New Shores; 2 eastern-American trade buildings | 15-year +10% trade efficiency; 50 DIP |
| `amc_assembly`, An American Assembly | Ports; 10 cities; stability 1 | 50 ADM; 50 reform progress; formation conditions explained |

## USA tree specification

Positions are column.row. Counts refer to owned city provinces unless specified.
Early modifiers last 15–20 years; permanent effects explicitly say permanent.
IDs are `amc_` plus the snake-case title listed in production (later IDs assigned
at implementation). All thresholds/rewards below are adopted targets; mechanics
not yet verified against vanilla must be checked before each branch is implemented.
Parent shorthand refers to the mission title; cross-links are intentional.

| Grid / mission | Parents | Requirements | Rewards |
| --- | --- | --- | --- |
| 1.1 A Continental Foothold **slice** | — | 10 eastern-American core cities | Permanent claims in Mississippi; 100 DIP |
| 1.2 The Mississippi Road | Foothold | 8 Mississippi core cities | Basin local -10% development cost 20 years; Florida/Texas claims |
| 1.3 The Florida Question | Mississippi | 5 cities in Florida/North Florida | Ports +1 production; permanent +10% sailor recovery |
| 1.4 The Lone Star | Florida | 6 Texas/Texas Plains core cities | Plains/Oregon claims; 150 MIL |
| 1.5 Beyond the Rockies | Lone Star | 12 core cities in selected Plains/Rockies areas | 20-year -15% construction cost; western survey event |
| 1.6 Oregon Country | Rockies | 6 Oregon/Columbia River cities | Permanent +25 settlers/year; California claims |
| 1.7 The Golden State | Oregon | 10 California core cities; 2 production buildings | Permanent +10% goods produced; 3 western cities +2 production |
| 1.8 From Sea to Shining Sea | Golden State, Internal Market | 60 NA core cities, both coastal networks | Permanent +20% governing capacity, -10% state maintenance |
| 1.9 A Union of States | Sea to Sea, More Perfect Union | 1,500 NA development; 20 courthouses; average autonomy <=15% | Permanent -10% minimum autonomy in territories, +10 states |
| 1.10 The Continental Republic | Union of States, Federal Roads | 2,000 NA development; stability 3; peace | Permanent -10% core cost, +20% manpower recovery, -10% development cost |
| 1.11 The American Century (shared finale) | Five column capstones | GP rank 1; income 1,000; tech 30/30/30; 3,000 development; stability 3 | Permanent +20% admin efficiency, +20% goods produced, +1 merchant, +1 leader fire/siege; 100 prestige |
| 2.1 Citizen Soldiers **slice** | — | 10 regiments; army tradition 20 | 15-year -10% infantry cost, +15% manpower recovery; 100 MIL |
| 2.2 Nations and Neighbors | Citizen Soldiers, Federal Compact | NA native ally with opinion 100 OR 2 accepted NA native cultures; 5 integrated core cities | Permanent +1 accepted culture, +1 diplomatic reputation; treaty event explains sovereignty |
| 2.3 The Continental Army | Neighbors | 30 regiments; tradition 40; professionalism 20% | Permanent +10% infantry combat ability, -10% regiment drill loss |
| 2.4 West Point | Continental Army | MIL 16; 3 barracks/training fields; professionalism 40% | Permanent +1 leader siege, +10% army tradition from battles |
| 2.5 Supply Across a Continent | West Point, Federal Roads | 50 regiments; 8 forts; 15,000 manpower | Permanent -15% land attrition, +25% supply limit |
| 2.6 Arsenal of the Republic | Supply, Arsenal of Industry | 15 weapon manufactories; MIL 22 | Permanent +15% artillery combat ability, -15% artillery cost |
| 2.7 No Foreign Master | Arsenal, Sea to Sea | independent; 100 prestige; 60 regiments; peace | 20-year +10% morale; permanent +1 leader fire |
| 2.8 An Expeditionary Army | No Master, Ocean Roads | 80 regiments; footholds in 2 other continents | Permanent -15% reinforcement cost, +20% movement speed |
| 2.9 Command of the Battlefield | Expeditionary Army | tradition 70; professionalism 80%; 120 regiments | Permanent +5% discipline, +1 leader shock, -10% fire damage received |
| 2.10 Defender of the Republic | Battlefield, Union of States | MIL 29; 250,000 manpower; 150 regiments | Permanent +15% morale, +15% fire damage, +25% manpower |
| 3.1 Liberty at Last **slice** | — | independent; peace; core NA capital | 100 reform progress; 20 prestige; 20-year -1 unrest/-10% stability cost |
| 3.2 The Federal Compact **slice** | Liberty | stability 1; ADM 10; 10 eastern core cities | Constitutional event: republic conversion and one permanent institutional choice |
| 3.3 A More Perfect Union **slice** | Compact | republic; choice flag; stability 2; tradition 70 | Permanent +0.3 tradition/year, +10% reform progress growth |
| 3.4 Federal Roads | Union, Open Doors | 12 workshops; 6 courthouses; ADM 16 | Permanent -15% construction time, -10% construction cost |
| 3.5 Public Credit | Federal Roads | 500 treasury; no loans; inflation <2%; 5 churches | Permanent -0.5 interest, +10% tax; 100 ADM |
| 3.6 The Unfinished Promise | Public Credit | stability 2; ADM 20; tradition 80 | Emancipation event; abolish slavery through verified vanilla pattern; permanent -1 unrest |
| 3.7 A Republic of Learning | Promise, Workshop Republic | ADM/DIP/MIL 23; 5 universities | Permanent -10% technology cost, +20% institution spread |
| 3.8 The Federal Service | Learning | 15 town halls; 60 core cities | Permanent +20% governing capacity, -10% governing cost |
| 3.9 Government by Consent | Service, Nations/Neighbors | tradition 90; stability 3; no unrest in 20 developed cities | Permanent +0.5 tradition/year, -15% advisor cost, +1 possible policy |
| 3.10 The Durable Republic | Consent, Continental Republic | ADM 29; 2,500 development; tradition 90 | Permanent -15% stability cost, -15% advisor cost, -10% province warscore cost |
| 4.1 Free Harbors **slice** | — | core coastal NA capital; trade building | Permanent capital +15% local trade power; 50 DIP |
| 4.2 Open Doors **slice** | Harbors, Compact | 3 eastern core cities at 10 development; stability 1 | Capital +2 manpower; 20-year +25 settlers, -10% development cost |
| 4.3 A Workshop Republic **slice** | Open Doors | 5 eastern core cities with workshop/counting house | Permanent +10% production efficiency, +5% goods produced |
| 4.4 An Internal Market | Workshop, Mississippi | 15 trade buildings; DIP 16; 50% home-node trade share | Permanent +1 merchant, +10% domestic trade power |
| 4.5 The Mill Towns | Market | 8 textile manufactories; 5 eastern 25-dev cities | Permanent +10% goods produced; local manufacturing hubs |
| 4.6 Arsenal of Industry | Mill Towns, Public Credit | 20 manufactories; 600 development; income 150 | Permanent -15% manufactory cost, +15% production efficiency |
| 4.7 The National Bank | Arsenal | treasury 2,000; zero loans; inflation <2%; 8 counting houses | Permanent -1 interest, +15% trade efficiency |
| 4.8 Engines of Prosperity | Bank, Golden State | 40 manufactories; income 400; embraced manufactories | Permanent +20% goods produced, -15% development cost |
| 4.9 The World's Workshop | Engines | 60 manufactories; 12 40-dev cities; income 650 | Permanent +20% production efficiency, -15% construction cost |
| 4.10 An Industrial Colossus | World Workshop, Learning | 80 manufactories; income 900; ADM/DIP 29; 2,000 development | Permanent +25% goods produced, +20% production efficiency, -10% technology cost |
| 5.1 Guard the Coast **slice** | — | 10 ships; 3 core NA ports | 15-year -10% ship cost/+20% repair; 50 naval tradition |
| 5.2 A Republic at Sea | Coast, Harbors | 20 light ships; 6 shipyards; DIP 15 | Permanent +20% naval force limit; +1 admiral maneuver |
| 5.3 Caribbean Watch | Republic at Sea, Florida | 5 Caribbean ports owned/subject; 40% Caribbean share | Permanent +15% ship trade power; Mexico/Caribbean selective claims |
| 5.4 The Monroe Doctrine | Watch, No Foreign Master | GP; no foreign-owned provinces in eastern-American core areas; 50 ships | Permanent +1 diplomat, +20% improve relations; hemisphere diplomacy event |
| 5.5 An American Neighborhood | Monroe | 3 independent allied American capitals OR 3 American subjects; 150 relations | Permanent -15% subject liberty desire, +2 diplomatic relations |
| 5.6 Two Ocean Fleets | Neighborhood, Golden State | 30 heavy ships; 10 Atlantic/Pacific ports; tradition 40 | Permanent +15% heavy combat ability, -15% naval attrition |
| 5.7 The Ocean Roads | Fleets | owned ports in Europe/Africa/Asia; 80 ships | Permanent +25% naval engagement width, +1 merchant |
| 5.8 Hemispheric Primacy | Roads, Industrial Engines | GP rank <=3; 1,800 Americas development; 5 American alliances/subjects | Permanent +20% trade steering, +2 diplomatic reputation |
| 5.9 A Seat at Every Table | Primacy, Federal Service | GP rank <=2; 60% home trade; outside-Americas ally; 100 prestige | Permanent +1 diplomat, +20% global trade power, -10% warscore cost |
| 5.10 Master of the Oceans | Seat, Battlefield | 60 heavies; navy tradition 70; DIP 29; ports on 4 continents | Permanent +20% naval morale, +15% heavy combat ability, -15% ship cost |

The grid has 51 listed USA objectives (five ten-mission columns plus shared finale).
Four further interleaved objectives will bring the target to 55: Atlantic Recognition
(Liberty/Harbors: 2 European allies or prestige 60; +1 diplomat for 20 years),
Land and Liberty (Neighbors/Mississippi: 15 integrated native-culture core cities;
permanent -5 years separatism), A Nation of Arrivals (Open Doors/Mill Towns:
eight accepted cultures and 10 25-dev cities; permanent -10% development cost),
and Pacific Commerce (Two Ocean Fleets/Engines: 50% California trade, Asian port;
permanent +15% trade efficiency). Final row positions/arrow layout will be adjusted
when these are implemented, preserving short readable cross-links.

## Permanent reward budget and choices

Economic branch capstone totals intentionally exceed vanilla: approx +75% goods
produced and +65% production efficiency through earned industrial milestones,
plus targeted construction/finance/technology tools. Naval totals build engagement,
repair, range and heavy-ship quality. Military bonuses require industry and global
reach. Only the final century gives administrative efficiency; no all-power-cost
blanket reward. Balance must be tested at milestones, including stacking with ideas.

The compact event offers **enumerated federal powers** (+10% governing capacity,
-10% state maintenance) or **local guarantees** (+1 accepted culture, -1 unrest).
Both convert monarchy to base `oligarchy_reform` republic if needed, grant 10
tradition and set mutually exclusive flags. These are institutional emphases, not
an autocracy/liberty toggle. Reform is vanilla oligarchy mechanically; localization
must not pretend this implements a custom constitution government reform.

## Phases and test strategy

1. Reconnaissance/design and pattern guide before production.
2. First slice: colonial runway; nine marked USA missions; full localization;
   empty vanilla-USA override; descriptors; static validation and grid check.
3. Extend existing runner for a USA profile/fixture and data-driven mission input.
   Prove vanilla decision formation and swap via actual UI where feasible;
   independent USA readiness, real claims, event choice, rewards, negative state,
   downstream/unrelated state and native save checkpoints.
4. Continental + native diplomatic branches; targeted native area/claim tests.
5. Republic/immigration/industrial expansion, event choices and modifier arithmetic.
6. Navy/hemisphere/military/global branches, quantitative permanent-reward probes.
7. Integrated England->CN->USA campaign, real independence war, reload/AI checks,
   release descriptors and full tree playtest. No release-ready claim before this.

Reuse shared validation/layout/collector/lifecycle; extend the bounded real-input
driver instead of creating separate automation. Fixture effects never grant mission
rewards or complete missions. Save oracle checks actual player/version/DLC/mod,
series, completed IDs, modifier identity/count/expiry, culture/reform, development
and unexpected rewards. Negative/readiness transitions need actual UI inspection;
no console readiness/completion query is treated as authoritative.

## Open questions and evidence boundaries

- Natural colonial mission assignment and release/play flag persistence,
  independent-CN visibility and that route's formation swap need native proof.
  Overseas-English vanilla-decision formation/idea offer/USA grid swap are verified.
- The formation fixture models an overseas English country rather than playing
  years of colonization; it does not establish the complete campaign route.
- Accepted-native-culture classification, foreign great-power ownership tests,
  policy limits and exact modifier IDs in future branches require vanilla review.
- Four real claims, numerical rewards, independent negative readiness and ordinary
  save/reload are verified for the slice's enumerated-powers path. The separate
  [2026-10-07 constitutional fixture](../../testing/mods/american_century/local-guarantees-2026-10-07/README.md)
  proves real Local Guarantees -> Union claims, exact permanent rewards, 60 -> 70
  tradition readiness and paused reload. Elapsed accrual, expiry, other roots, AI
  and dynamic scrolling need independent scenarios.
  Existing real-input proof uses one observed window geometry.
- Final border/count requirements deliberately avoid indiscriminate region conquest.
- Latest implementation/evidence: [USA playtests/status](../../testing/american-century/README.md).
