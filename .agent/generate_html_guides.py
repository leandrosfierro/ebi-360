#!/usr/bin/env python3
"""
Generador de HTML Profesional para Guías de Usuario EBI 360
Convierte Markdown a HTML con diseño profesional sin dependencias externas
"""

import os
import re
from pathlib import Path
from datetime import datetime

# Configuración
WORKSPACE = "/Users/leandrofierro/Workspaces/ebi-360"
AGENT_DIR = f"{WORKSPACE}/.agent"
OUTPUT_DIR = f"{AGENT_DIR}/pdfs"

# Crear directorio de salida
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

def markdown_to_html(markdown_text):
    """Convierte Markdown básico a HTML"""
    html = markdown_text
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Bold
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    
    # Italic
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Code inline
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Links
    html = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html)
    
    # Listas
    lines = html.split('\n')
    in_list = False
    result = []
    
    for line in lines:
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            if not in_list:
                result.append('<ul>')
                in_list = True
            item = line.strip()[2:]
            result.append(f'<li>{item}</li>')
        elif line.strip().startswith(('1. ', '2. ', '3. ', '4. ', '5. ', '6. ', '7. ', '8. ', '9. ')):
            if not in_list:
                result.append('<ol>')
                in_list = True
            item = re.sub(r'^\d+\.\s+', '', line.strip())
            result.append(f'<li>{item}</li>')
        else:
            if in_list:
                result.append('</ul>' if result[-2].startswith('<ul>') or '<ul>' in '\n'.join(result[-5:]) else '</ol>')
                in_list = False
            if line.strip():
                if not line.strip().startswith('<'):
                    result.append(f'<p>{line}</p>')
                else:
                    result.append(line)
            else:
                result.append('<br>')
    
    if in_list:
        result.append('</ul>')
    
    return '\n'.join(result)

