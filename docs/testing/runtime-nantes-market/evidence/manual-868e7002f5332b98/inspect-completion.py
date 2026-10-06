"""Scenario evidence reader, from repository root; phase completed or reloaded.

Original saves/logs and all production files are read only. Retains raw excerpts,
hashes and probe failures separately from independent saved-state observations.
"""
from pathlib import Path
import datetime
import hashlib
import json
import re
import shutil
import sys
import zipfile

phase = sys.argv[1] if len(sys.argv) > 1 else 'completed'
assert phase in ['completed', 'reloaded']
root = Path('tools/runtime-tests/work/nantes-manual-20261003T222727038Z-868e7002f5332b98')
evidence = Path(__file__).parent
nonce = '868e7002f5332b98'
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
prep = json.loads((root / 'preparation.json').read_text())
for key, folder in [('sourceManifest', Path('mod/brittany_missions')),
                    ('stagedManifest', root / 'brittany_nantes_manual')]:
    for entry in prep[key]:
        assert digest(folder / entry['path']) == entry['sha256'], entry
for entry in prep['consoleFiles']:
    assert digest(root / 'profile' / entry['file']) == entry['sha256'], entry


def block(s, pattern, offset=0):
    match = re.search(pattern, s[offset:], re.M)
    assert match, pattern
    start = offset + match.start()
    depth = 0
    began = False
    for token in re.finditer(r'"(?:\\.|[^"\\])*"|#[^\r\n]*|[{}]', s[start:]):
        if token.group() == '{':
            depth += 1
            began = True
        elif token.group() == '}':
            depth -= 1
        if began and depth == 0:
            return s[start:start + token.end()]
    raise AssertionError('Unclosed block: ' + pattern)


save = root / f'profile/save games/BRI_nantes_{phase}.eu4'
copies = root / f'checkpoints/{phase}'
copies.mkdir(parents=True, exist_ok=True)
target = copies / save.name
if target.exists():
    assert digest(target) == digest(save), 'Existing snapshot differs'
else:
    shutil.copy2(save, target)
with zipfile.ZipFile(target) as archive:
    meta = archive.read('meta').decode('latin1')
    state = archive.read('gamestate').decode('latin1')
# Latin-1 maps bytes losslessly; preserve exact excerpt bytes, no name reencoding.
(evidence / f'{phase}-meta.txt').write_bytes(meta.encode('latin1'))
assert 'date=1444.11.11' in meta and 'player="BRI"' in meta
assert 'speed=0\n' in state.replace('\r\n', '\n')
campaign = re.search(r'campaign_id="([^"]+)"', meta).group(1)
readiness = json.loads((evidence / 'readiness-check.json').read_text())
predecessor = None
loaded_from = re.search(r'save_game="([^"]+)"', meta).group(1)
if phase == 'completed':
    assert campaign == readiness['checkpoints'][0]['campaignId']
else:
    # Actual reload changed campaign_id. Check explicit saved load provenance,
    # immutable predecessor identity and relevant saved state instead of assuming
    # a campaign UUID is stable. Preserve the original reader failure separately.
    predecessor = json.loads((evidence / 'completed-check.json').read_text())
    assert loaded_from == 'BRI_nantes_completed.eu4', loaded_from
    assert digest(Path(predecessor['savePath'])) == predecessor['sha256']
    assert digest(Path(predecessor['snapshotPath'])) == predecessor['sha256']
