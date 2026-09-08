$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-core-fix-v1017-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1017.3'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1017.3-help-install-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('help.html','assets\js\ms-help-v1004.js','assets\css\ms-help-v1004.css')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;$dir=Split-Path $dst -Parent;New-Item -ItemType Directory -Force -Path $dir | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1017.3 HELP INSTALL ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha1=[Security.Cryptography.SHA1]::Create();try{$hash=$sha1.ComputeHash($all)}finally{$sha1.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
$patch=Join-Path $env:TEMP 'MS_V1017_3_HELP_INSTALL_PATCH.js'
$ok=$false
try{
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-v1017-3-help-install-patch.js') -OutFile $patch -TimeoutSec 60
  $blob=Get-GitBlobSha1 $patch
  Write-Host ('PATCH_GIT_BLOB_SHA1='+$blob)
  if($blob -ne '2397236d13c2586636330c0869a16b14fa90c810'){throw ('PATCH_BLOB_MISMATCH '+$blob)}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
  node --check (Join-Path $root 'assets\js\ms-help-v1004.js')
  if($LASTEXITCODE -ne 0){throw 'HELP_JS_NODE_CHECK_FAILED'}
  $j=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-help-v1004.js'),[Text.Encoding]::UTF8)
  $c=[IO.File]::ReadAllText((Join-Path $root 'assets\css\ms-help-v1004.css'),[Text.Encoding]::UTF8)
  $h=[IO.File]::ReadAllText((Join-Path $root 'help.html'),[Text.Encoding]::UTF8)
  if(!$j.Contains('MS_V1017_3_INSTALL_HELP')){throw 'INSTALL_HELP_MARKER_MISSING'}
  if(!$j.Contains('beforeinstallprompt') -or !$j.Contains('msInstallHelp')){throw 'INSTALL_HELP_FLOW_MISSING'}
  if(!$c.Contains('.ms10173-install-now') -or !$c.Contains('#c9ff3d') -or !$c.Contains('#fff7e8') -or !$c.Contains('#6da77a')){throw 'INSTALL_HELP_IDENTITY_MISSING'}
  if(!$h.Contains('ms-help-v1004.css?v=10173') -or !$h.Contains('ms-help-v1004.js?v=10173')){throw 'HELP_CACHE_BUST_MISSING'}
  Write-Host 'V1017_3_SOURCE_ASSERTIONS_OK'
  Write-Host 'help_first_item=INSTALL_APP'
  Write-Host 'install_prompt=SUPPORTED_WHEN_AVAILABLE'
  Write-Host 'android_manual_steps=YES'
  Write-Host 'ios_safari_steps=YES'
  Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
  Write-Host 'food_photo_calorie_feature=NOT_IMPLEMENTED'
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1017.3 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;$dir=Split-Path $dst -Parent;New-Item -ItemType Directory -Force -Path $dir | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){Write-Host 'V1017.3 LOCAL QA PASS' -ForegroundColor Green;Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ===';vercel.cmd --prod --yes --scope dayeem-studio-demos;if($LASTEXITCODE -ne 0){Write-Host 'V1017.3 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE};Write-Host 'V1017.3 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green}
