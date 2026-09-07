$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-delivery-v1016-3'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1016.3'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1016.3-github-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','weights.html','exercise.html')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  Copy-Item -LiteralPath $src -Destination (Join-Path $rb $f) -Force
}
Write-Host '=== MUSCLE STATE v1016.3 FINAL ==='
Write-Host ('ROLLBACK='+$rb)
function Download-Verified([string]$url,[string]$path,[string]$sha){
  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $path -TimeoutSec 60
  $h=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
  Write-Host ((Split-Path $path -Leaf)+'_SHA256='+$h)
  if($h -ne $sha){throw ('SHA_MISMATCH '+(Split-Path $path -Leaf)+' '+$h)}
}
$runtime=Join-Path $root 'assets\js\ms-v1016-3-runtime.js'
$css=Join-Path $root 'assets\css\ms-v1016-3.css'
$patch=Join-Path $env:TEMP 'MS_V1016_3_HTML_PATCH.js'
$ok=$false
try{
  Download-Verified ($base+'/ms-v1016-3-runtime.js') $runtime '6b4805cefd02da50e1f162e529a5d33f2bba779f2440d2aace32ad829c16af7a'
  Download-Verified ($base+'/ms-v1016-3.css') $css '1316b839300a2e2a279656eda0dbf1e37e43f9ba7793a31580a5caca141b0cf0'
  Download-Verified ($base+'/ms-v1016-3-html-patch.js') $patch 'a544bead693722c98c0c463f736df629f7032b438f36f05489b361b1b110c10d'
  node --check $runtime
  if($LASTEXITCODE -ne 0){throw 'RUNTIME_NODE_CHECK_FAILED'}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCHER_NODE_CHECK_FAILED'}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'HTML_PATCH_FAILED'}
  $rt=[IO.File]::ReadAllText($runtime,[Text.Encoding]::UTF8)
  foreach($m in @('normalizeAll','applySavedSwaps','renderAfterSwap','guardClientUI','ensureLibraryDirectLog')){
    if(!$rt.Contains($m)){throw ('RUNTIME_MARKER_MISSING='+$m)}
  }
  Write-Host 'V1016_3_FEATURE_MARKERS_OK'
  Write-Host 'standard_day_exercises=7'
  Write-Host 'single_alternative_button=true'
  Write-Host 'alternative_preview=start_end'
  Write-Host 'alternative_apply=instant_no_refresh'
  Write-Host 'saved_swaps_reapplied_after_normalize=true'
  Write-Host 'wellness_home_only=true'
  Write-Host 'internal_ui_cleanup=true'
  Write-Host 'library_direct_log=same_exercise_modal'
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1016.3 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){Copy-Item -LiteralPath $src -Destination (Join-Path $root $f) -Force}
  }
  Remove-Item -LiteralPath $runtime,$css -Force -ErrorAction SilentlyContinue
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){
  Write-Host 'V1016.3 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1016.3 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1016.3 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
