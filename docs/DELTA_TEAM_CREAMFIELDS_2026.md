# Delta Team — TrackDJs Creamfields 2026

## Objetivo y alcance
Creamfields 2026 es la portada principal en `/` (redirección a `/app/festival/creamfields-2026`). La experiencia TrackDJs global permanece en `/app`. No se eliminan las rutas anteriores ni se migran bases de datos.

### Entregado en esta rama
- Catálogo de 86 sets desde `lib/festival/creamfields-2026.json`, con filtro por día, artista y escenario.
- Selección de sets en memoria; alertas visuales por cruces de horario.
- Acuerdo beta obligatorio con acto afirmativo (marcar y pulsar Entrar).
- Opción de no guardar información local activada por defecto, independiente del acuerdo beta. En modo privado no hay llamadas al backend desde el componente del planner.
- Guardado opcional solo en localStorage del navegador y revocación con eliminación.
- Poster PNG dibujado localmente en canvas (no se sube a un servidor).
- Enlace compartible con IDs de sets como parámetro URL, sin datos de identidad.
- Compartir PNG + texto/enlace mediante Web Share API cuando está soportado. Alternativa: descargar PNG y abrir WhatsApp con el enlace en texto. En este caso el usuario adjunta manualmente la imagen.
- Advertencia de beta independiente y no oficial y de que los horarios podrían cambiar.

### Riesgos y criterios de QA
1. Validar `npm ci`, `npm run lint`, `npm run build` en Node 22+; no comprobados por esta integración remota.
2. Validar Chrome Android, Safari iOS y escritorio, incluyendo cancelación al compartir.
3. Confirmar que selección y acuerdo no persisten en modo privado tras recarga.
4. Confirmar que en modo opcional con guardado sí persisten y que revocación elimina la clave.
5. Confirmar que abrir un enlace con `?lineup=...` recupera solo IDs permitidos (máximo 86).
6. Confirmar que el cartel PNG tiene todas las filas para selecciones grandes.
7. Auditar Vercel Analytics, middleware, cookies, logs y scripts generales del layout antes de afirmar privacidad completa. Los logs técnicos de hosting no son desactivados por esta opción.
8. La imagen y el texto simultáneos dependen de la integración del sistema operativo con WhatsApp; no se puede garantizar desde una web que WhatsApp incluya ambos automáticamente.
9. Revisar la terminología legal del acuerdo beta antes de comunicarlo como contrato y confirmar permisos/licencias de branding.
10. Los horarios son una transcripción referencial: verificar fuente oficial al publicar.

## Delta Team — roles y definición de terminado
- **Producto/PM:** conservar posicionamiento Creamfields-first y TrackDJs global secundario; definir métricas sin tracking personal sin permiso.
- **UX:** auditar comprensión de consentimientos, accesibilidad, móvil y botones de compartir.
- **DEV:** ejecutar build, corregir lint, probar Web Share API y agregar tests automatizados.
- **Privacidad/QA:** verificar red de solicitudes, localStorage y revocación; revisar cláusulas con asesoría legal.
- **Release:** PR → preview Vercel → QA móvil → autorización → merge a main, sin publicar directamente.

**No incluidos:** cuentas de usuarios, Supabase social, fotos estilo Instagram, grupos persistentes, notificaciones push o geolocalización.
