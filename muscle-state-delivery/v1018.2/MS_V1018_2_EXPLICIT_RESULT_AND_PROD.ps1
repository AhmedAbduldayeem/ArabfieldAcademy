$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$branch='muscle-state-food-photo-v1018-1'
$base='https://raw.githubusercontent.com/AhmedAbduldayeem/ArabfieldAcademy/'+$branch+'/muscle-state-delivery/v1018.2'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$rb=Join-Path $root ('_rollback\v1018.2-result-'+$stamp)
New-Item -ItemType Directory -Force -Path $rb | Out-Null
$tracked=@('app.html','assets\js\pwa.js')
foreach($f in $tracked){
  $src=Join-Path $root $f
  if(!(Test-Path -LiteralPath $src)){throw ('MISSING_FILE='+$f)}
  $dst=Join-Path $rb $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
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
$js=Join-Path $root 'assets\js\ms-food-photo-result-v10182.js'
$css=Join-Path $root 'assets\css\ms-food-photo-result-v10182.css'
$ok=$false
try{
  Write-Host '=== MUSCLE STATE v1018.2 EXPLICIT RESULT ==='
  Write-Host ('ROLLBACK='+$rb)
  Download-Verified 'ms-food-photo-result-v10182.js' $js '380d8629e98e3479194752506afe06daf4903662'
  Download-Verified 'ms-food-photo-result-v10182.css' $css 'e6a3011c58a62ac9081921a54d8d966eb3b17373'
  node --check $js
  if($LASTEXITCODE -ne 0){throw 'RESULT_JS_NODE_CHECK_FAILED'}
  $j=[IO.File]::ReadAllText($js,[Text.Encoding]::UTF8)
  $c=[IO.File]::ReadAllText($css,[Text.Encoding]::UTF8)
  foreach($m in @('ms10182-result','mountResult','totalsFrom','ms10182-detected','provider_quota_or_billing')){
    if(!$j.Contains($m)){throw ('RESULT_MARKER_MISSING '+$m)}
  }
  foreach($v in @('#fff7e8','#f6ead7','#c9ff3d','#214b31')){
    if(!$c.Contains($v)){throw ('IDENTITY_COLOR_MISSING '+$v)}
  }
  $app=Join-Path $root 'app.html'
  $h=[IO.File]::ReadAllText($app,[Text.Encoding]::UTF8)
  $h=[regex]::Replace($h,'<link[^>]+ms-food-photo-result-v10182\.css[^>]*>\s*','',[Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $h=[regex]::Replace($h,'<script[^>]+ms-food-photo-result-v10182\.js[^>]*></script>\s*','',[Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $cssAnchor='<link rel="stylesheet" href="assets/css/ms-food-photo-v1018-1.css?v=10181">'
  if(!$h.Contains($cssAnchor)){throw 'V10181_CSS_ANCHOR_MISSING'}
  $h=$h.Replace($cssAnchor,$cssAnchor+"`r`n"+'<link rel="stylesheet" href="assets/css/ms-food-photo-result-v10182.css?v=10182">')
  $jsAnchor='<script src="assets/js/ms-food-photo-v1018-1.js?v=10181" defer></script>'
  if(!$h.Contains($jsAnchor)){throw 'V10181_JS_ANCHOR_MISSING'}
  $h=$h.Replace($jsAnchor,$jsAnchor+"`r`n"+'<script src="assets/js/ms-food-photo-result-v10182.js?v=10182" defer></script>')
  $h=$h.Replace('assets/js/pwa.js?v=10181','assets/js/pwa.js?v=10182')
  [IO.File]::WriteAllText($app,$h,[Text.UTF8Encoding]::new($false))
  $pwa=Join-Path $root 'assets\js\pwa.js'
  $p=[IO.File]::ReadAllText($pwa,[Text.Encoding]::UTF8)
  if(!$p.Contains("const VERSION='10181';") -and !$p.Contains("const VERSION='10182';")){throw 'PWA_VERSION_ANCHOR_MISSING'}
  $p=$p.Replace("const VERSION='10181';","const VERSION='10182';")
  [IO.File]::WriteAllText($pwa,$p,[Text.UTF8Encoding]::new($false))
  $h=[IO.File]::ReadAllText($app,[Text.Encoding]::UTF8)
  $p=[IO.File]::ReadAllText($pwa,[Text.Encoding]::UTF8)
  if(([regex]::Matches($h,'ms-food-photo-result-v10182\.js')).Count -ne 1){throw 'RESULT_JS_REF_COUNT'}
  if(([regex]::Matches($h,'ms-food-photo-result-v10182\.css')).Count -ne 1){throw 'RESULT_CSS_REF_COUNT'}
  if(!$h.Contains('assets/js/pwa.js?v=10182')){throw 'PWA_REF_10182_MISSING'}
  if(!$p.Contains("const VERSION='10182';")){throw 'PWA_VERSION_10182_MISSING'}
  try{
    $health=Invoke-RestMethod -UseBasicParsing -Uri 'https://vfqhvkibpisfidulohlm.supabase.co/functions/v1/muscle-state-nutrition-e2e-once?action=health' -Method Get -TimeoutSec 30
    if(!$health.ok){throw 'BACKEND_HEALTH_FALSE'}
    if(!$health.vision_enabled){throw 'VISION_DISABLED'}
    Write-Host ('BACKEND_SERVICE='+[string]$health.service)
    Write-Host ('VISION_ENABLED='+[string]$health.vision_enabled)
  }catch{throw ('BACKEND_HEALTH_FAILED '+$_.Exception.Message)}
  Write-Host 'V1018_2_SOURCE_ASSERTIONS_OK'
  Write-Host 'analysis_result=ALWAYS_EXPLICIT'
  Write-Host 'detected_foods=VISIBLE_EVEN_IF_UNMATCHED'
  Write-Host 'calories_macros=BIG_SUMMARY'
  Write-Host 'zero_components=EXPLICIT_RESULT_SCREEN'
  Write-Host 'back=RESULT_TO_IMAGE'
  Write-Host 'identity=VANILLA_CREAM_GREEN'
  npm run check
  if($LASTEXITCODE -ne 0){throw 'NPM_CHECK_FAILED'}
  npm run test:smoke
  if($LASTEXITCODE -ne 0){throw 'SMOKE_FAILED'}
  $ok=$true
}catch{
  Write-Host ('V1018.2 ERROR: '+$_.Exception.Message) -ForegroundColor Red
  foreach($f in $tracked){
    $src=Join-Path $rb $f
    if(Test-Path -LiteralPath $src){Copy-Item -LiteralPath $src -Destination (Join-Path $root $f) -Force}
  }
  Remove-Item -LiteralPath $js,$css -Force -ErrorAction SilentlyContinue
  Write-Host 'ROLLBACK_RESTORED'
  exit 1
}
if($ok){
  Write-Host 'V1018.2 LOCAL QA PASS' -ForegroundColor Green
  Write-Host '=== DEPLOYING OFFICIAL PRODUCTION ==='
  vercel.cmd --prod --yes --scope dayeem-studio-demos
  if($LASTEXITCODE -ne 0){
    Write-Host 'V1018.2 LOCAL PASS BUT PRODUCTION DEPLOY FAILED' -ForegroundColor Yellow
    exit $LASTEXITCODE
  }
  Write-Host 'V1018.2 PRODUCTION DEPLOY COMPLETED' -ForegroundColor Green
}