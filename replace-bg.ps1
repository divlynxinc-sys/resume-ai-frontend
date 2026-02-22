Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $newContent = $content -replace 'bg-\[#0b1220\]', 'bg-[var(--app-bg)]' -replace 'bg-\[#0B1220\]', 'bg-[var(--app-bg)]'
  if ($content -ne $newContent) {
    Set-Content -Path $_.FullName -Value $newContent -NoNewline
    Write-Host "Updated: $($_.FullName)"
  }
}
Write-Host "Done."
