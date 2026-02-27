$outlook = New-Object -ComObject Outlook.Application

$subject = {{subject}}
$start = {{start}}
$end = {{end}}
$location = {{location}}
$body = {{body}}
$attendees = {{attendees}}
$allDay = {{allDay}}

$appt = $outlook.CreateItem(1)
$appt.Subject = $subject
$appt.Start = [DateTime]::Parse($start)
$appt.End = [DateTime]::Parse($end)
$appt.Location = $location
$appt.Body = $body
$appt.AllDayEvent = $allDay

if ($attendees -ne '') {
    $appt.RequiredAttendees = $attendees
}

$appt.Save()

[PSCustomObject]@{
    EntryID = $appt.EntryID
    Subject = $appt.Subject
    Start   = $appt.Start.ToString('o')
    End     = $appt.End.ToString('o')
} | ConvertTo-Json -Compress
