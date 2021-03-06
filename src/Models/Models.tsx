import { pipe } from "fp-ts/lib/function"
import * as O from 'fp-ts/Option'
import * as AR from 'fp-ts/ReadonlyArray'
import * as iots from 'io-ts'
import * as OpI from 'monocle-ts/lib/index'
import { fromTraversable, Lens, Prism, Traversal } from 'monocle-ts'
import * as Op from 'monocle-ts/lib/Optional'
import { indexReadonlyArray } from "monocle-ts/lib/Ix"
import { fromNullable } from "io-ts-types"
import { unsafeUpdateAt } from "fp-ts/lib/Array"
import { At } from "monocle-ts/lib/At"


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
  description: iots.union([iots.string, iots.undefined, iots.null]),
  deal_code: iots.union([iots.null, iots.undefined, iots.string]),
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





// *** CONTENT STUFF *****\\

const slideFormDataT = iots.intersection([
  iots.type({
    _tag: iots.literal('store'),
    headline_copy: iots.string,
    background_image_url: iots.string,
    text_color_id: iots.number,
    store: iots.union([ajStoreT, iots.null]),
  }),
  iots.partial({
    dealId: iots.number,
    deal_id: iots.number
  })
])

export type SlideFormData = iots.TypeOf<typeof slideFormDataT>

export interface SlideData {
  readonly id: number
  readonly background_image_url: string,
  readonly main_copy: string,
  headline_copy: string,
  readonly content_position_id: number,
  readonly text_color_id: number,
  readonly display_order: number,
  readonly deal_code: string,
  readonly deal_id: number,
  readonly store: AJStore,
  readonly button_url: string
  readonly store_id: number
  readonly start_at: string
  readonly end_at: string
}

const bannerContentBaseT = iots.type({
  title: iots.string,
  cashBackString: iots.string,
  backgroundImageUrl: iots.union([iots.string, iots.null])
})

const handoffUrlT = iots.partial({
  handoff: handoffT
})

const colorCodeT = iots.partial({
  text_color_id: iots.number
})

const bannerCopyT = iots.partial({
  headline_copy: iots.string,
  main_copy: iots.string
})

const bannerStartEndT = iots.partial({
  start_at: iots.string,
  end_at: iots.string
})

const bannerContentT = iots.intersection([bannerContentBaseT, handoffUrlT, colorCodeT, bannerCopyT, bannerStartEndT])

export type BannerContent = iots.TypeOf<typeof bannerContentT>

export const featuredDealsSectionT = iots.type({
  tag: iots.literal('FEATURED_DEALS'),
  deals: iots.array(dealT),
  dealRows: iots.array(iots.array(dealT))
})


export type FeaturedDealsSection = iots.TypeOf<typeof featuredDealsSectionT>

export const additionalStoresSectionT = iots.type({
  tag: iots.literal('ADDITIONAL_STORES'),
  title: iots.string,
  stores: iots.array(ajStoreT),
  storeRows: iots.array(iots.array(ajStoreT))
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


const headlessDigitalEventContentBaseT = iots.type({
  pageTitle: iots.string,
  banner: bannerContentT,
  sections: iots.array(sectionT),
})

const carouselFieldT = iots.partial({
  carousel: iots.array(slideFormDataT)
})

const headlessDigitalEventContentT = iots.intersection([headlessDigitalEventContentBaseT, carouselFieldT])

const headlessDigitalEventContentRespBaseT = iots.type({
  pageTitle: iots.string,
  banner: bannerContentT,
  sections: iots.array(sectionT),
})

const headlessDigitalEventContentRespT = iots.intersection([headlessDigitalEventContentBaseT, carouselFieldT])

export type HeadlessDigitalEventContent = iots.TypeOf<typeof headlessDigitalEventContentT>
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

export const unsafeIndexArray = <A = never>(): OpI.At<A[], number, A> =>
  new OpI.At(i => new Lens(list => list[i], value => list => unsafeUpdateAt(i, value, list)));

export module Modelenz {
  export const contentL = Lens.fromProp<HeadlessDigitalEvent>()('content')
  export const bannerL = Lens.fromProp<HeadlessDigitalEventContent>()('banner')
  export const carouselL = Lens.fromProp<HeadlessDigitalEventContent>()('carousel')
  export const sectionsL = Lens.fromProp<HeadlessDigitalEventContent>()('sections') as unknown as Lens<HeadlessDigitalEventContent, readonly Section[]>
  export const sectionsTraversal: Traversal<readonly Section[], Section> = fromTraversable(AR.readonlyArray)<Section>()

  export module SectionPrisms {
    export const knownSectionP = new Prism<Section, KnownSection>(s => isKnownSection(s) ? O.some(s) : O.none, ks => ks)
    export const knownToFeaturedP = new Prism<KnownSection, FeaturedDealsSection>(s => isFeaturedDealsSection(s.section) ? O.some(s.section) : O.none, fs => ({ tag: 'KNOWN', section: fs }))
    export const knownToAdditionalStoresP = new Prism<KnownSection, AdditionalStoresSection>(s => isAdditionalStoresSection(s.section) ? O.some(s.section) : O.none, fs => ({ tag: 'KNOWN', section: fs }))
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


export function colorCodeToColor(code: number): string {
  if (code === 0) {
    return 'black'
  }

  return 'white'
}



export function carouselToBanner(carousel: SlideFormData[]): BannerContent | null {
  const fs = carousel[0]
  if (fs) {
    return {
      title: fs.headline_copy,
      headline_copy: fs.headline_copy,
      text_color_id: fs.text_color_id,
      backgroundImageUrl: fs.background_image_url,
      cashBackString: "",
      handoff: fs.dealId ? { tag: 'dealHandoff', dealId: fs.dealId, store: fs.store! } : { tag: 'storeHandoff', store: fs.store! },
    }
  }

  return null
}