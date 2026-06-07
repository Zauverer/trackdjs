# Sprint 5B — Supabase Connection

## Objetivo

Conectar credenciales reales Supabase y migrar persistencia progresivamente sin romper fallback.

## Alcance recomendado

1. Supabase Auth
   - Crear proyecto Supabase si no existe.
   - Configurar env vars reales.
   - Login con email magic link.
   - Perfil de usuario asociado a `auth.users`.
   - Protección ligera de acciones personales.

2. Tablas reales
   - Diseñar schema SQL.
   - `profiles`
   - `djs`
   - `events`
   - `venues`
   - `producers`
   - `event_lineups`
   - `user_seen_djs`
   - `user_saved_events`
   - `user_going_events`
   - `badges`
   - Migrar mock data como seed inicial.
   - Persistencia real para usuarios.
   - Persistencia real para DJs seguidos.
   - Persistencia real para DJs vistos.
   - Persistencia real para eventos guardados.
   - Persistencia real para estados voy/fui.

3. RLS policies
   - Lectura pública para DJs/eventos publicados.
   - Escritura privada para acciones del usuario.
   - Admin-only para carga editorial.
   - Probar policies con usuarios reales.

4. Panel admin simple
   - Crear/editar DJs.
   - Crear/editar eventos.
   - Cargar lineup y timetable.
   - Publicar/despublicar.

5. Perfil editable
   - Alias, ciudad, bio y géneros favoritos.
   - Migrar estado de `localStorage` a Supabase después de login.

6. Claim DJ profile
   - Formulario de solicitud.
   - Estado `pending`, `approved`, `rejected`.
   - Validación manual al inicio.

7. Eventos reales por ciudad
   - Prioridad Santiago.
   - Slugs estables.
   - Curaduría manual antes de automatizar.
   - Importador editorial desde fuentes oficiales/ticketeras, sin scraping frágil de Instagram.
   - Coordenadas reales por venue para reemplazar el mapa esquemático.
   - Productoras y venues como entidades administrables.

8. Analytics
   - PostHog para eventos clave:
     - `dj_followed`
     - `dj_seen_marked`
     - `event_saved`
     - `event_going_marked`
     - `my_track_shared`
     - `signup_started`
     - `map_pin_clicked`
     - `upcoming_event_clicked`

10. Integración progresiva
   - Activar repositorios Supabase para lectura de DJs/eventos.
   - Activar Auth real.
   - Migrar localStorage a tablas de usuario después de login.
   - Mantener fallback offline/mock hasta estabilizar.
   - Reemplazar tipos manuales por `lib/supabase/database.types.ts` generado con Supabase CLI.

9. Planner de festivales
   - Timetable programable por escenario.
   - Alertas antes de cada set.
   - Export a Google Calendar.
   - Modo Creamfields para sumar/restar conflictos de horario.

## Principio de producto

Mantener `Mi Track` como el corazón de la experiencia: cada acción debe enriquecer la identidad musical del usuario.

## Futuro Gamificado

- Banderas de países donde el usuario ha visto a cada DJ.
- Ranking de fans que vieron un DJ en más países.
- DJ más seguido por cada usuario.
- DJ que más ha tocado dentro del radar TrackDJs.
- DJ con más horas acumuladas tocadas por ciudad, venue y festival.
- Enlaces a videos de YouTube de sets/eventos.
- Ranking “más fan de este DJ”.
- Evidencia futura por foto/metadatos para validar asistencia.
- Badges por país, ciudad, festival, género y etapa de la noche.

## Sprint 7C — Seed Sync + Trust Layer

- Verificar que todos los slugs de DJs/eventos mock existen en Supabase.
- Crear SQL incremental para sincronizar DJs, eventos, venues y lineups faltantes sin duplicar.
- Generar tipos reales con Supabase CLI y reemplazar el tipo manual.
- Revisar `user_seen_djs` con `event_id` para que las medallas muestren evento/año real.
- Agregar estado visual de `verificado` solo cuando exista evidencia o validación futura.
- Mantener `autodeclarado` como default para no inflar confianza.
- Probar `/app/debug/user-actions` con usuario real antes y después de cada acción.
- Medir latencia percibida de acciones y reducir consultas si aparecen nuevas duplicaciones.
- Diseñar, sin implementar todavía, el flujo de evidencia futura para validar asistencia.
