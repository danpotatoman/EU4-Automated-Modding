"""Read-only native checkpoint inspection; run from the repository root.

Copies saves into ignored work and retains exact-byte save excerpts as evidence.
No game or original checkpoint mutation. This is scenario-specific, not a runner.
"""
from pathlib import Path
import datetime
import hashlib
import json
import re
import shutil
import zipfile

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


checks = []
copies = root / 'checkpoints/readiness'
copies.mkdir(parents=True, exist_ok=True)
for label in ['unready', 'ready']:
    save = root / f'profile/save games/BRI_nantes_{label}.eu4'
    target = copies / save.name
    if target.exists():
        assert digest(target) == digest(save), 'Existing snapshot differs'
    else:
        shutil.copy2(save, target)
    with zipfile.ZipFile(target) as archive:
        meta = archive.read('meta').decode('latin1')
        state = archive.read('gamestate').decode('latin1')
    # Latin-1 is a lossless byte mapping, not a claim about EU4 name encoding.
    (evidence / f'{label}-meta.txt').write_bytes(meta.encode('latin1'))
    assert 'date=1444.11.11' in meta and 'player="BRI"' in meta
    assert 'speed=0\n' in state.replace('\r\n', '\n')
    dlcs = re.findall(r'"([^"]+)"', block(meta, r'^dlc_enabled=\{'))
    assert set(prep['dlcs']).issubset(dlcs)
    mods = block(meta, r'^mods_enabled_names=\{')
    assert re.findall(r'filename="([^"]+)"', mods) == ['mod/nantes_manual.mod']
    country = block(state, r'^\tBRI=\{', state.index('\ncountries={'))
    (evidence / f'{label}-BRI.txt').write_bytes(country.encode('latin1'))
    assert 'bri_commerce_missions' in country
    assert 'bri_nantes_market' not in country and 'bri_breton_textiles' not in country
    flags = ['bri_diplomacy_preview', 'bri_french_sphere_path', 'bri_autonomous_path']
    assert all(flag not in country for flag in flags)
    provinces = {}
    for pid in [169, 172, 4384]:
        province = block(state, rf'^-{pid}=\{{', state.index('\nprovinces={'))
        (evidence / f'{label}-province-{pid}.txt').write_bytes(province.encode('latin1'))
        assert 'owner="BRI"' in province
        assert 'bri_demand_for_breton_cloth' not in province
        buildings = block(province, r'^\s*buildings=\{') if re.search(r'^\s*buildings=\{', province, re.M) else ''
        if pid in [169, 4384]:
            assert 'workshop=yes' in buildings
            assert 'eu4nf_goods=0.000' in province
            assert 'eu4nf_goods_before=0.000' in province
        else:
            for building in ['marketplace', 'trade_depot', 'stock_exchange']:
                assert (f'{building}=yes' in buildings) == (label == 'ready' and building == 'marketplace')
        provinces[str(pid)] = {'name': re.search(r'\bname="([^"]+)"', province).group(1),
                               'owner': 'BRI', 'buildings': re.findall(r'(\w+)=yes', buildings),
                               'clothIdPresent': False}
    checks.append({'label': label, 'savePath': save.as_posix(), 'snapshotPath': target.as_posix(),
                   'sha256': digest(target), 'bytes': target.stat().st_size,
                   'date': '1444.11.11', 'paused': True, 'player': 'BRI',
                   'campaignId': re.search(r'campaign_id="([^"]+)"', meta).group(1),
                   'saveVersion': '1.37.5.0', 'dlcs': dlcs, 'provinces': provinces,
                   'commerceSeriesSaved': True, 'missionIdsAbsentFromCountry': True,
                   'selectorFlagsAbsent': True})
assert checks[0]['campaignId'] == checks[1]['campaignId']
log = root / 'profile/logs/game.log'
shutil.copy2(log, evidence / 'ready-game.log')
all_lines = log.read_text(errors='replace').splitlines()
start = next(i for i, line in enumerate(all_lines) if f'EU4NF {nonce} BEGIN ready' in line)
end = next(i for i in range(start, len(all_lines)) if f'EU4NF {nonce} END ready' in all_lines[i])
lines = [line for line in all_lines[start:end + 1] if nonce in line]
expected = ['BEGIN ready', 'OK marketplace-added', 'OK ready-fixture-only', 'OK ready-value-169',
            'OBS ready-named-169 query-false', 'OK ready-value-4384',
            'OBS ready-named-4384 query-false', 'END ready']
assert len(lines) == len(expected), lines
for line, marker in zip(lines, expected):
    assert '1444.11.11' in line and line.endswith(f'EU4NF {nonce} {marker}'), (line, marker)
result = {'status': 'readiness-verified-awaiting-ordinary-completion',
          'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'nonce': nonce, 'sourceAndStagedAndConsoleHashesUnchanged': True,
          'checkpoints': checks, 'readyMarkerCount': len(lines), 'readyMarkers': lines,
          'operatorReport': 'Nantes unavailable due to missing trade building, then marketplace present and mission ready after run nantes_ready.txt. Cloth for Sail parent blocked before and after. No unpause or refresh; 11 November 1444. Both requested save names used.',
          'readinessVerified': True, 'ordinaryCompletionVerified': False,
          'boundary': 'UI readiness is an operator report corroborated by native fixture/save evidence. Absent mission IDs are saved-state observations, not an independent readiness oracle. DLC metadata lists 21 names: all 18 specified DLC plus Art of War, Common Sense and Rights of Man. No additional compatibility claim is inferred.'}
(evidence / 'readiness-check.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status': result['status'], 'saveHashes': [x['sha256'] for x in checks],
                  'readyMarkers': len(lines), 'unchangedHashes': True}))
