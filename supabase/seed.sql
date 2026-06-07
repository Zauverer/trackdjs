insert into public.venues (id, slug, name, city, comuna, address, lat, lng, instagram_url, tiktok_url, website_url, contact_email, contact_phone, capacity, description) values
('10000000-0000-0000-0000-000000000001','espacio-riesco','Espacio Riesco','Santiago','Huechuraba','Av. El Salto 5000, Huechuraba',-33.3795,-70.6065,'https://instagram.com/trackdjs.venue.riesco','https://www.tiktok.com/@trackdjs.venues','https://trackdjs.com/venues/espacio-riesco','espacios-demo@trackdjs.com','+56 9 0000 1002',12000,'Venue para eventos masivos'),
('10000000-0000-0000-0000-000000000002','club-la-feria','Club La Feria','Santiago','Providencia','Constitucion 275, Providencia',-33.4328,-70.6347,'https://instagram.com/trackdjs.venue.laferia',null,'https://trackdjs.com/venues/club-la-feria','laferia-demo@trackdjs.com',null,700,'Club electrónico de Santiago'),
('10000000-0000-0000-0000-000000000003','estudio-madis-tvn','Estudio Madis, TVN','Providencia','Providencia','Bellavista 0990, Providencia',-33.4315,-70.6286,'https://instagram.com/trackdjs.venue.madis',null,null,'madis-demo@trackdjs.com',null,900,'Estudio y venue para fiestas'),
('10000000-0000-0000-0000-000000000004','estadio-espanol-curico','Estadio Español Curicó','Curicó','Curicó','Av España 802, Curicó',-34.9849,-71.2394,'https://instagram.com/trackdjs.venue.curico',null,null,'curico-demo@trackdjs.com',null,800,'Venue regional'),
('10000000-0000-0000-0000-000000000005','club-hipico','Club Hípico de Santiago','Santiago','Santiago','Club Hípico de Santiago',-33.4627,-70.6687,'https://instagram.com/trackdjs.venue.clubhipico',null,'https://trackdjs.com/venues/club-hipico','festival-demo@trackdjs.com',null,25000,'Venue festival')
on conflict (id) do nothing;

insert into public.producers (id, slug, name, city, comuna, instagram_url, tiktok_url, website_url, contact_email, contact_phone, description, verified) values
('20000000-0000-0000-0000-000000000001','ritual-cl','Ritual CL','Santiago','Santiago','https://instagram.com/trackdjs.producer.ritual','https://www.tiktok.com/@trackdjs.producers','https://trackdjs.com/producers/ritual-cl','ritual-demo@trackdjs.com','+56 9 0000 2001','Techno nocturno',true),
('20000000-0000-0000-0000-000000000002','aurora-sessions','Aurora Sessions','Santiago','Providencia','https://instagram.com/trackdjs.producer.aurora','https://www.tiktok.com/@trackdjs.producers','https://trackdjs.com/producers/aurora-sessions','aurora-demo@trackdjs.com',null,'Melodic open air',true),
('20000000-0000-0000-0000-000000000003','pulse-factory','Pulse Factory','Santiago','Estación Central','https://instagram.com/trackdjs.producer.pulse',null,'https://trackdjs.com/producers/pulse-factory','pulse-demo@trackdjs.com',null,'Warehouse energy',false),
('20000000-0000-0000-0000-000000000004','creamfields-chile','Creamfields Chile','Santiago','Santiago','https://instagram.com/trackdjs.producer.creamfields',null,'https://trackdjs.com/producers/creamfields-chile','creamfields-demo@trackdjs.com',null,'Festival electrónico',true)
on conflict (id) do nothing;

