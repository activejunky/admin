import { array, readonlyArray } from "fp-ts"
import produce from "immer"
import { fromTraversable, iso, At, Lens, Prism, Traversal } from 'monocle-ts'
import * as Op from 'monocle-ts/lib/Optional'
import * as OpI from 'monocle-ts/lib/index'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { Traversable, TraversableComposition11 } from "fp-ts/lib/Traversable"
import * as IdxRA from 'monocle-ts/Index/ReadonlyArray'
import { first } from "rxjs"
import { pipe } from "fp-ts/lib/function"
import * as L from 'monocle-ts/Lens'
import * as isom from 'monocle-ts/Iso'
import * as Trav from 'monocle-ts/Traversal'
import * as iots from 'io-ts'
import * as iotst from 'io-ts-types'
import * as AR from 'fp-ts/ReadonlyArray'
import { number } from "fp-ts-std"
import { indexReadonlyArray } from "monocle-ts/lib/Ix"


const ajStoreT = iots.type({
  id: iots.number,
  url_slug: iots.string,
  name: iots.string,
  image_url: iots.string
})

export type AJStore = iots.TypeOf<typeof ajStoreT>

export const dealT = iots.type({
  id: iots.number,
  title: iots.string,
  description: iots.string,
  deal_code: iots.string,
  store: ajStoreT
})

export type Deal = iots.TypeOf<typeof dealT>

const storeHandoffT = iots.type({ tag: iots.literal('storeHandoff'), store: ajStoreT })
const dealHandoffT = iots.type({ tag: iots.literal('dealHandoff'), store: ajStoreT, dealId: iots.number })
const customUrlHandoffT = iots.type({ tag: iots.literal('customUrlHandoff'), url: iots.string })

const handoffT = iots.union([storeHandoffT, dealHandoffT, customUrlHandoffT])
export type Handoff = iots.TypeOf<typeof handoffT>
type StoreHandoff = iots.TypeOf<typeof storeHandoffT>
type DealHandoff = iots.TypeOf<typeof dealHandoffT>



// *** CONTENT STUFF *****

const bannerContentBaseT = iots.type({
  title: iots.string,
  cashBackString: iots.string,
  backgroundImageUrl: iots.union([iots.string, iots.null])
})

const handoffUrlT = iots.partial({
  handoff: handoffT
})

const bannerContentT = iots.intersection([bannerContentBaseT, handoffUrlT])

export type BannerContent = iots.TypeOf<typeof bannerContentT>

export const featuredDealsSectionT = iots.type({
  tag: iots.literal('FEATURED_DEALS'),
  deals: iots.array(dealT)
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

class Cat {
  constructor(private tag: string) { }
}

class Meow extends Cat {
  constructor(private name: string) {
    super("meow")
  }
}

export module Modelenz {
  export const contentL = Lens.fromProp<HeadlessDigitalEvent>()('content')
  export const bannerL = Lens.fromProp<HeadlessDigitalEventContent>()('banner')
  export const sectionsL = Lens.fromProp<HeadlessDigitalEventContent>()('sections') as unknown as Lens<HeadlessDigitalEventContent, readonly Section[]>
  const sectionsTraversal: Traversal<readonly Section[], Section> = fromTraversable(AR.readonlyArray)<Section>()

  export module SectionPrisms {
    export const knownSectionP = new Prism<Section, KnownSection>(s => isKnownSection(s) ? O.some(s) : O.none, ks => ks)
    export const knownToFeaturedP = new Prism<KnownSection, FeaturedDealsSection>(s => isFeaturedDealsSection(s.section) ? O.some(s.section) : O.none, fs => ({ tag: 'KNOWN', section: fs }))
  }

  // const fidxo: OpI.Optional<readonly Section[], Section> = indexReadonlyArray<Section>().index(0)
  // const sl = sectionsL.composeOptional(fidxo)

  function updateFirstFeaturedDealsSection(he: HeadlessDigitalEvent, m: (fs: FeaturedDealsSection) => FeaturedDealsSection) {
    const lnz: Traversal<HeadlessDigitalEvent, FeaturedDealsSection> = (
      contentL
        .composeLens(sectionsL)
        .composeTraversal(sectionsTraversal)
        .composePrism(SectionPrisms.knownSectionP)
        .composePrism(SectionPrisms.knownToFeaturedP)
    )
  }

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

  export const storeHandoffP = new Prism<Handoff, StoreHandoff>(s => s.tag === 'storeHandoff' ? O.some(s) : O.none, s => s)
  export const dealHandoffP = new Prism<Handoff, DealHandoff>(s => s.tag === 'dealHandoff' ? O.some(s) : O.none, s => s)
}