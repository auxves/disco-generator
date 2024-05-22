<script lang="ts">
  import { db } from "$lib/db"
  import { page } from "$app/stores"

  import { Slash } from "lucide-svelte"
  import { liveQuery } from "dexie"

  const draft_id = $derived($page.params.draft_id)

  const draft = $derived(
    !isNaN(+draft_id)
      ? liveQuery(() => db.drafts.get(+draft_id))
      : liveQuery(() => undefined),
  )
</script>

<header class="flex h-16 items-center px-8 border-b">
  <a href="/" class="size-10 p-1 hover:p-0 transition-[padding]">
    <img src="/favicon.png" alt="Website logo" />
  </a>

  <nav
    class="flex items-center space-x-6 mx-6 uppercase font-medium text-sm text-muted-foreground tracking-widest"
  >
    <Slash class="opacity-40" />
    <a href="/" class="last:text-primary hover:text-primary transition-colors">
      Drafts
    </a>

    {#if $draft}
      <Slash class="opacity-40" />
      <span class="last:text-primary hover:text-primary transition-colors">
        {$draft.name}
      </span>
    {/if}
  </nav>
</header>
