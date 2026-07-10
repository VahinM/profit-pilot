-- ============================================================
-- ProfitPilot database schema
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1. BUSINESSES — one row per user's business
create table businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'My business',
  tax_rate    numeric(5,2) not null default 0,
  currency    text not null default 'USD',
  time_zone   text not null default 'America/Los_Angeles',
  created_at  timestamptz not null default now()
);

-- 2. CUSTOMERS
create table customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null,
  company     text,
  email       text,
  phone       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- 3. INVOICES
create table invoices (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  customer_id  uuid references customers(id) on delete set null,
  number       text not null,                          -- e.g. INV-1042
  status       text not null default 'draft'
               check (status in ('draft','pending','paid','partially_paid','overdue')),
  issue_date   date not null default current_date,
  due_date     date,
  tax_rate     numeric(5,2) not null default 0,
  notes        text,
  created_at   timestamptz not null default now()
);

-- 4. INVOICE LINE ITEMS
create table invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0
);

-- 5. INCOME — money in (invoice payments, POS imports, manual entries)
create table income (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  customer_id  uuid references customers(id) on delete set null,
  invoice_id   uuid references invoices(id) on delete set null,
  source       text not null,                          -- who paid / where it came from
  description  text,
  amount       numeric(12,2) not null check (amount > 0),
  date         date not null default current_date,
  method       text not null default 'cash'
               check (method in ('cash','card','ach','check','venmo','zelle','other')),
  entry_type   text not null default 'manual'
               check (entry_type in ('manual','invoice_payment','pos_import','bank_import')),
  created_at   timestamptz not null default now()
);

-- 6. EXPENSES — money out
create table expenses (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references businesses(id) on delete cascade,
  merchant       text not null,
  amount         numeric(12,2) not null check (amount > 0),
  date           date not null default current_date,
  category       text not null default 'other'
                 check (category in ('advertising','fuel','office_supplies','equipment',
                        'rent','payroll','meals','travel','insurance','utilities',
                        'software','taxes','inventory','supplies','other')),
  notes          text,
  receipt_url    text,                                  -- storage path, added later
  payment_method text not null default 'card',
  status         text not null default 'cleared'
                 check (status in ('pending','cleared')),
  created_at     timestamptz not null default now()
);

-- Helpful indexes for the queries the dashboard runs constantly
create index idx_income_business_date   on income (business_id, date desc);
create index idx_expenses_business_date on expenses (business_id, date desc);
create index idx_invoices_business      on invoices (business_id, status);
create index idx_customers_business     on customers (business_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Every table locked so users can only ever touch their own data.
-- ============================================================

alter table businesses    enable row level security;
alter table customers     enable row level security;
alter table invoices      enable row level security;
alter table invoice_items enable row level security;
alter table income        enable row level security;
alter table expenses      enable row level security;

-- Businesses: you can only see/edit a business you own
create policy "own business" on businesses
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Everything else: allowed only if the row belongs to a business you own.
-- One reusable check via a helper function keeps policies short.
create or replace function owns_business(b_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from businesses where id = b_id and owner_id = auth.uid());
$$;

create policy "own rows" on customers
  for all using (owns_business(business_id)) with check (owns_business(business_id));

create policy "own rows" on invoices
  for all using (owns_business(business_id)) with check (owns_business(business_id));

create policy "own rows" on income
  for all using (owns_business(business_id)) with check (owns_business(business_id));

create policy "own rows" on expenses
  for all using (owns_business(business_id)) with check (owns_business(business_id));

-- Invoice items belong to a business through their invoice
create policy "own rows" on invoice_items
  for all using (
    exists (select 1 from invoices i where i.id = invoice_id and owns_business(i.business_id))
  ) with check (
    exists (select 1 from invoices i where i.id = invoice_id and owns_business(i.business_id))
  );

-- ============================================================
-- AUTO-CREATE a business when someone signs up
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into businesses (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', 'My business'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
