import produce from "immer"

export type AJStore = { id: number, url_slug: string, name: string, image_url: string }

export type Deal = {
  readonly _tag: "Deal",
  readonly id: number,
  readonly title: string,
  readonly description: string,
  readonly store: AJStore,
  readonly expires: string,
  readonly deal_code: string,
}

type BannerContent = {
  title: string
  cashBackString: string
  backgroundImageUrl: string | null
}

export type Section =
  KnownSection
// | {_ tag: 'templated'} -- TODO: somday allow for flexible


export type KnownSectionTypes =
  { _tag: 'FEATURED_DEALS', deals: Deal[] }
  | KnownSections.FeaturedStores
  | { _tag: 'ADDITIONAL_STORES', stores: AJStore[] }

export class KnownSection {
  _tag: 'Known' = 'Known'
  constructor(public section: KnownSectionTypes) { }

  modifyIfFeaturedStore(f: (fs: KnownSections.FeaturedStores) => KnownSections.FeaturedStores) {
    if (this.section instanceof KnownSections.FeaturedStores) {
      const modifiedFeaturedSection = f(this.section)
      this.section = modifiedFeaturedSection
    }
  }
}
export namespace KnownSections {
  type Tag = 'FEATURED_STORES' | 'ADDITIONAL_STORES'
  export class FeaturedStores {
    _tag: Tag = 'FEATURED_STORES'
    constructor(public stores: AJStore[]) { }

    withAddedStore(store: AJStore): FeaturedStores {
      return new FeaturedStores([...this.stores.concat(store)])
    }
    withRemovedStore(urlSlug: string): FeaturedStores {
      const mbIdx = this.stores.findIndex(store => store.url_slug = urlSlug)
      console.log("MB IDX! ", mbIdx)
      const withRemovedStore = produce(this.stores, draft => {
        const index = draft.findIndex(s => s.url_slug === urlSlug)
        if (index !== -1) draft.splice(index, 1)
      })
      return new FeaturedStores(withRemovedStore)
    }
  }
}

export type HeadlessDigitalEventContent = {
  pageTitle: string
  banner: BannerContent
  sections: Section[]
  featuredStores: AJStore[]
  additionalStores: null | { title: string, stores: AJStore[] }
  // featuredDeals: Deal[]
}

export interface HeadlessDigitalEvent {
  id: string
  title: string
  last_saved_at: string | null
  last_published_at: string | null
  content: HeadlessDigitalEventContent
}

export interface HeadlessDigitalEventResponseObj {
  id: string
  title: string
  last_saved_at: string | null
  last_published_at: string | null
  content: HeadlessDigitalEventContent | null
}