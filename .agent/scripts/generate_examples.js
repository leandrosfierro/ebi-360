const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function generateSurvey(filename, meta, questions, algo) {
    const wb = XLSX.utils.book_new();

    // Metadata sheet format as requested by parser.ts findMetaValue
    const metaArray = Object.entries(meta).map(([key, value]) => ({ Campo: key, Valor: value }));
    const wsMeta = XLSX.utils.json_to_sheet(metaArray);
    XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

    const wsQuestions = XLSX.utils.json_to_sheet(questions);
    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Questions');

    const wsAlgo = XLSX.utils.aoa_to_sheet([[JSON.stringify(algo, null, 2)]]);
    XLSX.utils.book_append_sheet(wb, wsAlgo, 'Algorithm');

    const filePath = path.join('/Users/leandrofierro/Workspaces/ebi-360/public/docs/ejemplos', filename);
    XLSX.writeFile(wb, filePath);
    console.log(`✅ Generada: ${filePath}`);
}

// 1. NOM-035 (México) - Ejemplo simplificado
generateSurvey('NOM-035-MX.xlsx', {
    'Código': 'NOM035_MX',
    'Nombre': 'NOM-035 Factores de Riesgo Psicosocial',
    'Descripción': 'Cuestionario para la identificación de factores de riesgo psicosocial en los centros de trabajo.',
    'Tipo': 'REGULATORY',
    'País': 'MX',
    'Normativa': 'NOM-035-STPS-2018',
    'Versión': '1.0',
    'Es Base': 'NO',
    'Es Obligatoria': 'SI'
}, [
    { '#': 0, Dominio: 'Ambiente de Trabajo', Constructo: 'Condiciones', Tipo: 'FO', Pregunta: '¿Mi trabajo me exige mucho esfuerzo físico?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 0.0, Peso_Org: 1.0 },
    { '#': 1, Dominio: 'Factores propios de la tarea', Constructo: 'Carga de trabajo', Tipo: 'FO', Pregunta: '¿Mi trabajo me obliga a trabajar con mucha rapidez?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 0.0, Peso_Org: 1.0 },
    { '#': 2, Dominio: 'Liderazgo y Relaciones', Constructo: 'Liderazgo', Tipo: 'MIXED', Pregunta: '¿Recibo retroalimentación sobre mi desempeño?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 0.2, Peso_Org: 0.8 }
], {
    scoring_method: "weighted_average",
    domains: [
        { name: "Ambiente de Trabajo", weight: 0.33, questions: [0] },
        { name: "Factores propios de la tarea", weight: 0.33, questions: [1] },
        { name: "Liderazgo y Relaciones", weight: 0.34, questions: [2] }
    ],
    thresholds: { low: 0, medium: 20, high: 45, excellent: 100 },
    recommendations: {
        "Ambiente de Trabajo_low": "Se recomienda realizar un diagnóstico de seguridad e higiene."
    }
});

// 2. Ley Karin (Chile) - Ejemplo simplificado
generateSurvey('Ley-Karin-CL.xlsx', {
    'Código': 'LEY_KARIN_CL',
    'Nombre': 'Ley Karin: Prevención de Acoso y Violencia',
    'Descripción': 'Evaluación de clima preventivo frente al acoso laboral, sexual y violencia en el trabajo.',
    'Tipo': 'REGULATORY',
    'País': 'CL',
    'Normativa': 'Ley N° 21.643',
    'Versión': '1.0',
    'Es Base': 'NO',
    'Es Obligatoria': 'SI'
}, [
    { '#': 0, Dominio: 'Prevención', Constructo: 'Protocolos', Tipo: 'FO', Pregunta: '¿Conoces el protocolo de prevención de acoso de la empresa?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 0.0, Peso_Org: 1.0 },
    { '#': 1, Dominio: 'Cultura', Constructo: 'Respeto', Tipo: 'RP', Pregunta: '¿Sientes que el trato de tus superiores es respetuoso?', Peso: 1.0, Severidad: 1.0, Peso_Personal: 1.0, Peso_Org: 0.0 }
], {
    scoring_method: "weighted_average",
    domains: [
        { name: "Prevención", weight: 0.5, questions: [0] },
        { name: "Cultura", weight: 0.5, questions: [1] }
    ],
    thresholds: { low: 0, medium: 5, high: 7, excellent: 9 },
    recommendations: {
        "Prevención_low": "Urgente: Realizar capacitación sobre los nuevos protocolos de la Ley Karin."
    }
});
