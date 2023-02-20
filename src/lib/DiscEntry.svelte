<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import type { Disc } from "../types"

  const dispatch = createEventDispatcher()

  export let disc: Disc

  let textures: FileList
  let sounds: FileList

  $: if (sounds?.length === 1) disc.sound = sounds[0]
  $: if (textures?.length === 1) disc.texture = textures[0]

  $: textureLabel = disc.texture ? ` (${disc.texture.name})` : ""
  $: soundLabel = disc.sound ? ` (${disc.sound.name})` : ""
</script>

<main>
  <button class="remove-button" on:click={() => dispatch("remove")}>✕</button>

  <div>
    <label for="">Identifier</label>
    <input
      type="text"
      placeholder="Make sure this is unique"
      bind:value={disc.id}
    />
  </div>

  <div>
    <label for="">Name</label>
    <input type="text" placeholder="Artist - Song" bind:value={disc.name} />
  </div>

  <div>
    <label for="">Sound {soundLabel}</label>
    <input type="file" accept=".ogg, audio/ogg" bind:files={sounds} />
  </div>

  <div>
    <label for="">Texture {textureLabel}</label>
    <input type="file" accept="image/png" bind:files={textures} />
  </div>
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 1rem;
    position: relative;
    padding-left: 3rem;

    @media (min-width: 900px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .remove-button {
    display: grid;
    align-items: center;
    justify-content: center;

    background-color: hsl(0, 50%, 70%);

    width: 32px;
    height: 100%;
    border-radius: 8px;
    position: absolute;

    &:hover {
      background-color: hsl(0, 30%, 55%);
    }
  }
</style>
