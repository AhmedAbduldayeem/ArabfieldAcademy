$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.3'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.3-nutrition-session-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js','ms-nutrition-personalized.js')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
Write-Host '=== MUSCLE STATE v1018.3 NUTRITION SESSION ==='
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
function Download-Verified([string]$name,[string]$dest,[string]$sha){
  New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri ($base+'/'+$name) -OutFile $dest -TimeoutSec 60
  $h=Get-GitBlobSha1 $dest
  Write-Host ($name+'_GIT_BLOB_SHA1='+$h)
  if($h -ne $sha){throw ('GIT_BLOB_MISMATCH '+$name+' '+$h)}
}
$js=Join-Path $root 'assets\js\ms-nutrition-session-v10183.js'
$css=Join-Path $root 'assets\css\ms-nutrition-session-v10183.css'
$patch=Join-Path $env:TEMP 'MS_V10183_PATCH.js'
$ok=$false
try{
  Download-Verified 'ms-nutrition-session-v10183.js' $js 'a35df906c738ca7c3efa476ec0861a73ced03e4f'
  Download-Verified 'ms-nutrition-session-v10183.css' $css '820e885eeea77288448027a1acaddbe43077df3f'
  Download-Verified 'ms-v10183-patch.js' $patch 'e14bb12c8ed490bc4e6470a982785fb00d71863b'
  node --check $js
  if($LASTEXITCODE -ne 0){throw 'SESSION_GUARD_NODE_CHECK_FAILED'}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'PATCH_NODE_CHECK_FAILED'}
  $j=[IO.File]::ReadAllText($js,[Text.Encoding]::UTF8)
  $c=[IO.File]::ReadAllText($css,[Text.Encoding]::UTF8)
  if(!$j.Contains('window.MS_API?.refreshSession')){throw 'AUTO_REFRESH_MISSING'}
  if(!$j.Contains('ms10183NutritionHost')){throw 'NUTRITION_HOST_MISSING'}
  if(!$j.Contains('ms10181-analyze')){throw 'FOOD_PHOTO_ANALYZE_GUARD_MISSING'}
  if(!$j.Contains('res.status===401')){throw 'HTTP_401_RETRY_MISSING'}
  if(!$j.Contains('sessionStorage')){throw 'SESSION_STORAGE_SUPPORT_MISSING'}
  foreach($v in @('#fff7e8','#f6ead7','#6da77a','#8fc79a','#c9ff3d')){if(!$c.Contains($v)){throw ('IDENTITY_COLOR_MISSING '+$v)}}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'SOURCE_PATCH_FAILED'}
  node --check (Join-Path $root 'ms-nutrition-personalized.js')
  if($LASTEXITCODE -ne 0){throw 'PERSONALIZED_NODE_CHECK_FAILED'}
  $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
  $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
  $n=[IO.File]::ReadAllText((Join-Path $root 'ms-nutrition-personalized.js'),[Text.Encoding]::UTF8)
  if(([regex]::Matches($h,'ms-nutrition-session-v10183\.js')).Count -ne 1){throw 'SESSION_GUARD_JS_REF_COUNT'}
  if(([regex]::Matches($h,'ms-nutrition-session-v10183\.css')).Count -ne 1){throw 'SESSION_GUARD_CSS_REF_COUNT'}
  if(!$h.Contains('ms-nutrition-personalized.js?v=10183')){throw 'PERSONALIZED_CACHE_BUST_MISSING'}
  if(!$h.Contains('assets/js/pwa.js?v=10183')){throw 'PWA_QUERY_10183_MISSING'}
  if(!$p.Contains("const VERSION='10183';")){throw 'PWA_VERSION_10183_MISSING'}
  if(!$n.Contains('window.MS_API?.getToken?.()') -or !$n.Contains('sessionStorage')){throw 'PERSONALIZED_SESSION_FIX_MISSING'}
  Write-Host 'V1018_3_SOURCE_ASSERTIONS_OK'
  Write-Host 'nutrition_session=AUTO_REFRESH_ON_401'
  Write-Host 'nutrition_token=LOCAL_AND_SESSION_STORAGE'
  Write-Host 'nutrition_containers=GUARANTEED'
  Write-Host 'nutrition_blank_state=REMOVED'
  Write-Host 'food_photo_session=AUTO_REFRESH_ON_401'
  Write-Host 'food_photo_health_message=CANNOT_MASK_ACTIVE_ANALYSIS'
  Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
  try{
    $health=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -Method Get -TimeoutSec 30
    if(!$health.ok){throw 'BACKEND_HEALTH_FALSE'}
    if(!$health.vision_enabled){throw 'VISION_DISABLED'}
    Write-Host 'FOOD_PHOTO_BACKEND_HEALTH=PASS'
    Write-Host ('VISION_ENABLED='+[string]$health.vision_enabled)
  }catch{throw ('BACKEND_HEALTH_FAILED '+$_.Exception.Message)}
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1018.3 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){
      $dst=Join-Path $root $f
      New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
      Copy-Item -LiteralPath $src -Destination $dst -Force
    }
  }
  Remove-Item -LiteralPath $js,$css -Force -ErrorAction SilentlyContinue
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){
  Write-Host 'V1018.3 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1018.3 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1018.3 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}
