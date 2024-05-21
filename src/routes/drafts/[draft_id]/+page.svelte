<script lang="ts">
  import { liveQuery } from "dexie"

  import { page } from "$app/stores"
  import { db } from "$lib/db"
  import { generate } from "$lib/generation"

  import { Button } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import { Separator } from "$lib/components/ui/separator"

  import { Download } from "lucide-svelte"

  import DiscCard from "$lib/components/DiscCard.svelte"

  import NewDiscDialog from "./NewDiscDialog.svelte"
  import DraftOptionsMenu from "./DraftOptionsMenu.svelte"

  const { draft_id } = $page.params as import("./$types").RouteParams

  const draft = $derived(liveQuery(() => db.drafts.get(+draft_id)))

  const discs = $derived(
    liveQuery(() => db.discs.where("draft").equals(+draft_id).toArray()),
  )
</script>

{#if $draft}
  <div class="flex flex-col gap-8 w-full items-center py-8">
    <div class="space-y-4 max-w-screen-lg w-full px-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 class="text-4xl font-medium tracking-tight">
          {$draft.name}
        </h2>
        <div class="flex sm:items-center gap-2 sm:ml-auto">
          <Button onclick={() => generate($draft)}>
            <Download class="mr-2 h-4 w-4" />
            Export
          </Button>
          <DraftOptionsMenu draft={$draft} />
        </div>
      </div>
      <p>
        {$draft.description || "No description."}
      </p>
      <Badge class="font-mono" variant="secondary">
        {$draft.namespace}
      </Badge>
    </div>

    <Separator />

    <div class="space-y-8 max-w-screen-lg w-full px-8">
      <div class="flex items-center gap-4">
        <h2 class="text-3xl font-medium tracking-tight">Discs</h2>
        <div class="flex items-center gap-2 ml-auto">
          <NewDiscDialog draft={$draft} />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        {#each $discs || [] as disc (disc.id)}
          <DiscCard {disc} />
        {/each}
      </div>
    </div>
  </div>
{/if}

<svelte:head>
  <title>{$draft?.name} - Disco</title>
</svelte:head>
