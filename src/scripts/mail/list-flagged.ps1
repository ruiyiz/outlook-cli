$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$folderName = {{folder}}
$limit = {{limit}}

# Get folder
if ($folderName -eq 'Inbox' -or $folderName -eq '') {
    $folder = $namespace.GetDefaultFolder(6)
} else {
    $inbox = $namespace.GetDefaultFolder(6)
    $folder = $null
    foreach ($f in $namespace.Folders) {
        foreach ($sf in $f.Folders) {
            if ($sf.Name -eq $folderName) { $folder = $sf; break }
        }
        if ($folder) { break }
    }
    if (-not $folder) {
        foreach ($sf in $inbox.Folders) {
            if ($sf.Name -eq $folderName) { $folder = $sf; break }
        }
    }
    if (-not $folder) { $folder = $inbox }
}

$items = $folder.Items
$items.Sort('[ReceivedTime]', $true)

$results = @()
$count = 0
$scanned = 0

foreach ($item in $items) {
    if ($count -ge $limit) { break }
    if ($scanned -ge 10000) { break }
    $scanned++
    if ($item.Class -ne 43) { continue }
    if ($item.FlagStatus -ne 2) { continue }

    $results += [PSCustomObject]@{
        EntryID             = $item.EntryID
        Subject             = $item.Subject
        SenderName          = $item.SenderName
        SenderEmailAddress  = $item.SenderEmailAddress
        ReceivedTime        = $item.ReceivedTime.ToString('o')
        Unread              = $item.UnRead
        Importance          = $item.Importance
        HasAttachments      = $item.Attachments.Count -gt 0
        AttachmentCount     = $item.Attachments.Count
        ConversationID      = $item.ConversationID
        ConversationTopic   = $item.ConversationTopic
        FlagStatus          = $item.FlagStatus
    }
    $count++
}

$results | ConvertTo-Json -Depth 3 -Compress
