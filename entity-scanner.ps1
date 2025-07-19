# Entity Scanner - Find all entities in the project
Write-Host "?? ENTITY SCANNER - Finding all @Entity classes" -ForegroundColor Cyan

$javaFiles = Get-ChildItem -Path "src\main\java" -Recurse -Name "*.java" 2>$null
$entityFiles = @()

foreach ($file in $javaFiles) {
    $fullPath = "src\main\java\$file"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -like "*@Entity*") {
            $entityFiles += @{
                File = $file
                Path = $fullPath
                Package = if ($content -match "package\s+([^;]+)") { $matches[1] } else { "Unknown" }
            }
        }
    }
}

if ($entityFiles.Count -eq 0) {
    Write-Host "? NO ENTITIES FOUND!" -ForegroundColor Red
} else {
    Write-Host "?? Found $($entityFiles.Count) entity files:" -ForegroundColor Green
    foreach ($entity in $entityFiles) {
        Write-Host "  ?? $($entity.File)" -ForegroundColor Cyan
        Write-Host "    ?? Package: $($entity.Package)" -ForegroundColor Gray
        Write-Host "    ?? Path: $($entity.Path)" -ForegroundColor Gray
    }
}