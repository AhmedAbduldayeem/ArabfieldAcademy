$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018-food-photo-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
Write-Host '=== MUSCLE STATE v1018 FOOD PHOTO ==='
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
$js=Join-Path $root 'assets\js\ms-food-photo-v1018.js'
$css=Join-Path $root 'assets\css\ms-food-photo-v1018.css'
$patch=Join-Path $env:TEMP 'MS_V1018_HTML_PATCH.js'
$ok=$false
try{
  Download-Verified 'ms-food-photo-v1018.js' $js 'd2bf97c027e96d0c499866478f0226d2028aa9b9'
  Download-Verified 'ms-food-photo-v1018.css' $css '87bc5e919fa5b04a8bf32a0554e2aa048e4f6e7a'
  Download-Verified 'ms-v1018-html-patch.js' $patch 'cf09d0001209c58e139ead25ccac76d165a70774'
  node --check $js
  if($LASTEXITCODE -ne 0){throw 'FOOD_PHOTO_JS_NODE_CHECK_FAILED'}
  node --check $patch
  if($LASTEXITCODE -ne 0){throw 'HTML_PATCH_NODE_CHECK_FAILED'}
  $j=[IO.File]::ReadAllText($js,[Text.Encoding]::UTF8)
  $c=[IO.File]::ReadAllText($css,[Text.Encoding]::UTF8)
  if(!$j.Contains('function compressImage(file)')){throw 'IMAGE_COMPRESSION_MISSING'}
  if(!$j.Contains('image_data_url')){throw 'VISION_IMAGE_PAYLOAD_MISSING'}
  if(!$j.Contains('capture="environment"')){throw 'CAMERA_CAPTURE_MISSING'}
  if(!$j.Contains('image_persisted') -and $j.Contains('.storage.')){throw 'UNEXPECTED_STORAGE_CLIENT'}
  if($j.Contains('.storage.') -or $j.Contains('/storage/v1/')){throw 'PERMANENT_IMAGE_STORAGE_NOT_ALLOWED'}
  if(!$j.Contains('muscle-state-nutrition-e2e-once')){throw 'FOOD_PHOTO_API_MISSING'}
  foreach($v in @('#fff7e8','#f6ead7','#6da77a','#8fc79a','#c9ff3d')){
    if(!$c.Contains($v)){throw ('IDENTITY_COLOR_MISSING '+$v)}
  }
  if(!$c.Contains('.ms1018-card-actions button:first-child') -or !$c.Contains('background:var(--ms1018-lime)')){throw 'PRIMARY_ACTION_IDENTITY_MISSING'}
  node $patch $root
  if($LASTEXITCODE -ne 0){throw 'HTML_PATCH_FAILED'}
  $h=[IO.File]::ReadAllText((Join-Path $root 'app.html'),[Text.Encoding]::UTF8)
  $p=[IO.File]::ReadAllText((Join-Path $root 'assets\js\pwa.js'),[Text.Encoding]::UTF8)
  if(([regex]::Matches($h,'ms-food-photo-v1018\.js')).Count -ne 1){throw 'FOOD_PHOTO_JS_REF_COUNT'}
  if(([regex]::Matches($h,'ms-food-photo-v1018\.css')).Count -ne 1){throw 'FOOD_PHOTO_CSS_REF_COUNT'}
  if(!$p.Contains("const VERSION='1018';")){throw 'PWA_VERSION_1018_MISSING'}
  Write-Host 'V1018_SOURCE_ASSERTIONS_OK'
  Write-Host 'nutrition_option=FOOD_PHOTO'
  Write-Host 'camera_or_gallery=YES'
  Write-Host 'client_image_compression=YES'
  Write-Host 'permanent_image_storage=NONE'
  Write-Host 'structured_meal_storage=SUPABASE_DB'
  Write-Host 'manual_catalog_fallback=YES'
  Write-Host 'identity=VANILLA_CREAM_FRESH_GREEN'
  try{
    $health=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -Method Get -TimeoutSec 30
    if(!$health.ok){throw 'BACKEND_HEALTH_FALSE'}
    Write-Host 'FOOD_PHOTO_BACKEND_HEALTH=PASS'
    Write-Host ('VISION_AUTO_ANALYSIS='+[string]$health.vision_enabled)
    Write-Host ('IMAGE_STORAGE='+[string]$health.image_storage)
  }catch{throw ('BACKEND_HEALTH_FAILED '+$_.Exception.Message)}
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1018 ERROR: '+$_.Exception.Message) -ForegroundColor Red
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
  Write-Host 'V1018 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1018 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1018 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}