#!/usr/bin/env python3
"""
Generador de HTML para la Estrategia y Backlog de EBI 360
Crea una versión web premium del dossier de estrategia
"""

import os
import re
from pathlib import Path
from datetime import datetime

# Configuración
WORKSPACE = "/Users/leandrofierro/Workspaces/ebi-360"
AGENT_DIR = f"{WORKSPACE}/.agent"
DOCS_DIR = f"{AGENT_DIR}/documentation"
OUTPUT_DIR = f"{WORKSPACE}/public/docs/admin-docs"

# Crear directorio de salida si no existe
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

def markdown_to_html(markdown_text):
    """Convierte Markdown básico a HTML compatible con el diseño premium"""
    html = markdown_text
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    
    # Bold & Italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Checkboxes
    html = re.sub(r'- \[ \]', r'<li class="checkbox">☐', html)
    html = re.sub(r'- \[x\]', r'<li class="checkbox checked">☑', html)
    
    # Listas
    lines = html.split('\n')
    result = []
    in_list = False
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('- ') or stripped.startswith('* ') or stripped.startswith('<li'):
            if not in_list:
                result.append('<ul>')
                in_list = True
            if stripped.startswith('<li'):
                result.append(stripped)
            else:
                result.append(f'<li>{stripped[2:]}</li>')
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            if stripped:
                if not stripped.startswith('<'):
                    result.append(f'<p>{line}</p>')
                else:
                    result.append(line)
    
    if in_list:
        result.append('</ul>')
        
    return '\n'.join(result)

def create_strategy_html():
    input_file = f"{DOCS_DIR}/EBI360-Estrategia-y-Backlog-Completo.md"
    output_file = f"{OUTPUT_DIR}/EBI360-Estrategia-y-Backlog.html"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    html_body = markdown_to_html(markdown_content)
    
    current_date = datetime.now().strftime("%d de %B, %Y")
    
    template = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EBI 360 - Estrategia y Backlog Técnico</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #8b5cf6;
            --primary-dark: #7c3aed;
            --secondary: #6366f1;
            --bg: #f8fafc;
            --card-bg: rgba(255, 255, 255, 0.9);
        }}
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: 'Inter', sans-serif;
            background: #0f172a;
            color: #f1f5f9;
            line-height: 1.6;
            padding: 2rem;
        }}
        
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            color: #1e293b;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 50px 100px rgba(0,0,0,0.5);
        }}
        
        .header {{
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            padding: 5rem 3rem;
            text-align: center;
            color: white;
        }}
        
        .header h1 {{ font-size: 3.5rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 1rem; }}
        .header p {{ font-size: 1.25rem; opacity: 0.9; font-weight: 500; }}
        
        .content {{ padding: 4rem 3rem; }}
        
        h1 {{ font-size: 2.5rem; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 4px solid var(--primary); padding-bottom: 0.5rem; }}
        h2 {{ font-size: 2rem; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--primary); }}
        h3 {{ font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }}
        
        p {{ margin-bottom: 1.2rem; }}
        
        ul {{ margin-left: 2rem; margin-bottom: 1.5rem; }}
        li {{ margin-bottom: 0.5rem; }}
        
        li.checkbox {{ list-style: none; margin-left: -1rem; display: flex; align-items: center; gap: 0.5rem; }}
        li.checkbox.checked {{ color: #10b981; font-weight: 700; }}
        
        hr {{ border: none; border-top: 1px solid #e2e8f0; margin: 3rem 0; }}
        
        .footer {{ background: #f8fafc; padding: 3rem; text-align: center; color: #64748b; font-size: 0.9rem; border-top: 1px solid #e2e8f0; }}
        
        .print-btn {{
            position: fixed; bottom: 2rem; right: 2rem;
            background: var(--primary); color: white; border: none;
            padding: 1rem 2rem; border-radius: 50px; font-weight: 800;
            cursor: pointer; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
            transition: all 0.3s ease; z-index: 100;
        }}
        .print-btn:hover {{ transform: translateY(-5px); box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6); }}

        @media print {{
            .print-btn {{ display: none; }}
            body {{ background: white; padding: 0; }}
            .container {{ box-shadow: none; border-radius: 0; width: 100%; }}
        }}
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Exportar a PDF</button>
    <div class="container">
        <div class="header">
            <h1>EBI 360</h1>
            <p>Estrategia de Producto y Backlog Técnico Evolutivo</p>
            <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">Generado el {current_date}</p>
        </div>
        <div class="content">
            {html_body}
        </div>
        <div class="footer">
            <p>© 2026 EBI 360 - Plataforma de Bienestar Integral</p>
        </div>
    </div>
</body>
</html>
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(template)
    
    return output_file

if __name__ == "__main__":
    print(f"✅ Generando HTML de Estrategia...")
    path = create_strategy_html()
    print(f"✨ Archivo creado en: {path}")
