[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

[Console]::Out.WriteLine("READY")
[Console]::Out.Flush()

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    $line = $line.Trim()
    if ($line -eq '') { continue }

    $outText = ''
    $errText = ''

    try {
        $bytes = [System.Convert]::FromBase64String($line)
        $script = [System.Text.Encoding]::UTF8.GetString($bytes)
        $sb = [scriptblock]::Create($script)

        $outLines = [System.Collections.Generic.List[string]]::new()
        $errLines = [System.Collections.Generic.List[string]]::new()

        & $sb 2>&1 | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                $errLines.Add($_.ToString())
            } else {
                $outLines.Add([string]$_)
            }
        }

        $outText = ($outLines -join "`n").Trim()
        $errText = ($errLines -join "`n").Trim()
        $response = [ordered]@{ ok = $true; out = $outText; err = $errText } | ConvertTo-Json -Compress
    } catch {
        $response = [ordered]@{ ok = $false; out = ''; err = $_.Exception.Message } | ConvertTo-Json -Compress
    }

    [Console]::Out.WriteLine($response)
    [Console]::Out.Flush()
}
