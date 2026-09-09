$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.13'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.13-identity-safe-smart-nav-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js','assets\js\ms-food-photo-v1018-1.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
$cssRel='assets\css\ms-v101813-mobile-nav.css'
$cssPath=Join-Path $root $cssRel
$cssExisted=Test-Path -LiteralPath $cssPath
if($cssExisted){$dst=Join-Path $rb $cssRel;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $cssPath -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1018.13 IDENTITY SAFE SMART NAV ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha=[Security.Cryptography.SHA1]::Create();try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
function Download-Verified([string]$name,[string]$dest,[string]$sha){New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null;Invoke-WebRequest -UseBasicParsing -Uri ($base+'/'+$name) -OutFile $dest -TimeoutSec 60;$h=Get-GitBlobSha1 $dest;Write-Host ($name+'_GIT_BLOB_SHA1='+$h);if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$name+' '+$h)}}
$patch=Join-Path $env:TEMP 'MS_V101813_IDENTITY_SAFE_SMART_NAV_PATCH.js'
$ok=$false
try{
 Download-Verified 'ms-v101813-smart-layer-mobile-nav-patch.js' $patch '074afdc4668f4a9cbe9cd30b7bd57b1efebd4d18'
 Download-Verified 'ms-v101813-mobile-nav.css' $cssPath '04518dc0e390cd235efda7a8d7c5d6340f182ef3'
 node --check $patch;if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
 node $patch $root;if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
 node --check (Join-Path $root 'assets\js\ms-food-photo-v1018-1.js');if($LASTEXITCODE -ne 0){throw 'FOOD_PHOTO_NODE_CHECK_FAILED'}
 $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
 $f=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-food-photo-v1018-1.js'),[Text.Encoding]::UTF8)
 $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
 $c=[IO.File]::ReadAllText($cssPath,[Text.Encoding]::UTF8)
 $nav=[regex]::Match($h,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(!$nav){throw 'MOBILE_NAV_MISSING'}
 if(([regex]::Matches($nav,'data-app-nav=')).Count -ne 3){throw 'MOBILE_NAV_NOT_THREE'}
 foreach($x in @('data-app-nav="home"','data-app-nav="training"','data-app-nav="nutrition"')){if(!$nav.Contains($x)){throw ('MOBILE_NAV_ITEM_MISSING '+$x)}}
 if($nav.Contains('weights.html') -or $nav.Contains('data-app-nav="progress"') -or $nav.Contains('data-app-nav="account"')){throw 'MOBILE_NAV_EXTRA_ITEM_PRESENT'}
 if(!$h.Contains('ms101813-weight-cta') -or !$h.Contains('./weights.html#weightsWorkspace')){throw 'TRAINING_WEIGHTS_CTA_MISSING'}
 if(!$h.Contains('assets/css/ms-v101813-mobile-nav.css?v=101813')){throw 'MOBILE_CSS_REF_MISSING'}
 if(!$h.Contains('ms-food-photo-v1018-1.js?v=101813')){throw 'FOOD_CACHE_101813_MISSING'}
 if(!$h.Contains('ms-food-photo-result-v10182.js?v=101813')){throw 'RESULT_CACHE_101813_MISSING'}
 if(!$h.Contains('assets/js/pwa.js?v=101813')){throw 'PWA_QUERY_101813_MISSING'}
 if(!$p.Contains("const VERSION='101813';")){throw 'PWA_VERSION_101813_MISSING'}
 if(!$f.Contains('const max=1024') -or !$f.Contains('blob?.size>1200000')){throw 'FOOD_CLIENT_COMPRESSION_MISSING'}
 if($f -cmatch 'Gemini|OpenAI|Billing'){throw 'FOOD_EXTERNAL_COPY_REMAINS'}
 foreach($v in @('#fff7e8','#f6ead7','#6da77a','#8fc79a','#c9ff3d','#214b31')){if(!$c.Contains($v)){throw ('IDENTITY_COLOR_MISSING '+$v)}}
 Write-Host 'V1018_13_SOURCE_ASSERTIONS_OK'
 Write-Host 'mobile_nav=HOME_TRAINING_NUTRITION_ONLY'
 Write-Host 'weights_cta=INSIDE_TRAINING'
 Write-Host 'identity_tokens=EXPLICIT'
 Write-Host 'food_client_max_side=1024'
 Write-Host 'food_client_large_guard=1200000'
 Write-Host 'user_ui=NO_PROVIDER_DATA'
 $health=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -Method Get -TimeoutSec 30
 if(!$health.ok -or !$health.vision_enabled -or !$health.smart_cache -or $health.paid_fallback -ne $false){throw 'SMART_BACKEND_HEALTH_FAILED'}
 $probe=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=provider-probe' -Method Get -TimeoutSec 45
 if(!$probe.ok -or !$probe.configured -or !$probe.reachable -or $probe.paid_fallback -ne $false){throw 'VISION_BACKEND_NOT_REACHABLE'}
 Write-Host 'SMART_BACKEND=PASS'
 Write-Host 'smart_cache=TRUE'
 Write-Host 'paid_fallback=FALSE'
 npm run check;if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
 npm run test:smoke;if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
 $ok=$true
}catch{
 Write-Host ('V1018.13 ERROR: '+$_.Exception.Message) -ForegroundColor Red
 foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
 if($cssExisted){$src=Join-Path $rb $cssRel;if(Test-Path -LiteralPath $src){Copy-Item -LiteralPath $src -Destination $cssPath -Force}}else{Remove-Item -LiteralPath $cssPath -Force -ErrorAction SilentlyContinue}
 Write-Host 'ROLLBACK_RESTORED'
 exit 1
}
if($ok){
 Write-Host 'V1018.13 LOCAL QA PASS' -ForegroundColor Green
 Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
 vercel.cmd --prod --yes --scope dayeem-studio-demos
 if($LASTEXITCODE -ne 0){Write-Host 'V1018.13 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE}
 $live=(Invoke-WebRequest -UseBasicParsing -Uri ('https://muscle-state-00.vercel.app/app.html?v=101813&t='+(Get-Date).Ticks) -TimeoutSec 45).Content
 $liveNav=[regex]::Match($live,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(([regex]::Matches($liveNav,'data-app-nav=')).Count -ne 3){throw 'PRODUCTION_MOBILE_NAV_NOT_THREE'}
 if(!$live.Contains('ms101813-weight-cta') -or !$live.Contains('ms-v101813-mobile-nav.css?v=101813') -or !$live.Contains('ms-food-photo-v1018-1.js?v=101813') -or !$live.Contains('assets/js/pwa.js?v=101813')){throw 'PRODUCTION_101813_ASSERTION_FAILED'}
 Write-Host 'PRODUCTION_ASSERTIONS=PASS'
 Write-Host 'V1018.13 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
