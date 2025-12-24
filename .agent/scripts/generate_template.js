const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/docs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const templatePath = path.join(outputDir, 'plantilla_encuesta.xlsx');

// 1. Metadata Sheet
const metadata = [
    { Campo: 'Código', Valor: 'EBI_CUSTOM_01', Descripción: 'Identificador único de la encuesta' },
    { Campo: 'Nombre', Valor: 'Encuesta de Bienestar Personalizada', Descripción: 'Nombre legible' },
    { Campo: 'Descripción', Valor: 'Esta es una encuesta de ejemplo para el sistema modular.', Descripción: 'Descripción opcional' },
    { Campo: 'Tipo', Valor: 'CUSTOM', Descripción: 'BASE, REGULATORY, o CUSTOM' },
    { Campo: 'País', Valor: 'CL', Descripción: 'Código ISO de país (opcional)' },
    { Campo: 'Normativa', Valor: '', Descripción: 'Nombre de la ley o norma (opcional)' },
    { Campo: 'Versión', Valor: '1.0', Descripción: 'Versión de la encuesta' },
    { Campo: 'Es Base', Valor: 'NO', Descripción: 'SI o NO' },
    { Campo: 'Es Obligatoria', Valor: 'NO', Descripción: 'SI o NO' }
];

// 2. Questions Sheet
const questions = [
    { '#': 0, Dominio: 'Físico', Constructo: 'Salud', Tipo: 'RP', Pregunta: '¿Te sientes con energía durante el día?', Peso: 0.5, Severidad: 1.0, Peso_Personal: 1.0, Peso_Org: 0.0 },
    { '#': 1, Dominio: 'Físico', Constructo: 'Entorno', Tipo: 'FO', Pregunta: '¿Tu lugar de trabajo es cómodo?', Peso: 0.5, Severidad: 1.0, Peso_Personal: 0.0, Peso_Org: 1.0 },
    { '#': 2, Dominio: 'Emocional', Constructo: 'Estrés', Tipo: 'RP', Pregunta: '¿Puedes manejar el estrés laboral?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 1.0, Peso_Org: 0.0 }
];

// 3. Algorithm Sheet (JSON in A1)
const algorithm = {
    scoring_method: "weighted_average",
    domains: [
        { name: "Físico", weight: 1.0, questions: [0, 1] },
        { name: "Emocional", weight: 1.0, questions: [2] }
    ],
    thresholds: {
        low: 0,
        medium: 5,
        high: 7,
        excellent: 9
    },
    recommendations: {
        "Físico_low": "Considera realizar pausas activas cada 2 horas.",
        "Emocional_low": "Te recomendamos participar en nuestros talleres de manejo de estrés."
    }
};

const wb = XLSX.utils.book_new();

const wsMeta = XLSX.utils.json_to_sheet(metadata);
XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

const wsQuestions = XLSX.utils.json_to_sheet(questions);
XLSX.utils.book_append_sheet(wb, wsQuestions, 'Questions');

const wsAlgo = XLSX.utils.aoa_to_sheet([[JSON.stringify(algorithm, null, 2)]]);
XLSX.utils.book_append_sheet(wb, wsAlgo, 'Algorithm');

XLSX.writeFile(wb, templatePath);

console.log(`✅ Plantilla generada en: ${templatePath}`);
