import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  const exam_id = params.slug;

  const { data: exam, error: examError } = await locals.supabase
    .from("exams")
    .select("id, name, subject:subjects(name)")
    .eq("id", exam_id)
    .eq("is_deleted", false)
    .single();

  const { data: questions, error: questionsError } = await locals.supabase
    .from("questions")
    .select("id, question, options (id, option_text, is_correct)")
    .eq("exam_id", exam_id)
    .eq("is_deleted", false)
    .order("id", { ascending: true });

  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
    return { questions: [], exam: null };
  }

  if (examError) {
    console.error("Error fetching exam:", examError);
    return { questions: [], exam: null };
  }

  return { questions, exam };
};
