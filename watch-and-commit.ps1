# Auto-commit watcher for Labour Management Project
# This PowerShell script monitors for file changes and auto-commits them

$repoPath = "c:\Users\Onkar\Downloads\labour management"
$WatchInterval = 5

Write-Host "Watching for changes in Labour Management repository..."
Write-Host "Repository: $repoPath"
Write-Host "Check interval: $($WatchInterval)s`n"

while ($true) {
    try {
        Set-Location $repoPath
        $status = git status --porcelain
        
        if ($status) {
            Write-Host "Changes detected at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Write-Host $status
            
            git add -A
            
            $commitMsg = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMsg
            
            Write-Host "Committed: $commitMsg`n"
        }
        
        Start-Sleep -Seconds $WatchInterval
    }
    catch {
        Write-Host "Error: $_"
    }
}
