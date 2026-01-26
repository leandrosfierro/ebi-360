import { createClient } from '@supabase/supabase-js';
import { questions } from '../src/lib/logic.ts'; // This might not work directly in node if it's TS
// Let's just hardcode the survey creation to be safe and simple.

async function seedSurveys() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Seeding base survey...');

    const baseSurvey = {
        name: 'Diagnóstico EBI 360°',
        description: 'Evaluación integral de bienestar personal y organizacional.',
        slug: 'ebi-360-base',
        active: true,
        calculation_algorithm: {
            domains: [
                { name: "Físico", questions: [0, 1, 2, 3], weight: 1 },
                { name: "Nutricional", questions: [4, 5], weight: 1 },
                { name: "Emocional", questions: [6, 7, 8, 9, 10, 11], weight: 1 },
                { name: "Social", questions: [12, 13, 14, 15], weight: 1 },
                { name: "Familiar", questions: [16, 17, 18, 19], weight: 1 },
                { name: "Económico", questions: [20, 21, 22, 23], weight: 1 }
            ]
        }
    };

    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .upsert(baseSurvey, { onConflict: 'slug' })
        .select()
        .single();

    if (surveyError) {
        console.error('Error seeding survey:', surveyError.message);
        return;
    }

    console.log(`Survey "${survey.name}" created/updated with ID: ${survey.id}`);

    // Seed questions
    const surveyQuestions = [
        { id: 0, domain: "Físico", text: "¿Dormís lo suficiente como para sentirte descansado/a la mayoría de los días?" },
        { id: 1, domain: "Físico", text: "¿Tu jornada laboral permite mantener horarios regulares de descanso?" },
        { id: 2, domain: "Físico", text: "¿Te tomás pequeñas pausas o te movés unos minutos durante tu jornada?" },
        { id: 3, domain: "Físico", text: "¿El ritmo de trabajo permite hacer pausas breves cuando las necesitás?" },
        { id: 4, domain: "Nutricional", text: "¿Mantenés horarios mínimos para comer sin saltearte comidas?" },
        { id: 5, domain: "Nutricional", text: "¿Podés comer sin apuros durante tu jornada laboral?" },
        { id: 6, domain: "Emocional", text: "¿Podés manejar el estrés diario sin sentirte desbordado/a?" },
        { id: 7, domain: "Emocional", text: "¿Las exigencias del trabajo mantienen tu nivel de estrés en algo manejable?" },
        { id: 8, domain: "Emocional", text: "¿Lográs regular tus emociones en situaciones tensas?" },
        { id: 9, domain: "Emocional", text: "¿El ambiente laboral favorece un clima emocional saludable?" },
        { id: 10, domain: "Emocional", text: "¿Disfrutás al menos una parte de tu trabajo en el día a día?" },
        { id: 11, domain: "Emocional", text: "¿El entorno laboral favorece experiencias positivas durante la jornada?" },
        { id: 12, domain: "Social", text: "¿Te involucrás activamente para mantener relaciones positivas con tu equipo?" },
        { id: 13, domain: "Social", text: "¿Te sentís incluido/a y bien tratado/a por tu equipo?" },
        { id: 14, domain: "Social", text: "¿Pedís ayuda cuando realmente la necesitás?" },
        { id: 15, domain: "Social", text: "¿Tus compañeros suelen brindarte apoyo cuando lo necesitás?" },
        { id: 16, domain: "Familiar", text: "¿Lográs organizar tu vida personal sin que se vea afectada constantemente por el trabajo?" },
        { id: 17, domain: "Familiar", text: "¿La empresa respeta tus horarios y límites personales fuera del trabajo?" },
        { id: 18, domain: "Familiar", text: "¿Sentís apoyo de tu entorno para cumplir tus responsabilidades laborales?" },
        { id: 19, domain: "Familiar", text: "¿La empresa comprende y acompaña situaciones personales cuando es necesario?" },
        { id: 20, domain: "Económico", text: "¿Sentís tranquilidad en cómo manejás tus finanzas personales?" },
        { id: 21, domain: "Económico", text: "¿La estabilidad de tu ingreso te permite sentir tranquilidad mes a mes?" },
        { id: 22, domain: "Económico", text: "¿Tenés tus finanzas personales organizadas de manera clara?" },
        { id: 23, domain: "Económico", text: "¿Recibís tu información salarial de forma clara y confiable?" }
    ];

    const finalQuestions = surveyQuestions.map(q => ({
        survey_id: survey.id,
        question_number: q.id,
        domain: q.domain,
        question_text: q.text,
        weight: 1,
        severity: 1
    }));

    // Clear old questions for this survey to avoid duplicates
    await supabase.from('survey_questions').delete().eq('survey_id', survey.id);

    const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(finalQuestions);

    if (questionsError) {
        console.error('Error seeding questions:', questionsError.message);
    } else {
        console.log(`Successfully seeded ${finalQuestions.length} questions.`);
    }

    console.log('Seeding complete.');
}

seedSurveys();
