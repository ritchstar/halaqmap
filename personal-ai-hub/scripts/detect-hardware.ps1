Write-Host ""
Write-Host "=== Personal AI Hub - Hardware hint ===" -ForegroundColor Cyan

$ramGb = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
Write-Host "RAM: $ramGb GB"

try {
  $gpu = Get-CimInstance Win32_VideoController |
    Where-Object { $_.Name -notmatch 'Microsoft|Basic' } |
    Select-Object -First 1
  if ($null -ne $gpu) {
    Write-Host "GPU: $($gpu.Name)"
    if ($gpu.AdapterRAM -gt 0) {
      $vramGb = [math]::Round($gpu.AdapterRAM / 1GB, 1)
      Write-Host "VRAM (approx): $vramGb GB"
    }
  } else {
    Write-Host "GPU: none detected / integrated only"
  }
} catch {
  Write-Host "GPU: could not detect"
}

Write-Host ""
Write-Host "Suggested first pulls:" -ForegroundColor Green
if ($ramGb -lt 12) {
  Write-Host "  ollama pull qwen2.5:3b"
  Write-Host "  ollama pull nomic-embed-text"
} elseif ($ramGb -lt 24) {
  Write-Host "  ollama pull qwen2.5:7b"
  Write-Host "  ollama pull nomic-embed-text"
} else {
  Write-Host "  ollama pull qwen2.5:14b"
  Write-Host "  ollama pull qwen2.5:7b"
  Write-Host "  ollama pull nomic-embed-text"
}
Write-Host ""
