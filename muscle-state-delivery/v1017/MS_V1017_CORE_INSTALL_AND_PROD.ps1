$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-core-fix-v1017'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1017'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1017-core-'+$stamp)
$tracked=@(
  'app.html',
  'weights.html',
  'exercise.html',
  'assets\js\app.js',
  'assets\js\weights.js',
  'assets\js\exercises-page.js',
  'assets\js\ms-smart-training-v975.js',
  'assets\css\app.css',
  'assets\js\pwa.js'
)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
Write-Host '=== MUSCLE STATE V1017 CORE SOURCE FIX ==='
Write-Host ('ROLLBACK='+$rb)
$tmp=Join-Path $env:TEMP ('MS_V1017_CORE_'+$stamp)
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$patch=Join-Path $tmp 'ms-v1017-core-patch.js'
$ok=$false
try{
  $b64=''
  @('01','02','03','04a','04b','05a','05b','06') | ForEach-Object {
    $n=$_
    $u=$base+'/core-patch.b64.'+$n
    $p=Join-Path $tmp ('core-patch.b64.'+$n)
    Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $p -TimeoutSec 60
    $part=[IO.File]::ReadAllText($p,[Text.Encoding]::ASCII).Trim()
    if([string]::IsNullOrWhiteSpace($part)){throw ('EMPTY_CHUNK='+$n)}
    Write-Host ('CHUNK_'+$n+'_CHARS='+$part.Length)
    $b64+=$part
  }
  Write-Host ('PATCH_B64_CHARS='+$b64.Length)
  if($b64.Length -ne 40824){throw ('PATCH_B64_LENGTH_MISMATCH='+$b64.Length)}
  $bytes=[Convert]::FromBase64String($b64)
  [IO.File]::WriteAllBytes($patch,$bytes)
  Write-Host ('PATCH_BYTES='+$bytes.Length)
  if($bytes.Length -ne 30618){throw ('PATCH_SIZE_MISMATCH='+$bytes.Length)}
  $h=(Get-FileHash -LiteralPath $patch -Algorithm SHA256).Hash.ToLowerInvariant()
  Write-Host ('PATCH_SHA256='+$h)
  if($h -ne '7a64a36c3863bd9a4f1338d987569d5f3fb4efc39ac2af51fb4e1fd7de3c939c'){throw ('PATCH_SHA_MISMATCH='+$h)}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  Write-Host 'V1017 CORE PATCH VERIFIED'
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'CORE_PATCH_EXECUTION_FAILED'}
  $verify=Join-Path $tmp 'verify-v1017.js'
  $verifyText=@'
const fs=require('fs'),p=require('path');
const root=process.argv[2];
const r=f=>fs.readFileSync(p.join(root,f),'utf8');
const must=(v,m)=>{if(!v)throw new Error(m)};
const app=r('assets/js/app.js'),w=r('assets/js/weights.js'),x=r('assets/js/exercises-page.js'),s=r('assets/js/ms-smart-training-v975.js'),c=r('assets/css/app.css'),pwa=r('assets/js/pwa.js');
const ah=r('app.html'),wh=r('weights.html'),eh=r('exercise.html');
must(app.includes('MS_V1017_CORE_START'),'APP_CORE_MISSING');
must(app.includes('data-alt-ex'),'APP_ALT_MISSING');
must(app.includes('out.slice(0,7)'),'APP_7_MISSING');
must(app.includes('renderTraining();const card'),'APP_INSTANT_RENDER_MISSING');
must(w.includes('MS_V1017_WEIGHT_CORE_START'),'WEIGHTS_CORE_MISSING');
must(w.includes('mswOpenAlt'),'WEIGHTS_ALT_MISSING');
must(w.includes('out.slice(0,7)'),'WEIGHTS_7_MISSING');
must(x.includes('MS_V1017_DIRECT_LOG'),'DIRECT_LOG_MISSING');
must(x.includes('data-ms1017-direct'),'DIRECT_CTA_MISSING');
must(s.includes('MS_V1017_SMART_CLEAN'),'SMART_CLEAN_MISSING');
must(!s.includes('SMART TRAINING CYCLE'),'SMART_TRAINING_INTERNAL_UI_REMAINS');
must(!s.includes("if(training&&!$('#ms975ReadinessMini'))"),'TRAINING_READINESS_INJECTOR_REMAINS');
must(c.includes('MS_V1017_CORE_CSS'),'CORE_CSS_MISSING');
must(c.includes('.ms1017-alt-btn'),'ALT_STYLE_MISSING');
must(pwa.includes("const VERSION='1017';"),'PWA_VERSION_MISSING');
for(const h of [ah,wh,eh]){
  must(!/ms-v1016-(?:3|4)-runtime\.js/.test(h),'OLD_RUNTIME_REFERENCE');
  must(!/ms-v1016-(?:3|4)\.css/.test(h),'OLD_CSS_REFERENCE');
}
must(!ah.includes('id="demoPlanCard"'),'DEMO_CARD_REMAINS');
console.log('V1017_SOURCE_ASSERTIONS_OK');
console.log('standard_days=7');
console.log('alternatives=ONE_BUTTON_START_END_NO_12_CAP');
console.log('alternative_apply=IMMEDIATE');
console.log('wellness=HOME_ONLY');
console.log('internal_training_ui=REMOVED');
console.log('direct_log=SAME_EXERCISE_MODAL');
console.log('overlay_runtimes=REMOVED');
console.log('pwa_cache=1017');
'@
  [IO.File]::WriteAllText($verify,$verifyText,(New-Object Text.UTF8Encoding($false)))
  node $verify $root
  if($LASTEXITCODE -ne 0){throw 'SOURCE_ASSERTIONS_FAILED'}
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1017 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){
      $dst=Join-Path $root $f
      New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
      Copy-Item -LiteralPath $src -Destination $dst -Force
    }
  }
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){
  Write-Host 'V1017 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1017 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1017 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
