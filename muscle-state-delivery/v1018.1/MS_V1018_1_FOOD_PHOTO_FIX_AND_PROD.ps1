$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$appPath=Join-Path $root 'app.html'
$pwaPath=Join-Path $root 'assets\js\pwa.js'
$jsPath=Join-Path $root 'assets\js\ms-food-photo-v1018-1.js'
$cssPath=Join-Path $root 'assets\css\ms-food-photo-v1018-1.css'
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.1'
$expectedJs='72622c2326819c76d48050742ff145bc0f73eb3b'
$expectedCss='a36b9b38a42c5fe9981bd7c6497bd15accc6c696'
$utf8=New-Object System.Text.UTF8Encoding($false)

function GitBlobSha1([string]$path){
  $bytes=[IO.File]::ReadAllBytes($path)
  $head=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0))
  $all=New-Object byte[] ($head.Length+$bytes.Length)
  [Buffer]::BlockCopy($head,0,$all,0,$head.Length)
  [Buffer]::BlockCopy($bytes,0,$all,$head.Length,$bytes.Length)
  $sha=[Security.Cryptography.SHA1]::Create()
  try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()}
  return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()
}
function Restore-Rollback{
  if(Test-Path -LiteralPath (Join-Path $rb 'app.html')){Copy-Item -LiteralPath (Join-Path $rb 'app.html') -Destination $appPath -Force}
  if(Test-Path -LiteralPath (Join-Path $rb 'pwa.js')){Copy-Item -LiteralPath (Join-Path $rb 'pwa.js') -Destination $pwaPath -Force}
  if($hadJs){Copy-Item -LiteralPath (Join-Path $rb 'ms-food-photo-v1018-1.js') -Destination $jsPath -Force}else{Remove-Item -LiteralPath $jsPath -Force -ErrorAction SilentlyContinue}
  if($hadCss){Copy-Item -LiteralPath (Join-Path $rb 'ms-food-photo-v1018-1.css') -Destination $cssPath -Force}else{Remove-Item -LiteralPath $cssPath -Force -ErrorAction SilentlyContinue}
  Write-Host 'ROLLBACK_RESTORED'
}

Write-Host '=== MUSCLE STATE V1018.1 FOOD PHOTO STABILITY FIX ==='
if(!(Test-Path -LiteralPath $appPath)){throw 'APP_HTML_NOT_FOUND'}
if(!(Test-Path -LiteralPath $pwaPath)){throw 'PWA_JS_NOT_FOUND'}
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.1-food-photo-'+$stamp)
New-Item -ItemType Directory -Path $rb -Force | Out-Null
Copy-Item -LiteralPath $appPath -Destination (Join-Path $rb 'app.html') -Force
Copy-Item -LiteralPath $pwaPath -Destination (Join-Path $rb 'pwa.js') -Force
$hadJs=Test-Path -LiteralPath $jsPath
$hadCss=Test-Path -LiteralPath $cssPath
if($hadJs){Copy-Item -LiteralPath $jsPath -Destination (Join-Path $rb 'ms-food-photo-v1018-1.js') -Force}
if($hadCss){Copy-Item -LiteralPath $cssPath -Destination (Join-Path $rb 'ms-food-photo-v1018-1.css') -Force}
Write-Host ('ROLLBACK='+$rb)

$tmpJs=Join-Path $env:TEMP 'ms-food-photo-v1018-1.js'
$tmpCss=Join-Path $env:TEMP 'ms-food-photo-v1018-1.css'
Remove-Item -LiteralPath $tmpJs,$tmpCss -Force -ErrorAction SilentlyContinue

