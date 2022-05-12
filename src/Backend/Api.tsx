import { AJStore, Deal, HeadlessDigitalEvent } from "../Models"

const baseUrl = 'https://activejunky-stage.herokuapp.com'

function endpt(ep: string): string {
  return `${baseUrl}/${ep}`
}

const HDE = 'headless_digital_events'

function hdept(ep: string): string {
  return endpt(`${HDE}/${ep}`)
}

// async function searchDeals(term: string): Promise<Deal[]> {
//   const url = `/api/search/deals.json?search_terms=${term}`
//   const r = await fetch(url)
//   const j: { results: Deal[] } = await r.json()
//   return j.results
// }

type HomepageData = {
  store_carousels: { stores: AJStore[] }[]
}

async function fetchHomePage(): Promise<HomepageData> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": "-1",
  });

  const url = "/api/homepages/content.json"
  const r = await fetch(url, { headers })
  console.log("R! ", r)
  const j: HomepageData = await r.json()
  console.log("J!", j)
  return j
}

async function publishDraft(tkn: string, id: string) {
  const reqInit: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tkn}` } }
  const url = hdept(`/${id}/publish`)
  const r = await fetch(url, reqInit)
  console.log("R! ", r.status)
}


async function saveDraft(tkn: string, id: string, content: Object) {
  const body: BodyInit = JSON.stringify({ content })
  const reqInit: RequestInit = { method: 'POST', body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tkn}` } }
  const url = hdept(`/${id}/save`)
  const r = await fetch(url, reqInit)
  console.log("R! ", r.status)
}

async function allDigitalEvents() {
  const r = await fetch(endpt(`${HDE}.json`))
  const j: HeadlessDigitalEvent[] = await r.json()
  console.log("ADE J! ", JSON.stringify(j))
  return j
}

async function digitalEvent(id: string) {
  const r = await fetch(hdept(`${id}`))
  const j: HeadlessDigitalEvent = await r.json()
  return j
}


export const Backend = {
  publishDraft,
  saveDraft,
  allDigitalEvents,
  digitalEvent,
  fetchHomePage
}