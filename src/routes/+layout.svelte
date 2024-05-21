<script lang="ts">
  import "../app.css"

  import Confirm from "$lib/components/Confirm.svelte"
  import Header from "$lib/components/Header.svelte"
  import AudioPlayer from "$lib/components/AudioPlayer.svelte"

  const { children } = $props()
</script>

<svelte:head>
  <meta
    name="description"
    content="Disco Generator lets you create your own Disco addon using a graphical interface."
  />
  <title>Disco</title>
</svelte:head>

<Header />

<main class="flex items-center flex-col">
  {@render children()}
</main>

<Confirm />
<AudioPlayer />
