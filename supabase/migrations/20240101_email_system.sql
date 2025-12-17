-- Create table for email templates
create table if not exists email_templates (
  id uuid default gen_random_uuid() primary key,
  type text unique not null,
  name text not null,
  subject text not null,
  body_html text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Create table for email logs
create table if not exists email_logs (
  id uuid default gen_random_uuid() primary key,
  to_email text not null,
  template_type text not null,
  status text not null, -- 'sent', 'failed'
  error_message text,
  metadata jsonb,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sent_by uuid references auth.users(id)
);

-- Enable RLS
alter table email_templates enable row level security;
alter table email_logs enable row level security;

-- Policies for email_templates (only super_admin can manage)
create policy "Super admins can view email templates"
  on email_templates for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

create policy "Super admins can insert email templates"
  on email_templates for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

create policy "Super admins can update email templates"
  on email_templates for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

-- Policies for email_logs (only super_admin can view)
create policy "Super admins can view email logs"
  on email_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
    )
  );

create policy "System can insert email logs"
  on email_logs for insert
  with check (true); -- Allow insert from server actions (auth usually handled there or via service role)

-- Insert default templates
insert into email_templates (type, name, subject, body_html)
values 
  ('invite_super_admin', 'Invitación Super Admin', 'Invitación a EBI 360', '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"> <h1 style="color: #7e22ce;">Bienvenido a EBI 360</h1> <p>Hola <strong>{{full_name}}</strong>,</p> <p>Has sido invitado a unirte a EBI 360 con permisos de <strong>Super Administrador</strong>.</p> <p>Para comenzar, por favor acepta la invitación haciendo clic en el siguiente botón:</p> <div style="text-align: center; margin: 30px 0;"> <a href="{{invite_link}}" style="background-color: #7e22ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;"> Aceptar Invitación </a> </div> <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p> <p style="color: #666; font-size: 12px; word-break: break-all;">{{invite_link}}</p> </div>'),
  ('invite_company_admin', 'Invitación Company Admin', 'Invitación a Administrar Empresa en EBI 360', '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"> <h1 style="color: #7e22ce;">Bienvenido a EBI 360</h1> <p>Hola <strong>{{full_name}}</strong>,</p> <p>Has sido invitado a unirte a EBI 360 para administrar tu empresa.</p> <p>Para comenzar, por favor acepta la invitación haciendo clic en el siguiente botón:</p> <div style="text-align: center; margin: 30px 0;"> <a href="{{invite_link}}" style="background-color: #7e22ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;"> Aceptar Invitación </a> </div> <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p> <p style="color: #666; font-size: 12px; word-break: break-all;">{{invite_link}}</p> </div>')
on conflict (type) do nothing;
