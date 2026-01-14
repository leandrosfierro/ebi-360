
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(process.cwd(), 'public/EBI_MVP_Algoritmo_v1.xlsx');
const OUTPUT_SQL_PATH = path.join(process.cwd(), '.agent/migrations/seed_ebi360_survey.sql');

function generateSQL() {
    console.log('Reading Excel:', EXCEL_PATH);
    const workbook = XLSX.readFile(EXCEL_PATH);

    // 1. Get Questions from 'Respuestas'
    const respSheet = workbook.Sheets['Respuestas'];
    const questionsData = XLSX.utils.sheet_to_json(respSheet);

    // 2. Map Domains and Questions for Algorithm JSON
    const domainsMap = new Map();
    const questions = [];

    questionsData.forEach((row, index) => {
        const domainName = row['Dominio'];
        if (!domainsMap.has(domainName)) {
            domainsMap.set(domainName, []);
        }
        domainsMap.get(domainName).push(index);

        questions.push({
            question_number: index,
            domain: row['Dominio'],
            construct: row['Constructo'],
            question_type: row['Tipo'],
            question_text: row['Pregunta'],
            weight: row['PD_constructo'],
            severity: row['SR_constructo'],
            personal_weight: row['Peso_personal'],
            org_weight: row['Peso_organizacional'],
            display_order: index
        });
    });

    const domains = Array.from(domainsMap.entries()).map(([name, questionIndices]) => ({
        name,
        weight: 1.0, // Default domain weight
        questions: questionIndices
    }));

    // 3. Define Algorithm JSON
    const algorithm = {
        scoring_method: "weighted_average",
        domains: domains,
        thresholds: {
            critical: 1,
            low: 3,
            medium: 5,
            high: 7,
            excellent: 9
        }
    };

    // 4. Build SQL Content
    let sql = `-- 🛠️ Migración de Encuesta Base EBI 360 (GENERADO AUTOMÁTICAMENTE DESDE EXCEL)
-- Origen: EBI_MVP_Algoritmo_v1.xlsx
BEGIN;

-- 1. Eliminar si ya existe para evitar duplicados (limpieza controlada)
DELETE FROM surveys WHERE code = 'EBI360';

-- 2. Insertar Encuesta
INSERT INTO surveys (code, name, description, survey_type, version, status, is_base, calculation_algorithm)
VALUES (
    'EBI360', 
    'EBI 360 v2.0', 
    'Evaluación de Bienestar Integral 360 (Fuente Oficial Excel)', 
    'base', 
    '2.0', 
    'active', 
    true, 
    '${JSON.stringify(algorithm)}'
);

-- 3. Obtener ID de la encuesta y cargar preguntas
DO $$
DECLARE
    v_survey_id UUID;
BEGIN
    SELECT id INTO v_survey_id FROM surveys WHERE code = 'EBI360';

`;

    questions.forEach(q => {
        sql += `    INSERT INTO survey_questions (survey_id, question_number, domain, construct, question_type, question_text, weight, severity, personal_weight, org_weight, display_order) 
    VALUES (v_survey_id, ${q.question_number}, '${q.domain}', '${q.construct}', '${q.question_type}', '${q.question_text.replace(/'/g, "''")}', ${q.weight}, ${q.severity}, ${q.personal_weight}, ${q.org_weight}, ${q.display_order});\n`;
    });

    sql += `
END $$;

COMMIT;
`;

    fs.writeFileSync(OUTPUT_SQL_PATH, sql);
    console.log('✅ SQL SEED generated and saved to:', OUTPUT_SQL_PATH);
}

try {
    generateSQL();
} catch (error) {
    console.error('❌ Error generating SQL:', error);
    process.exit(1);
}
