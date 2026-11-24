-- THE AIRCREST: every flight request sent from the website.
-- Rows are written only by the `flight-request` Edge Function (service role).
-- Row Level Security is on with no policies, so the public (anon) key can neither read nor write.

create table if not exists public.flight_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  email           text not null,
  phone           text not null,
  passengers      integer check (passengers between 1 and 50),
  from_place      text not null,
  to_place        text not null,
  departure_date  date,
  return_date     date,
  aircraft        text,
  lang            text,
  status          text not null default 'new' check (status in ('new', 'quoted', 'booked', 'lost', 'spam')),
  notes           text,
  client_ip_hash  text,
  owner_email_sent  boolean not null default false,
  client_email_sent boolean not null default false
);

comment on table public.flight_requests is 'Flight requests from theaircrest website. Update status/notes as you handle each request.';

create index if not exists flight_requests_created_at_idx on public.flight_requests (created_at desc);
create index if not exists flight_requests_ip_recent_idx on public.flight_requests (client_ip_hash, created_at desc);

alter table public.flight_requests enable row level security;
