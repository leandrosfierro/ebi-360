import * as XLSX from 'xlsx';
import { SurveyImportData, SurveyMetadata, SurveyQuestion, SurveyAlgorithm } from './types';

export async function parseSurveyExcel(file: File): Promise<SurveyImportData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // 1. Parse Metadata
                const metaSheet = workbook.Sheets['Metadata'];
                if (!metaSheet) throw new Error('Sheet "Metadata" not found');
                const metaData = XLSX.utils.sheet_to_json(metaSheet) as any[];

                const metadata: SurveyMetadata = {
                    code: findMetaValue(metaData, 'Código'),
                    name: findMetaValue(metaData, 'Nombre'),
                    description: findMetaValue(metaData, 'Descripción'),
                    survey_type: findMetaValue(metaData, 'Tipo').toLowerCase() as any,
                    country_code: findMetaValue(metaData, 'País'),
                    regulation_name: findMetaValue(metaData, 'Normativa'),
                    version: String(findMetaValue(metaData, 'Versión')),
                    is_base: findMetaValue(metaData, 'Es Base') === 'SI',
                    is_mandatory: findMetaValue(metaData, 'Es Obligatoria') === 'SI'
                };

                // 2. Parse Questions
                const questionsSheet = workbook.Sheets['Questions'];
                if (!questionsSheet) throw new Error('Sheet "Questions" not found');
                const questionsRaw = XLSX.utils.sheet_to_json(questionsSheet) as any[];

                const questions: SurveyQuestion[] = questionsRaw.map((q: any) => ({
                    question_number: Number(q['#'] || q['Número']),
                    domain: q['Dominio'],
                    construct: q['Constructo'],
                    question_type: q['Tipo'],
                    question_text: q['Pregunta'],
                    weight: Number(q['Peso']),
                    severity: Number(q['Severidad']),
                    personal_weight: Number(q['Peso_Personal']),
                    org_weight: Number(q['Peso_Org'])
                }));

                // 3. Parse Algorithm
                const algorithmSheet = workbook.Sheets['Algorithm'];
                if (!algorithmSheet) throw new Error('Sheet "Algorithm" not found');
                const algorithmRaw = XLSX.utils.sheet_to_json(algorithmSheet, { header: 1 }) as any[][];

                // Assuming the JSON is in cell A1
                const algorithmStr = algorithmRaw[0]?.[0];
                if (!algorithmStr) throw new Error('Algorithm JSON not found in cell A1 of "Algorithm" sheet');

                let algorithm: SurveyAlgorithm;
                try {
                    algorithm = typeof algorithmStr === 'string' ? JSON.parse(algorithmStr) : algorithmStr;
                } catch (err) {
                    throw new Error('Invalid JSON in Algorithm sheet');
                }

                resolve({ metadata, questions, algorithm });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

function findMetaValue(data: any[], field: string): any {
    const row = data.find(r => r['Campo'] === field || r['field'] === field);
    return row ? (row['Valor'] || row['value']) : undefined;
}

export function validateSurveyData(data: SurveyImportData): string[] {
    const errors: string[] = [];

    // Metadata validations
    if (!data.metadata.code) errors.push('Code is required');
    if (!data.metadata.name) errors.push('Name is required');
    if (!['base', 'regulatory', 'custom'].includes(data.metadata.survey_type)) {
        errors.push('Invalid survey type. Must be base, regulatory, or custom');
    }

    // Questions validations
    if (data.questions.length === 0) errors.push('No questions found');
    data.questions.forEach((q, i) => {
        if (!q.question_text) errors.push(`Question #${q.question_number || i + 1} has no text`);
        if (!q.domain) errors.push(`Question #${q.question_number || i + 1} has no domain`);
        const totalWeight = q.personal_weight + q.org_weight;
        if (Math.abs(totalWeight - 1.0) > 0.001 && q.question_type !== 'MIXED') {
            errors.push(`Question #${q.question_number} weights do not sum to 1.0 (${totalWeight})`);
        }
    });

    // Algorithm validations
    if (!data.algorithm.scoring_method) errors.push('Scoring method is required in algorithm');
    if (!data.algorithm.domains || data.algorithm.domains.length === 0) {
        errors.push('No domains defined in algorithm');
    }

    return errors;
}
