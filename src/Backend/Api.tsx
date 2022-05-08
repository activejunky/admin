import { Deal } from "../Models"

async function searchDeals(term: string): Promise<Deal[]> {
  const url = `/api/search/deals.json?search_terms=${term}`
  const r = await fetch(url)
  const j: { results: Deal[] } = await r.json()
  return j.results
}


export const Backend = {
  searchDeals
}