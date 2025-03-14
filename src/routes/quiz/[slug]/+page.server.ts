import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const examId = params.slug;

  // Fetch exam details (name)
  const { data: exam, error: examError } = await locals.supabase
      .from("exams")
      .select("id, name, subject:subjects(name)")
      .eq("id", examId)
      .eq("is_deleted", false)
      .single();

  if (examError) {
    console.error("Error fetching exam:", examError);
    return { exam: null, questions: [] };
  }

  // Fetch questions
  const { data: questions, error: questionsError } = await locals.supabase
      .from("questions")
      .select("id, question, options (id, option_text, is_correct), exams (name)")
      .eq("exam_id", examId)
      .eq("is_deleted", false);


  if (questionsError) {
    console.error("Error fetching quiz questions:", questionsError);
    return { exam, questions: [] };
  }

  // Randomize order of questions & options
  const shuffledQuestions = questions
      .map((q) => ({
        ...q,
        options: q.options.sort(() => Math.random() - 0.5), // Shuffle options
      }))
      .sort(() => Math.random() - 0.5); // Shuffle questions

  return { exam, questions: shuffledQuestions };
};
