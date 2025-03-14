<script lang="ts">
  import Button from "$lib/components/Button.svelte";

  let { data } = $props();
  let exam = data.exam;
  let questions = $state(data.questions);
  let selectedAnswers = $state({});
  let showResults = $state(false);
  let score = $state(0);

  function validateAnswers() {
    score = calculateScore()
    showResults = true;
  }

  function isCorrect(option, questionId) {
    return showResults && selectedAnswers[questionId]?.includes(option.id) && option.is_correct;
  }

  function isUnselectedCorrect(option, questionId) {
    return showResults && option.is_correct && !selectedAnswers[questionId]?.includes(option.id);
  }

  function toggleAnswer(questionId, optionId, isMultiple) {
    if (!selectedAnswers[questionId]) {
      selectedAnswers[questionId] = isMultiple ? [] : null;
    }

    if (isMultiple) {
      // Toggle option for multiple choice
      if (selectedAnswers[questionId].includes(optionId)) {
        selectedAnswers[questionId] = selectedAnswers[questionId].filter(id => id !== optionId);
      } else {
        selectedAnswers[questionId] = [...selectedAnswers[questionId], optionId];
      }
    } else {
      // Single choice: override previous selection
      selectedAnswers[questionId] = [optionId];
    }
  }

  function calculateScore() {
    let correctCount = 0;

    questions.forEach((question) => {
      const correctOptions = question.options.filter(opt => opt.is_correct).map(opt => opt.id);
      const selectedOptions = selectedAnswers[question.id] || [];

      // Single-choice: only one correct answer
      if (correctOptions.length === 1) {
        if (selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0])) {
          correctCount++;
        }
      }
      // Multiple-choice: all correct answers must be selected
      else {
        if (selectedOptions.length === correctOptions.length && selectedOptions.every(optId => correctOptions.includes(optId))) {
          correctCount++;
        }
      }
    });

    return correctCount;
  }

</script>

<div class="flex flex-col items-center">
  <h1 class="text-2xl font-semibold text-center">{exam?.subject?.name || "Subject"}</h1>
  <h2 class="text-lg font-medium text-gray-400">{exam ? exam.name : "Quiz"}</h2>

  <div class="w-full max-w-2xl flex flex-col gap-8 m-6">
    {#each questions as question, index}
      <div>
        <h2 class="text-lg font-semibold">{index + 1}. {question.question}</h2>

        {#each question.options as option}
          <!-- Calculate multiple choice before looping -->
          {#await Promise.resolve(question.options.filter(opt => opt.is_correct).length > 1) then isMultipleCorrect}
            <label class={`flex items-center space-x-3 cursor-pointer p-1 rounded transition
                 ${isCorrect(option, question.id) ? "bg-green-400 text-black" : ""}
                 ${isUnselectedCorrect(option, question.id) ? "bg-red-400 text-black" : ""}
                 ${!showResults ? "hover:bg-neutral-700" : ""}
                 `}
            >
              <input
                      type={isMultipleCorrect ? "checkbox" : "radio"}
                      checked={selectedAnswers[question.id]?.includes(option.id)}
                      onchange={() => toggleAnswer(question.id, option.id, isMultipleCorrect)}
                      class="mr-2 appearance-none w-4 h-4 border border-white focus:outline-none
        {isMultipleCorrect ? 'rounded-sm' : 'rounded-full'}
        checked:bg-white checked:border-white
        "
                      disabled={showResults}
              />

              <span>{option.option_text}</span>
            </label>
          {/await}
        {/each}
      </div>
    {/each}

    <Button onclick={validateAnswers} disabled={showResults}>
      Validate Answers
    </Button>

    {#if showResults}
      <p class="text-xl font-semibold text-center mt-4">
        Score: {score} / {questions.length}
      </p>
    {/if}
  </div>
</div>
