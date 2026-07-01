$ErrorActionPreference = "Stop"

$RepoOwner = "JRonCamay"
$RepoName = "gandhi"
$Branch = "main"
$Folder = "ChadTheGreat"
$BaseRaw = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$Branch/$Folder"
$Target = $PSScriptRoot

$Files = @(
    "manifest.json",
    "background.js",
    "content.js",
    "bridge.js",
    "data.js",
    "storage.js",
    "scanner.js",
    "actions.js",
    "ui.js",
    "paint.js",
    "paintHotkeys.js",
    "agentFixes.js",
    "EXTENSION_SETUP.md",
    "Update-Chad.ps1",
    "Update-Chad.bat"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ChadTheGreat Local Updater" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Target folder:" $Target
Write-Host "Source:" "$RepoOwner/$RepoName/$Folder@$Branch"
Write-Host ""

foreach ($File in $Files) {
    $Url = "$BaseRaw/$File?cacheBust=$(Get-Date -Format yyyyMMddHHmmss)"
    $Out = Join-Path $Target $File
    $Tmp = "$Out.tmp"

    Write-Host "Downloading $File ..." -ForegroundColor Yellow

    try {
        Invoke-WebRequest -Uri $Url -OutFile $Tmp -UseBasicParsing

        if ((Test-Path $Tmp) -and ((Get-Item $Tmp).Length -gt 0)) {
            Move-Item -Path $Tmp -Destination $Out -Force
            Write-Host "Updated $File" -ForegroundColor Green
        }
        else {
            if (Test-Path $Tmp) { Remove-Item $Tmp -Force }
            Write-Host "Skipped $File because downloaded file was empty." -ForegroundColor Red
        }
    }
    catch {
        if (Test-Path $Tmp) { Remove-Item $Tmp -Force }
        Write-Host "Failed $File" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔥 Chad Local Update Complete 🔥" -ForegroundColor Green
Write-Host "Reload ChadTheGreat in chrome://extensions, then refresh ChatGPT." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
