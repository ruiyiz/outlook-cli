$outlook = New-Object -ComObject Outlook.Application

$to = {{to}}
$subject = {{subject}}
$body = {{body}}
$cc = {{cc}}
$bcc = {{bcc}}
$isHtml = {{isHtml}}
$attachPaths = {{attachPaths}}

$mail = $outlook.CreateItem(0)
$mail.To = $to
$mail.Subject = $subject
$mail.CC = $cc
$mail.BCC = $bcc

if ($isHtml) {
    $mail.HTMLBody = $body
} else {
    $mail.Body = $body
}

if ($attachPaths -ne '') {
    $paths = $attachPaths -split ';'
    foreach ($p in $paths) {
        if ($p.Trim() -ne '') {
            $mail.Attachments.Add($p.Trim())
        }
    }
}

$mail.Send()

[PSCustomObject]@{ sent = $true } | ConvertTo-Json -Compress
