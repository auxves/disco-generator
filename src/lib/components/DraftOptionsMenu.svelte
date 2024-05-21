<script lang="ts">
  import { db } from "$lib/db"
  import type { Draft } from "$lib/types"

  import { buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"

  import { Ellipsis, Trash, Edit2 } from "lucide-svelte"

  import { confirm } from "$lib/components/Confirm.svelte"
  import { goto } from "$app/navigation"
  import DraftForm from "$lib/components/DraftForm.svelte"

  type Props = {
    draft: Draft
  }

  const { draft }: Props = $props()

  let open = $state(false)
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit draft</Dialog.Title>
      <Dialog.Description>idk</Dialog.Description>
    </Dialog.Header>
    <DraftForm
      data={draft}
      onSubmit={(data) => {
        db.drafts.update(draft.id, data)
        open = false
      }}
    />
  </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: "outline", size: "icon" })}
  >
    <Ellipsis class="size-4" />
    <span class="sr-only">More</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item
      onclick={() => {
        open = !open
      }}
    >
      <Edit2 class="mr-2 h-4 w-4" />
      Edit
    </DropdownMenu.Item>

    <DropdownMenu.Separator />

    <DropdownMenu.Item
      class="text-destructive"
      onclick={() => {
        confirm({
          description:
            "This draft and all resources associated with it will be permanently deleted.",
          action: "Delete",
          onConfirm() {
            db.discs.where("draft").equals(draft.id!).delete()
            db.drafts.delete(draft.id!)
            goto("/")
          },
        })
      }}
    >
      <Trash class="mr-2 h-4 w-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
