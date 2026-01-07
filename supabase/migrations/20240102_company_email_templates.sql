-- Add company_id to email_templates to allow per-company customization
alter table email_templates add column if not exists company_id uuid references companies(id);

-- Update RLS policies for email_templates
drop policy if exists "Super admins can view email templates" on email_templates;
drop policy if exists "Super admins can insert email templates" on email_templates;
drop policy if exists "Super admins can update email templates" on email_templates;

create policy "Admins can view their company email templates or global ones"
  on email_templates for select
  using (
    (company_id is null) or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin' or
        (profiles.role = 'company_admin' and profiles.company_id = email_templates.company_id)
      )
    )
  );

create policy "Admins can manage their company email templates"
  on email_templates for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin' or
        (profiles.role = 'company_admin' and profiles.company_id = email_templates.company_id)
      )
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin' or
        (profiles.role = 'company_admin' and profiles.company_id = company_id)
      )
    )
  );

-- Insert default employee invitation template if it doesn't exist (as global)
insert into email_templates (type, name, subject, body_html)
values (
  'employee_invitation', 
  'Invitación a Colaborador', 
  'Te invitaron a participar en EBI 360', 
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
    <h2 style="color: #7e22ce;">¡Hola {{full_name}}!</h2>
    <p>Tu empresa <strong>{{company_name}}</strong> te invita a sumarte a <strong>EBI 360</strong>, la plataforma para medir y mejorar tu bienestar integral.</p>
    <p>Para comenzar, solo tienes que hacer clic en el botón de abajo e ingresar con tu cuenta de Google corporativa.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_link}}" style="background-color: #7e22ce; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(126, 34, 206, 0.2);">
        Comenzar Diagnóstico
      </a>
    </div>
    <p style="color: #666; font-size: 14px; line-height: 1.6;">
      Tus respuestas son <strong>100% anónimas</strong>. El objetivo es conocer el estado general de bienestar de la organización para poder tomar acciones que los beneficien a todos.
    </p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="color: #999; font-size: 12px; text-align: center;">
      Si tienes problemas con el botón, copia y pega este enlace:<br/>
      <span style="color: #7e22ce;">{{login_link}}</span>
    </p>
  </div>'
)
on conflict (type) where company_id is null do nothing;
