<#
.SYNOPSIS
    Deploy the storefront to production.

.DESCRIPTION
    Render auto-deploys the `main` branch, so publishing is just a push to
    GitHub. This wraps the part that is easy to get wrong: staging ONLY the
    app's own source. This repository root also holds unrelated projects
    (timetrack, dse-dashboard, several backup copies) plus a few hundred scratch
    files, so a bare `git add -A` would commit all of that and break the
    Render build.

.PARAMETER Message
    Commit message. Omit to be prompted.

.PARAMETER PushOnly
    Push without committing anything new.

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Message "Add gift wrap option"
    .\deploy.ps1 -PushOnly
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message,

    [switch]$PushOnly
)

$ErrorActionPreference = 'Stop'

$Branch    = 'main'
$Remote    = 'origin'
$LiveUrl   = 'https://chilahati-baby-mart.onrender.com'

# Everything the running site actually needs. Anything outside this list is
# scratch: other projects, backups, logs and downloaded responses.
$AppPaths = @(
    'src'
    'public'
    'data'
    'scripts'
    'package.json'
    'package-lock.json'
    'next.config.ts'
    'postcss.config.mjs'
    'tsconfig.json'
    'next-env.d.ts'
    '.env.example'
    'deploy.ps1'
)

Set-Location -LiteralPath $PSScriptRoot

# Drop anything that is not actually present. `git add` treats an unknown
# pathspec as a hard error, and the list intentionally includes optional files
# like .env.example that may not exist in every checkout.
$AppPaths = @($AppPaths | Where-Object { Test-Path -LiteralPath $_ })

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$NativeArgs
    )

    # git writes ordinary progress notes ("Everything up-to-date", "To
    # https://...") to stderr. Under PS 5.1 a redirected stderr line becomes a
    # NativeCommandError, which $ErrorActionPreference = 'Stop' would escalate
    # into a terminating failure. Relax the preference for the call and judge
    # success by the exit code instead.
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $out = & $FilePath @NativeArgs 2>&1 | ForEach-Object { "$_" }
        $code = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previous
    }

    if ($code -ne 0) {
        throw "$FilePath $($NativeArgs -join ' ') failed:`n$($out -join "`n")"
    }
    return $out
}

# NOTE: args are always passed as a single pre-built array. Letting PowerShell
# bind them positionally flattens an array argument into one space-joined
# string, which turns a git pathspec list into a single nonsense pathspec that
# silently matches nothing - i.e. "no changes" for every deploy.
function Invoke-Git {
    param([Parameter(Mandatory = $true)][string[]]$GitArgs)
    return Invoke-Native -FilePath 'git' -NativeArgs $GitArgs
}

$currentBranch = (Invoke-Git @('rev-parse', '--abbrev-ref', 'HEAD')).Trim()
if ($currentBranch -ne $Branch) {
    Write-Host "error: on branch '$currentBranch', expected '$Branch'." -ForegroundColor Red
    Write-Host "       Render only auto-deploys '$Branch'." -ForegroundColor Red
    exit 1
}

# `git status --porcelain -- <paths>` lists only changes under those paths, so an
# empty result means there is genuinely nothing to deploy.
$dirty  = @(Invoke-Git (@('status', '--porcelain', '--') + $AppPaths))
$staged = @(Invoke-Git @('diff', '--cached', '--name-only'))

if ($dirty.Count -eq 0 -and $staged.Count -eq 0) {
    if (-not $PushOnly) {
        Write-Host 'No changes in the app source. Re-run with -PushOnly to push anyway.' -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Nothing to commit; pushing $Branch."
}

if (-not $PushOnly) {
    # Render's build runs `next build`, which type-checks - so anything tsc
    # rejects here would fail the deploy anyway. Better to find out now.
    Write-Host '==> Checking types' -ForegroundColor Cyan
    Invoke-Native -FilePath 'npx.cmd' -NativeArgs @('tsc', '--noEmit') | Out-Null

    Invoke-Git (@('add', '--') + $AppPaths) | Out-Null

    $staged = @(Invoke-Git @('diff', '--cached', '--name-only'))
    if ($staged.Count -eq 0) {
        Write-Host "No app changes to commit; pushing $Branch."
    }
    else {
        Write-Host '==> Staged for commit:' -ForegroundColor Cyan
        $staged | ForEach-Object { Write-Host "    $_" }
        Write-Host ''

        if ([string]::IsNullOrWhiteSpace($Message)) {
            $Message = Read-Host 'Commit message'
            if ([string]::IsNullOrWhiteSpace($Message)) {
                Write-Host 'error: empty commit message; aborting.' -ForegroundColor Red
                exit 1
            }
        }

        Invoke-Git @('commit', '-m', $Message) | Out-Null
        Write-Host '==> Committed' -ForegroundColor Green
    }
}

Invoke-Git @('push', $Remote, $Branch) | Out-Null
Write-Host "==> Pushed $Branch; Render will auto-deploy." -ForegroundColor Green

# Render builds take a couple of minutes. Watch the live site rather than
# declaring success on push alone - a push can succeed and still fail to build.
Write-Host "==> Waiting for $LiveUrl to serve the new build" -ForegroundColor Cyan
for ($attempt = 1; $attempt -le 30; $attempt++) {
    Start-Sleep -Seconds 20
    try {
        $response = Invoke-WebRequest -Uri "$LiveUrl/" -UseBasicParsing -TimeoutSec 60
        if ($response.StatusCode -eq 200) {
            Write-Host "==> Live site is responding ($attempt/30)." -ForegroundColor Green
            Write-Host "    Verify your change at $LiveUrl" -ForegroundColor Green
            exit 0
        }
    }
    catch {
        # still building, or the free-tier instance is waking up
    }
    Write-Host "    not up yet ($attempt/30)"
}

Write-Host "warning: $LiveUrl did not respond in time." -ForegroundColor Yellow
Write-Host '         Check https://dashboard.render.com for build logs.' -ForegroundColor Yellow
exit 1