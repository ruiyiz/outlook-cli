$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}
$subject = {{subject}}
$start = {{start}}
$end = {{end}}
$location = {{location}}
$body = {{body}}
$attendees = {{attendees}}

$item = $namespace.GetItemFromID($entryId)

if ($subject -ne '') { $item.Subject = $subject }
if ($start -ne '') { $item.Start = [DateTime]::Parse($start) }
if ($end -ne '') { $item.End = [DateTime]::Parse($end) }
if ($location -ne '') { $item.Location = $location }
if ($body -ne '') { $item.Body = $body }
if ($attendees -ne '') { $item.RequiredAttendees = $attendees }

$item.Save()

[PSCustomObject]@{
    EntryID = $item.EntryID
    Subject = $item.Subject
    Start   = $item.Start.ToString('o')
    End     = $item.End.ToString('o')
} | ConvertTo-Json -Compress
