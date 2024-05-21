<script lang="ts">
  import { db } from "$lib/db"
  import type { Draft } from "$lib/types"

  import { buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"

  import { Plus } from "lucide-svelte"
  import DiscForm from "$lib/components/DiscForm.svelte"

  type Props = {
    draft: Draft
  }

  const { draft }: Props = $props()

  let open = $state(false)
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
    <Plus class="mr-2 h-4 w-4" />
    Add
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create a new disc</Dialog.Title>
      <Dialog.Description>
        Fill out the information for your disc and upload the necessary
        resources.
      </Dialog.Description>
    </Dialog.Header>
    <DiscForm
      owner={draft.id!}
      onSubmit={(disc) => {
        db.discs.put(disc)
        open = false
      }}
    />
  </Dialog.Content>
</Dialog.Root>
