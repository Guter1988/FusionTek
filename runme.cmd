@echo off
echo Starting Docker containers...
docker compose up -d

echo Waiting for services to be ready...
timeout /t 2 /nobreak > nul

echo Opening browser to http://localhost:3000
start http://localhost:3000

echo Attaching to logs...
docker compose logs -f
