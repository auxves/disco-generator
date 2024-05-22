export async function load({ params }) {
  const draft_id = Number(params.draft_id)

  return { draft_id }
}
