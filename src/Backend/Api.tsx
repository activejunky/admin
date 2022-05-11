import { Deal } from "../Models"

async function searchDeals(term: string): Promise<Deal[]> {
  const url = `/api/search/deals.json?search_terms=${term}`
  const r = await fetch(url)
  const j: { results: Deal[] } = await r.json()
  return j.results
}

async function publishDraft(tkn: string, id: string) {
  const reqInit: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tkn}` } }
  const url = `http://localhost:3000/headless_digital_events/${id}/publish`
  const r = await fetch(url, reqInit)
  console.log("R! ", r.status)
}


export const Backend = {
  searchDeals,
  publishDraft
}