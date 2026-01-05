# Auto-commit watcher for Labour Management Project
# This PowerShell script monitors for file changes and auto-commits them

param(
    [int]$WatchInterval = 5  # Check every 5 seconds
)

$repoPath = "c:\Users\Onkar\Downloads\labour management"
$lastCommitTime = (git -C $repoPath log -1 --format=%ai | Get-Date)

Write-Host "🔍 Watching for changes in Labour Management repository..."
Write-Host "Repository: $repoPath"
Write-Host "Check interval: ${WatchInterval}s`n"

while ($true) {
    try {
        # Check for uncommitted changes
        $status = git -C $repoPath status --porcelain
        
        if ($status) {
            Write-Host "📝 Changes detected at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Write-Host $status
            
            # Stage all changes
            git -C $repoPath add -A
            
            # Create commit with timestamp
            $commitMsg = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git -C $repoPath commit -m $commitMsg
            
            Write-Host "✅ Committed with message: $commitMsg`n"
        }
        
        Start-Sleep -Seconds $WatchInterval
    }
    catch {
        Write-Host "❌ Error: $_"
    }
}
