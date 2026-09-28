#!/usr/bin/env bash
set -euo pipefail

# Deploy script: se ejecuta en el VPS cada vez que se actualiza el repo.
# 1) Corre migraciones
# 2) Actualiza datos gestionados por el sistema
# 3) Reinicia el proceso PM2 correspondiente a este proyecto

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "==> Ejecutando migraciones..."
npm run migrate

echo "==> Actualizando datos gestionados por el sistema..."
npm run update-system-data

echo "==> Deploy finalizado correctamente."
