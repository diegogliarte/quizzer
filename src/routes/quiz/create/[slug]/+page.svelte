<script lang="ts">
  import Button from "$lib/components/Button.svelte";

  let { data } = $props();
  let { supabase } = $derived(data);

  let exam = data.exam;
  let questions = $state(data.questions);
  let newQuestionText = $state("");
  let newOptionText = $state({});
  let bulkPasteText = $state("");

  async function createQuestion() {
    if (!newQuestionText.trim()) return;

    const { data: question, error } = await supabase
      .from("questions")
      .insert([{ question: newQuestionText, exam_id: exam.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    questions = [
      ...questions,
      { id: question.id, question: newQuestionText, options: [] },
    ];
    newQuestionText = "";
  }

  async function createOption(questionId) {
    if (!newOptionText[questionId]?.trim()) return;

    const { data, error } = await supabase
      .from("options")
      .insert([
        {
          option_text: newOptionText[questionId],
          question_id: questionId,
          is_correct: false,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            options: [
              ...q.options,
              {
                id: data[0].id,
                option_text: newOptionText[questionId],
                is_correct: false,
              },
            ],
          }
        : q,
    );

    newOptionText[questionId] = "";
  }

  async function deleteQuestion(questionId) {
    const { error } = await supabase
      .from("questions")
      .update({ is_deleted: true })
      .eq("id", questionId);

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.filter((q) => q.id !== questionId);
  }

  async function deleteOption(optionId, questionId) {
    const { error } = await supabase
      .from("options")
      .update({ is_deleted: true })
      .eq("id", optionId);

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.map((q) =>
      q.id === questionId
        ? { ...q, options: q.options.filter((opt) => opt.id !== optionId) }
        : q,
    );
  }

  async function updateQuestion(questionId, newText) {
    if (!newText.trim()) return;

    const { error } = await supabase
      .from("questions")
      .update({ question: newText })
      .eq("id", questionId);

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.map((q) =>
      q.id === questionId ? { ...q, question: newText } : q,
    );
  }

  async function updateOption(optionId, newText, questionId) {
    if (!newText.trim()) return;

    const { error } = await supabase
      .from("options")
      .update({ option_text: newText })
      .eq("id", optionId);

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, option_text: newText } : opt,
            ),
          }
        : q,
    );
  }

  async function updateExam(examId, newName) {
    if (!newName.trim()) return;

    const { error } = await supabase
      .from("exams")
      .update({ name: newName })
      .eq("id", examId);

    if (error) {
      console.error(error);
      return;
    }
  }

  async function toggleCorrect(optionId, questionId, isCorrect) {
    const { error } = await supabase
      .from("options")
      .update({ is_correct: isCorrect })
      .eq("id", optionId);

    if (error) {
      console.error(error);
      return;
    }

    questions = questions.map((q) =>
      q.id === questionId
        ? {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, is_correct: isCorrect } : opt,
            ),
          }
        : q,
    );
  }

  async function bulkPaste() {
    const lines = bulkPasteText.trim().split("\n");
    let newQuestions = [];

    for (const line of lines) {
      const [questionText, ...options] = line.split(";");

      if (!questionText || options.length === 0) continue;

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([{ question: questionText.trim(), exam_id: exam.id }])
        .select()
        .single();

      if (questionError) {
        console.error(questionError);
        continue;
      }

      const questionId = questionData.id;
      let newOptions = [];

      for (const option of options) {
        const isCorrect = option.startsWith("*");
        const optionText = isCorrect ? option.slice(1) : option;

        const { data: optionData, error: optionError } = await supabase
          .from("options")
          .insert([
            {
              option_text: optionText.trim(),
              question_id: questionId,
              is_correct: isCorrect,
            },
          ])
          .select()
          .single();

        if (optionError) {
          console.error(optionError);
          continue;
        }

        newOptions.push({
          id: optionData.id,
          option_text: optionText.trim(),
          is_correct: isCorrect,
        });
      }

      newQuestions.push({
        id: questionId,
        question: questionText.trim(),
        options: newOptions,
      });
    }

    questions = [...questions, ...newQuestions];
    bulkPasteText = "";
  }

  console.log(exam);
</script>

<div class="flex flex-col items-center">
  <div class="w-full max-w-2xl space-y-8">
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-2xl font-semibold text-center">
        {exam?.subject?.name || "Subject"}
      </h1>

      <input
        type="text"
        bind:value={exam.name}
        class="text-lg font-medium text-gray-400 text-center cursor-pointer w-fit"
        onchange={() => updateExam(exam?.id, exam?.name)}
      />
    </div>

    <!-- Questions Section -->
    <div class="space-y-8">
      {#each questions as question, index}
        <div class="bg-neutral-800 p-8 rounded-lg space-y-4">
          <div class="relative group flex items-center text-xl font-semibold">
            <button
              class="absolute -left-5 text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onclick={() => deleteQuestion(question.id)}
            >
              ✕
            </button>
            <span class="text-gray-400 mr-2">{index + 1}.</span>
            <textarea
              bind:value={question.question}
              class="cursor-pointer field-sizing-content w-full bg-transparent text-white focus:outline-none resize-none overflow-hidden"
              onblur={() => updateQuestion(question.id, question.question)}
              onkeydown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  updateQuestion(question.id, question.question);
                }
              }}
            >
            </textarea>
          </div>

          <!-- Options Section -->
          <div class="mt-4 ml-4 space-y-3">
            {#each question.options as option}
              <div class="relative group flex items-center rounded-lg gap-2">
                <button
                  class="absolute -left-5 text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  onclick={() => deleteOption(option.id, question.id)}
                >
                  ✕
                </button>

                <textarea
                  bind:value={option.option_text}
                  class="cursor-pointer field-sizing-content w-full bg-transparent text-white focus:outline-none resize-none overflow-hidden"
                  onblur={() =>
                    updateOption(option.id, option.option_text, question.id)}
                  onkeydown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      updateOption(option.id, option.option_text, question.id);
                    }
                  }}
                />

                <input
                  type="checkbox"
                  checked={option.is_correct}
                  class="w-5 h-5 cursor-pointer accent-green-400"
                  onchange={() =>
                    toggleCorrect(option.id, question.id, !option.is_correct)}
                />
              </div>
            {/each}

            <!-- Add New Option -->
            <textarea
              type="text"
              bind:value={newOptionText[question.id]}
              placeholder="Add option..."
              class="border w-full border-dashed field-sizing-content border-gray-500 text-gray-400 px-2 py-1 cursor-text inline-block hover:text-white outline-none rounded resize-none overflow-hidden"
              onchange={() => createOption(question.id)}
              onkeydown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  createOption(question.id);
                }
              }}
            />
          </div>
        </div>
      {/each}

      <!-- Add New Question -->
      <textarea
        bind:value={newQuestionText}
        placeholder="Add new question..."
        class="field-sizing-content w-full border border-dashed border-gray-500 text-gray-400 px-2 py-1 cursor-text inline-block hover:text-white outline-none rounded resize-none overflow-hidden"
        onchange={() => createQuestion()}
        onkeydown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            createQuestion();
          }
        }}
      />
    </div>

    <div class="flex flex-col gap-2 justify-content items-center">
      <textarea
        bind:value={bulkPasteText}
        placeholder="Paste bulk questions here..."
        class="field-sizing-content w-full border border-gray-500 text-gray-400 px-2 py-1 cursor-text inline-block hover:text-white outline-none rounded resize-none overflow-hidden"
      >
      </textarea>

      <Button onclick={bulkPaste}>Bulk Add</Button>
    </div>
  </div>
</div>
