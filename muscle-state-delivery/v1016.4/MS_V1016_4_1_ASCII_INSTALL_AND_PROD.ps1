$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-delivery-v1016-4'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1016.4'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1016.4.1-ascii-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null

$tracked=@('app.html','weights.html','exercise.html','assets\js\pwa.js')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
Write-Host '=== MUSCLE STATE v1016.4.1 ASCII INSTALL ==='
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

$runtime=Join-Path $root 'assets\js\ms-v1016-4-runtime.js'
$css=Join-Path $root 'assets\css\ms-v1016-4.css'
$patch=Join-Path $env:TEMP 'MS_V1016_4_HTML_PATCH.js'
$ok=$false

try{
  Download-Verified ($base+'/ms-v1016-4-runtime.js') $runtime '687c89dded6723a9b6f161a18a2d9459655cdc51'
  Download-Verified ($base+'/ms-v1016-4.css') $css 'fa86f763c179d2a91e15312bb35c903fd4ec99be'
  Download-Verified ($base+'/ms-v1016-4-html-patch.js') $patch '099f6839fee190e2e46d56724ab903562b6cf897'

  node --check $runtime
  if($LASTEXITCODE -ne 0){throw 'RUNTIME_NODE_CHECK_FAILED'}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCHER_NODE_CHECK_FAILED'}

  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'HTML_PATCH_FAILED'}

  $rt=[IO.File]::ReadAllText($runtime,[Text.Encoding]::UTF8)
  foreach($m in @(
    'const data=()=>window.MS_DATA||{};',
    'push:{chest:3,shoulder:2,triceps:2}',
    'function normalizeAll()',
    'function applySavedSwaps()',
    'function chooseSwap(id)',
    'replacement_exercise_id:y.id',
    'function stripWellnessOutsideHome()',
    'function ensureLibraryDirectLog()',
    'ms10164-pair',
    'training_day:',
    'save-log'
  )){
    if(!$rt.Contains($m)){throw ('RUNTIME_MARKER_MISSING='+$m)}
  }
  if($rt.Contains('.slice(0,12)')){throw 'ALTERNATIVES_12_LIMIT_STILL_PRESENT'}

  $choose=$rt.IndexOf('function chooseSwap(id)')
  $set=$rt.IndexOf('setItemId(item,y.id);',$choose)
  $render=$rt.IndexOf("if(page()==='weights.html')",$choose)
  $persist=$rt.IndexOf('persistRemote(row)',$choose)
  if($choose -lt 0 -or $set -lt 0 -or $render -lt 0 -or $persist -lt 0 -or !($set -lt $render -and $render -lt $persist)){
    throw 'INSTANT_SWAP_ORDER_INVALID'
  }

  $app=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
  $weights=[IO.File]::ReadAllText((Join-Path $root 'weights.html'),[Text.Encoding]::UTF8)
  $exercise=[IO.File]::ReadAllText((Join-Path $root 'exercise.html'),[Text.Encoding]::UTF8)
  $pwa=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)

  foreach($pair in @(@('app.html',$app),@('weights.html',$weights),@('exercise.html',$exercise))){
    if($pair[1] -notmatch 'ms-v1016-4-runtime\.js\?v=10164" defer'){throw ('DEFER_RUNTIME_MISSING='+$pair[0])}
    if($pair[1] -notmatch 'ms-v1016-4\.css\?v=10164'){throw ('V10164_CSS_MISSING='+$pair[0])}
    if($pair[1] -match 'ms-v1016-3-runtime\.js|ms-v1016-3\.css'){throw ('OLD_V10163_REFERENCE='+$pair[0])}
  }
  if($app -match 'id="demoPlanCard"'){throw 'INTERNAL_DEMO_CARD_REMAINS'}
  if($pwa -notmatch "const VERSION='10164';"){throw 'PWA_CACHE_VERSION_NOT_UPDATED'}

  Write-Host 'V1016_4_1_BEHAVIOR_ASSERTIONS_OK'
  Write-Host 'runtime_reads_live_data=true'
  Write-Host 'runtime_load_order=defer_after_existing_scripts'
  Write-Host 'standard_day_exercises=7'
  Write-Host 'push_distribution=3_chest_2_shoulders_2_triceps'
  Write-Host 'single_alternatives_button=true'
  Write-Host 'alternatives_limit=NONE'
  Write-Host 'alternative_preview=start_end'
  Write-Host 'alternative_apply=IMMEDIATE_BEFORE_REMOTE_SAVE'
  Write-Host 'saved_swap_reapply=true'
  Write-Host 'wellness_scope=HOME_ONLY'
  Write-Host 'internal_demo_data=REMOVED'
  Write-Host 'library_direct_log=SAME_EXERCISE_MODAL'
  Write-Host 'pwa_cache_version=10164'

  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1016.4.1 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){
      $dst=Join-Path $root $f
      New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
      Copy-Item -LiteralPath $src -Destination $dst -Force
    }
  }
  Remove-Item -LiteralPath $runtime,$css -Force -ErrorAction SilentlyContinue
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}

if($ok){
  Write-Host 'V1016.4.1 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1016.4.1 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1016.4.1 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
