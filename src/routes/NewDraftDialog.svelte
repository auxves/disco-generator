<script lang="ts">
  import { goto } from "$app/navigation"
  import { db } from "$lib/db"

  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Label } from "$lib/components/ui/label"
  import { Input } from "$lib/components/ui/input"

  import { Plus } from "lucide-svelte"

  let namespace = $state("")
  let name = $state("")
  let description = $state("")

  const VALID_NAMESPACE_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz_-."

  function create() {
    if (
      namespace.length < 1 ||
      [...namespace].some((c) => !VALID_NAMESPACE_CHARS.includes(c))
    ) {
      return
    }

    if (name.length < 1) {
      return
    }

    db.drafts
      .put({ namespace, name, description })
      .then((key) => goto(`/drafts/${key}`))
  }
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
    <Plus class="mr-2 h-4 w-4" />
    New
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Start a new draft</Dialog.Title>
      <Dialog.Description>
        We need some basic information for your new addon.
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid w-full items-center gap-4">
      <div class="flex flex-col space-y-1.5 gap-1">
        <Label for="namespace">Namespace</Label>
        <Input
          id="namespace"
          placeholder="The unique identifier of your addon"
          bind:value={namespace}
        />
      </div>
      <div class="flex flex-col space-y-1.5 gap-1">
        <Label for="name">Name</Label>
        <Input
          id="name"
          placeholder="The name that users will see"
          bind:value={name}
        />
      </div>
      <div class="flex flex-col space-y-1.5 gap-1">
        <Label for="description">Description</Label>
        <Input
          id="description"
          placeholder="An optional description of the addon"
          bind:value={description}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" onclick={create}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
