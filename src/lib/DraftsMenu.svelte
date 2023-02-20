<script lang="ts">
  import type { Disc, Draft } from "../types"

  export let drafts: Draft[]

  export let id: string
  export let name: string
  export let description: string
  export let discs: Disc[]

  let open = false

  $: symbol = open ? "↑" : "↓"

  function toggle() {
    open = !open
  }

  function remove(index: number) {
    localStorage.removeItem(drafts[index].id)

    drafts.splice(index, 1)
    drafts = drafts
  }
</script>

<main>
  <button on:click={toggle} data-open={open}>Load Saved Draft {symbol}</button>
  <nav>
    {#if drafts.length !== 0}
      {#each drafts as draft, i (draft.id)}
        <div>
          <button
            on:click={() => {
              ;({ id, name, description, discs } = draft)
              toggle()
            }}
          >
            {draft.name}
          </button>
          <span>{draft.description}</span>
          <button class="remove" on:click={() => remove(i)}>✕</button>
        </div>
      {/each}
    {:else}
      No saved drafts!
    {/if}
  </nav>
</main>

<style lang="scss">
  main {
    position: relative;

    > button {
      position: relative;
      z-index: 100;
    }
  }

  nav {
    z-index: 10;
    display: grid;
    gap: 1rem;
    position: absolute;
    top: 56px;
    padding: 1rem;
    width: min(100%, 600px);
    border-radius: 0.5rem;

    background-color: hsl(0, 0%, 14%);

    box-shadow: 0 0 0 100vmax hsla(0, 0%, 0%, 0.5);
    opacity: 0;
    visibility: hidden;

    transition: all 0.2s;

    > div {
      display: grid;
      align-items: center;
      grid-template-columns: auto 1fr auto;
      gap: 0.75rem;

      span {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  button[data-open="true"] + nav {
    visibility: visible;
    opacity: 1;
  }

  .remove {
    background-color: hsl(0, 50%, 70%);

    &:hover {
      background-color: hsl(0, 30%, 55%);
    }
  }
</style>
