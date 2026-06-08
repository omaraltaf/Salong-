-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null,
  price_from int,
  price_to int,
  category text check (category in ('dame', 'herre', 'barn', 'behandling')),
  icon text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Pricing tiers
create table pricing (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  label text not null,
  price int not null,
  is_active boolean default true,
  sort_order int default 0
);

-- Timeslots
create table timeslots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  service_id uuid references services(id) on delete set null,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  timeslot_id uuid references timeslots(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_id uuid references services(id) on delete set null,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- Contact submissions
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Content blocks
create table content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamptz default now()
);

-- Opening hours
create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean default false
);

-- Testimonials
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  content text not null,
  rating int default 5 check (rating between 1 and 5),
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Gallery
create table gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt_text text,
  section text check (section in ('hero', 'about', 'gallery')),
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Social links
create table social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  is_active boolean default true
);

-- RLS policies
alter table services enable row level security;
alter table pricing enable row level security;
alter table timeslots enable row level security;
alter table bookings enable row level security;
alter table contact_submissions enable row level security;
alter table content_blocks enable row level security;
alter table opening_hours enable row level security;
alter table testimonials enable row level security;
alter table gallery enable row level security;
alter table social_links enable row level security;

-- Public read access
create policy "Public read services" on services for select using (is_active = true);
create policy "Public read pricing" on pricing for select using (is_active = true);
create policy "Public read timeslots" on timeslots for select using (is_available = true);
create policy "Public read content" on content_blocks for select using (true);
create policy "Public read hours" on opening_hours for select using (true);
create policy "Public read testimonials" on testimonials for select using (is_published = true);
create policy "Public read gallery" on gallery for select using (is_active = true);
create policy "Public read social" on social_links for select using (is_active = true);

-- Public insert for bookings and contact
create policy "Public insert bookings" on bookings for insert with check (true);
create policy "Public insert contact" on contact_submissions for insert with check (true);

-- Authenticated full access (admin)
create policy "Admin all services" on services for all using (auth.role() = 'authenticated');
create policy "Admin all pricing" on pricing for all using (auth.role() = 'authenticated');
create policy "Admin all timeslots" on timeslots for all using (auth.role() = 'authenticated');
create policy "Admin all bookings" on bookings for all using (auth.role() = 'authenticated');
create policy "Admin all contact" on contact_submissions for all using (auth.role() = 'authenticated');
create policy "Admin all content" on content_blocks for all using (auth.role() = 'authenticated');
create policy "Admin all hours" on opening_hours for all using (auth.role() = 'authenticated');
create policy "Admin all testimonials" on testimonials for all using (auth.role() = 'authenticated');
create policy "Admin all gallery" on gallery for all using (auth.role() = 'authenticated');
create policy "Admin all social" on social_links for all using (auth.role() = 'authenticated');

-- Seed content blocks
insert into content_blocks (key, value) values
('hero_headline', 'Din lokale frisør i Skedsmokorset siden 1986'),
('hero_subheading', 'Profesjonell hårpleie med personlig service — alltid med deg i fokus'),
('about_heading', 'Om Blue Point'),
('about_text', 'Siden 1986 har Blue Point vært Skedsmokorsets foretrukne frisørsalong. Vi tilbyr en varm og personlig opplevelse, der erfaring møter moderne teknikker. Hos oss er du alltid i trygge hender.'),
('contact_heading', 'Ta kontakt'),
('contact_subheading', 'Book en time eller send oss en melding — vi svarer så snart som mulig.'),
('footer_tagline', 'Profesjonell hårpleie med personlig touch siden 1986.');

-- Seed opening hours
insert into opening_hours (day_of_week, open_time, close_time, is_closed) values
(0, '10:00', '17:00', false),
(1, '10:00', '17:00', false),
(2, '10:00', '18:00', false),
(3, '10:00', '18:00', false),
(4, '10:00', '17:00', false),
(5, null, null, true),
(6, null, null, true);

-- Seed services
insert into services (name, description, duration_minutes, price_from, price_to, category, sort_order) values
('Dameklipp', 'Klipp og styling tilpasset ditt hår og ønsker', 60, 450, 650, 'dame', 1),
('Herreklipp', 'Klassisk eller moderne herreklipp', 30, 350, 450, 'herre', 2),
('Barneklipp', 'Snill og rask klipp for de minste', 30, 250, 300, 'barn', 3),
('Farging', 'Helfarging med kvalitetsprodukter fra Schwarzkopf', 90, 750, 1200, 'dame', 4),
('Highlights / Balayage', 'Naturlige eller dramatiske lysninger', 120, 950, 1800, 'dame', 5),
('Vippe- og brynsfarging', 'Fremhev blikket med farging av vipper og bryn', 30, 250, 350, 'behandling', 6),
('Styling / Føning', 'Profesjonell styling for hverdag eller fest', 45, 400, 600, 'dame', 7);

-- Seed testimonials
insert into testimonials (author_name, content, rating, is_published, sort_order) values
('Mona M.', 'Utrolig dyktige og hyggelige frisører. Har vært kunde her i over ti år og blir alltid strålende fornøyd!', 5, true, 1),
('Svetlana I.', 'Kjempefornøyd med min nye frisyre. Kjempe koselig dame og veldig god service. Anbefales!', 5, true, 2),
('Lisa K.', 'Profesjonelt utført og inkredibelt hyggelig atmosfære. Kommer alltid tilbake til Blue Point.', 5, true, 3);

-- Seed social links
insert into social_links (platform, url, is_active) values
('facebook', 'https://facebook.com/bluepointskedsmo', true);
