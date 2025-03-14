<script lang="ts">
  let { data } = $props();
  let { supabase } = $derived(data);

  let subjects = $state(data.subjects);
  let newSubjectName = $state("");
  let newExamName = $state({});
  let editingSubject = $state({});
  let editingExam = $state({});

  async function createSubject() {
    if (!newSubjectName.trim()) return;

    const { data, error } = await supabase
      .from("subjects")
      .insert([{ name: newSubjectName }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    subjects = [
      ...subjects,
      { id: data[0].id, name: newSubjectName, exams: [] },
    ];
    newSubjectName = "";
  }

  async function createExam(subjectId) {
    if (!newExamName[subjectId]?.trim()) return;

    const { data, error } = await supabase
      .from("exams")
      .insert([{ name: newExamName[subjectId], subject_id: subjectId }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    subjects = subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            exams: [
              ...subject.exams,
              { id: data[0].id, name: newExamName[subjectId] },
            ],
          }
        : subject,
    );

    newExamName[subjectId] = "";
  }

  async function deleteSubject(subjectId) {
    const { error } = await supabase
      .from("subjects")
      .update({ is_deleted: true })
      .eq("id", subjectId);

    if (error) {
      console.error(error);
      return;
    }

    subjects = subjects.filter((subject) => subject.id !== subjectId);
  }

  async function deleteExam(examId, subjectId) {
    const { error } = await supabase
      .from("exams")
      .update({ is_deleted: true })
      .eq("id", examId);

    if (error) {
      console.error(error);
      return;
    }

    subjects = subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            exams: subject.exams.filter((exam) => exam.id !== examId),
          }
        : subject,
    );
  }
</script>

<div class="flex flex-col items-center">
  <h1 class="text-2xl font-semibold text-center">Create a Quiz</h1>
  <p class="text-gray-400 text-center mt-1">
    Select a subject and exam, or create new ones.
  </p>

  <div class="mt-8 space-y-4">
    {#each subjects as subject}
      <div class="relative group flex items-center">
        <!-- X Delete Button (Positioned Absolutely) -->
        <button
          class="absolute left-0 text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          onclick={() => deleteSubject(subject.id)}
        >
          ✕
        </button>

        <!-- Subject Name -->
        <h2 class="text-lg font-semibold cursor-pointer hover:underline pl-6">
          {subject.name}
        </h2>
      </div>

      <div class="ml-6 mt-2 space-y-2">
        {#each subject.exams as exam}
          <div class="relative group flex items-center">
            <!-- X Delete Button (Positioned Absolutely) -->
            <button
              class="absolute left-0 text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onclick={() => deleteExam(exam.id, subject.id)}
            >
              ✕
            </button>

            <!-- Exam Name -->
            <a href={"/quiz/create/" + exam.id} class="cursor-pointer hover:underline pl-6">
              {exam.name} <span class="text-gray-400 text-sm">({exam.questionCount} questions)</span>
            </a>
          </div>
        {/each}

        <!-- New Exam Input (Aligned with Exam Name) -->
        <input
          type="text"
          bind:value={newExamName[subject.id]}
          placeholder="New Exam"
          class="border border-dashed border-gray-500 text-gray-400 px-2 py-1 cursor-text inline-block mt-2 hover:text-white outline-none rounded ml-6"
          onchange={() => createExam(subject.id)}
        />
      </div>
    {/each}

    <!-- New Subject Input (Aligned with Subject Name) -->
    <input
      bind:value={newSubjectName}
      placeholder="New Subject"
      class="border border-dashed border-gray-500 text-gray-400 px-2 py-1 cursor-text inline-block mt-2 hover:text-white outline-none rounded ml-6"
      onchange={() => createSubject()}
    />
  </div>
</div>
