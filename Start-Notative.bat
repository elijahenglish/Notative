@echo off
setlocal

cd /d "%~dp0"

set "NODE_DIR=%ProgramFiles%\nodejs"
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%LocalAppData%\Programs\nodejs"

if not exist "%NODE_DIR%\node.exe" (
  echo Node.js was not found.
  echo Install Node.js, then run this launcher again.
  pause
  exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"

if not exist "node_modules\electron\cli.js" (
  echo Dependencies are missing. Installing them now...

  if exist "%NODE_DIR%\npm.cmd" (
    call "%NODE_DIR%\npm.cmd" install
  ) else (
    echo npm.cmd was not found in %NODE_DIR%.
    pause
    exit /b 1
  )

  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting Notative...
"%NODE_DIR%\node.exe" ".\node_modules\electron\cli.js" "."

if errorlevel 1 (
  echo.
  echo Notative exited with an error.
  pause
  exit /b 1
)

endlocal