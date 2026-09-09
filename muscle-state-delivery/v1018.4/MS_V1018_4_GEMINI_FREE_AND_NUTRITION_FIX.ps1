$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.4-gemini-free-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js','ms-nutrition-personalized.js','assets\js\ms-food-photo-v1018-1.js','assets\js\ms-food-photo-result-v10182.js')
$optional=@('assets\js\ms-nutrition-session-v10183.js','assets\css\ms-nutrition-session-v10183.css')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
foreach($f in $optional){
  $src=Join-Path $root $f
  if(Test-Path -LiteralPath $src){
    $dst=Join-Path $rb $f
    New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
    Copy-Item -LiteralPath $src -Destination $dst -Force
  }
}
Write-Host '=== MUSCLE STATE v1018.4 GEMINI FREE ==='
Write-Host ('ROLLBACK='+$rb)
function Get-GitBlobSha1([string]$path){
  $bytes=[IO.File]::ReadAllBytes($path)
  $header=[Text.Encoding]::ASCII.GetBytes([string]::Concat('blob ',$bytes.Length.ToString(),[char]0))
  $all=New-Object byte[] ($header.Length+$bytes.Length)
  [Buffer]::BlockCopy($header,0,$all,0,$header.Length)
  [Buffer]::BlockCopy($bytes,0,$all,$header.Length,$bytes.Length)
  $sha1=[Security.Cryptography.SHA1]::Create()
  try{$hash=$sha1.ComputeHash($all)}finally{$sha1.Dispose()}
  return ([BitConverter]::ToString($hash)).Replace('-','').ToLowerInvariant()
}
function Download-Verified([string]$rel,[string]$dest,[string]$sha){
  New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/'+$rel) -OutFile $dest -TimeoutSec 60
  $h=Get-GitBlobSha1 $dest
  Write-Host ($rel+'_GIT_BLOB_SHA1='+$h)
  if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$rel+' '+$h)}
}
$sessionJs=Join-Path $root 'assets\js\ms-nutrition-session-v10183.js'
$sessionCss=Join-Path $root 'assets\css\ms-nutrition-session-v10183.css'
$patch=Join-Path $env:TEMP 'MS_V10184_GEMINI_PATCH.js'
$ok=$false
try{
  Download-Verified 'v1018.3/ms-nutrition-session-v10183.js' $sessionJs 'a35df906c738ca7c3efa476ec0861a73ced03e4f'
  Download-Verified 'v1018.3/ms-nutrition-session-v10183.css' $sessionCss '820e885eeea77288448027a1acaddbe43077df3f'
  Download-Verified 'v1018.4/ms-v10184-gemini-patch.js' $patch 'b757ea960d887733330d2409bc475759be4f00db'
  node --check $sessionJs
  if($LASTEXITCODE -ne 0){throw 'SESSION_GUARD_NODE_CHECK_FAILED'}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  $sj=[IO.File]::ReadAllText($sessionJs,[Text.Encoding]::UTF8)
  $sc=[IO.File]::ReadAllText($sessionCss,[Text.Encoding]::UTF8)
  if(!$sj.Contains('window.MS_API?.refreshSession')){throw 'AUTO_REFRESH_MISSING'}
  if(!$sj.Contains('sessionStorage')){throw 'SESSION_STORAGE_SUPPORT_MISSING'}
  if(!$sj.Contains('res.status===401')){throw 'HTTP_401_RETRY_MISSING'}
  if(!$sj.Contains('ms10183NutritionHost')){throw 'NUTRITION_HOST_MISSING'}
  foreach($v in @('#fff7e8','#f6ead7','#6da77a','#8fc79a','#c9ff3d')){if(!$sc.Contains($v)){throw ('IDENTITY_COLOR_MISSING '+$v)}}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'SOURCE_PATCH_FAILED'}
  node --check (Join-Path $root 'ms-nutrition-personalized.js')
  if($LASTEXITCODE -ne 0){throw 'PERSONALIZED_NODE_CHECK_FAILED'}
  node --check (Join-Path $root 'assets\js\ms-food-photo-v1018-1.js')
  if($LASTEXITCODE -ne 0){throw 'FOOD_PHOTO_NODE_CHECK_FAILED'}
  node --check (Join-Path $root 'assets\js\ms-food-photo-result-v10182.js')
  if($LASTEXITCODE -ne 0){throw 'FOOD_RESULT_NODE_CHECK_FAILED'}
  $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
  $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
  $n=[IO.File]::ReadAllText((Join-Path $root 'ms-nutrition-personalized.js'),[Text.Encoding]::UTF8)
  $f=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-food-photo-v1018-1.js'),[Text.Encoding]::UTF8)
  $r=[IO.File]::ReadAllText((Join-Path $root 'assets\js\ms-food-photo-result-v10182.js'),[Text.Encoding]::UTF8)
  if(([regex]::Matches($h,'ms-nutrition-session-v10183\.js')).Count -ne 1){throw 'SESSION_GUARD_JS_REF_COUNT'}
  if(([regex]::Matches($h,'ms-nutrition-session-v10183\.css')).Count -ne 1){throw 'SESSION_GUARD_CSS_REF_COUNT'}
  if(!$h.Contains('ms-nutrition-personalized.js?v=10184')){throw 'PERSONALIZED_CACHE_BUST_MISSING'}
  if(!$h.Contains('ms-food-photo-v1018-1.js?v=10184')){throw 'FOOD_PHOTO_CACHE_BUST_MISSING'}
  if(!$h.Contains('ms-food-photo-result-v10182.js?v=10184')){throw 'FOOD_RESULT_CACHE_BUST_MISSING'}
  if(!$h.Contains('assets/js/pwa.js?v=10184')){throw 'PWA_QUERY_10184_MISSING'}
  if(!$p.Contains("const VERSION='10184';")){throw 'PWA_VERSION_10184_MISSING'}
  if(!$n.Contains('window.MS_API?.getToken?.()') -or !$n.Contains('sessionStorage')){throw 'PERSONALIZED_SESSION_FIX_MISSING'}
  if(!$f.Contains('provider_free_quota_exceeded')){throw 'GEMINI_FREE_QUOTA_MESSAGE_MISSING'}
  if(!$f.Contains('Gemini')){throw 'GEMINI_COPY_MISSING'}
  if($f.Contains('OpenAI API') -or $r.Contains('OpenAI API')){throw 'OPENAI_COPY_STILL_VISIBLE'}
  Write-Host 'V1018_4_SOURCE_ASSERTIONS_OK'
  Write-Host 'vision_provider=GEMINI_ONLY'
  Write-Host 'paid_fallback=NONE'
  Write-Host 'primary_model=GEMINI_2_5_FLASH'
  Write-Host 'fallback_model=GEMINI_2_5_FLASH_LITE'
  Write-Host 'nutrition_session=AUTO_REFRESH_ON_401'
  Write-Host 'nutrition_token=LOCAL_AND_SESSION_STORAGE'
  Write-Host 'nutrition_containers=GUARANTEED'
  Write-Host 'food_photo_result=EXPLICIT'
  Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
  try{
    $health=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -Method Get -TimeoutSec 30
    if(!$health.ok){throw 'BACKEND_HEALTH_FALSE'}
    if(!$health.vision_enabled){throw 'VISION_DISABLED'}
    if([string]$health.provider -ne 'gemini'){throw ('WRONG_PROVIDER '+[string]$health.provider)}
    if($health.paid_fallback -ne $false){throw 'PAID_FALLBACK_PRESENT'}
    $probe=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=provider-probe' -Method Get -TimeoutSec 30
    if(!$probe.ok -or !$probe.configured -or !$probe.reachable){throw 'GEMINI_PROVIDER_PROBE_FAILED'}
    Write-Host 'GEMINI_BACKEND_HEALTH=PASS'
    Write-Host ('PROVIDER='+[string]$health.provider)
    Write-Host ('VISION_ENABLED='+[string]$health.vision_enabled)
    Write-Host ('GEMINI_REACHABLE='+[string]$probe.reachable)
    Write-Host ('PAID_FALLBACK='+[string]$health.paid_fallback)
  }catch{throw ('BACKEND_HEALTH_FAILED '+$_.Exception.Message)}
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1018.4 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){
      $dst=Join-Path $root $f
      New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
      Copy-Item -LiteralPath $src -Destination $dst -Force
    }
  }
  foreach($f in $optional){
    $src=Join-Path $rb $f
    $dst=Join-Path $root $f
    if(Test-Path -LiteralPath $src){Copy-Item -LiteralPath $src -Destination $dst -Force}else{Remove-Item -LiteralPath $dst -Force -ErrorAction SilentlyContinue}
  }
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){
  Write-Host 'V1018.4 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1018.4 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1018.4 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
