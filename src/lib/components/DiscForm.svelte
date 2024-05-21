<script lang="ts">
  import { z } from "zod"
  import { defaults, fileProxy, superForm } from "sveltekit-superforms"
  import { zod, zodClient } from "sveltekit-superforms/adapters"

  import type { Disc } from "$lib/types"
  import { convertSound } from "$lib/logic"

  import * as Form from "$lib/components/ui/form"
  import { Input, FileInput } from "$lib/components/ui/input"

  import { LoaderCircle } from "lucide-svelte"

  type Props = {
    owner: number
    data?: Disc
    onSubmit: (data: Disc) => any
  }

  const { data, owner, onSubmit }: Props = $props()

  const schema = z.object({
    identifier: z
      .string({ required_error: "Identifier is required." })
      .min(1, "Identifier must be at least one character long.")
      .regex(
        /^[a-z0-9-_]*$/,
        "Identifier can only contain lowercase letters, numbers, dashes, and underscores.",
      ),
    name: z
      .string({ required_error: "Name is required." })
      .min(1, "Name must be at least one character long."),
    sound: data
      ? z.instanceof(File).optional()
      : z.instanceof(File, { message: "Sound is required." }),
    texture: data
      ? z.instanceof(File).optional()
      : z.instanceof(File, { message: "Texture is required." }),
  })

  let loading = $state(false)

  const form = superForm(
    defaults({ identifier: data?.identifier, name: data?.name }, zod(schema)),
    {
      SPA: true,
      validators: zodClient(schema),
      async onUpdate({ form }) {
        if (form.valid) {
          const { identifier, name, sound, texture } = form.data

          loading = true

          if (data) {
            onSubmit({
              ...data,
              identifier,
              name,
              ...(sound ? await convertSound(sound) : {}),
              ...(texture ? { texture: await texture.arrayBuffer() } : {}),
            })
          } else {
            onSubmit({
              identifier,
              name,
              ...(await convertSound(sound!)),
              texture: await texture!.arrayBuffer(),
              draft: owner,
            })
          }

          loading = false
        }
      },
    },
  )

  const { form: formData, enhance } = form

  const sound = fileProxy(form, "sound")
  const texture = fileProxy(form, "texture")
</script>

<form method="POST" class="space-y-2" enctype="multipart/form-data" use:enhance>
  <Form.Field {form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input
        placeholder="Artist - Song"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.name}
      />
    </Form.Control>
    <Form.Description>This shows up on the item's tooltip.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="identifier">
    <Form.Control let:attrs>
      <Form.Label>Identifier</Form.Label>
      <Input
        placeholder="example_disc"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.identifier}
      />
    </Form.Control>
    <Form.Description>
      This identifier must be unique within the addon.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="sound">
    <Form.Control let:attrs>
      <Form.Label>Sound</Form.Label>
      <FileInput
        autocomplete="off"
        accept="audio/*"
        {...attrs}
        bind:files={$sound}
      />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="texture">
    <Form.Control let:attrs>
      <Form.Label>Texture</Form.Label>
      <FileInput
        autocomplete="off"
        accept="image/png"
        {...attrs}
        bind:files={$texture}
      />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Button>
    {#if data}
      Save
    {:else}
      Create
    {/if}

    {#if loading}
      <LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
