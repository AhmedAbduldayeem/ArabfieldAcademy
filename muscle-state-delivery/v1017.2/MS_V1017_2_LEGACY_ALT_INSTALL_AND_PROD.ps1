$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-core-fix-v1017-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1017.2'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1017.2-legacy-alt-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','weights.html','assets\js\app.js','assets\js\weights.js','ms-training-personalization.js','ms-performance-hub.js','assets\css\app.css','assets\js\pwa.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;$dir=Split-Path $dst -Parent;New-Item -ItemType Directory -Force -Path $dir | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1017.2 LEGACY ALT CLEANUP ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha1=[Security.Cryptography.SHA1]::Create();try{$hash=$sha1.ComputeHash($all)}finally{$sha1.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
$patch=Join-Path $env:TEMP 'MS_V1017_2_LEGACY_ALT_PATCH.js'
$ok=$false
try{
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-v1017-2-legacy-cleanup-patch.js') -OutFile $patch -TimeoutSec 60
  $blob=Get-GitBlobSha1 $patch
  Write-Host ('PATCH_GIT_BLOB_SHA1='+$blob)
  if($blob -ne '60b059b4e575bdd87e91996eca85ffda3e04f9ea'){throw ('PATCH_BLOB_MISMATCH '+$blob)}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
  foreach($f in @('assets\js\app.js','assets\js\weights.js','ms-training-personalization.js','ms-performance-hub.js','assets\js\pwa.js')){node --check (Join-Path $root $f);if($LASTEXITCODE -ne 0){throw ('NODE_CHECK_FAILED '+$f)}}
  $tp=[IO.File]::ReadAllText((Join-Path $root 'ms-training-personalization.js'),[Text.Encoding]::UTF8)
  $app=[IO.File]::ReadAllText((Join-Path $root 'assets\js\app.js'),[Text.Encoding]::UTF8)
  $weights=[IO.File]::ReadAllText((Join-Path $root 'assets\js\weights.js'),[Text.Encoding]::UTF8)
  $perf=[IO.File]::ReadAllText((Join-Path $root 'ms-performance-hub.js'),[Text.Encoding]::UTF8)
  $css=[IO.File]::ReadAllText((Join-Path $root 'assets\css\app.css'),[Text.Encoding]::UTF8)
  $pwa=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
  if(!$tp.Contains('MS_V1017_2_LEGACY_ALT_UI_DISABLED')){throw 'LEGACY_SOURCE_DISABLE_MISSING'}
  if($tp.Contains('function addTo(el,base,day){')){throw 'LEGACY_ADD_TO_STILL_PRESENT'}
  if(!$app.Contains('ms1017-alt-btn')){throw 'NEW_APP_ALT_MISSING'}
  if(!$weights.Contains('ms1017-alt-btn')){throw 'NEW_WEIGHTS_ALT_MISSING'}
  if(!$css.Contains('.ms1017-alt-btn{background:#c9ff3d!important')){throw 'FLUORESCENT_ALT_STYLE_MISSING'}
  if(!$perf.Contains('if(sec.parentElement!==home){anchor?home.insertBefore(sec,anchor):home.append(sec)}')){throw 'RECOVERY_HOME_ONLY_MISSING'}
  if(!$pwa.Contains("const VERSION='10172';")){throw 'PWA_10172_MISSING'}
  Write-Host 'V1017_2_SOURCE_ASSERTIONS_OK'
  Write-Host 'legacy_alt_button=REMOVED_AT_SOURCE'
  Write-Host 'legacy_selected_alt_button=REMOVED_AT_SOURCE'
  Write-Host 'new_alt_button=FLUORESCENT_ONLY'
  Write-Host 'performance_recovery=HOME_ONLY'
  Write-Host 'muscle_recovery=HOME_ONLY'
  Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1017.2 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;$dir=Split-Path $dst -Parent;New-Item -ItemType Directory -Force -Path $dir | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){Write-Host 'V1017.2 LOCAL QA PASS' -ForegroundColor Green;Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ===';vercel.cmd --prod --yes --scope dayeem-studio-demos;if($LASTEXITCODE -ne 0){Write-Host 'V1017.2 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE};Write-Host 'V1017.2 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green}
