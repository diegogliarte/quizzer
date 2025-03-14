<script lang="ts">
  let {
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
    onclick = () => {},
      children
  } = $props();
</script>

<button
  {type}
  {disabled}
  onclick={onclick}
  class={`w-fit py-2 rounded font-medium transition cursor-pointer px-4
        ${variant === "primary" ? "bg-white text-black hover:bg-gray-300" : "bg-neutral-800 text-white hover:bg-neutral-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}`}
>
    {@render children()}
</button>
