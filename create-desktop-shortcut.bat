@echo off
title Create Desktop App Shortcut
echo Creating Desktop shortcut with custom icon...

set SCRIPT="%TEMP%\create_shortcut_%RANDOM%.vbs"
set APP_DIR=%~dp0
set TARGET_HTML=%APP_DIR%index.html
set ICON_PATH=%APP_DIR%favicon.ico

echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Family Class Manager.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "chrome.exe" >> %SCRIPT%
echo oLink.Arguments = "--app=file:///%TARGET_HTML%" >> %SCRIPT%
echo oLink.Description = "Family Class & Activity Management System" >> %SCRIPT%
echo oLink.IconLocation = "%ICON_PATH%, 0" >> %SCRIPT%
echo oLink.WorkingDirectory = "%APP_DIR%" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo ========================================================
echo   [DONE] Desktop Shortcut created successfully!
echo   Look for "Family Class Manager" on your Desktop.
echo ========================================================
echo.
pause