try{
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-food-photo-v1018-1.js') -OutFile $tmpJs -TimeoutSec 60
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-food-photo-v1018-1.css') -OutFile $tmpCss -TimeoutSec 60
  $jsBlob=GitBlobSha1 $tmpJs
  $cssBlob=GitBlobSha1 $tmpCss
  Write-Host ('JS_GIT_BLOB_SHA1='+$jsBlob)
  Write-Host ('CSS_GIT_BLOB_SHA1='+$cssBlob)
  if($jsBlob -ne $expectedJs){throw ('JS_BLOB_MISMATCH '+$jsBlob)}
  if($cssBlob -ne $expectedCss){throw ('CSS_BLOB_MISMATCH '+$cssBlob)}
  node --check $tmpJs
  if($LASTEXITCODE -ne 0){throw 'FOOD_PHOTO_JS_SYNTAX_FAILED'}

  Copy-Item -LiteralPath $tmpJs -Destination $jsPath -Force
  Copy-Item -LiteralPath $tmpCss -Destination $cssPath -Force

  $app=[IO.File]::ReadAllText($appPath,[Text.Encoding]::UTF8)
  $app=[regex]::Replace($app,'<link rel="stylesheet" href="assets/css/ms-food-photo-v1018(?:-1)?\.css\?v=\d+">','')
  $app=[regex]::Replace($app,'<script src="assets/js/ms-food-photo-v1018(?:-1)?\.js\?v=\d+" defer></script>','')
  $app=[regex]::Replace($app,'assets/js/pwa\.js\?v=\d+','assets/js/pwa.js?v=10181')
  if($app -notmatch '</head>'){throw 'HEAD_CLOSE_NOT_FOUND'}
  if($app -notmatch '</body>'){throw 'BODY_CLOSE_NOT_FOUND'}
  $app=$app.Replace('</head>','<link rel="stylesheet" href="assets/css/ms-food-photo-v1018-1.css?v=10181">'+[Environment]::NewLine+'</head>')
  $app=$app.Replace('</body>','<script src="assets/js/ms-food-photo-v1018-1.js?v=10181" defer></script>'+[Environment]::NewLine+'</body>')
  [IO.File]::WriteAllText($appPath,$app,$utf8)

  $pwa=[IO.File]::ReadAllText($pwaPath,[Text.Encoding]::UTF8)
  $pwa=[regex]::Replace($pwa,"const VERSION='[^']+';","const VERSION='10181';",1)
  [IO.File]::WriteAllText($pwaPath,$pwa,$utf8)

  node --check $jsPath
  if($LASTEXITCODE -ne 0){throw 'INSTALLED_FOOD_PHOTO_JS_SYNTAX_FAILED'}
  node --check $pwaPath
  if($LASTEXITCODE -ne 0){throw 'PWA_JS_SYNTAX_FAILED'}

  $verify=@'
const fs=require('fs');
const app=fs.readFileSync('app.html','utf8');
const js=fs.readFileSync('assets/js/ms-food-photo-v1018-1.js','utf8');
const css=fs.readFileSync('assets/css/ms-food-photo-v1018-1.css','utf8');
const pwa=fs.readFileSync('assets/js/pwa.js','utf8');
const count=(s,r)=>(s.match(r)||[]).length;
function ok(v,m){if(!v){console.error(m);process.exit(1)}}
ok(count(app,/ms-food-photo-v1018-1\.js\?v=10181/g)===1,'NEW_JS_REF_COUNT');
ok(count(app,/ms-food-photo-v1018-1\.css\?v=10181/g)===1,'NEW_CSS_REF_COUNT');
ok(!/ms-food-photo-v1018\.js\?v=1018/.test(app),'OLD_JS_REF_REMAINS');
ok(!/ms-food-photo-v1018\.css\?v=1018/.test(app),'OLD_CSS_REF_REMAINS');
ok(/pwa\.js\?v=10181/.test(app),'PWA_REF_MISSING');
ok(js.includes('data-ms10181-gallery'),'GALLERY_BUTTON_MISSING');
ok(js.includes('data-ms10181-gallery-input'),'GALLERY_INPUT_MISSING');
ok(js.includes('capture="environment"'),'CAMERA_CAPTURE_MISSING');
ok(js.includes("addEventListener('popstate'"),'BACK_HANDLER_MISSING');
ok(js.includes('history.pushState'),'HISTORY_STAGE_MISSING');
ok(js.includes('ms10181Stage'),'STEP_STATE_MISSING');
ok(js.includes('provider_quota_or_billing'),'PROVIDER_ERROR_MAP_MISSING');
ok(js.includes('MSFoodPhoto10181'),'RUNTIME_MARKER_MISSING');
ok(!js.includes('data-close'),'GENERIC_CLOSE_COLLISION');
ok(css.includes('#fff7e8')&&css.includes('#f6ead7')&&css.includes('#6da77a')&&css.includes('#c9ff3d'),'IDENTITY_PALETTE_MISSING');
ok(pwa.includes("const VERSION='10181';"),'PWA_VERSION_MISSING');
console.log('V1018_1_SOURCE_ASSERTIONS_OK');
console.log('gallery=EXPLICIT_STUDIO_OPTION');
console.log('camera=EXPLICIT_CAMERA_OPTION');
console.log('back=STEP_ONLY');
console.log('nutrition_card=SELF_HEALING');
console.log('provider_errors=ACTIONABLE');
console.log('identity=VANILLA_CREAM_GREEN');
'@
  $vf=Join-Path $env:TEMP 'verify-v1018-1.js'
  [IO.File]::WriteAllText($vf,$verify,[Text.Encoding]::ASCII)
  node $vf
  if($LASTEXITCODE -ne 0){throw 'SOURCE_ASSERTIONS_FAILED'}

  $health=Invoke-RestMethod -Method Get -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -TimeoutSec 60
  if(!$health.ok){throw 'BACKEND_HEALTH_FAILED'}
  if($health.service -ne 'food_photo_v1018_1'){throw ('BACKEND_SERVICE_MISMATCH '+$health.service)}
  if(!$health.vision_enabled){throw 'VISION_NOT_ENABLED'}
  Write-Host ('BACKEND_SERVICE='+$health.service)
  Write-Host ('VISION_ENABLED='+$health.vision_enabled)
  Write-Host ('PRIMARY_MODEL='+$health.model)
  Write-Host ('FALLBACK_MODEL='+$health.fallback_model)

  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_TEST_FAILED'}
  Write-Host 'V1018.1 LOCAL QA PASS'
}catch{
  Restore-Rollback
  throw
}finally{
  Remove-Item -LiteralPath $tmpJs,$tmpCss -Force -ErrorAction SilentlyContinue
}

Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
& vercel.cmd --prod --yes --scope dayeem-studio-demos
if($LASTEXITCODE -ne 0){
  Write-Host 'V1018.1 LOCAL PASS BUT PRODUCTION DEPLOY FAILED'
  exit $LASTEXITCODE
}
Write-Host 'V1018.1 PRODUCTION DEPLOY COMPLETED'
