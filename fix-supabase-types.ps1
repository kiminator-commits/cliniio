# PowerShell script to fix Supabase type issues
# Remove explicit type parameters from .from() calls

$files = Get-ChildItem -Path src -Recurse -Include "*.ts","*.tsx" | Where-Object { (Get-Content $_.FullName -Raw) -match "Database\['public'\]\['Tables'\]" }

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Fix .from() calls with explicit type parameters
    $content = $content -replace "\.from<'[^']+',\s*Database\['public'\]\['Tables'\]\['[^']+'\]\['[^']+'\]>\('[^']+'\)", {
        param($match)
        $tableName = $match -replace ".*\('([^']+)'\)", '$1'
        return ".from('$tableName')"
    }
    
    # Fix .insert() calls with explicit type parameters
    $content = $content -replace "\.insert\([^)]+as\s+Database\['public'\]\['Tables'\]\['[^']+'\]\['[^']+'\]\)", ".insert($1)"
    
    # Fix .update() calls with explicit type parameters
    $content = $content -replace "\.update\([^)]+as\s+Database\['public'\]\['Tables'\]\['[^']+'\]\['[^']+'\]\)", ".update($1)"
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Fixed Supabase type issues in $($files.Count) files"