def create_professional_html(input_file, output_file, title, subtitle, cover_color):
    """Crea HTML profesional con diseño completo"""
    
    # Leer markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convertir a HTML
    html_content = markdown_to_html(markdown_content)
    
    # Formatear fechas fuera del f-string
    current_month_year = datetime.now().strftime("%B %Y")
    current_full_date = datetime.now().strftime("%d de %B de %Y")
    title_escaped = title.replace("'", "\\'")
    
    # Template HTML profesional
    html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        @page {{
            size: A4;
            margin: 2cm;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: linear-gradient(135deg, {cover_color} 0%, #764ba2 100%);
            padding: 2rem;
        }}
        
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.4);
            overflow: hidden;
        }}
        
        .cover {{
            background: {cover_color};
            background: linear-gradient(135deg, {cover_color} 0%, #764ba2 100%);
            color: white;
            padding: 5rem 3rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        
        .cover::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 15s ease-in-out infinite;
        }}
        
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.1); }}
        }}
        
        .cover-content {{
            position: relative;
            z-index: 1;
        }}
        
        .logo {{
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 900;
            color: {cover_color};
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }}
        
        .cover h1 {{
            font-size: 3rem;
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            letter-spacing: -0.02em;
        }}
        
        .cover .subtitle {{
            font-size: 1.5rem;
            opacity: 0.95;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }}
        
        .cover .version {{
            font-size: 1rem;
            opacity: 0.85;
            margin-top: 2rem;
            font-weight: 500;
        }}
        
        .content {{
            padding: 4rem 3rem;
        }}
        
        h1, h2, h3, h4, h5, h6 {{
            color: #111827;
            margin-top: 2.5rem;
            margin-bottom: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
        }}
        
        h1 {{ 
            font-size: 2.5rem; 
            border-bottom: 4px solid {cover_color}; 
            padding-bottom: 0.75rem;
            margin-top: 3rem;
        }}
        
        h2 {{ 
            font-size: 2rem; 
            color: {cover_color};
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}
        
        h2::before {{
            content: '';
            width: 6px;
            height: 2rem;
            background: {cover_color};
            border-radius: 3px;
        }}
        
        h3 {{ 
            font-size: 1.5rem;
            color: #374151;
        }}
        
        h4 {{
            font-size: 1.25rem;
            color: #4b5563;
        }}
        
        p {{
            margin-bottom: 1.25rem;
            text-align: justify;
        }}
        
        ul, ol {{
            margin-left: 2.5rem;
            margin-bottom: 1.5rem;
        }}
        
        li {{
            margin-bottom: 0.75rem;
            line-height: 1.6;
        }}
        
        code {{
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            color: #be123c;
            border: 1px solid #e5e7eb;
        }}
        
        pre {{
            background: #1f2937;
            color: #f3f4f6;
            padding: 2rem;
            border-radius: 16px;
            overflow-x: auto;
            margin: 2rem 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border: 1px solid #374151;
        }}
        
        pre code {{
            background: none;
            color: inherit;
            padding: 0;
            border: none;
        }}
        
        blockquote {{
            border-left: 5px solid {cover_color};
            padding: 1.5rem 2rem;
            margin: 2rem 0;
            background: #f9fafb;
            border-radius: 0 12px 12px 0;
            font-style: italic;
            color: #374151;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }}
        
        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 2rem 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }}
        
        th, td {{
            padding: 1rem 1.5rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }}
        
        th {{
            background: linear-gradient(135deg, {cover_color} 0%, #764ba2 100%);
            color: white;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.05em;
        }}
        
        tr:hover {{
            background: #f9fafb;
        }}
        
        tr:last-child td {{
            border-bottom: none;
        }}
        
        .toc {{
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 2.5rem;
            border-radius: 16px;
            margin: 2rem 0;
            border: 2px solid #e5e7eb;
        }}
        
        .toc h2 {{
            margin-top: 0;
            color: {cover_color};
        }}
        
        .toc ul {{
            list-style: none;
            margin-left: 0;
        }}
        
        .toc li {{
            padding: 0.5rem 0;
        }}
        
        .toc a {{
            color: {cover_color};
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
        }}
        
        .toc a:hover {{
            transform: translateX(8px);
            color: #764ba2;
        }}
        
        .highlight-box {{
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 5px solid #f59e0b;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 0 12px 12px 0;
        }}
        
        .info-box {{
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-left: 5px solid #3b82f6;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 0 12px 12px 0;
        }}
        
        .success-box {{
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            border-left: 5px solid #10b981;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 0 12px 12px 0;
        }}
        
        .warning-box {{
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-left: 5px solid #ef4444;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 0 12px 12px 0;
        }}
        
        .footer {{
            background: #f9fafb;
            padding: 3rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 3px solid {cover_color};
        }}
        
        .footer strong {{
            color: {cover_color};
        }}
        
        .print-button {{
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: {cover_color};
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            border: none;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            z-index: 1000;
        }}
        
        .print-button:hover {{
            transform: translateY(-4px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.4);
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .container {{
                box-shadow: none;
                border-radius: 0;
                max-width: 100%;
            }}
            
            .print-button {{
                display: none;
            }}
            
            .cover {{
                page-break-after: always;
            }}
            
            h1, h2, h3 {{
                page-break-after: avoid;
            }}
            
            pre, table {{
                page-break-inside: avoid;
            }}
        }}
        
        @media (max-width: 768px) {{
            body {{
                padding: 0;
            }}
            
            .container {{
                border-radius: 0;
            }}
            
            .cover {{
                padding: 3rem 1.5rem;
            }}
            
            .cover h1 {{
                font-size: 2rem;
            }}
            
            .content {{
                padding: 2rem 1.5rem;
            }}
            
            h1 {{
                font-size: 1.75rem;
            }}
            
            h2 {{
                font-size: 1.5rem;
            }}
        }}
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    
    <div class="container">
        <div class="cover">
            <div class="cover-content">
                <div class="logo">EBI</div>
                <h1>{title}</h1>
                <p class="subtitle">{subtitle}</p>
                <p class="version">Versión 1.0 • {current_month_year}</p>
            </div>
        </div>
        
        <div class="content">
            {html_content}
        </div>
        
        <div class="footer">
            <p><strong>© 2025 EBI 360</strong> - Todos los derechos reservados</p>
            <p>Documento generado el {current_full_date}</p>
        </div>
    </div>
    
    <script>
        window.addEventListener('beforeprint', () => {{
            document.title = '{title_escaped}';
        }});
    </script>
</body>
</html>"""
    
    # Guardar HTML
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    return output_file

def main():
    print("🚀 Generador de Guías Profesionales - EBI 360")
    print("=" * 70)
    
    files = [
        {
            "input": f"{AGENT_DIR}/guia-usuario-colaborador.md",
            "output": f"{OUTPUT_DIR}/EBI360-Guia-Usuario-Colaborador.html",
            "title": "Guía de Usuario EBI 360",
            "subtitle": "Para Colaboradores",
            "color": "#6366f1"
        },
        {
            "input": f"{AGENT_DIR}/guia-superadministrador.md",
            "output": f"{OUTPUT_DIR}/EBI360-Guia-Super-Administrador.html",
            "title": "Guía de Super Administrador EBI 360",
            "subtitle": "Panel de Control Completo",
            "color": "#8b5cf6"
        },
        {
            "input": f"{AGENT_DIR}/guia-administrador-empresa.md",
            "output": f"{OUTPUT_DIR}/EBI360-Guia-Administrador-Empresa.html",
            "title": "Guía de Administrador de Empresa EBI 360",
            "subtitle": "Gestión de Equipo y Resultados",
            "color": "#10b981"
        }
    ]
    
    print("\n📄 Generando guías HTML profesionales...\n")
    
    for config in files:
        try:
            output = create_professional_html(
                config["input"],
                config["output"],
                config["title"],
                config["subtitle"],
                config["color"]
            )
            print(f"✅ {config['title']}")
            print(f"   📁 {output}")
            print()
        except Exception as e:
            print(f"❌ Error generando {config['title']}: {e}\n")
    
    print("=" * 70)
    print("✅ Proceso completado!")
    print(f"\n📁 Archivos guardados en: {OUTPUT_DIR}")
    print("\n💡 Instrucciones para generar PDF:")
    print("   1. Abre los archivos HTML en tu navegador")
    print("   2. Haz clic en el botón 'Imprimir / Guardar PDF'")
    print("   3. Selecciona 'Guardar como PDF' como destino")
    print("   4. Ajusta los márgenes si es necesario")
    print("   5. Guarda el archivo")
    print("\n🎨 Los archivos HTML tienen diseño profesional y son")
    print("   totalmente responsivos para visualización web.")

if __name__ == "__main__":
    main()
