$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$folderName = {{folder}}
$conversationId = {{conversationId}}

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

$results = @()

function Get-MailObject($item) {
    return [PSCustomObject]@{
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
    }
}

# Try Restrict() first; fall back to a bounded linear scan if ConversationID is not filterable
$useRestrict = $true
try {
    $filter = "[ConversationID] = '" + $conversationId + "'"
    $restricted = $folder.Items.Restrict($filter)
    # Trigger enumeration to detect a lazy filter error
    $null = $restricted.Count
} catch {
    $useRestrict = $false
}

if ($useRestrict) {
    foreach ($item in $restricted) {
        if ($item.Class -ne 43) { continue }
        $results += Get-MailObject $item
    }
} else {
    $items = $folder.Items
    $items.Sort('[ReceivedTime]', $true)
    $scanned = 0
    foreach ($item in $items) {
        if ($scanned -ge 500) { break }
        $scanned++
        if ($item.Class -ne 43) { continue }
        if ($item.ConversationID -ne $conversationId) { continue }
        $results += Get-MailObject $item
    }
}

$results | ConvertTo-Json -Depth 3 -Compress
