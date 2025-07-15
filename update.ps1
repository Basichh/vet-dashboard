# Vet Dashboard Update Script
# This script pulls the latest changes from GitHub and replaces all files

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Vet Dashboard Update Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Configuration
$repoUrl = "https://github.com/Basichh/vet-dashboard"
$branch = "main"
$currentDir = Get-Location
$tempDir = Join-Path $env:TEMP "vet-dashboard-update"
$backupDir = Join-Path $currentDir "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

try {
    # Check if git is available
    Write-Host "Checking for git..." -ForegroundColor Yellow
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Git is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "Git found: $gitVersion" -ForegroundColor Green

    # Create backup of current files
    Write-Host ""
    Write-Host "Creating backup of current files..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Get list of files to backup (exclude .git and backup folders)
    $filesToBackup = Get-ChildItem -Path $currentDir -Recurse | Where-Object { 
        $_.FullName -notmatch "\\\.git\\" -and 
        $_.FullName -notmatch "\\backup-" -and
        $_.FullName -ne $backupDir
    }
    
    foreach ($file in $filesToBackup) {
        $relativePath = $file.FullName.Substring($currentDir.Path.Length + 1)
        $backupPath = Join-Path $backupDir $relativePath
        $backupParentDir = Split-Path $backupPath -Parent
        
        if (!(Test-Path $backupParentDir)) {
            New-Item -ItemType Directory -Path $backupParentDir -Force | Out-Null
        }
        
        if ($file.PSIsContainer -eq $false) {
            Copy-Item $file.FullName $backupPath -Force
        }
    }
    Write-Host "Backup created at: $backupDir" -ForegroundColor Green

    # Clean up old temp directory if it exists
    if (Test-Path $tempDir) {
        Write-Host "Cleaning up previous temp files..." -ForegroundColor Yellow
        Remove-Item $tempDir -Recurse -Force
    }

    # Clone the latest version
    Write-Host ""
    Write-Host "Downloading latest version from GitHub..." -ForegroundColor Yellow
    git clone --branch $branch --single-branch $repoUrl $tempDir
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to download from GitHub. Please check your internet connection." -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }

    # Remove current files (except backup directories and .git)
    Write-Host ""
    Write-Host "Removing old files..." -ForegroundColor Yellow
    $itemsToRemove = Get-ChildItem -Path $currentDir | Where-Object { 
        $_.Name -notmatch "^backup-" -and 
        $_.Name -ne ".git" -and
        $_.Name -ne "update.ps1"  # Don't remove the update script itself
    }
    
    foreach ($item in $itemsToRemove) {
        Remove-Item $item.FullName -Recurse -Force
    }

    # Copy new files from temp directory
    Write-Host "Installing new files..." -ForegroundColor Yellow
    $newFiles = Get-ChildItem -Path $tempDir -Recurse | Where-Object { 
        $_.FullName -notmatch "\\\.git\\" 
    }
    
    foreach ($file in $newFiles) {
        $relativePath = $file.FullName.Substring($tempDir.Length + 1)
        $destinationPath = Join-Path $currentDir $relativePath
        $destinationParentDir = Split-Path $destinationPath -Parent
        
        if (!(Test-Path $destinationParentDir)) {
            New-Item -ItemType Directory -Path $destinationParentDir -Force | Out-Null
        }
        
        if ($file.PSIsContainer -eq $false) {
            Copy-Item $file.FullName $destinationPath -Force
        }
    }

    # Clean up temp directory
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    Remove-Item $tempDir -Recurse -Force

    # Success message
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Update completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your files have been updated to the latest version." -ForegroundColor White
    Write-Host "A backup of your previous files is available at:" -ForegroundColor White
    Write-Host "$backupDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now run start-server.ps1 or start-server.bat to start the application." -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "An error occurred during the update:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "If you have a backup, you can restore your files from:" -ForegroundColor Yellow
    Write-Host "$backupDir" -ForegroundColor Cyan
    
    # Clean up temp directory if it exists
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
