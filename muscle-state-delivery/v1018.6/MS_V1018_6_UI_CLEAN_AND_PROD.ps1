$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.6'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.6-ui-clean-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js','assets\js\ms-food-photo-v1018-1.js','assets\js\ms-food-photo-result-v10182.js')
foreach($f in $tracked){$src=Join-Path $root $f;if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)};$dst=Join-Path $rb $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}
Write-Host '=== MUSCLE STATE v1018.6 UI CLEAN ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){$bytes=[IO.File]::ReadAllBytes($path);$header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0));$all=New-Object byte[] ($header.Length+$bytes.Length);[Buffer]::BlockCopy($header,0,$all,0,$header.Length);[Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length);$sha=[Security.Cryptography.SHA1]::Create();try{$hash=$sha.ComputeHash($all)}finally{$sha.Dispose()};return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()}
$patch=Join-Path $env:TEMP 'MS_V10186_UI_CLEAN_PATCH.js'
$ok=$false
try{
 Invoke-WebRequest -UseBasicParsing -Uri ($base+'/ms-v10186-ui-clean-patch.js') -OutFile $patch -TimeoutSec 60
 $ph=Get-GitBlobSha1 $patch;Write-Host ('PATCH_GIT_BLOB_SHA1='+$ph);if($ph -ne '21caf1ce7b95352a56e8bdca3366a29584095360'){throw ('PATCH_BLOB_MISMATCH '+$ph)}
 node --check $patch;if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
 node $patch $root;if($LASTEXITCODE -ne 0){throw 'PATCH_EXEC_FAILED'}
 node --check (Join-Path $root 'assets\js\ms-food-photo-v1018-1.js');if($LASTEXITCODE -ne 0){throw 'FOOD_PHOTO_NODE_CHECK_FAILED'}
 node --check (Join-Path $root 'assets\js\ms-food-photo-result-v10182.js');if($LASTEXITCODE -ne 0){throw 'RESULT_NODE_CHECK_FAILED'}
 $f=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-food-photo-v1018-1.js'),[Text.Encoding]::UTF8)
 $r=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-food-photo-result-v10182.js'),[Text.Encoding]::UTF8)
 $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
 $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
 if($f -match '(?i)Gemini|OpenAI|Billing'){throw 'EXTERNAL_PROVIDER_COPY_IN_FOOD_UI'}
 if($r -match '(?i)Gemini|OpenAI|Billing'){throw 'EXTERNAL_PROVIDER_COPY_IN_RESULT_UI'}
 if(!$h.Contains('ms-food-photo-v1018-1.js?v=10186')){throw 'FOOD_CACHE_10186_MISSING'}
 if(!$h.Contains('ms-food-photo-result-v10182.js?v=10186')){throw 'RESULT_CACHE_10186_MISSING'}
 if(!$h.Contains('assets/js/pwa.js?v=10186')){throw 'PWA_QUERY_10186_MISSING'}
 if(!$p.Contains("const VERSION='10186';")){throw 'PWA_VERSION_10186_MISSING'}
 Write-Host 'V1018_6_SOURCE_ASSERTIONS_OK'
 Write-Host 'user_ui=NO_EXTERNAL_PROVIDER_DATA'
 Write-Host 'analysis_status=GENERIC_ONLY'
 Write-Host 'health_success_message=HIDDEN'
 Write-Host 'pwa_cache=10186'
 $probe=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=provider-probe' -Method Get -TimeoutSec 45
 if(!$probe.ok -or !$probe.configured -or !$probe.reachable){throw 'VISION_BACKEND_NOT_REACHABLE'}
 Write-Host 'VISION_BACKEND=PASS'
 npm run check;if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
 npm run test:smoke;if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
 $ok=$true
}catch{
 Write-Host ('V1018.6 ERROR: '+$_.Exception.Message) -ForegroundColor Red
 foreach($f in $tracked){$src=Join-Path $rb $f;if(Test-Path -LiteralPath $src){$dst=Join-Path $root $f;New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null;Copy-Item -LiteralPath $src -Destination $dst -Force}}
 Write-Host 'ROLLBACK_RESTORED'
 exit 1
}
if($ok){Write-Host 'V1018.6 LOCAL QA PASS' -ForegroundColor Green;Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ===';vercel.cmd --prod --yes --scope dayeem-studio-demos;if($LASTEXITCODE -ne 0){Write-Host 'V1018.6 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow;exit $LASTEXITCODE};Write-Host 'V1018.6 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green}