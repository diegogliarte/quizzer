<script>
  import "../app.css";

  import { invalidate } from "$app/navigation";
  import { onMount } from "svelte";
  import Button from "$lib/components/Button.svelte";
  import {redirect} from "@sveltejs/kit";

  let { data, children } = $props();
  let { session, supabase } = $derived(data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => data.subscription.unsubscribe();
  });

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
    location.href = "/";
  };
</script>

{#if session}
<header class="bg-neutral-800 text-white p-4 shadow-md">
  <div class="max-w-5xl mx-auto flex justify-between items-center">
    <!-- Logo / Title -->
    <h1 class="text-xl font-semibold">
      <a href="/" class="hover:underline">Quiz App</a>
    </h1>

    <!-- Navigation Links -->
    <nav class="space-x-6">
      <a href="/dashboard" class="text-gray-400 hover:text-white">Dashboard</a>
      <a href="/quiz/create" class="text-gray-400 hover:text-white">Create Quiz</a>
    </nav>

    <!-- Logout Button -->
    <Button className="!w-fit" onclick={logout}>
      Logout
    </Button>
  </div>
</header>
{/if}

<main class="text-white">
  <div class="p-8">
    {@render children()}
  </div>
</main>
