$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace('MAPI')

$entryId = {{entryId}}
$attachIndex = {{attachIndex}}
$savePath = {{savePath}}
$listOnly = {{listOnly}}

$item = $namespace.GetItemFromID($entryId)

if ($listOnly) {
    $attachments = @()
    foreach ($att in $item.Attachments) {
        $attachments += [PSCustomObject]@{
            Index    = $att.Index
            FileName = $att.FileName
            Size     = $att.Size
            Type     = $att.Type
        }
    }
    $attachments | ConvertTo-Json -Depth 3 -Compress
} else {
    if ($item.Attachments.Count -eq 0) {
        Write-Error "No attachments found"
        exit 1
    }

    $att = $item.Attachments.Item($attachIndex)
    $filePath = Join-Path $savePath $att.FileName
    $att.SaveAsFile($filePath)

    [PSCustomObject]@{
        saved    = $true
        fileName = $att.FileName
        path     = $filePath
        size     = $att.Size
    } | ConvertTo-Json -Compress
}
