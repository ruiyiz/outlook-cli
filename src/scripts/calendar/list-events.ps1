$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$fromDate = {{fromDate}}
$toDate = {{toDate}}

$calendar = $namespace.GetDefaultFolder(9)
$items = $calendar.Items
$items.IncludeRecurrences = $true
$items.Sort('[Start]')

$from = [DateTime]::Parse($fromDate)
$to = [DateTime]::Parse($toDate)

$filter = "[Start] >= '" + $from.ToString('g') + "' AND [Start] <= '" + $to.ToString('g') + "'"
$filtered = $items.Restrict($filter)

$results = @()
foreach ($item in $filtered) {
    if ($item.Class -ne 26) { continue }
    $results += [PSCustomObject]@{
        EntryID                      = $item.EntryID
        Subject                      = $item.Subject
        Start                        = $item.Start.ToString('o')
        End                          = $item.End.ToString('o')
        Location                     = $item.Location
        Organizer                    = $item.Organizer
        RequiredAttendees            = $item.RequiredAttendees
        IsAllDayEvent                = $item.AllDayEvent
        Duration                     = $item.Duration
        BusyStatus                   = $item.BusyStatus
        ReminderMinutesBeforeStart   = $item.ReminderMinutesBeforeStart
    }
}

$results | ConvertTo-Json -Depth 3 -Compress
