<script lang="ts">
  import Button from "$lib/components/Button.svelte";

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<div class="flex flex-col items-center justify-center">
  <div class="w-full max-w-xs">
    <h1 class="text-xl font-semibold text-center mb-4">Sign up</h1>
    <p class="text-sm text-center mb-3">
      Already have an account? <a href="login" class="underline">Sign in</a>
    </p>

    {#if form?.error}<p class="text-red-400">{form.error}</p>{/if}

    <form method="POST" action="?/signup" class="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        class="w-full p-2 rounded bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-white"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        class="w-full p-2 rounded bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-white"
      />
      <Button type="submit" className="w-full">Sign up</Button>
    </form>
  </div>
</div>
