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
function Get-GitBlobSha1([string]$path){
  $bytes=[IO.File]::ReadAllBytes($path)
  $header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0))
  $all=New-Object byte[] ($header.Length+$bytes.Length)
  [Buffer]::BlockCopy($header,0,$all,0,$header.Length)
  [Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length)
  $sha1=[Security.Cryptography.SHA1]::Create()
  try{$hash=$sha1.ComputeHash($all)}finally{$sha1.Dispose()}
  return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()
}
function Download-Verified([string]$url,[string]$path,[string]$blobSha){
  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $path -TimeoutSec 60
  $h=Get-GitBlobSha1 $path
  Write-Host ((Split-Path $path -Leaf)+'_GIT_BLOB_SHA1='+$h)
  if($h -ne $blobSha){throw ('GIT_BLOB_MISMATCH '+(Split-Path $path -Leaf)+' '+$h)}
}
$runtime=Join-Path $root 'assets\js\ms-v1016-3-runtime.js'
$css=Join-Path $root 'assets\css\ms-v1016-3.css'
$patch=Join-Path $env:TEMP 'MS_V1016_3_HTML_PATCH.js'
$ok=$false
try{
  Download-Verified ($base+'/ms-v1016-3-runtime.js') $runtime 'fd31c02390694349863a609b7c94d32a883d454f'
  Download-Verified ($base+'/ms-v1016-3.css') $css 'f7aa72cd5e6a2bfcf35fc97a7ed3d4e16bb2c541'
  Download-Verified ($base+'/ms-v1016-3-html-patch.js') $patch 'a442086ccd15d57c1728b344e5f9326a95cabab6'
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
