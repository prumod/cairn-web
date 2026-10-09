# Configuração do Cairn Web para Windows x64, sem WSL.
# Execute a partir de um terminal PowerShell. Não precisa de o abrir como administrador.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StageIndex = 0
$TotalStages = 5
$ToolsRoot = Join-Path $HOME '.cairn'
$TempSetup = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString())

function Stage([string]$Name) {
    $script:StageIndex++
    Write-Host "`nEtapa $script:StageIndex de ${TotalStages}: $Name"
}

function Run([string]$Command, [string[]]$Arguments) {
    Write-Host "  A executar: $Command $($Arguments -join ' ')"
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "O comando terminou com o código $LASTEXITCODE."
    }
}

function Add-UserPath([string]$Directory) {
    $current = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($Directory -notin ($current -split ';')) {
        [Environment]::SetEnvironmentVariable('Path', "$Directory;$current", 'User')
    }
    $env:Path = "$Directory;$env:Path"
}

function Download([string]$Url, [string]$Destination) {
    Write-Host "  A descarregar: $Url"
    Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing
}

function Verify-Checksum([string]$Archive, [string]$Checksums) {
    $name = Split-Path -Leaf $Archive
    $entries = @(Get-Content $Checksums | Where-Object { $_ -match "^[a-fA-F0-9]{64}\s+\*?$([regex]::Escape($name))$" })
    if ($entries.Count -ne 1) { throw "Não foi possível encontrar o checksum de $name." }
    $expected = ($entries[0] -split '\s+')[0]
    if ((Get-FileHash $Archive -Algorithm SHA256).Hash -ne $expected) {
        throw "O checksum de $name não corresponde ao publicado."
    }
}

function Node-Ready {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return $false }
    & node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit((a>22 || (a===22 && b>=12)) && typeof require("node:fs").globSync === "function" ? 0 : 1)'
    return $LASTEXITCODE -eq 0
}

