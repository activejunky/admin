import { array, readonlyArray } from "fp-ts"
import produce from "immer"
import { fromTraversable, iso, Lens, Prism, Traversal } from 'monocle-ts'
import * as Op from 'monocle-ts/lib/Optional'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as Idx from 'monocle-ts/lib/index'
import * as IdxA from 'monocle-ts/Index/Array'
import { Traversable } from "fp-ts/lib/Traversable"
import { first } from "rxjs"
import { pipe } from "fp-ts/lib/function"
import * as L from 'monocle-ts/Lens'
import * as Trav from 'monocle-ts/Traversal'
import * as iots from 'io-ts'
import * as iotst from 'io-ts-types'
import * as AR from 'fp-ts/ReadonlyArray'


const ajStoreT = iots.type({
  id: iots.number,
  url_slug: iots.string,
  name: iots.string,
  image_url: iots.string
})

export type AJStore = iots.TypeOf<typeof ajStoreT>

export type Deal = {
  readonly _tag: "Deal",
  readonly id: number,
  readonly title: string,
  readonly description: string,
  readonly store: AJStore,
  readonly expires: string,
  readonly deal_code: string,
}

export const dealResultT = iots.type({
  id: iots.number,
  image_url: iots.string,
  name: iots.string,
  url_slug: iots.string,
  default_cashback: iots.number
})

export type DealResult = iots.TypeOf<typeof dealResultT>

const bannerContentT = iots.type({
  title: iots.string,
  cashBackString: iots.string,
  backgroundImageUrl: iots.union([iots.string, iots.null])
})
export type BannerContent = iots.TypeOf<typeof bannerContentT>

export const featuredDealsSectionT = iots.type({
  tag: iots.literal('FEATURED_DEALS'),
  dealIds: iots.array(iots.number),
  deals: iots.array(dealResultT)
})

export type FeaturedDealsSection = iots.TypeOf<typeof featuredDealsSectionT>

export const additionalStoresSectionT = iots.type({
  tag: iots.literal('ADDITIONAL_STORES'),
  title: iots.string,
  stores: iots.array(ajStoreT)
})

export type AdditionalStoresSection = iots.TypeOf<typeof additionalStoresSectionT>

export const knownSectionSectionT = iots.union([featuredDealsSectionT, additionalStoresSectionT])
export type KnownSectionSection = iots.TypeOf<typeof knownSectionSectionT>

export const knownSectionT = iots.type({
  tag: iots.literal('KNOWN'),
  section: knownSectionSectionT
})

export function isFeaturedDealsSection(kss: KnownSectionSection): kss is FeaturedDealsSection {
  return kss.tag === 'FEATURED_DEALS'
}

export function isAdditionalStoresSection(kss: KnownSectionSection): kss is AdditionalStoresSection {
  return kss.tag === 'ADDITIONAL_STORES'
}

export function isKnownSection(s: Section): s is KnownSection {
  return s.tag === 'KNOWN'
}

export type KnownSection = iots.TypeOf<typeof knownSectionT>


const templatedSectionT = iots.type({ tag: iots.literal('TEMPLATED') })

const sectionT = iots.union([knownSectionT, templatedSectionT])
export type Section = iots.TypeOf<typeof sectionT>

export function typeFilter<T, R extends T>(a: T[], f: (e: T) => e is R): R[] {
  const r: R[] = [];
  a.forEach(e => { if (f(e)) r.push(e) });
  return r;
}


const headlessDigitalEventContentT = iots.type({
  pageTitle: iots.string,
  banner: bannerContentT,
  sections: iots.array(sectionT)
})
export type HeadlessDigitalEventContent = {
  pageTitle: string
  banner: BannerContent
  sections: Section[]
  // featuredStores: AJStore[]
  // additionalStores: null | { title: string, stores: AJStore[] }
  // featuredDeals: Deal[]
}

export interface HeadlessDigitalEvent {
  id: string
  title: string
  last_saved_at: string | null
  last_published_at: string | null
  content: HeadlessDigitalEventContent
}



export const headlessDigitalEventResponseObjT = iots.type({
  id: iots.string,
  title: iots.string,
  last_saved_at: iots.union([iots.string, iots.null]),
  last_published_at: iots.union([iots.string, iots.null]),
  content: iots.union([headlessDigitalEventContentT, iots.null])
})

export type HeadlessDigitalEventResponseObj = iots.TypeOf<typeof headlessDigitalEventResponseObjT>

export module Modelenz {
  export const contentL = Lens.fromProp<HeadlessDigitalEvent>()('content')
  export const bannerL = Lens.fromProp<HeadlessDigitalEventContent>()('banner')
  export const sectionsL = Lens.fromProp<HeadlessDigitalEventContent>()('sections') as unknown as Lens<HeadlessDigitalEventContent, readonly Section[]>
  const eachSectionsTraversable = fromTraversable(A.array)<Section>()

  export const firstFeaturedStoreSectionP = new Prism<readonly Section[], FeaturedDealsSection>(
    (ss) => {
      const kss = pipe(ss, AR.filter(isKnownSection))
      const fss: readonly FeaturedDealsSection[] = pipe(kss, AR.map(ks => ks.section), AR.filter(isFeaturedDealsSection))
      return AR.head(fss)
    },
    fs => [{ tag: 'KNOWN', section: fs }]
  )

  export const featuredDealsP = new Prism<Section, FeaturedDealsSection>(
    s => {
      if (isKnownSection(s) && isFeaturedDealsSection(s.section)) {
        return O.some(s.section)
      }
      return O.none
    },
    fs => ({ tag: 'KNOWN', section: fs })
  )

  export const additionalStoresP = new Prism<Section, AdditionalStoresSection>(
    s => {
      if (isKnownSection(s) && isAdditionalStoresSection(s.section)) {
        return O.some(s.section)
      }
      return O.none
    },
    fs => ({ tag: 'KNOWN', section: fs })
  )

  export const firstAdditionalStoreSectionP = new Prism<readonly Section[], AdditionalStoresSection>(
    (ss) => {
      const kss = pipe(ss, AR.filter(isKnownSection))
      const fss: readonly AdditionalStoresSection[] = pipe(kss, AR.map(ks => ks.section), AR.filter(isAdditionalStoresSection))
      return AR.head(fss)
    },
    fs => [{ tag: 'KNOWN', section: fs }]
  )


  export function sectionByIdxL(idx: number) {
    return pipe(sectionsL.asOptional(), Op.index(idx))
  }
}