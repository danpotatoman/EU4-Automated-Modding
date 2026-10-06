param(
    [ValidateSet('Snapshot','Stop','Suspend')][string]$Action = 'Snapshot',
    [int]$OwnedId,
    [string]$Created,
    [string]$Executable,
    [ValidateRange(0,5)][int]$GraceSeconds = 0
)
$ErrorActionPreference = 'Stop'
if ($Action -eq 'Snapshot') {
    $records = @(Get-CimInstance Win32_Process | ForEach-Object {
        [pscustomobject]@{ pid = [int]$_.ProcessId; parentPid = [int]$_.ParentProcessId;
            created = $_.CreationDate.ToUniversalTime().ToString('o');
            name = $_.Name; executable = $_.ExecutablePath; command = $_.CommandLine;
            windowHandle = $(if ($_.Name -eq 'eu4.exe') {
                (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue).MainWindowHandle.ToInt64()
            } else { 0 });
            windowTitle = $(if ($_.Name -match '^(eu4|CrashReporter|WerFault)\.exe$') {
                (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue).MainWindowTitle
            } else { '' }) }
    })
    ConvertTo-Json -InputObject $records -Compress
    exit 0
}
# Recheck identity immediately before touching a PID. Never use taskkill /T, whose
# descendant/PID lookup cannot validate creation times after parent exit/reuse.
$record = Get-CimInstance Win32_Process -Filter "ProcessId=$OwnedId"
if (-not $record) { 'already-exited'; exit 0 }
if ($record.CreationDate.ToUniversalTime().ToString('o') -ne $Created -or
    $record.ExecutablePath -ne $Executable) { 'identity-changed'; exit 0 }
$owned = Get-Process -Id $OwnedId -ErrorAction SilentlyContinue
if (-not $owned) { 'already-exited'; exit 0 }
# Pin the instance before reading its start time or issuing any native operation.
$ownedHandle = $owned.Handle
# CIM creation timestamps have microsecond precision; recheck the held handle's
# start time as well, allowing only that timestamp's sub-millisecond truncation.
if ([Math]::Abs(($owned.StartTime.ToUniversalTime() - [DateTime]::Parse($Created).ToUniversalTime()).TotalMilliseconds) -ge 1) {
    'identity-changed'; exit 0
}
if ($Action -eq 'Suspend') {
    # Diagnostic-only: one process handle, not a name/tree/global suspension.
    # NtSuspendProcess declaration: https://github.com/winsiderss/phnt/blob/master/ntpsapi.h
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class EU4RuntimeDiagnostic {
    [DllImport("ntdll.dll", ExactSpelling = true)]
    public static extern int NtSuspendProcess(IntPtr processHandle);
}
'@
    $nativeStatus = [EU4RuntimeDiagnostic]::NtSuspendProcess($ownedHandle)
    $suspendedAt = [DateTime]::UtcNow.ToString('o')
    if ($nativeStatus -ne 0) { throw "Diagnostic suspension failed: NTSTATUS $nativeStatus" }
    $owned.Refresh()
    $threads = @($owned.Threads | ForEach-Object {
        $state = $_.ThreadState.ToString()
        [pscustomobject]@{ id = $_.Id; state = $state;
            waitReason = $(if ($state -eq 'Wait') { $_.WaitReason.ToString() } else { $null }) }
    })
    ConvertTo-Json -InputObject ([pscustomobject]@{ action = 'suspended'; pid = $OwnedId;
        created = $Created; executable = $Executable; ntStatus = $nativeStatus;
        suspendedAtUtc = $suspendedAt; threads = $threads;
        threadCount = $threads.Count;
        suspendedThreadCount = @($threads | Where-Object { $_.waitReason -eq 'Suspended' }).Count }) -Depth 4 -Compress
    exit 0
}
if ($GraceSeconds -gt 0) {
    $requested = $owned.CloseMainWindow()
    if ($owned.WaitForExit($GraceSeconds * 1000)) { 'window-close'; exit 0 }
}
# The Process object holds a handle to the verified instance, avoiding PID reuse
# between the identity lookup and termination.
$owned.Kill()
if (-not $owned.WaitForExit(5000)) { throw "Owned process $OwnedId did not exit after termination." }
'forced'
