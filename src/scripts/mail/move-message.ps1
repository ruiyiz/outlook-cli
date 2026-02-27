$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}
$targetFolderName = {{targetFolder}}

$item = $namespace.GetItemFromID($entryId)
$inbox = $namespace.GetDefaultFolder(6)

$targetFolder = $null
foreach ($f in $namespace.Folders) {
    foreach ($sf in $f.Folders) {
        if ($sf.Name -eq $targetFolderName) { $targetFolder = $sf; break }
        foreach ($ssf in $sf.Folders) {
            if ($ssf.Name -eq $targetFolderName) { $targetFolder = $ssf; break }
        }
        if ($targetFolder) { break }
    }
    if ($targetFolder) { break }
}

if (-not $targetFolder) {
    foreach ($sf in $inbox.Folders) {
        if ($sf.Name -eq $targetFolderName) { $targetFolder = $sf; break }
    }
}

if (-not $targetFolder) {
    Write-Error "Folder '$targetFolderName' not found"
    exit 1
}

$item.Move($targetFolder) | Out-Null

[PSCustomObject]@{ moved = $true; folder = $targetFolderName } | ConvertTo-Json -Compress
