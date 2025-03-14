import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { data: subjects, error: subjectsError } = await locals.supabase
      .from("subjects")
      .select(`
      id, 
      name, 
      exams (
        id, 
        name,
        subject_id,
        questions: questions (id)
      )
    `)
      .eq("is_deleted", false)
      .eq("exams.is_deleted", false)
      .eq("exams.questions.is_deleted", false)
      .order("id", { ascending: true });

  if (subjectsError) {
    console.error("Error fetching subjects:", subjectsError);
    return { subjects: [] };
  }

  // Format subjects and count questions for each exam
  const formattedSubjects = subjects.map((subject) => ({
    ...subject,
    exams: subject.exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      subjectName: subject.name, // Include subject name
      questionCount: exam.questions.length, // Count questions
    })),
  }));

  return { subjects: formattedSubjects };
};
