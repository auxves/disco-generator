<script lang="ts">
  import { z } from "zod"
  import { defaults, superForm } from "sveltekit-superforms"
  import { zod, zodClient } from "sveltekit-superforms/adapters"

  import type { Draft } from "$lib/types"

  import * as Form from "$lib/components/ui/form"
  import { Input } from "$lib/components/ui/input"
  import { Badge } from "$lib/components/ui/badge"

  const schema = z.object({
    namespace: z
      .string({ required_error: "Namespace is required." })
      .min(2, "Namespace must be at least two characters long.")
      .max(64, "Namespace must be at most 64 characters long.")
      .regex(
        /^[a-z0-9-_]*$/,
        "Namespace can only contain lowercase letters, numbers, dashes, and underscores.",
      ),

    name: z
      .string({ required_error: "Name is required." })
      .min(1, "Name is required."),

    description: z.string().default(""),
  })

  type Props = {
    data?: Draft
    onSubmit: (data: Draft) => any
  }

  const { data, onSubmit }: Props = $props()

  const form = superForm(defaults(data, zod(schema)), {
    SPA: true,
    validators: zodClient(schema),
    onUpdate({ form }) {
      if (form.valid) {
        onSubmit(form.data)
      }
    },
  })

  const { form: formData, enhance } = form
</script>

<form method="POST" class="space-y-2" use:enhance>
  <Form.Field {form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input
        placeholder="Example Music Discs"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.name}
      />
    </Form.Control>
    <Form.Description>This will be the generated mod's name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="namespace">
    <Form.Control let:attrs>
      <Form.Label>Namespace</Form.Label>
      <Input
        placeholder="example-music-discs"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.namespace}
      />
    </Form.Control>
    <Form.Description>
      All discs within this addon will be under this namespace.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="description">
    <Form.Control let:attrs>
      <Form.Label>
        Description
        <Badge class="ml-1" variant="outline">optional</Badge>
      </Form.Label>
      <Input
        placeholder="This disco addon..."
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.description}
      />
    </Form.Control>
    <Form.Description>
      This will be the generated mod's description.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Button>
    {#if data}
      Save
    {:else}
      Create
    {/if}
  </Form.Button>
</form>
