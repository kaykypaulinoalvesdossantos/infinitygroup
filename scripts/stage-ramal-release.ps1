param(
    [Parameter(Mandatory)][string]$Apk,
    [string]$BuildTools = "$env:LOCALAPPDATA/Android/Sdk/build-tools/36.0.0"
)

$ErrorActionPreference = 'Stop'
$apkPath = (Resolve-Path -LiteralPath $Apk).Path
$downloads = Join-Path $PSScriptRoot '../public/downloads'
$publishedApk = Join-Path $downloads 'infinity-ramal.apk'
$manifest = Join-Path $downloads 'infinity-ramal-update.json'
$signer = Join-Path $BuildTools 'apksigner.bat'
$aapt = Join-Path $BuildTools 'aapt.exe'

function Get-CertificateDigest([string]$Path) {
    $certificate = & $signer verify --print-certs $Path
    if ($LASTEXITCODE -ne 0) { throw "APK com assinatura inválida: $Path" }
    $digest = $certificate | Select-String '^Signer #\d+ certificate SHA-256 digest:'
    if (-not $digest) { throw "Certificado do APK indisponível: $Path" }
    return ($digest.Line -join [Environment]::NewLine)
}

function Get-ApkRelease([string]$Path) {
    $badging = & $aapt dump badging $Path
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível ler o APK.' }
    $package = $badging | Select-String "^package: name='com\.infinitygroups\.ramal' versionCode='(\d+)' versionName='([^']+)'"
    if (-not $package) { throw 'O APK precisa pertencer ao Infinity Ramal.' }
    return [ordered]@{
        versionCode = [long]$package.Matches[0].Groups[1].Value
        versionName = $package.Matches[0].Groups[2].Value
    }
}

$release = Get-ApkRelease $apkPath
$previous = Get-ApkRelease $publishedApk
if ($release.versionCode -le $previous.versionCode) { throw 'Aumente o versionCode do APK antes de publicar.' }
if ((Get-CertificateDigest $apkPath) -ne (Get-CertificateDigest $publishedApk)) {
    throw 'A assinatura é diferente da versão distribuída. Use a chave original do Ramal.'
}
$release.sha256 = (Get-FileHash -LiteralPath $apkPath -Algorithm SHA256).Hash.ToLowerInvariant()
Copy-Item -LiteralPath $apkPath -Destination $publishedApk
$release | ConvertTo-Json | Set-Content -LiteralPath $manifest -Encoding utf8NoBOM
Write-Output "Ramal $($release.versionName) preparado. Publique o APK e o manifesto no mesmo commit."
