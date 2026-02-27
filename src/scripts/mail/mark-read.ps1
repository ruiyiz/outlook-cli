$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}
$markAsRead = {{markAsRead}}

$item = $namespace.GetItemFromID($entryId)
$item.UnRead = -not $markAsRead
$item.Save()

[PSCustomObject]@{ unread = $item.UnRead } | ConvertTo-Json -Compress
