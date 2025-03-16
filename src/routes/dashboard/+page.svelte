<script lang="ts">
  let { data } = $props();

  let subjects = $state(data.subjects);
</script>

<div class="flex flex-col items-center">
  <h1 class="text-2xl font-semibold text-center">Available Quizzes</h1>
  <p class="text-gray-400 text-center mt-1">
    Select a subject and exam to start a quiz.
  </p>

  <div class="mt-8 space-y-4">
    {#each subjects as subject}
      <div class="relative flex items-center">
        <!-- Subject Name -->
        <h2 class="text-lg font-semibold pl-6">{subject.name}</h2>
      </div>

      <div class="ml-6 mt-2 space-y-2">
        {#each subject.exams as exam}
          <div class="relative flex items-center group">
            <!-- Exam Name (Clickable) + Question Count -->
            <a
              href={"/quiz/" + exam.id}
              class="cursor-pointer hover:underline pl-6"
            >
              {exam.name}
              <span class="text-gray-400 text-sm"
                >({exam.questionCount} questions)</span
              >
            </a>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
