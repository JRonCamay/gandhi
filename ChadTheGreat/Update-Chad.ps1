$ErrorActionPreference = "Stop"

$RepoOwner = "JRonCamay"
$RepoName = "gandhi"
$Branch = "main"
$Folder = "ChadTheGreat"
$Target = $PSScriptRoot
$Parent = Split-Path -Parent $Target

$ApiUrl = "https://api.github.com/repos/${RepoOwner}/${RepoName}/contents/${Folder}?ref=${Branch}"
$RawBase = "https://raw.githubusercontent.com/${RepoOwner}/${RepoName}/${Branch}/${Folder}"

function Write-Title($Text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function New-BackupFolder {
    $Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupRoot = Join-Path $Parent "ChadBackups"
    $BackupDir = Join-Path $BackupRoot $Stamp
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    return $BackupDir
}

function Get-RemoteFiles {
    Write-Host "Reading GitHub folder list..." -ForegroundColor Yellow

    $Headers = @{
        "User-Agent" = "ChadTheGreat-Updater"
        "Accept" = "application/vnd.github+json"
    }

    $Items = Invoke-RestMethod -Uri $ApiUrl -Headers $Headers -Method Get

    return @($Items | Where-Object {
        $_.type -eq "file" -and
        $_.name -notlike ".*" -and
        $_.name -ne "Update-Chad.ps1" -and
        $_.name -ne "Update-Chad.bat"
    } | Sort-Object name)
}

function Get-FileText($Path) {
    if (!(Test-Path $Path)) { return $null }
    return [System.IO.File]::ReadAllText($Path)
}

function Download-File($Item, $BackupDir) {
    $FileName = $Item.name
    $EncodedName = [System.Uri]::EscapeDataString($FileName)
    $Url = "${RawBase}/${EncodedName}?cacheBust=$(Get-Date -Format yyyyMMddHHmmssfff)"
    $Out = Join-Path $Target $FileName
    $Tmp = "$Out.tmp"

    Write-Host "Downloading $FileName ..." -ForegroundColor Yellow

    try {
        Invoke-WebRequest -Uri $Url -OutFile $Tmp -UseBasicParsing

        if (!(Test-Path $Tmp) -or ((Get-Item $Tmp).Length -le 0)) {
            if (Test-Path $Tmp) { Remove-Item $Tmp -Force }
            Write-Host "Skipped $FileName because downloaded file was empty." -ForegroundColor Red
            return "skipped"
        }

        $OldText = Get-FileText $Out
        $NewText = Get-FileText $Tmp

        if ($OldText -ne $null -and $OldText -eq $NewText) {
            Remove-Item $Tmp -Force
            Write-Host "Unchanged $FileName" -ForegroundColor DarkGray
            return "unchanged"
        }

        if (Test-Path $Out) {
            Copy-Item $Out (Join-Path $BackupDir $FileName) -Force
        }

        Move-Item -Path $Tmp -Destination $Out -Force
        Write-Host "Updated $FileName" -ForegroundColor Green
        return "updated"
    }
    catch {
        if (Test-Path $Tmp) { Remove-Item $Tmp -Force }
        Write-Host "Failed $FileName" -ForegroundColor Red
        Write-Host "URL: $Url" -ForegroundColor DarkGray
        Write-Host $_.Exception.Message -ForegroundColor Red
        return "failed"
    }
}

Write-Title "ChadTheGreat Smart Updater"
Write-Host "Target folder: $Target"
Write-Host "Backup parent: $Parent"
Write-Host "Repository: ${RepoOwner}/${RepoName}"
Write-Host "Remote folder: $Folder"
Write-Host "Branch: $Branch"
Write-Host ""

try {
    $BadBackup = Join-Path $Target "_chad_backups"
    if (Test-Path $BadBackup) {
        Write-Host "Removing old Chrome-blocking backup folder: $BadBackup" -ForegroundColor Yellow
        Remove-Item $BadBackup -Recurse -Force
    }

    $BackupDir = New-BackupFolder
    Write-Host "Backup folder: $BackupDir" -ForegroundColor DarkCyan
    Write-Host ""

    $RemoteFiles = Get-RemoteFiles

    if (!$RemoteFiles -or $RemoteFiles.Count -eq 0) {
        throw "No files found in GitHub folder: $Folder"
    }

    Write-Host "Found $($RemoteFiles.Count) remote files." -ForegroundColor Green
    Write-Host "Updater files are skipped so they do not overwrite themselves." -ForegroundColor DarkGray
    Write-Host ""

    $Updated = @()
    $Unchanged = @()
    $Skipped = @()
    $Failed = @()

    foreach ($Item in $RemoteFiles) {
        $Result = Download-File $Item $BackupDir

        if ($Result -eq "updated") { $Updated += $Item.name }
        elseif ($Result -eq "unchanged") { $Unchanged += $Item.name }
        elseif ($Result -eq "skipped") { $Skipped += $Item.name }
        else { $Failed += $Item.name }
    }

    Write-Title "Update Result"

    Write-Host "Updated: $($Updated.Count)" -ForegroundColor Green
    foreach ($File in $Updated) { Write-Host "  + $File" -ForegroundColor Green }

    Write-Host ""
    Write-Host "Unchanged: $($Unchanged.Count)" -ForegroundColor DarkGray

    if ($Skipped.Count -gt 0) {
        Write-Host ""
        Write-Host "Skipped: $($Skipped.Count)" -ForegroundColor Yellow
        foreach ($File in $Skipped) { Write-Host "  - $File" -ForegroundColor Yellow }
    }

    if ($Failed.Count -gt 0) {
        Write-Host ""
        Write-Host "Failed: $($Failed.Count)" -ForegroundColor Red
        foreach ($File in $Failed) { Write-Host "  ! $File" -ForegroundColor Red }
    }

    Write-Host ""
    Write-Host "Chad Local Update Complete" -ForegroundColor Green
    Write-Host "Reload ChadTheGreat in chrome://extensions, then refresh ChatGPT." -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "Updater failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to close"