Push-Location $ProjectRoot
try {
    Write-Host 'Configuração do Cairn Web para Windows.'
    Write-Host 'Os comandos são automáticos. O Windows pode pedir autorização para instalar o Git.'
    Write-Host 'Pode interromper com Ctrl+C e voltar a executar o script.'
    Stage 'Verificar o sistema e instalar Git'
    if ($env:OS -ne 'Windows_NT' -or $env:PROCESSOR_ARCHITECTURE -ne 'AMD64') {
        throw 'Este assistente suporta Windows x64. Em Ubuntu/WSL, use scripts/setup-project.sh.'
    }
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    New-Item -ItemType Directory -Force -Path $TempSetup, $ToolsRoot | Out-Null
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
            Write-Host 'Abra https://apps.microsoft.com/detail/9nblggh4nns1 e instale o Instalador de Aplicações da Microsoft.'
            Write-Host 'Depois, feche este terminal, abra outro e volte a executar o assistente.'
            throw 'O winget é necessário para instalar o Git automaticamente.'
        }
        Run winget @('install', '--id', 'Git.Git', '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity')
        $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
    }
    Run git @('--version')
    $gitCommand = (Get-Command git).Source
    $gitRoot = Split-Path -Parent (Split-Path -Parent $gitCommand)
    $gitBash = Join-Path $gitRoot 'bin\bash.exe'
    if (-not (Test-Path $gitBash)) {
        throw 'Não foi encontrado o Bash do Git for Windows. Instale Git for Windows em https://git-scm.com/downloads/win e repita a configuração.'
    }
    # Os scripts de validação usam Git Bash, não o bash.exe do WSL.
    $env:Path = "$(Split-Path -Parent $gitBash);$env:Path"

    Stage 'Instalar Bun 1.3.14 e verificar Node.js'
    $bunDirectory = Join-Path $ToolsRoot 'bun-1.3.14\bun-windows-x64-baseline'
    $bunExe = Join-Path $bunDirectory 'bun.exe'
    if (-not (Test-Path $bunExe)) {
        $archive = Join-Path $TempSetup 'bun.zip'
        Download 'https://github.com/oven-sh/bun/releases/download/bun-v1.3.14/bun-windows-x64-baseline.zip' $archive
        Expand-Archive -Path $archive -DestinationPath (Join-Path $ToolsRoot 'bun-1.3.14') -Force
    }
    Add-UserPath $bunDirectory
    if ((& bun --version) -ne '1.3.14') { throw 'Não foi possível ativar o Bun 1.3.14.' }
    if (-not (Node-Ready)) {
        $nodeVersion = '22.23.2'
        $name = "node-v$nodeVersion-win-x64.zip"
        $archive = Join-Path $TempSetup $name
        $checksums = Join-Path $TempSetup 'node-checksums.txt'
        Download "https://nodejs.org/dist/v$nodeVersion/$name" $archive
        Download "https://nodejs.org/dist/v$nodeVersion/SHASUMS256.txt" $checksums
        Verify-Checksum $archive $checksums
        Expand-Archive -Path $archive -DestinationPath $ToolsRoot -Force
        Add-UserPath (Join-Path $ToolsRoot "node-v$nodeVersion-win-x64")
    }
    if (-not (Node-Ready)) { throw 'É necessário Node.js 22.12 ou superior.' }
    Run node @('--version')
    Run bun @('--version')

    Stage 'Instalar as dependências do projeto'
    Run bun @('install', '--frozen-lockfile')

    Stage 'Preparar Gitleaks e Chromium'
    $scanner = Join-Path $ProjectRoot '.tools\gitleaks.exe'
    $scannerReady = $false
    if (Test-Path $scanner) { $scannerReady = ((& $scanner version) -eq '8.30.0') }
    if (-not $scannerReady) {
        $name = 'gitleaks_8.30.0_windows_x64.zip'
        $archive = Join-Path $TempSetup $name
        $checksums = Join-Path $TempSetup 'gitleaks-checksums.txt'
        $base = 'https://github.com/gitleaks/gitleaks/releases/download/v8.30.0'
        Download "$base/$name" $archive
        Download "$base/gitleaks_8.30.0_checksums.txt" $checksums
        Verify-Checksum $archive $checksums
        Expand-Archive -Path $archive -DestinationPath (Join-Path $ProjectRoot '.tools') -Force
    }
    Run $scanner @('version')
    # Git Bash aceita caminhos absolutos com barras normais.
    $env:GITLEAKS_BIN = $scanner.Replace('\', '/')
    [Environment]::SetEnvironmentVariable('GITLEAKS_BIN', $env:GITLEAKS_BIN, 'User')
    Run bunx @('--no-install', 'playwright', 'install', 'chromium')

    Stage 'Verificar o projeto'
    Run $gitBash @('scripts/check.sh', 'full')
    Write-Host "`nConfiguração concluída. As verificações terminaram sem erros."
    Write-Host 'As suites sem testes indicam uma omissão, não comprovam o comportamento da aplicação.'
    Write-Host 'O assistente acrescentou as ferramentas instaladas ao PATH do seu utilizador.'
    Write-Host 'O GITLEAKS_BIN do seu utilizador aponta para o scanner desta cópia do projeto.'
    Write-Host 'Abra um novo terminal PowerShell nesta pasta e execute: bun run dev'
    Write-Host 'Abra o endereço apresentado pelo Vite, normalmente http://localhost:5173.'
    Write-Host 'Não é necessário criar um ficheiro .env. Discord, WhatsApp e publicação são configurações separadas.'
}
catch {
    Write-Host "`nErro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'A configuração não ficou concluída. Corrija o erro acima e volte a executar este script.'
    exit 1
}
finally {
    if (Test-Path $TempSetup) { Remove-Item -LiteralPath $TempSetup -Recurse -Force }
    Pop-Location
}
