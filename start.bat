@echo off
rem Build and open the lucky draw locally; works offline once node_modules is installed.
cd /d %~dp0
if not exist node_modules call npm install
call npm run build || goto :eof
call npx vite preview --port 4173 --open
