$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$fromDate = {{fromDate}}
$toDate = {{toDate}}
$calendarName = {{calendarName}}

function Find-CalendarByName {
    param($ol, $ns, $name)
    # Check subfolders of default calendar
    $defaultCal = $ns.GetDefaultFolder(9)
    foreach ($folder in $defaultCal.Folders) {
        if ($folder.Name -eq $name) { return $folder }
    }
    # Search all MAPI stores
    foreach ($store in $ns.Stores) {
        $root = $store.GetRootFolder()
        foreach ($folder in $root.Folders) {
            if ($folder.Name -eq $name -and $folder.DefaultItemType -eq 1) { return $folder }
            foreach ($sub in $folder.Folders) {
                if ($sub.Name -eq $name -and $sub.DefaultItemType -eq 1) { return $sub }
            }
        }
    }
    # Search Navigation Pane (covers linked shared calendars not in any store)
    if ($ol.Explorers.Count -gt 0) {
        $navPane = $ol.Explorers.Item(1).NavigationPane
        $calModule = $navPane.Modules.GetNavigationModule(1)
        foreach ($group in $calModule.NavigationGroups) {
            foreach ($navFolder in $group.NavigationFolders) {
                try {
                    if ($navFolder.DisplayName -eq $name) { return $navFolder.Folder }
                } catch {}
            }
        }
    }
    return $null
}

if ($calendarName -eq '') {
    $calendar = $namespace.GetDefaultFolder(9)
} else {
    $calendar = Find-CalendarByName $outlook $namespace $calendarName
    if (-not $calendar) {
        throw "Calendar '$calendarName' not found"
    }
}

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
