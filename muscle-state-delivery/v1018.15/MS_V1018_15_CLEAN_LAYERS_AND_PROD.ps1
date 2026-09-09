$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.15'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.15-clean-layers-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','weights.html','assets\js\pwa.js','sw.js','assets\js\ms-phase-v952.js','assets\js\ms-member-v943.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
$newFiles=@('assets\js\ms-v101815-clean-mobile.js','assets\css\ms-v101815-clean-mobile.css')
$legacyFiles=@('assets\css\ms-v101812-mobile-nav.css','assets\css\ms-v101813-mobile-nav.css','assets\css\ms-v101814-quick-access-nav.css','assets\js\ms-v101814-quick-access-nav.js')
$previous=@{}
foreach($f in ($newFiles+$legacyFiles)){$src=Join-Path $root $f;$previous[$f]=Test-Path -LiteralPath $src;if($previous[$f]){$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
Write-Host '=== MUSCLE STATE v1018.15 CLEAN LAYERS ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha=[Security.Cryptography.SHA1]::Create();try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
function Download-Verified([string]$name,[string]$dest,[string]$sha){New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null;Invoke-WebRequest -UseBasicParsing -Uri ($base+'/'+$name) -OutFile $dest -TimeoutSec 60;$h=Get-GitBlobSha1 $dest;Write-Host ($name+'_GIT_BLOB_SHA1='+$h);if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$name+' '+$h)}}
$patch=Join-Path $env:TEMP 'MS_V101815_CLEANUP_PATCH.js'
$jsDest=Join-Path $root 'assets\js\ms-v101815-clean-mobile.js'
$cssDest=Join-Path $root 'assets\css\ms-v101815-clean-mobile.css'
$ok=$false
try{
 $vp=Join-Path $root '.vercel\project.json';if(Test-Path -LiteralPath $vp){$vj=[IO.File]::ReadAllText($vp,[Text.Encoding]::UTF8);if(!$vj.Contains('prj_IAbEITc4LtYxnRvZdi8VKKWlrhYT')){throw 'WRONG_VERCEL_PROJECT'}}
 Download-Verified 'ms-v101815-cleanup-patch.js' $patch 'b87bf36a08cac15dffbc81eedd224c1cdcbca9b9'
 Download-Verified 'ms-v101815-clean-mobile.js' $jsDest '814eaf8d4f020e7f1c324109846e214dd18c8b98'
 Download-Verified 'ms-v101815-clean-mobile.css' $cssDest 'f187340d815dcc32849b08da298e3882af54f7e4'
 node --check $patch;if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
 node --check $jsDest;if($LASTEXITCODE -ne 0){throw 'CLEAN_RUNTIME_NODE_CHECK_FAILED'}
 node $patch $root;if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
 foreach($f in @('assets\js\ms-phase-v952.js','assets\js\ms-member-v943.js','assets\js\pwa.js','sw.js')){node --check (Join-Path $root $f);if($LASTEXITCODE -ne 0){throw ('NODE_CHECK_FAILED '+$f)}}
 foreach($f in $legacyFiles){Remove-Item -LiteralPath (Join-Path $root $f) -Force -ErrorAction SilentlyContinue}
 $app=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
 $weights=[IO.File]::ReadAllText((Join-Path $root 'weights.html'),[Text.Encoding]::UTF8)
 $phase=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-phase-v952.js'),[Text.Encoding]::UTF8)
 $member=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-member-v943.js'),[Text.Encoding]::UTF8)
 $runtime=[IO.File]::ReadAllText($jsDest,[Text.Encoding]::UTF8)
 $css=[IO.File]::ReadAllText($cssDest,[Text.Encoding]::UTF8)
 $pwa=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
 $sw=[IO.File]::ReadAllText((Join-Path $root 'sw.js'),[Text.Encoding]::UTF8)
 if($phase.Contains('ms952-pricing-nav') -or $phase.Contains('last.replaceWith(a)')){throw 'LEGACY_PHASE_MOBILE_OWNER_REMAINS'}
 if($member.Contains('ms943-account-trigger') -or $member.Contains("classList.add('ms943-legacy-account')")){throw 'LEGACY_MEMBER_QUICK_OWNER_REMAINS'}
 foreach($x in @('ms-v101815-clean-mobile.css?v=101815','ms-v101815-clean-mobile.js?v=101815','ms-member-v943.js?v=101815','ms-phase-v952.js?v=101815','assets/js/pwa.js?v=101815')){if(!$app.Contains($x)){throw ('APP_REF_MISSING '+$x)}}
 foreach($x in @('ms-v101815-clean-mobile.css?v=101815','ms-v101815-clean-mobile.js?v=101815','ms-member-v943.js?v=101815','ms-phase-v952.js?v=101815','assets/js/pwa.js?v=101815')){if(!$weights.Contains($x)){throw ('WEIGHTS_REF_MISSING '+$x)}}
 if($app.Contains('ms-v101814-quick-access-nav') -or $app.Contains('ms-v101813-mobile-nav')){throw 'APP_OLD_MOBILE_REF_REMAINS'}
 if(!$app.Contains('ms101815-weight-cta') -or !$app.Contains('./weights.html#weightsWorkspace')){throw 'TRAINING_WEIGHT_CTA_MISSING'}
 $appNav=[regex]::Match($app,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(([regex]::Matches($appNav,'data-app-nav=')).Count -ne 3){throw 'APP_STATIC_NAV_NOT_THREE'}
 foreach($x in @('data-app-nav="home"','data-app-nav="training"','data-app-nav="nutrition"')){if(!$appNav.Contains($x)){throw ('APP_STATIC_NAV_ITEM_MISSING '+$x)}}
 $weightsNav=[regex]::Match($weights,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(([regex]::Matches($weightsNav,'<a ')).Count -ne 3){throw 'WEIGHTS_STATIC_NAV_NOT_THREE'}
 if(!$runtime.Contains('ms101815-bottom-nav') -or !$runtime.Contains('ensureFoodFirst') -or !$runtime.Contains('./pricing.html')){throw 'CLEAN_RUNTIME_ASSERTION_FAILED'}
 if(!$runtime.Contains("background:'#c9ff3d'") -or !$css.Contains('background:#c9ff3d!important')){throw 'QUICK_ACCESS_LIME_ASSERTION_FAILED'}
 if(!$pwa.Contains("const VERSION='101815';") -or !$pwa.Contains("updateViaCache:'none'") -or !$pwa.Contains('ms_pwa_controller_101815')){throw 'PWA_REFRESH_ASSERTION_FAILED'}
 if(!$sw.Contains("const VERSION='muscle-state-pwa-v101815';")){throw 'SW_VERSION_101815_MISSING'}
 foreach($f in $legacyFiles){if(Test-Path -LiteralPath (Join-Path $root $f)){throw ('LEGACY_FILE_STILL_PRESENT '+$f)}}
 Write-Host 'V1018_15_SOURCE_ASSERTIONS_OK'
 Write-Host 'legacy_phase_pricing_nav=REMOVED'
 Write-Host 'legacy_member_quick_access=REMOVED'
 Write-Host 'mobile_nav_owner=V101815_ONLY'
 Write-Host 'bottom_nav=HOME_TRAINING_NUTRITION_ONLY'
 Write-Host 'quick_access=FLUORESCENT_LIME'
 Write-Host 'packages=QUICK_ACCESS'
 Write-Host 'weights_cta=TRAINING_PROMINENT'
 Write-Host 'food_photo=NUTRITION_FIRST'
 Write-Host 'pwa_update=FORCED_NO_CACHE'
 Write-Host 'pwa_cache=101815'
 npm run check;if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
 npm run test:smoke;if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
 $ok=$true
}catch{
 Write-Host ('V1018.15 ERROR: '+$_.Exception.Message) -ForegroundColor Red
 foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
 foreach($f in ($newFiles+$legacyFiles)){$dst=Join-Path $root $f;if($previous[$f]){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}else{Remove-Item -LiteralPath $dst -Force -ErrorAction SilentlyContinue}}
 Write-Host 'ROLLBACK_RESTORED'
 exit 1
}
if($ok){
 Write-Host 'V1018.15 LOCAL QA PASS' -ForegroundColor Green
 Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
 vercel.cmd --prod --yes --scope dayeem-studio-demos
 if($LASTEXITCODE -ne 0){Write-Host 'V1018.15 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE}
 $q=[string](Get-Date).Ticks
 $liveApp=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/app.html?v=101815&t='+$q)) -join "`n"
 $liveWeights=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/weights.html?v=101815&t='+$q)) -join "`n"
 $livePhase=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/js/ms-phase-v952.js?v=101815&t='+$q)) -join "`n"
 $liveMember=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/js/ms-member-v943.js?v=101815&t='+$q)) -join "`n"
 $liveCss=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/assets/css/ms-v101815-clean-mobile.css?v=101815&t='+$q)) -join "`n"
 $liveSw=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/sw.js?v=101815&t='+$q)) -join "`n"
 if([string]::IsNullOrWhiteSpace($liveApp) -or [string]::IsNullOrWhiteSpace($liveWeights)){throw 'PRODUCTION_FETCH_FAILED'}
 foreach($x in @('ms-v101815-clean-mobile.css?v=101815','ms-v101815-clean-mobile.js?v=101815','ms-member-v943.js?v=101815','ms-phase-v952.js?v=101815')){if(!$liveApp.Contains($x)){throw ('PRODUCTION_APP_REF_MISSING '+$x)}}
 if(!$liveWeights.Contains('ms-v101815-clean-mobile.js?v=101815')){throw 'PRODUCTION_WEIGHTS_RUNTIME_MISSING'}
 if($livePhase.Contains('ms952-pricing-nav') -or $livePhase.Contains('last.replaceWith(a)')){throw 'PRODUCTION_LEGACY_PHASE_OWNER_REMAINS'}
 if($liveMember.Contains('ms943-account-trigger')){throw 'PRODUCTION_LEGACY_QUICK_OWNER_REMAINS'}
 if(!$liveCss.Contains('background:#c9ff3d!important')){throw 'PRODUCTION_QUICK_LIME_MISSING'}
 if(!$liveSw.Contains("muscle-state-pwa-v101815")){throw 'PRODUCTION_SW_101815_MISSING'}
 Write-Host 'PRODUCTION_ASSERTIONS=PASS'
 Write-Host 'V1018.15 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
