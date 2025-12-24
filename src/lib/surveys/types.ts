export type SurveyType = 'base' | 'regulatory' | 'custom';
export type SurveyStatus = 'draft' | 'active' | 'archived';
export type QuestionType = 'RP' | 'FO' | 'MIXED';

export interface SurveyMetadata {
    code: string;
    name: string;
    description?: string;
    survey_type: SurveyType;
    country_code?: string;
    regulation_name?: string;
    version: string;
    is_base: boolean;
    is_mandatory: boolean;
}

export interface SurveyQuestion {
    question_number: number;
    domain: string;
    construct?: string;
    question_type: QuestionType;
    question_text: string;
    weight: number;
    severity: number;
    personal_weight: number;
    org_weight: number;
}

export interface SurveyAlgorithm {
    scoring_method: string;
    domains: {
        name: string;
        weight: number;
        questions: number[];
    }[];
    thresholds: Record<string, number>;
    recommendations?: Record<string, string>;
}

export interface SurveyImportData {
    metadata: SurveyMetadata;
    questions: SurveyQuestion[];
    algorithm: SurveyAlgorithm;
}
