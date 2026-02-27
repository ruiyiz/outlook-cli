$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

function Get-CalendarFolders {
    param($folder, $storeName)
    if ($folder.DefaultItemType -eq 1) {
        [PSCustomObject]@{
            Name       = $folder.Name
            Store      = $storeName
            FolderPath = $folder.FolderPath
        }
    }
    foreach ($sub in $folder.Folders) {
        Get-CalendarFolders $sub $storeName
    }
}

$seen = [System.Collections.Generic.HashSet[string]]::new()
$results = @()

# Walk all MAPI stores
foreach ($store in $namespace.Stores) {
    $root = $store.GetRootFolder()
    foreach ($folder in $root.Folders) {
        $results += Get-CalendarFolders $folder $store.DisplayName
    }
}

foreach ($r in $results) { $null = $seen.Add($r.FolderPath) }

# Walk Navigation Pane calendar module (catches linked shared calendars)
if ($outlook.Explorers.Count -gt 0) {
    $navPane = $outlook.Explorers.Item(1).NavigationPane
    $calModule = $navPane.Modules.GetNavigationModule(1)
    foreach ($group in $calModule.NavigationGroups) {
        foreach ($navFolder in $group.NavigationFolders) {
            try {
                $f = $navFolder.Folder
                if ($f.DefaultItemType -eq 1 -and -not $seen.Contains($f.FolderPath)) {
                    $results += [PSCustomObject]@{
                        Name       = $navFolder.DisplayName
                        Store      = $group.Name
                        FolderPath = $f.FolderPath
                    }
                    $null = $seen.Add($f.FolderPath)
                }
            } catch {}
        }
    }
}

$results | ConvertTo-Json -Depth 3 -Compress
