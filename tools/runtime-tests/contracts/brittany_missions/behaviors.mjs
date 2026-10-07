// Four selected production behaviors; diagnostics remain outside the required suite.
export const behaviors = {
  'preview-gate': ['initial-allowed', 'french-preview-blocked', 'autonomous-preview-blocked', 'locked-allowed', 'final-flags'],
  'shipbuilding-reward': ['empty-before', 'shipyard-granted', 'ship-cost-delta', 'ship-repair-delta',
    'modifier-removed', 'grand-before', 'grand-preserved', 'grand-repair-delta', 'mission-incomplete'],
  'borders-reward': ['unallied-before', 'unallied-dip-plus-50', 'unallied-reputation-one',
    'unallied-modifier-removed', 'allied-before', 'allied-dip-unchanged', 'allied-reputation-one', 'mission-incomplete'],
  'textiles-upgrade': ['buildings-before', 'first-building-branches', 'second-upgrade-and-development',
    'third-development', 'mission-incomplete'],
};
export const requiredTests = Object.keys(behaviors);
export const extractedRewards = {
  bri_breton_shipbuilding: 'bri_shipbuilding_reward_effect',
  bri_secure_the_borders: 'bri_secure_borders_reward_effect',
};
