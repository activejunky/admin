import { head } from "fp-ts/lib/ReadonlyNonEmptyArray"
import { AJStore, Deal, dealT, HeadlessDigitalEvent, HeadlessDigitalEventResponseObj, headlessDigitalEventResponseObjT } from "../Models"
import * as E from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import * as iotst from 'io-ts-types'
import * as iots from 'io-ts'


export const baseUrl = process.env.REACT_APP_API_BASE_URL

export const s3BaseUrl = process.env.REACT_APP_S3_BUCKET_URL

function endpt(ep: string): string {
  return `${baseUrl}/${ep}`
}

const HDE = 'cms/headless_digital_events'

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

  const url = `${baseUrl}/api/homepages/content.json`
  const r = await fetch(url, { headers })
  console.log("R! ", r)
  const j: HomepageData = await r.json()
  console.log("J!", j)
  return j
}

async function searchStores(p: { searchTerms: string }): Promise<AJStore[]> {
  const url = endpt(`api/search/stores.json?search_terms=${p.searchTerms}`)
  const r = await fetch(url)
  const j: { results: AJStore[] } = await r.json()
  return j.results
}

const searchDealsResultT = iots.type({
  results: iots.array(dealT)
})

async function searchDeals(p: { searchTerms: string }): Promise<Deal[]> {
  const url = endpt(`api/search/deals.json?search_terms=${p.searchTerms}`)
  const r = await fetch(url)
  const j = await r.json()
  const dr = searchDealsResultT.decode(j)
  console.log("DR! ", PathReporter.report(dr))
  if (E.isRight(dr)) {
    return dr.right.results
  } else {
    throw new Error('failed to decode deals')
  }
}

async function getDeal(p: { dealId: number }): Promise<Deal> {
  // const url = endpt(`api/v1/deals/${p.dealId}`)
  const url = endpt(`api/deals/${p.dealId}`)
  const r = await fetch(url)
  console.log("GET DEAL RESULT! ", r.status)
  const j: Deal = await r.json()
  return j
}

async function publishDraft(tkn: string, id: string) {
  const reqInit: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tkn}` } }
  const url = hdept(`${id}/publish`)
  const r = await fetch(url, reqInit)
  console.log("R! ", r.status)
}


async function saveDraft(tkn: string, id: string, content: Object) {
  const headers = new Headers({
    "Content-Type": "application/json",
    'Authorization': `Bearer ${tkn}`,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": "-1",
  });
  const body: BodyInit = JSON.stringify({ content })
  const reqInit: RequestInit = { method: 'POST', body, headers }
  const url = hdept(`${id}/save.json`)
  const r = await fetch(url, reqInit)
  console.log("R! ", r.status)
}

async function allDigitalEvents() {
  const r = await fetch(endpt(`${HDE}.json`))
  const j: HeadlessDigitalEvent[] = await r.json()
  console.log("ADE J! ", JSON.stringify(j))
  return j
}

async function getDigitalEvent(id: string) {
  const r = await fetch(hdept(`${id}.json`))
  const j = await r.json()
  const ehde = headlessDigitalEventResponseObjT.decode(j)
  if (E.isRight(ehde)) {
    return ehde.right
  } else {
    console.log("E! ", ehde.left)
    console.log("PATH ERROR! ", PathReporter.report(ehde))
    throw new Error('Failed to decode digital event')
  }
}

async function putToS3(fileObject: any, presignedUrl: string) {
  const requestOptions = {
    method: "PUT",
    headers: {
      // "Content-Type": fileObject.type,
    },
    body: fileObject,
  };
  console.log("FILE OBJECT TYPE ! ", fileObject.type)
  const response = await fetch(presignedUrl, requestOptions);
  return response;
}

async function getUploadUrl(id: string): Promise<string> {
  const url = hdept(`${id}/presigned_put_url.json`)
  // const url = `http://localhost:3000/${id}/presigned_put_url.json`
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": "-1",
  });
  const r = await fetch(url, { headers: headers })
  const j: { url: string } = await r.json()
  return j.url
}

async function uploadImage(file: File, digitalEventId: string) {
  const url = await getUploadUrl(digitalEventId)
  console.log("URL TO UPLOAD WITH ! ", url)
  const uploadResult = await putToS3(file, url)
  console.log("UPLOAD RESULT! ", uploadResult)
}


export const Backend = {
  publishDraft,
  saveDraft,
  allDigitalEvents,
  digitalEvent: getDigitalEvent,
  fetchHomePage,
  getStores: searchStores,
  searchDeals,
  getDeal,

  uploadImage
}