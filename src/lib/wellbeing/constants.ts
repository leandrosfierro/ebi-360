export const WELLBEING_DOMAINS = [
    { id: 'financiero', label: 'Financiero', icon: 'DollarSign' },
    { id: 'fisico', label: 'Físico', icon: 'Activity' },
    { id: 'nutricional', label: 'Nutricional', icon: 'Utensils' },
    { id: 'emocional', label: 'Emocional', icon: 'Heart' },
    { id: 'social', label: 'Social', icon: 'Users' },
    { id: 'familiar', label: 'Familiar', icon: 'Home' },
] as const;

export type WellbeingDomainId = typeof WELLBEING_DOMAINS[number]['id'];

export const DOMAIN_LABELS: Record<string, string> = {
    financiero: 'Financiero',
    fisico: 'Físico',
    nutricional: 'Nutricional',
    emocional: 'Emocional',
    social: 'Social',
    familiar: 'Familiar',
};

export const COLORS = {
    primary: '#7e22ce', // Bs360 Purple
    secondary: '#3b82f6', // Bs360 Blue
    accent: '#f43f5e',
    background: '#f8fafc',
    glass: 'rgba(255, 255, 255, 0.7)',
};
