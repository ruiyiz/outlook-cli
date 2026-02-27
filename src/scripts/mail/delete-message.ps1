$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}
$permanent = {{permanent}}

$item = $namespace.GetItemFromID($entryId)

if ($permanent) {
    $item.Delete()
} else {
    $deletedFolder = $namespace.GetDefaultFolder(3)
    $item.Move($deletedFolder) | Out-Null
}

[PSCustomObject]@{ deleted = $true; permanent = $permanent } | ConvertTo-Json -Compress
