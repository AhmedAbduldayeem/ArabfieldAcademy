$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-core-fix-v1017-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1017.1'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1017.1-identity-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','weights.html','assets\js\app.js','assets\js\weights.js','ms-performance-hub.js','assets\css\app.css','assets\js\pwa.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent)|Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1017.1 IDENTITY ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha1=[Security.Cryptography.SHA1]::Create();try{$hash=$sha1.ComputeHash($all)}finally{$sha1.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
$patch=Join-Path $env:TEMP 'MS_V1017_1_IDENTITY_PATCH.js'
$ok=$false
try{
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-v1017-1-identity-patch.js') -OutFile $patch -TimeoutSec 60
  $blob=Get-GitBlobSha1 $patch
  Write-Host ('PATCH_GIT_BLOB_SHA1='+$blob)
  if($blob -ne 'bd38904969ccd7f0a9c68a01a84c947ebc0d19af'){throw ('PATCH_BLOB_MISMATCH='+$blob)}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'PATCH_EXECUTION_FAILED'}
  foreach($f in @('assets\js\app.js','assets\js\weights.js','ms-performance-hub.js','assets\js\pwa.js')){node --check (Join-Path $root $f);if($LASTEXITCODE -ne 0){throw ('NODE_CHECK_FAILED='+$f)}}
  $app=[IO.File]::ReadAllText((Join-Path $root 'assets\js\app.js'),[Text.Encoding]::UTF8)
  $weights=[IO.File]::ReadAllText((Join-Path $root 'assets\js\weights.js'),[Text.Encoding]::UTF8)
  $perf=[IO.File]::ReadAllText((Join-Path $root 'ms-performance-hub.js'),[Text.Encoding]::UTF8)
  $css=[IO.File]::ReadAllText((Join-Path $root 'assets\css\app.css'),[Text.Encoding]::UTF8)
  $apphtml=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
  if(!$app.Contains('MS_V1017_1_IDENTITY')){throw 'APP_IDENTITY_MARKER_MISSING'}
  if(!$weights.Contains('MS_V1017_1_IDENTITY')){throw 'WEIGHTS_IDENTITY_MARKER_MISSING'}
  if(!$css.Contains('--ms-fluoro:#c9ff3d')){throw 'FLUORO_BUTTON_STYLE_MISSING'}
  if(!$css.Contains('--ms-vanilla:#fff7e8') -or !$css.Contains('--ms-fresh-green:#6da77a')){throw 'IDENTITY_PALETTE_MISSING'}
  if(!$perf.Contains('if(sec.parentElement!==home){anchor?home.insertBefore(sec,anchor):home.append(sec)}')){throw 'RECOVERY_HOME_SCOPE_MISSING'}
  if(!$apphtml.Contains('ms-performance-hub.js?v=10171')){throw 'PERFORMANCE_CACHE_BUST_MISSING'}
  Write-Host 'V1017_1_SOURCE_ASSERTIONS_OK'
  Write-Host 'identity_palette=VANILLA_CREAM_GREEN'
  Write-Host 'alternatives_button=FLUORESCENT_ONLY'
  Write-Host 'old_alternatives_button=REMOVED'
  Write-Host 'performance_recovery=HOME_ONLY'
  Write-Host 'muscle_recovery=HOME_ONLY'
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1017.1 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent)|Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){Write-Host 'V1017.1 LOCAL QA PASS' -ForegroundColor Green;Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ===';vercel.cmd --prod --yes --scope dayeem-studio-demos;if($LASTEXITCODE -ne 0){Write-Host 'V1017.1 LOCAL PASS BUT PROD DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE};Write-Host 'V1017.1 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green}
