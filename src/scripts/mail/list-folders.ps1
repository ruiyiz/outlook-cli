$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$recursive = {{recursive}}

function Get-FolderInfo($folder) {
    $info = [PSCustomObject]@{
        Name             = $folder.Name
        EntryID          = $folder.EntryID
        FolderPath       = $folder.FolderPath
        UnreadItemCount  = $folder.UnReadItemCount
        ItemCount        = $folder.Items.Count
        Folders          = @()
    }

    if ($recursive -and $folder.Folders.Count -gt 0) {
        foreach ($sub in $folder.Folders) {
            $info.Folders += Get-FolderInfo $sub
        }
    }

    return $info
}

# Find the store that contains the default Inbox
$inbox = $namespace.GetDefaultFolder(6)
$mainStore = $null
foreach ($store in $namespace.Folders) {
    foreach ($f in $store.Folders) {
        if ($f.EntryID -eq $inbox.EntryID) {
            $mainStore = $store
            break
        }
    }
    if ($mainStore) { break }
}

if (-not $mainStore) {
    # Fallback: use the store that contains Inbox by checking if Inbox is in its subtree
    $mainStore = $namespace.Folders | Select-Object -First 1
}

$results = @()
foreach ($f in $mainStore.Folders) {
    $results += Get-FolderInfo $f
}

$results | ConvertTo-Json -Depth 10 -Compress
