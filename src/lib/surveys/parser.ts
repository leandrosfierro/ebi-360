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
                    survey_type: String(findMetaValue(metaData, 'Tipo')).toLowerCase() as any,
                    country_code: findMetaValue(metaData, 'País'),
                    regulation_name: findMetaValue(metaData, 'Normativa'),
                    version: String(findMetaValue(metaData, 'Versión')),
                    is_base: findMetaValue(metaData, 'Es Base') === 'SI',
                    is_mandatory: findMetaValue(metaData, 'Es Obligatoria') === 'SI'
                };

                // 2. Parse Questions (Support for 'Questions' or 'Respuestas')
                const questionsSheet = workbook.Sheets['Questions'] || workbook.Sheets['Respuestas'];
                if (!questionsSheet) throw new Error('Sheet "Questions" or "Respuestas" not found');
                const questionsRaw = XLSX.utils.sheet_to_json(questionsSheet) as any[];

                const questions: SurveyQuestion[] = questionsRaw.map((q: any, i: number) => ({
                    question_number: Number(q['#'] || q['Número'] || i),
                    domain: q['Dominio'],
                    construct: q['Constructo'],
                    question_type: q['Tipo'],
                    question_text: q['Pregunta'],
                    weight: Number(q['Peso'] || q['PD_constructo'] || 1),
                    severity: Number(q['Severidad'] || q['SR_constructo'] || 1),
                    personal_weight: Number(q['Peso_Personal'] || q['Peso_personal'] || 0),
                    org_weight: Number(q['Peso_Org'] || q['Peso_organizacional'] || 0)
                }));

                // 3. Parse Algorithm (Support for 'Algorithm' or 'Índices')
                let algorithm: SurveyAlgorithm;
                const algorithmSheet = workbook.Sheets['Algorithm'];

                if (algorithmSheet) {
                    const algorithmRaw = XLSX.utils.sheet_to_json(algorithmSheet, { header: 1 }) as any[][];
                    const algorithmStr = algorithmRaw[0]?.[0];
                    if (!algorithmStr) throw new Error('Algorithm JSON not found in cell A1 of "Algorithm" sheet');
                    algorithm = typeof algorithmStr === 'string' ? JSON.parse(algorithmStr) : algorithmStr;
                } else {
                    // Fallback to auto-detecting domains from questions if 'Algorithm' sheet is missing
                    const domainsSet = new Set(questions.map(q => q.domain));
                    const domains = Array.from(domainsSet).map(name => ({
                        name,
                        weight: 1.0,
                        questions: questions
                            .filter(q => q.domain === name)
                            .map(q => q.question_number)
                    }));

                    algorithm = {
                        scoring_method: 'weighted_average',
                        domains,
                        thresholds: {
                            critical: 1,
                            low: 3,
                            medium: 5,
                            high: 7,
                            excellent: 9
                        }
                    };
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

    if (!data.metadata.code) errors.push('Code is required');
    if (!data.metadata.name) errors.push('Name is required');
    if (!['base', 'regulatory', 'custom'].includes(data.metadata.survey_type)) {
        errors.push('Invalid survey type. Must be base, regulatory, or custom');
    }

    if (data.questions.length === 0) errors.push('No questions found');
    data.questions.forEach((q, i) => {
        if (!q.question_text) errors.push(`Question #${q.question_number || i + 1} has no text`);
        if (!q.domain) errors.push(`Question #${q.question_number || i + 1} has no domain`);
    });

    if (!data.algorithm.scoring_method) errors.push('Scoring method is required in algorithm');
    if (!data.algorithm.domains || data.algorithm.domains.length === 0) {
        errors.push('No domains defined in algorithm');
    }

    return errors;
}
