@echo off
echo Starting ITS Database Server and Client...

REM Start the backend server in a new window
start "ITS Server" cmd /k "cd its-database-server && npm start"

REM Start the frontend client in a new window
start "ITS Client" cmd /k "cd its-database-client && npm start"
