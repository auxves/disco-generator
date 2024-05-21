<script lang="ts">
  import { db } from "$lib/db"
  import { buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"

  import { Plus } from "lucide-svelte"

  import DraftForm from "$lib/components/DraftForm.svelte"

  let open = $state(false)
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
    <Plus class="mr-2 h-4 w-4" />
    New
  </Dialog.Trigger>

  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Start a new draft</Dialog.Title>
      <Dialog.Description>
        We need some basic information for your new addon.
      </Dialog.Description>
    </Dialog.Header>
    <DraftForm
      onSubmit={(draft) => {
        db.drafts.put(draft)
        open = false
      }}
    />
  </Dialog.Content>
</Dialog.Root>
