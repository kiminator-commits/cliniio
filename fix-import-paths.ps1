# PowerShell script to fix malformed import paths with backslashes
# This script finds and replaces backslashes with forward slashes in import statements

Write-Host "Fixing malformed import paths..." -ForegroundColor Green

# Find all TypeScript/JavaScript files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix specific malformed import patterns
    $content = $content -replace "from '\.\.\\\.\.\\Icon\\Icon'", "from '../../Icon/Icon'"
    $content = $content -replace "from '\.\.\\\.\.\\\.\.\\Icon\\Icon'", "from '../../../Icon/Icon'"
    $content = $content -replace "from '\.\.\\\.\.\\\.\.\\\.\.\\Icon\\Icon'", "from '../../../../Icon/Icon'"
    $content = $content -replace "from '\.\.\\Icon\\Icon'", "from '../Icon/Icon'"
    $content = $content -replace "from '\.\.\\Icon\\Icon'", "from '../Icon/Icon'"
    
    # Fix other component import patterns
    $content = $content -replace "from '\.\.\\\.\.\\components\\", "from '../../components/'"
    $content = $content -replace "from '\.\.\\\.\.\\\.\.\\components\\", "from '../../../components/'"
    $content = $content -replace "from '\.\.\\\.\.\\\.\.\\\.\.\\components\\", "from '../../../../components/'"
    
    # Fix library component imports
    $content = $content -replace "from '\.\.\\\.\.\\\.\.\\\.\.\\\.\.\\components\\", "from '../../../../components/'"
    
    # Check if content was modified
    if ($content -ne $originalContent) {
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Cyan
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host "Import path fixes completed! Fixed $fixedCount files." -ForegroundColor Green 