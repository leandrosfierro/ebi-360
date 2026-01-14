export type SurveyType = 'base' | 'regulatory' | 'custom';
export type SurveyStatus = 'draft' | 'active' | 'archived';
export type QuestionType = 'RP' | 'FO' | 'MIXED';
export type UserRole = 'super_admin' | 'company_admin' | 'rrhh' | 'direccion' | 'consultor_bs360' | 'employee';
export type CampaignStatus = 'draft' | 'open' | 'closed';

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
    id?: string;
    survey_id?: string;
    question_number: number;
    domain: string;
    construct?: string;
    question_text: string;
    question_type: QuestionType;
    weight: number;
    severity: number;
    personal_weight: number;
    org_weight: number;
}

export interface Area {
    id: string;
    company_id: string;
    name: string;
    description?: string;
    estimated_employees?: number;
    created_at?: string;
}

export interface Campaign {
    id: string;
    company_id: string;
    survey_id: string;
    name?: string;
    status: CampaignStatus;
    start_date?: string;
    end_date?: string;
    min_threshold: number;
    is_active: boolean;
    is_mandatory: boolean;
}

export interface Report {
    id: string;
    company_id: string;
    evaluation_id?: string;
    area_id?: string;
    title: string;
    file_url: string;
    report_type: string;
    metadata?: any;
    generated_at?: string;
}

export interface Recommendation {
    id: string;
    evaluation_id?: string;
    area_id?: string;
    domain: string;
    construct?: string;
    finding_text: string;
    recommendation_text: string;
    recommendation_type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    source: 'ia' | 'manual';
    is_approved: boolean;
    approved_by?: string;
    created_at?: string;
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