assert re.findall(r'"([^"]+)"', block(meta, r'^savegame_versions=\{')) == ['1.37.5.0']
dlcs = re.findall(r'"([^"]+)"', block(meta, r'^dlc_enabled=\{'))
assert set(prep['dlcs']).issubset(dlcs)
mods = block(meta, r'^mods_enabled_names=\{')
assert re.findall(r'filename="([^"]+)"', mods) == ['mod/nantes_manual.mod']
country = block(state, r'^\tBRI=\{', state.index('\ncountries={'))
(evidence / f'{phase}-BRI.txt').write_bytes(country.encode('latin1'))
completed = re.findall(r'"([^"]+)"', block(country, r'^\s*completed_missions=\{'))
assert completed.count('bri_nantes_market') == 1
assert 'bri_breton_textiles' not in completed and 'bri_commerce_missions' in country
flags = ['bri_diplomacy_preview', 'bri_french_sphere_path', 'bri_autonomous_path']
assert all(flag not in country for flag in flags)
provinces = {}
for pid in [169, 172, 4384]:
    province = block(state, rf'^-{pid}=\{{', state.index('\nprovinces={'))
    (evidence / f'{phase}-province-{pid}.txt').write_bytes(province.encode('latin1'))
    assert 'owner="BRI"' in province
    buildings = block(province, r'^\s*buildings=\{')
    assert ('marketplace=yes' if pid == 172 else 'workshop=yes') in buildings
    row = {'owner': 'BRI', 'buildings': re.findall(r'(\w+)=yes', buildings)}
    if pid != 172:
        assert province.count('modifier="bri_demand_for_breton_cloth"') == 1
        modifier = block(province, r'^\s*modifier=\{')
        assert 'modifier="bri_demand_for_breton_cloth"' in modifier and 'date=-1.1.1' in modifier
        variables = block(province, r'^\s*variables=\{')
        for name, value in [('eu4nf_goods', '0.150'), ('eu4nf_goods_before', '0.000'), ('eu4nf_goods_delta', '0.150')]:
            assert f'{name}={value}' in variables
        row.update({'clothEntries': 1, 'clothId': 'bri_demand_for_breton_cloth',
                    'savedExpiry': '-1.1.1', 'goodsValue': 0.150, 'goodsBefore': 0.000,
                    'goodsDelta': 0.150})
    provinces[str(pid)] = row
if predecessor:
    assert provinces == predecessor['provinces'], 'Relevant province state differs'
    assert completed == predecessor['completedMissions'], 'Completed missions differ'
for source in (root / 'profile/logs').glob('*.log'):
    if not source.stem.endswith('_old'):
        shutil.copy2(source, evidence / f'{phase}-{source.name}')
all_lines = (root / 'profile/logs/game.log').read_text(errors='replace').splitlines()
start = next(i for i, line in enumerate(all_lines) if f'EU4NF {nonce} BEGIN {phase}' in line)
end = next(i for i in range(start, len(all_lines)) if f'EU4NF {nonce} END {phase}' in all_lines[i])
lines = [line for line in all_lines[start:end + 1] if nonce in line]
assert len(lines) == 11, lines
assert all('1444.11.11' in line for line in lines)
failures = [line for line in lines if f'EU4NF {nonce} FAIL' in line]
assert all(f'FAIL {phase}-nantes-completed' in line for line in failures), failures
for marker in ['textiles-incomplete', 'fixture-flags-retained', 'value-169', 'delta-169', 'value-4384', 'delta-4384']:
    assert sum(f'OK {phase}-{marker}' in line for line in lines) == 1, marker
if phase == 'reloaded':
    assert not any(f'EU4NF {nonce} BEGIN setup' in line for line in all_lines), 'Setup reran on reload'
result = {'status': 'saved-state-verified-probe-fail' if failures else 'saved-state-and-probes-verified',
          'phase': phase, 'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'nonce': nonce, 'sourceAndStagedAndConsoleHashesUnchanged': True,
          'savePath': save.as_posix(), 'snapshotPath': target.as_posix(),
          'sha256': digest(target), 'bytes': target.stat().st_size,
          'date': '1444.11.11', 'paused': True, 'campaignId': campaign,
          'campaignIdChangedFromInitial': campaign != readiness['checkpoints'][0]['campaignId'],
          'loadedFromSave': loaded_from,
          'predecessorSha256': predecessor['sha256'] if predecessor else None,
          'relevantStateMatchesPredecessor': True if predecessor else None,
          'completedMissions': completed, 'textilesIncomplete': True,
          'selectorFlagsAbsent': True, 'provinces': provinces,
          'observerMarkerCount': len(lines), 'observerMarkers': lines,
          'observerStatus': 'FAIL' if failures else 'PASS', 'observerFailures': failures,
          'failureAttribution': 'mission_completed observer contradicts completed_missions save and operator UI; observation mechanism unresolved, no attributable production contradiction' if failures else None,
          'boundary': 'Save independently proves identity, entries, sentinel expiry, completion and retained fixture. Numeric values/deltas corroborated by newly dispatched observer. UI action/readiness/once-only and actual reload require separately retained operator observations.'}
(evidence / f'{phase}-check.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status': result['status'], 'phase': phase, 'saveSha256': result['sha256'],
                  'completedMissions': completed, 'observerFailures': failures, 'hashesUnchanged': True}))
