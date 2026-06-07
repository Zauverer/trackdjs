# TrackDJs

TrackDJs v0.1.1 es el primer MVP público endurecido de una red social de nicho para amantes de la música electrónica. Permite descubrir DJs, eventos, lineups y construir un perfil musical con DJs vistos usando datos mock y persistencia local.

La pantalla de eventos incluye una primera capa de mapa/timeline con datos curados desde fuentes públicas y ticketeras para validar el flujo de discovery sin crear scraping frágil ni backend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React
- Leaflet + OpenStreetMap para mapa GPS sin API key
- localStorage para estados simples
- Datos mock en TypeScript
- Capa `/lib/data` preparada para reemplazar mocks por Supabase
- Clientes y repositorios Supabase preparados con fallback automático
- Vercel Analytics preparado para producción
- Deploy-ready para Vercel

## Fuentes cargadas en v0.1

- PuntoTicket: Amelie Lens en Espacio Riesco, 06 de junio de 2026.
- Club La Feria: calendario oficial con evento del sábado 06 de junio de 2026.
- Passline: LA OPEN Edición Aniversario, 06 de junio de 2026.
- Passline: Groove Party Club VOL22, 06 de junio de 2026.
- CNN Chile / Chilevisión: Creamfields Chile 2026, 14 y 15 de noviembre en Club Hípico de Santiago.
- PuntoTicket / Pulso Mag: The Grid Outworld con Klangkuenstler, 05 de septiembre de 2026.

Cuando una fuente no publica lineup o detalle completo, el campo queda como `Lineup por confirmar` para completarlo en Sprint 2 desde backend.

## Supabase

Sprint 5A deja Supabase preparado, pero no obligatorio. Sin variables de entorno, la app sigue funcionando con mocks y localStorage.

Ver guía completa en [supabase/README.md](./supabase/README.md).

Checklist operativo para conectar credenciales en [SUPABASE_CHECKLIST.md](./SUPABASE_CHECKLIST.md).

## Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm start
```

## Ver en celular durante desarrollo local

Levanta Next escuchando en toda la red:

```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

En este computador abre `http://localhost:3000`.

En un celular conectado a la misma Wi-Fi abre la IP local del computador, por ejemplo:

```text
http://192.168.100.21:3000
```

Si no carga en celular, permite Node.js/Next.js en el Firewall de Windows para redes privadas.

## Ver cambios online en Vercel

Flujo recomendado para revisar desde cualquier celular, incluso fuera de la Wi-Fi:

1. Conecta el repositorio de GitHub a Vercel.
2. Cada cambio local se confirma en Git y se sube a GitHub.
3. Vercel genera automáticamente un Deploy Preview por cada push.
4. Abre la URL pública del preview desde el celular.
5. Cuando esté aprobado, promueve a producción o mergea a la rama principal.

Comandos típicos:

```bash
git add .
git commit -m "Update TrackDJs events map"
git push
```

Alternativa rápida sin GitHub, usando Vercel CLI:

```bash
npx vercel
```

Para producción:

```bash
npx vercel --prod
```

La primera vez Vercel pedirá login y elegir proyecto. Después cada ejecución publica una URL online.

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, crea un nuevo proyecto e importa el repo.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Output directory: dejar vacío/default.
6. Deploy.

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md).

Checklist de lanzamiento en [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

Guía de feedback beta en [FEEDBACK.md](./FEEDBACK.md).

## Conectar trackdjs.com

1. En Vercel, entra al proyecto TrackDJs.
2. Ve a `Settings > Domains`.
3. Agrega `trackdjs.com` y, si quieres, `www.trackdjs.com`.
4. Copia los valores DNS que Vercel entregue.
5. En el panel del proveedor del dominio, crea o actualiza:
   - Registro `A` para `@` apuntando al valor/IP que indique Vercel.
   - Registro `CNAME` para `www` apuntando al host que indique Vercel.
6. Espera la propagación DNS.
7. Vuelve a Vercel y confirma que ambos dominios estén en estado `Valid Configuration`.

## Checklist post-deploy

- Abrir `/`, `/app`, `/app/events`, `/app/djs`, `/app/my-track`.
- Probar en móvil: seguir DJ, marcar `Lo vi`, guardar evento y marcar `Voy`.
- Confirmar que `Mi Track` refleja los cambios.
- Revisar que `/app/events` muestre mapa de hoy, timeline y filtros.
- Revisar consola del navegador sin errores.
- Revisar Lighthouse básico: contraste, performance y metadata.

## Sprint 5 sugerido

- Supabase Auth.
- Base de datos real para DJs, eventos, venues y perfiles.
- RLS policies.
- Migración de mock data.
- Panel admin simple para cargar DJs/eventos.
- Perfil editable real.
- Claim DJ profile.
- Eventos reales por ciudad.
- Analytics con PostHog.
