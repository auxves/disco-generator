<script lang="ts" context="module">
  import * as AlertDialog from "$lib/components/ui/alert-dialog"
  import { buttonVariants } from "./ui/button"

  let open = $state(false)
  let title = $state("")
  let description = $state("")
  let action = $state("")
  let className = $state("")

  let onConfirm: ConfirmOptions["onConfirm"] = $state(() => {})

  type ConfirmOptions = {
    title?: string
    description: string
    action: string
    class?: string
    onConfirm: () => any
  }

  export function confirm(options: ConfirmOptions) {
    ;({
      title = "Are you sure?",
      description,
      action,
      onConfirm,
      class: className = buttonVariants({ variant: "destructive" }),
    } = options)
    open = true
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action class={className} onclick={onConfirm}>
        {action}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
