import { Deal } from "../Models"

export async function searchDeals(term: string): Promise<Deal[]> {
  const url = `/api/search/deals.json?search_terms=${term}`
  const r = await fetch(url)
  const j: { deals: Deal[] } = await r.json()
  return j.deals
}