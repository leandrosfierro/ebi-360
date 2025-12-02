-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum Types
create type user_role as enum ('super_admin', 'company_admin', 'employee');
create type subscription_plan as enum ('basic', 'pro', 'enterprise');

-- COMPANIES Table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  primary_color text default '#7e22ce',
  active boolean default true,
  subscription_plan subscription_plan default 'basic',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role user_role default 'employee',
  company_id uuid references public.companies(id),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SURVEYS Table
create table public.surveys (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id),
  title text not null,
  active boolean default true,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESULTS Table
create table public.results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  survey_id uuid references public.surveys(id),
  global_score numeric(4, 2),
  domain_scores jsonb,
  answers jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)

-- Enable RLS
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.surveys enable row level security;
alter table public.results enable row level security;

-- PROFILES Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- COMPANIES Policies
create policy "Companies viewable by authenticated users"
  on companies for select
  using ( auth.role() = 'authenticated' );

-- RESULTS Policies
create policy "Users can view their own results"
  on results for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own results"
  on results for insert
  with check ( auth.uid() = user_id );

create policy "Company Admins can view results from their company"
  on results for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'company_admin'
      and profiles.company_id = (select company_id from profiles where id = results.user_id)
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
