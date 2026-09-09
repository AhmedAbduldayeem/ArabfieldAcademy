$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base16='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.16'
$base17='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.17'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.17-browser-balance-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','weights.html','programs.html','assets\js\data.js','assets\js\pwa.js','sw.js','assets\js\ms-v101815-clean-mobile.js','assets\css\ms-v101815-clean-mobile.css')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1018.17 ROBUST BROWSER FIX + BALANCED TRAINING ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha=[Security.Cryptography.SHA1]::Create();try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
function Download-Verified([string]$url,[string]$name,[string]$dest,[string]$sha){New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null;Invoke-WebRequest -UseBasicParsing -Uri ($url+'/'+$name) -OutFile $dest -TimeoutSec 60;$h=Get-GitBlobSha1 $dest;Write-Host ($name+'_GIT_BLOB_SHA1='+$h);if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$name+' '+$h)}}
$plans=Join-Path $env:TEMP 'MS_V101817_BALANCED_PLANS.json'
$patch=Join-Path $env:TEMP 'MS_V101817_BROWSER_BALANCE_PATCH.js'
$qa=Join-Path $env:TEMP 'MS_V101817_TRAINING_QA.js'
$ok=$false
try{
 $vp=Join-Path $root '.vercel\project.json';if(Test-Path -LiteralPath $vp){$vj=[IO.File]::ReadAllText($vp,[Text.Encoding]::UTF8);if(!$vj.Contains('prj_IAbEITc4LtYxnRvZdi8VKKWlrhYT')){throw 'WRONG_VERCEL_PROJECT'}}
 Download-Verified $base16 'ms-v101816-balanced-plans.json' $plans 'a5a70f30f03e69b01f86addca89eea0058d39cbf'
 Download-Verified $base17 'ms-v101817-browser-balance-patch.js' $patch '215f9f3b73772ddd56241a9ae42191a8de333d54'
 Download-Verified $base16 'ms-v101816-training-qa.js' $qa '622a26a981af895f325b558d4d8f0cc130b0e778'
 node --check $patch;if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
 node --check $qa;if($LASTEXITCODE -ne 0){throw 'QA_NODE_CHECK_FAILED'}
 node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log('BALANCED_PLANS_JSON_OK')" $plans;if($LASTEXITCODE -ne 0){throw 'BALANCED_PLANS_JSON_INVALID'}
 node $patch $root $plans;if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
 foreach($f in @('assets\js\data.js','assets\js\pwa.js','sw.js','assets\js\ms-v101815-clean-mobile.js')){node --check (Join-Path $root $f);if($LASTEXITCODE -ne 0){throw ('NODE_CHECK_FAILED '+$f)}}
 node $qa $root;if($LASTEXITCODE -ne 0){throw 'TRAINING_BALANCE_QA_FAILED'}
 $app=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
 $weights=[IO.File]::ReadAllText((Join-Path $root 'weights.html'),[Text.Encoding]::UTF8)
 $programs=[IO.File]::ReadAllText((Join-Path $root 'programs.html'),[Text.Encoding]::UTF8)
 $runtime=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-v101815-clean-mobile.js'),[Text.Encoding]::UTF8)
 $css=[IO.File]::ReadAllText((Join-Path $root 'assets\css\ms-v101815-clean-mobile.css'),[Text.Encoding]::UTF8)
 $pwa=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
 $sw=[IO.File]::ReadAllText((Join-Path $root 'sw.js'),[Text.Encoding]::UTF8)
 if(!$css.Contains('V101817_BROWSER_DOCK_FINAL_OVERRIDE') -or !$css.Contains('.ms101815-bottom-nav,.mobile-nav.ms938-nav{display:none!important}') -or !$css.Contains('.ms101815-bottom-nav{display:grid!important}')){throw 'BROWSER_DOCK_FINAL_OVERRIDE_ASSERTION_FAILED'}
 if(!$runtime.Contains("const MOBILE=window.matchMedia('(max-width:980px)');") -or !$runtime.Contains('if(!MOBILE.matches){n?.remove();return}') -or !$runtime.Contains("MOBILE.addEventListener?.('change',repair)")){throw 'BROWSER_DOCK_RUNTIME_ASSERTION_FAILED'}
 foreach($h in @($app,$weights,$programs)){if(!$h.Contains('assets/js/data.js?v=101817')){throw 'DATA_CACHE_REF_101817_MISSING'}}
 foreach($h in @($app,$weights)){if(!$h.Contains('ms-v101815-clean-mobile.css?v=101817') -or !$h.Contains('ms-v101815-clean-mobile.js?v=101817')){throw 'CLEAN_MOBILE_CACHE_REF_101817_MISSING'}}
 if(!$pwa.Contains("const VERSION='101817';")){throw 'PWA_VERSION_101817_MISSING'}
 if(!$sw.Contains("const VERSION='muscle-state-pwa-v101817';")){throw 'SW_VERSION_101817_MISSING'}
 Write-Host 'V1018_17_SOURCE_ASSERTIONS_OK'
 Write-Host 'desktop_broken_mobile_buttons=REMOVED_BY_FINAL_OVERRIDE'
 Write-Host 'mobile_bottom_nav=MOBILE_ONLY'
 Write-Host 'training_programs=13'
 Write-Host 'training_sessions=55'
 Write-Host 'paired_split_rule=THREE_PLUS_THREE_FINISHER'
 Write-Host 'push_rule=THREE_CHEST_THREE_SHOULDER_THREE_TRICEPS'
 Write-Host 'pull_rule=THREE_BACK_THREE_BICEPS_FINISHER'
 Write-Host 'leg_rule=THREE_QUAD_THREE_POSTERIOR_FINISHER'
 Write-Host 'conditioning=DEFERRED_TO_NEXT_CARDIO_SYSTEM'
 Write-Host 'pwa_cache=101817'
 npm run check;if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
 npm run test:smoke;if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
 $ok=$true
}catch{
 Write-Host ('V1018.17 ERROR: '+$_.Exception.Message) -ForegroundColor Red
 foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
 Write-Host 'ROLLBACK_RESTORED'
 exit 1
}
if($ok){
 Write-Host 'V1018.17 LOCAL QA PASS' -ForegroundColor Green
 Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
 vercel.cmd --prod --yes --scope dayeem-studio-demos
 if($LASTEXITCODE -ne 0){Write-Host 'V1018.17 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE}
 $q=[string](Get-Date).Ticks
 $liveApp=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/app.html?v=101817&t='+$q)) -join "`n"
 $liveCss=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/css/ms-v101815-clean-mobile.css?v=101817&t='+$q)) -join "`n"
 $liveRuntime=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/js/ms-v101815-clean-mobile.js?v=101817&t='+$q)) -join "`n"
 $liveData=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/js/data.js?v=101817&t='+$q)) -join "`n"
 $liveSw=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/sw.js?v=101817&t='+$q)) -join "`n"
 if([string]::IsNullOrWhiteSpace($liveApp) -or [string]::IsNullOrWhiteSpace($liveData)){throw 'PRODUCTION_FETCH_FAILED'}
 if(!$liveApp.Contains('assets/js/data.js?v=101817') -or !$liveApp.Contains('ms-v101815-clean-mobile.css?v=101817') -or !$liveApp.Contains('ms-v101815-clean-mobile.js?v=101817')){throw 'PRODUCTION_APP_REFS_FAILED'}
 if(!$liveCss.Contains('V101817_BROWSER_DOCK_FINAL_OVERRIDE') -or !$liveCss.Contains('.ms101815-bottom-nav,.mobile-nav.ms938-nav{display:none!important}') -or !$liveCss.Contains('.ms101815-bottom-nav{display:grid!important}')){throw 'PRODUCTION_DOCK_OVERRIDE_FAILED'}
 if(!$liveRuntime.Contains('if(!MOBILE.matches){n?.remove();return}')){throw 'PRODUCTION_RUNTIME_DOCK_GUARD_FAILED'}
 if(!$liveSw.Contains('muscle-state-pwa-v101817')){throw 'PRODUCTION_SW_101817_FAILED'}
 $liveRoot=Join-Path $env:TEMP ('MS_V101817_LIVE_'+$stamp);$liveDataDir=Join-Path $liveRoot 'assets\js';New-Item -ItemType Directory -Force -Path $liveDataDir | Out-Null;[IO.File]::WriteAllText((Join-Path $liveDataDir 'data.js'),$liveData,[Text.Encoding]::UTF8)
 node $qa $liveRoot;if($LASTEXITCODE -ne 0){throw 'PRODUCTION_TRAINING_QA_FAILED'}
 Write-Host 'PRODUCTION_ASSERTIONS=PASS'
 Write-Host 'V1018.17 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}