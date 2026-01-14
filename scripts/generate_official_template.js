
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(process.cwd(), 'public/EBI_MVP_Algoritmo_v1.xlsx');
const TARGET_PATH = path.join(process.cwd(), 'public/docs/EBI360-Plantilla-Oficial.xlsx');

function generateTemplate() {
    console.log('Reading source file:', SOURCE_PATH);
    const workbook = XLSX.readFile(SOURCE_PATH);

    // 1. Create Metadata Sheet
    const metadata = [
        ['Campo', 'Valor', 'Descripción'],
        ['Código', 'EBI360', 'Código único de la encuesta'],
        ['Nombre', 'EBI 360 v2.0', 'Nombre oficial'],
        ['Descripción', 'Evaluación de Bienestar Integral 360', 'Descripción breve'],
        ['Tipo', 'base', 'base / regulatory / custom'],
        ['País', 'Global', 'País de aplicación'],
        ['Normativa', 'EBI-Standard', 'Normativa aplicable'],
        ['Versión', '2.0', 'Versión del documento'],
        ['Es Base', 'SI', 'SI / NO'],
        ['Es Obligatoria', 'SI', 'SI / NO']
    ];
    const metaSheet = XLSX.utils.aoa_to_sheet(metadata);

    // 2. Add as the first sheet
    // We create a new workbook or manipulate the existing one
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, metaSheet, 'Metadata');

    // Copy sheets from source
    // We prioritize 'Respuestas' and 'Índices' for the new pattern
    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        XLSX.utils.book_append_sheet(newWorkbook, sheet, sheetName);
    });

    // 3. Add a legacy Algorithm sheet for backward compatibility or documentation
    const algorithm = {
        scoring_method: "weighted_average",
        thresholds: {
            critical: 1,
            low: 3,
            medium: 5,
            high: 7,
            excellent: 9
        }
    };
    const algoSheet = XLSX.utils.aoa_to_sheet([[JSON.stringify(algorithm)]]);
    XLSX.utils.book_append_sheet(newWorkbook, algoSheet, 'Algorithm');

    XLSX.writeFile(newWorkbook, TARGET_PATH);
    console.log('✅ Standardized template created at:', TARGET_PATH);
}

try {
    generateTemplate();
} catch (error) {
    console.error('❌ Error generating template:', error);
}