insert into public.djs (id, slug, artist_name, country, city, bio, genres, instagram_url, tiktok_url, soundcloud_url, spotify_url, youtube_url, website_url, contact_email, contact_enabled, verified) values
('30000000-0000-0000-0000-000000000001','amelie-lens','Amelie Lens','Belgium','Antwerp','Energía directa, tensión industrial y sets peak.',array['Techno','Hard Techno'],'https://instagram.com/trackdjs.dj.amelie','https://www.tiktok.com/@trackdjs.amelie','https://soundcloud.com/search?q=Amelie%20Lens','https://open.spotify.com/search/Amelie%20Lens','https://www.youtube.com/results?search_query=Amelie+Lens','https://trackdjs.com/djs/amelie-lens',null,false,true),
('30000000-0000-0000-0000-000000000002','charlotte-de-witte','Charlotte de Witte','Belgium','Ghent','Precisión oscura y bajos grandes.',array['Techno'],'https://instagram.com/trackdjs.dj.charlotte',null,'https://soundcloud.com/search?q=Charlotte%20de%20Witte','https://open.spotify.com/search/Charlotte%20de%20Witte','https://www.youtube.com/results?search_query=Charlotte+de+Witte',null,null,false,true),
('30000000-0000-0000-0000-000000000003','hernan-cattaneo','Hernan Cattaneo','Argentina','Buenos Aires','Narrativa progresiva de largo aliento.',array['Progressive','Melodic Techno'],'https://instagram.com/trackdjs.dj.hernan',null,'https://soundcloud.com/search?q=Hernan%20Cattaneo','https://open.spotify.com/search/Hernan%20Cattaneo',null,'https://trackdjs.com/djs/hernan-cattaneo','booking-demo@trackdjs.com',true,true),
('30000000-0000-0000-0000-000000000004','nina-kraviz','Nina Kraviz','Russia','Irkutsk','Selección impredecible entre hipnosis y acidez.',array['Techno','Minimal'],'https://instagram.com/trackdjs.dj.nina',null,'https://soundcloud.com/search?q=Nina%20Kraviz','https://open.spotify.com/search/Nina%20Kraviz',null,null,null,false,true),
('30000000-0000-0000-0000-000000000005','fjaak','FJAAK','Germany','Berlin','Máquinas, groove crudo y actitud warehouse.',array['Techno','House'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000006','keinemusik','Keinemusik','Germany','Berlin','Warm grooves y estética global de sunset.',array['Afro House','House'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000007','adriatique','Adriatique','Switzerland','Zurich','Melodía elegante y tensión emocional.',array['Melodic Techno','House'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000008','boris-brejcha','Boris Brejcha','Germany','Ludwigshafen','High-tech minimal de identidad inmediata.',array['Minimal','Techno'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000009','anna','ANNA','Brazil','Sao Paulo','Control, potencia y sensibilidad melódica.',array['Techno','Melodic Techno'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000010','indira-paganotto','Indira Paganotto','Spain','Madrid','Trance, techno duro y pista en ascenso.',array['Trance','Hard Techno'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000011','solomun','Solomun','Germany','Hamburg','Elegancia de club y tensión lenta.',array['House','Melodic Techno'],null,null,null,null,null,null,null,false,true),
('30000000-0000-0000-0000-000000000012','artbat','ARTBAT','Ukraine','Kyiv','Líneas épicas para escenarios grandes.',array['Melodic Techno'],null,null,null,null,null,null,null,false,true)
on conflict (id) do nothing;

insert into public.events (id, slug, name, description, starts_at, city, venue_id, producer_id, address, lat, lng, ticket_url, event_type, genres, status) values
('40000000-0000-0000-0000-000000000001','amelie-lens-espacio-riesco-2026','Amelie Lens Six Hours Set','Show presencial de Amelie Lens en Espacio Riesco.','2026-06-06 21:00:00-04','Santiago','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Av. El Salto 5000, Huechuraba',-33.3795,-70.6065,'https://www.puntoticket.com/amelie-lens-2026','Festival',array['Techno','Hard Techno'],'upcoming'),
('40000000-0000-0000-0000-000000000002','la-feria-sabado-06-2026','Sábado 06 en La Feria Club','Fecha publicada en calendario oficial.','2026-06-06 23:30:00-04','Santiago','10000000-0000-0000-0000-000000000002',null,'Constitucion 275, Providencia',-33.4328,-70.6347,'https://clublaferia.net/','Club',array['House','Techno'],'upcoming'),
('40000000-0000-0000-0000-000000000003','la-open-aniversario','LA OPEN - Edición Aniversario','Edición aniversario con componentes electrónicos/deep house.','2026-06-06 23:00:00-04','Providencia','10000000-0000-0000-0000-000000000003',null,'Bellavista 0990, Providencia',-33.4315,-70.6286,'https://www.passline.com/eventos/la-open-edicion-aniversario','Club',array['Deep House','Electronica','Open Format'],'upcoming'),
('40000000-0000-0000-0000-000000000004','groove-party-club-vol22','Groove Party Club VOL22','Fiesta old school con terraza electrónica.','2026-06-06 23:30:00-04','Curicó','10000000-0000-0000-0000-000000000004',null,'Av España 802, Curicó',-34.9849,-71.2394,'https://www.passline.com/eventos/groove-party-club-vol22','Club',array['Tech House','House','Progressive'],'upcoming'),
('40000000-0000-0000-0000-000000000005','creamfields-chile-2026','Creamfields Chile 2026','Festival confirmado para noviembre de 2026.','2026-11-14 12:00:00-03','Santiago','10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000004','Club Hípico de Santiago',-33.4627,-70.6687,null,'Festival',array['EDM','House','Techno'],'upcoming'),
('40000000-0000-0000-0000-000000000006','warehouse-ritual','Warehouse Ritual','Concreto, humo y máquinas.','2026-07-05 23:30:00-04','Santiago',null,'20000000-0000-0000-0000-000000000003','Warehouse Matucana',-33.4446,-70.6806,null,'Warehouse',array['Techno','Minimal'],'upcoming'),
('40000000-0000-0000-0000-000000000007','progressive-depths','Progressive Depths','Capas, paciencia y una historia bien mezclada.','2026-07-12 21:00:00-04','Santiago',null,'20000000-0000-0000-0000-000000000002','Basel Venue',-33.4372,-70.6506,null,'Club',array['Progressive','Melodic Techno'],'upcoming'),
('40000000-0000-0000-0000-000000000008','trance-control','Trance Control','Subidas rápidas, kicks tensos y sala lista.','2026-08-16 22:00:00-04','Santiago',null,'20000000-0000-0000-0000-000000000001','Warehouse Matucana',-33.4446,-70.6806,null,'Warehouse',array['Trance','Hard Techno'],'upcoming')
on conflict (id) do nothing;

insert into public.event_lineup (event_id, dj_id, stage_name, starts_at, sort_order, is_headliner) values
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Main','2026-06-06 22:00:00-04',1,true),
('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000009','Room A','2026-07-05 23:30:00-04',1,false),
('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000005','Room A','2026-07-06 01:00:00-04',2,true),
('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000004','Room A','2026-07-06 03:00:00-04',3,true),
('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000007','Club','2026-07-12 21:00:00-04',1,false),
('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000003','Club','2026-07-13 00:00:00-04',2,true),
('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000010','Room A','2026-08-16 22:00:00-04',1,true),
('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001','Room A','2026-08-17 00:30:00-04',2,true)
on conflict do nothing;

insert into public.badges (id, slug, name, description, icon, condition_type, condition_value) values
('50000000-0000-0000-0000-000000000001','first-rave','First Rave','Tu primera noche guardada en TrackDJs.','sparkles','seen_djs',1),
('50000000-0000-0000-0000-000000000002','warehouse','Warehouse Soul','La oscuridad también cuenta historias.','warehouse','warehouse_events',1),
('50000000-0000-0000-0000-000000000003','front-row','Front Row','Viste el set desde la primera línea.','badge','seen_djs',5),
('50000000-0000-0000-0000-000000000004','after-hours','After Hours','Cuando el amanecer no era el final.','moon','attended_events',1),
('50000000-0000-0000-0000-000000000005','crate-digger','Crate Digger','Tu radar musical está vivo.','disc','followed_djs',3),
('50000000-0000-0000-0000-000000000006','festival-run','Festival Run','Lineups largos, memoria selectiva.','calendar','festival_events',1),
('50000000-0000-0000-0000-000000000007','techno-heart','Techno Heart','BPM alto, corazón estable.','heart','genre_techno',1),
('50000000-0000-0000-0000-000000000008','sunrise','Sunrise Set','Ese cierre quedó registrado.','sun','attended_events',3)
on conflict (id) do nothing;
