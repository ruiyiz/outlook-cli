$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$query = {{query}}
$limit = {{limit}}

$inbox = $namespace.GetDefaultFolder(6)
$filter = "@SQL=""urn:schemas:httpmail:subject"" LIKE '%" + $query + "%' OR ""urn:schemas:httpmail:fromemail"" LIKE '%" + $query + "%' OR ""urn:schemas:httpmail:textdescription"" LIKE '%" + $query + "%'"

$items = $inbox.Items.Restrict($filter)
$items.Sort('[ReceivedTime]', $true)

$results = @()
$count = 0

foreach ($item in $items) {
    if ($count -ge $limit) { break }
    if ($item.Class -ne 43) { continue }

    $results += [PSCustomObject]@{
        EntryID            = $item.EntryID
        Subject            = $item.Subject
        SenderName         = $item.SenderName
        SenderEmailAddress = $item.SenderEmailAddress
        ReceivedTime       = $item.ReceivedTime.ToString('o')
        Unread             = $item.UnRead
        HasAttachments     = $item.Attachments.Count -gt 0
        AttachmentCount    = $item.Attachments.Count
    }
    $count++
}

$results | ConvertTo-Json -Depth 3 -Compress
