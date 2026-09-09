$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.14'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.14-quick-access-nav-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
$newFiles=@('assets\js\ms-v101814-quick-access-nav.js','assets\css\ms-v101814-quick-access-nav.css')
$previous=@{}
foreach($f in $newFiles){$src=Join-Path $root $f;$previous[$f]=Test-Path -LiteralPath $src;if($previous[$f]){$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
Write-Host '=== MUSCLE STATE v1018.14 QUICK ACCESS + NAV LOCK ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha=[Security.Cryptography.SHA1]::Create();try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
function Download-Verified([string]$name,[string]$dest,[string]$sha){New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null;Invoke-WebRequest -UseBasicParsing -Uri ($base+'/'+$name) -OutFile $dest -TimeoutSec 60;$h=Get-GitBlobSha1 $dest;Write-Host ($name+'_GIT_BLOB_SHA1='+$h);if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$name+' '+$h)}}
$patch=Join-Path $env:TEMP 'MS_V101814_APP_PATCH.js'
$jsDest=Join-Path $root 'assets\js\ms-v101814-quick-access-nav.js'
$cssDest=Join-Path $root 'assets\css\ms-v101814-quick-access-nav.css'
$ok=$false
try{
 $vp=Join-Path $root '.vercel\project.json';if(Test-Path -LiteralPath $vp){$vj=[IO.File]::ReadAllText($vp,[Text.Encoding]::UTF8);if(!$vj.Contains('prj_IAbEITc4LtYxnRvZdi8VKKWlrhYT')){throw 'WRONG_VERCEL_PROJECT'}}
 Download-Verified 'ms-v101814-app-patch.js' $patch '86b5649594bf3b2e9583d42a80a2d436ef440d53'
 Download-Verified 'ms-v101814-quick-access-nav.js' $jsDest 'fb2cb1823cff2268c118e6c68483a48542735d77'
 Download-Verified 'ms-v101814-quick-access-nav.css' $cssDest 'cf1eccb7fc1ee7d94b86375bcc699afb1e032f2d'
 node --check $patch;if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
 node --check $jsDest;if($LASTEXITCODE -ne 0){throw 'RUNTIME_NODE_CHECK_FAILED'}
 node $patch $root;if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
 node --check (Join-Path $root 'assets\js\pwa.js');if($LASTEXITCODE -ne 0){throw 'PWA_NODE_CHECK_FAILED'}
 $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
 $j=[IO.File]::ReadAllText($jsDest,[Text.Encoding]::UTF8)
 $c=[IO.File]::ReadAllText($cssDest,[Text.Encoding]::UTF8)
 $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
 $nav=[regex]::Match($h,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(!$nav){throw 'MOBILE_NAV_MISSING'}
 if(([regex]::Matches($nav,'data-app-nav=')).Count -ne 3){throw 'MOBILE_NAV_NOT_THREE'}
 foreach($x in @('data-app-nav="home"','data-app-nav="training"','data-app-nav="nutrition"')){if(!$nav.Contains($x)){throw ('MOBILE_NAV_ITEM_MISSING '+$x)}}
 if($nav.Contains('pricing.html') -or $nav.Contains('weights.html') -or $nav.Contains('data-app-nav="account"') -or $nav.Contains('data-app-nav="progress"')){throw 'MOBILE_NAV_EXTRA_ITEM_PRESENT'}
 if(!$h.Contains('ms101814-weight-cta') -or !$h.Contains('./weights.html#weightsWorkspace')){throw 'TRAINING_WEIGHT_CTA_MISSING'}
 if(!$h.Contains('ms-v101814-quick-access-nav.css?v=101814') -or !$h.Contains('ms-v101814-quick-access-nav.js?v=101814')){throw 'V101814_ASSET_REF_MISSING'}
 if(!$j.Contains('./pricing.html') -or !$j.Contains('ms101814QuickAccessBtn') -or !$j.Contains('ensureFoodFirst') -or !$j.Contains('enforceNav')){throw 'QUICK_ACCESS_RUNTIME_ASSERTION_FAILED'}
 if(!$c.Contains('min-height:58px') -or !$c.Contains('min-height:84px') -or !$c.Contains('#6da77a') -or !$c.Contains('#c9ff3d')){throw 'UX_STYLE_ASSERTION_FAILED'}
 if(!$h.Contains('assets/js/pwa.js?v=101814') -or !$p.Contains("const VERSION='101814';")){throw 'PWA_101814_MISSING'}
 Write-Host 'V1018_14_SOURCE_ASSERTIONS_OK'
 Write-Host 'bottom_nav=HOME_TRAINING_NUTRITION_LOCKED'
 Write-Host 'packages=QUICK_ACCESS_ONLY'
 Write-Host 'top_quick_access=ENLARGED_MULTI_DESTINATION'
 Write-Host 'weights_cta=TRAINING_PROMINENT'
 Write-Host 'food_photo=NUTRITION_FIRST_GUARDED'
 Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
 Write-Host 'pwa_cache=101814'
 npm run check;if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
 npm run test:smoke;if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
 $ok=$true
}catch{
 Write-Host ('V1018.14 ERROR: '+$_.Exception.Message) -ForegroundColor Red
 foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;Copy-Item -LiteralPath $src -Destination $dst -Force}}
 foreach($f in $newFiles){$dst=Join-Path $root $f;if($previous[$f]){$src=Join-Path $rb $f;Copy-Item -LiteralPath $src -Destination $dst -Force}else{Remove-Item -LiteralPath $dst -Force -ErrorAction SilentlyContinue}}
 Write-Host 'ROLLBACK_RESTORED'
 exit 1
}
if($ok){
 Write-Host 'V1018.14 LOCAL QA PASS' -ForegroundColor Green
 Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
 vercel.cmd --prod --yes --scope dayeem-studio-demos
 if($LASTEXITCODE -ne 0){Write-Host 'V1018.14 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE}
 $live=(curl.exe -L -sS ('https://muscle-state-00.vercel.app/app.html?v=101814&t='+(Get-Date).Ticks)) -join "`n"
 if($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($live)){throw 'PRODUCTION_FETCH_FAILED'}
 $liveNav=[regex]::Match($live,'<nav class="mobile-nav ms938-nav"[\s\S]*?</nav>').Value
 if(([regex]::Matches($liveNav,'data-app-nav=')).Count -ne 3){throw 'PRODUCTION_NAV_NOT_THREE'}
 if($liveNav.Contains('pricing.html') -or $liveNav.Contains('weights.html')){throw 'PRODUCTION_NAV_EXTRA_LINK'}
 if(!$live.Contains('ms101814-weight-cta') -or !$live.Contains('ms-v101814-quick-access-nav.css?v=101814') -or !$live.Contains('ms-v101814-quick-access-nav.js?v=101814')){throw 'PRODUCTION_101814_ASSERTION_FAILED'}
 Write-Host 'PRODUCTION_ASSERTIONS=PASS'
 Write-Host 'V1018.14 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
