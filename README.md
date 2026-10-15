# CompraLatino

Plataforma de compra intermediada para artículos y subastas en Japón, orientada a compradores de Latinoamérica. Incluye catálogo, búsqueda, compra directa, pujas, cuentas de usuario, seguimiento de pedidos y un panel de administración.

> El pago y las subastas son **simulados**. No se procesa dinero ni se envían pujas reales.

## Stack

- Next.js 14 (App Router), React 18, TypeScript y Tailwind CSS
- NextAuth (Credentials, JWT, bcrypt) con MFA de demostración
- PostgreSQL 15 con Prisma
- Redis 7 para caché de catálogo y límites de solicitudes
- Metabase opcional para tableros de BI

## Requisitos

- Node.js 20 o superior
- Docker con Docker Compose (para PostgreSQL, Redis y Metabase, o para la imagen de la aplicación)

## Ejecución local

1. Clona el repositorio y entra en la carpeta del proyecto.
2. Copia las variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Reemplaza `AUTH_SECRET` por un valor aleatorio largo (por ejemplo, `openssl rand -base64 32`).

3. Levanta los servicios de apoyo:

   ```bash
   docker compose up -d
   ```

4. Instala dependencias, genera el cliente de Prisma, aplica el esquema y carga el catálogo de demostración:

   ```bash
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. Arranca la aplicación:

   ```bash
   npm run dev -- --port 3001
   ```

Abre `http://localhost:3001`. Metabase, si lo necesitas, está en `http://localhost:3000`.

## Ejecución con Docker

La imagen de la aplicación se construye desde `Dockerfile`:

```bash
docker build -t compralatino .
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="postgresql://admin:password123@host.docker.internal:5432/compralatino?schema=public" \
  -e REDIS_URL="redis://host.docker.internal:6379" \
  -e AUTH_SECRET="un-valor-aleatorio-largo" \
  -e NEXTAUTH_URL="http://localhost:3001" \
  compralatino
```

El contenedor escucha en el puerto indicado por la variable `PORT` (3001 por defecto). Necesita una base de datos PostgreSQL con el esquema aplicado.

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL. |
| `AUTH_SECRET` | Sí | Secreto para firmar las sesiones de NextAuth. |
| `NEXTAUTH_URL` | Sí | URL pública de la aplicación. |
| `REDIS_URL` | No | Redis para caché y límites de solicitudes. Si no está disponible, la aplicación usa una alternativa en memoria. |
| `NEXT_PUBLIC_JPY_TO_USD` | No | Tipo de cambio JPY a USD (por defecto `0.0067`). |
| `SIMULATED_MFA_CODE` | No | Código del MFA de demostración (por defecto `123456`). |
| `NEXT_PUBLIC_METABASE_URL` | No | URL pública de Metabase. |
| `METABASE_DASHBOARD_ID` | No | Identificador del tablero de Metabase a mostrar. |
| `YAUCTIONS_MODE` | No | Usa `live` solo con un adaptador real de subastas. Por defecto funciona en modo demostración. |

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Compilación de producción. |
| `npm run start` | Sirve la compilación de producción. |
| `npm run lint` | Linter de Next.js. |
| `npm run db:generate` | Genera el cliente de Prisma. |
| `npm run db:push` | Aplica el esquema a la base de datos. |
| `npm run db:seed` | Carga el catálogo y el usuario administrador de demostración. |
| `npm run db:studio` | Abre Prisma Studio. |

## Despliegue en Render

El repositorio incluye un `Dockerfile`, así que puedes desplegarlo como **Web Service** con runtime *Docker*.

1. Crea una base de datos **PostgreSQL** y un **Key Value** (Redis) en Render, o usa servicios externos.
2. Crea un **Web Service** conectado a este repositorio, con runtime **Docker**.
3. Configura las variables de entorno:
   - `DATABASE_URL`: la cadena de conexión interna de tu PostgreSQL.
   - `REDIS_URL`: la URL de tu Key Value.
   - `AUTH_SECRET`: un valor aleatorio largo.
   - `NEXTAUTH_URL`: la URL pública de tu servicio, por ejemplo `https://compralatino.onrender.com`.
4. Aplica el esquema y carga los datos de demostración una vez, desde la consola de Render (Shell):

   ```bash
   npm run db:push
   npm run db:seed
   ```

Render asigna el puerto mediante `PORT`; el contenedor ya lo usa.

## Credenciales de prueba

`npm run db:seed` crea el usuario administrador de prueba:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@compralatino.local` | `CompraLatino2026` |

Para probar como usuario normal, crea una cuenta desde `/register`. Estas credenciales son solo para demostración: **cámbialas antes de usar cualquier entorno real**.

## Estructura

```
src/app/                 Rutas (App Router) y endpoints de API
src/components/          Componentes de interfaz
src/modules/             Reglas de negocio (catálogo, checkout, pujas)
src/infrastructure/      Adaptadores: Prisma, Redis, pagos y subastas
prisma/                  Esquema y datos de demostración
```

## Notas de seguridad

- `docker-compose.yml` y `.env.example` usan credenciales locales de ejemplo. Cámbialas antes de cualquier despliegue.
- Nunca subas el archivo `.env`; ya está excluido por `.gitignore`.
- El MFA y el pago son simulados. Para producción, integra un proveedor de códigos temporales y una pasarela de pago.

## Licencia

Proyecto académico. Ajusta esta sección antes de reutilizar el código.
