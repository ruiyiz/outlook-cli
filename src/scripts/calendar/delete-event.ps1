$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}

$item = $namespace.GetItemFromID($entryId)
$item.Delete()

[PSCustomObject]@{ deleted = $true } | ConvertTo-Json -Compress
