$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}

$item = $namespace.GetItemFromID($entryId)

if ($item.Class -ne 43) {
    Write-Error "Item is not a mail message"
    exit 1
}

$attachments = @()
foreach ($att in $item.Attachments) {
    $attachments += [PSCustomObject]@{
        Index    = $att.Index
        FileName = $att.FileName
        Size     = $att.Size
        Type     = $att.Type
    }
}

$result = [PSCustomObject]@{
    EntryID            = $item.EntryID
    Subject            = $item.Subject
    SenderName         = $item.SenderName
    SenderEmailAddress = $item.SenderEmailAddress
    ReceivedTime       = $item.ReceivedTime.ToString('o')
    Body               = $item.Body
    Unread             = $item.UnRead
    Importance         = $item.Importance
    HasAttachments     = $item.Attachments.Count -gt 0
    AttachmentCount    = $item.Attachments.Count
    Attachments        = $attachments
    To                 = $item.To
    CC                 = $item.CC
    BCC                = $item.BCC
}

# Mark as read
$item.UnRead = $false
$item.Save()

$result | ConvertTo-Json -Depth 5 -Compress
