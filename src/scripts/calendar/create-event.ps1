$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$subject = {{subject}}
$start = {{start}}
$end = {{end}}
$location = {{location}}
$body = {{body}}
$attendees = {{attendees}}
$allDay = {{allDay}}
$calendarName = {{calendarName}}

function Find-CalendarByName {
    param($ol, $ns, $name)
    $defaultCal = $ns.GetDefaultFolder(9)
    foreach ($folder in $defaultCal.Folders) {
        if ($folder.Name -eq $name) { return $folder }
    }
    foreach ($store in $ns.Stores) {
        $root = $store.GetRootFolder()
        foreach ($folder in $root.Folders) {
            if ($folder.Name -eq $name -and $folder.DefaultItemType -eq 1) { return $folder }
            foreach ($sub in $folder.Folders) {
                if ($sub.Name -eq $name -and $sub.DefaultItemType -eq 1) { return $sub }
            }
        }
    }
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
    $appt = $outlook.CreateItem(1)
} else {
    $calendar = Find-CalendarByName $outlook $namespace $calendarName
    if (-not $calendar) {
        throw "Calendar '$calendarName' not found"
    }
    $appt = $calendar.Items.Add(1)
}

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
