#!/usr/bin/env python3
"""
Generador de PDFs Profesionales para Guías de Usuario EBI 360
Convierte los archivos Markdown a PDFs con diseño profesional
"""

import os
import subprocess
from pathlib import Path

# Configuración
WORKSPACE = "/Users/leandrofierro/Workspaces/ebi-360"
AGENT_DIR = f"{WORKSPACE}/.agent"
OUTPUT_DIR = f"{AGENT_DIR}/pdfs"

# Crear directorio de salida
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

# Archivos a convertir
files_to_convert = [
    {
        "input": f"{AGENT_DIR}/guia-usuario-colaborador.md",
        "output": f"{OUTPUT_DIR}/EBI360-Guia-Usuario-Colaborador.pdf",
        "title": "Guía de Usuario - EBI 360",
        "subtitle": "Para Colaboradores",
        "author": "Equipo EBI 360",
        "cover_color": "#6366f1"  # Indigo
    },
    {
        "input": f"{AGENT_DIR}/guia-superadministrador.md",
        "output": f"{OUTPUT_DIR}/EBI360-Guia-Super-Administrador.pdf",
        "title": "Guía de Super Administrador - EBI 360",
        "subtitle": "Panel de Control Completo",
        "author": "Equipo EBI 360",
        "cover_color": "#8b5cf6"  # Purple
    }
]

def check_pandoc():
    """Verifica si pandoc está instalado"""
    try:
        subprocess.run(["pandoc", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_pandoc():
    """Instala pandoc usando homebrew"""
    print("📦 Instalando pandoc...")
    try:
        subprocess.run(["brew", "install", "pandoc"], check=True)
        print("✅ Pandoc instalado exitosamente")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error al instalar pandoc")
        return False

def create_pdf_with_pandoc(config):
    """Crea PDF usando pandoc con configuración personalizada"""
    
    input_file = config["input"]
    output_file = config["output"]
    
    # Configuración de pandoc
    pandoc_args = [
        "pandoc",
        input_file,
        "-o", output_file,
        "--pdf-engine=xelatex",
        "--toc",  # Tabla de contenidos
        "--toc-depth=3",
        "-V", "geometry:margin=1in",
        "-V", "fontsize=11pt",
        "-V", "documentclass=article",
        "-V", f"title={config['title']}",
        "-V", f"subtitle={config['subtitle']}",
        "-V", f"author={config['author']}",
        "-V", "date=\\today",
        "-V", "colorlinks=true",
        "-V", "linkcolor=blue",
        "-V", "urlcolor=blue",
        "-V", "toccolor=black",
        "--highlight-style=tango",
        "--number-sections",
    ]
    
    try:
        print(f"📄 Generando {output_file}...")
        subprocess.run(pandoc_args, check=True, capture_output=True)
        print(f"✅ PDF generado: {output_file}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al generar PDF: {e.stderr.decode()}")
        return False

def create_html_version(config):
    """Crea versión HTML como alternativa"""
    
    input_file = config["input"]
    output_file = config["output"].replace(".pdf", ".html")
    
    # HTML template con diseño profesional
    html_template = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
        }}
        
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        
        .cover {{
            background: {cover_color};
            background: linear-gradient(135deg, {cover_color} 0%, #764ba2 100%);
            color: white;
            padding: 4rem 3rem;
            text-align: center;
        }}
        
        .cover h1 {{
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }}
        
        .cover p {{
            font-size: 1.25rem;
            opacity: 0.95;
            margin-bottom: 0.5rem;
        }}
        
        .cover .date {{
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 2rem;
        }}
        
        .content {{
            padding: 3rem;
        }}
        
        h1, h2, h3, h4 {{
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }}
        
        h1 {{ font-size: 2rem; border-bottom: 3px solid {cover_color}; padding-bottom: 0.5rem; }}
        h2 {{ font-size: 1.5rem; color: {cover_color}; }}
        h3 {{ font-size: 1.25rem; }}
        
        p {{
            margin-bottom: 1rem;
        }}
        
        ul, ol {{
            margin-left: 2rem;
            margin-bottom: 1rem;
        }}
        
        li {{
            margin-bottom: 0.5rem;
        }}
        
        code {{
            background: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background: #1f2937;
            color: #f3f4f6;
            padding: 1.5rem;
            border-radius: 12px;
            overflow-x: auto;
            margin-bottom: 1.5rem;
        }}
        
        pre code {{
            background: none;
            color: inherit;
            padding: 0;
        }}
        
        blockquote {{
            border-left: 4px solid {cover_color};
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: #4b5563;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }}
        
        th, td {{
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }}
        
        th {{
            background: #f9fafb;
            font-weight: 700;
            color: {cover_color};
        }}
        
        .toc {{
            background: #f9fafb;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }}
        
        .toc h2 {{
            margin-top: 0;
        }}
        
        .toc ul {{
            list-style: none;
            margin-left: 0;
        }}
        
        .toc a {{
            color: {cover_color};
            text-decoration: none;
        }}
        
        .toc a:hover {{
            text-decoration: underline;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .container {{
                box-shadow: none;
                border-radius: 0;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="cover">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <p class="date">Diciembre 2025 • Versión 1.0</p>
        </div>
        <div class="content">
            {content}
        </div>
    </div>
</body>
</html>
"""
    
    try:
        # Leer el markdown
        with open(input_file, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        # Convertir markdown a HTML usando pandoc
        result = subprocess.run(
            ["pandoc", "-f", "markdown", "-t", "html"],
            input=markdown_content.encode(),
            capture_output=True,
            check=True
        )
        
        html_content = result.stdout.decode()
        
        # Crear HTML completo
        final_html = html_template.format(
            title=config['title'],
            subtitle=config['subtitle'],
            cover_color=config['cover_color'],
            content=html_content
        )
        
        # Guardar HTML
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(final_html)
        
        print(f"✅ HTML generado: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error al generar HTML: {e}")
        return False

def main():
    print("🚀 Generador de PDFs Profesionales - EBI 360")
    print("=" * 60)
    
    # Verificar pandoc
    if not check_pandoc():
        print("⚠️  Pandoc no está instalado")
        response = input("¿Deseas instalarlo ahora? (s/n): ")
        if response.lower() == 's':
            if not install_pandoc():
                print("❌ No se pudo instalar pandoc")
                print("💡 Generando versiones HTML como alternativa...")
                for config in files_to_convert:
                    create_html_version(config)
                return
        else:
            print("💡 Generando versiones HTML como alternativa...")
            for config in files_to_convert:
                create_html_version(config)
            return
    
    # Generar PDFs
    print("\n📄 Generando PDFs...")
    success_count = 0
    
    for config in files_to_convert:
        if create_pdf_with_pandoc(config):
            success_count += 1
        # También crear versión HTML
        create_html_version(config)
    
    print("\n" + "=" * 60)
    print(f"✅ Proceso completado: {success_count}/{len(files_to_convert)} PDFs generados")
    print(f"📁 Archivos guardados en: {OUTPUT_DIR}")
    print("\n💡 También se generaron versiones HTML para visualización web")

if __name__ == "__main__":
    main()
