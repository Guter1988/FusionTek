# FusionTek
FusionTek interview project for feedback analysis database setup.

## Project Overview
This repository contains a containerized PostgreSQL environment with an automated schema initialization for a feedback analysis application.

## Development Log
- **2026-04-16**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16**: Designed SQL schema with `feedback` and `features` tables using `GENERATED ALWAYS AS IDENTITY`.
- **2026-04-16**: Implemented automated `updated_at` triggers and set default values to `NOW()`.
- **2026-04-16**: Modified `docker-compose.yml` to remove persistent volumes (database resets on every deployment).
