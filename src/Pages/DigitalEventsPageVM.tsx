import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import produce from 'immer'
import { url } from 'inspector'
import createCachedSelector from 're-reselect'
import { Root } from 'react-dom/client'
import { AJStore, Deal } from '../Models'

type BannerContent = {
  title: string
  cashBackString: string
  backgroundImageUrl: string | null
}


export type PageState = {
  form: CreateDigitalEventFormInput

  isFetching: boolean
}

type Section =
  KnownSection
// | {_ tag: 'templated'} -- TODO: somday allow for flexible


type KnownSectionTypes =
  { _tag: 'FEATURED_DEALS', deals: Deal[] }
  | KnownSections.FeaturedStores
  | { _tag: 'ADDITIONAL_STORES', stores: AJStore[] }

class KnownSection {
  _tag: 'Known' = 'Known'
  constructor(public section: KnownSectionTypes) { }

  modifyIfFeaturedStore(f: (fs: KnownSections.FeaturedStores) => KnownSections.FeaturedStores) {
    if (this.section instanceof KnownSections.FeaturedStores) {
      const modifiedFeaturedSection = f(this.section)
      this.section = modifiedFeaturedSection
    }
  }
}
namespace KnownSections {
  type Tag = 'FEATURED_STORES' | 'ADDITIONAL_STORES'
  export class FeaturedStores {
    _tag: Tag = 'FEATURED_STORES'
    constructor(public stores: AJStore[]) { }

    withAddedStore(store: AJStore): FeaturedStores {
      return new FeaturedStores([...this.stores.concat(store)])
    }
    withRemovedStore(urlSlug: string): FeaturedStores {
      const mbIdx = this.stores.findIndex(store => store.url_slug = urlSlug)
      const withRemovedStore = produce(this.stores, draft => {
        const index = draft.findIndex(s => s.url_slug === urlSlug)
        if (index !== -1) draft.splice(index, 1)
      })
      return new FeaturedStores(withRemovedStore)
    }
  }
}



export type CreateDigitalEventFormInput = {
  pageTitle: string
  banner: BannerContent
  sections: Section[]
  featuredStores: AJStore[]
  featuredDeals: Deal[]
  additionalStores: null | { title: string, stores: AJStore[] }
}

export const emptyFormState: CreateDigitalEventFormInput = {
  pageTitle: '',
  banner: { title: '', cashBackString: '', backgroundImageUrl: null },
  sections: [],
  featuredStores: [],
  featuredDeals: [],
  additionalStores: null
}

const emptyPageState: PageState = {
  form: emptyFormState,
  isFetching: false
}

export const editModel = createModel<RootModel>()({
  state: emptyPageState, // initial state
  reducers: {
    // handle state changes with pure functions
    setPageTitle(state, payload: string) {
      return { ...state, form: { ...state.form, pageTitle: payload } };
    },

    setBannerTitle(state, payload: string) {
      const withNewTitle = { ...state.form, banner: { ...state.form.banner, title: payload } }
      return { ...state, form: withNewTitle }
    },
    setBannerCachback(state, payload: string) {
      const withNewForm = { ...state.form, banner: { ...state.form.banner, cashBackString: payload } }
      return { ...state, form: withNewForm }
    },
    setBannerImageUrl(state, payload: string) {
      const withNewForm = { ...state.form, banner: { ...state.form.banner, backgroundImageUrl: payload } }
      return { ...state, form: withNewForm }
    },

    addFeaturedStore(state, payload: AJStore) {
      const withNewSections: Section[] = state.form.sections.map(s => {
        s.modifyIfFeaturedStore(fss => fss.withAddedStore(payload))

        return s
      })
      const withNewForm = produce(state.form, draft => {
        draft.featuredStores.push(payload)
      })
      return { ...state, form: { ...withNewForm, sections: withNewSections } }
    },
    removeFeaturedStore(state, payload: string) {
      const withRemovedStoreSections = state.form.sections.map(s => {
        s.modifyIfFeaturedStore(ffs => ffs.withRemovedStore(payload))
        return s
      })
      const withRemovedStore = produce(state.form.featuredStores, draft => {
        const index = draft.findIndex(s => s.url_slug === payload)
        if (index !== -1) draft.splice(index, 1)
      })
      return { ...state, form: { ...state.form, featuredStores: withRemovedStore, sections: withRemovedStoreSections } }
    },
    addFeaturedDeal(state, payload: Deal) {
      const withNewForm = produce(state.form, draft => {
        draft.featuredDeals.push(payload)
      })
      return { ...state, form: withNewForm }
    },
    removeFeaturedDeal(state, payload: number) {
      const withRemovedStore = produce(state.form.featuredDeals, draft => {
        const index = draft.findIndex(s => s.id === payload)
        if (index !== -1) draft.splice(index, 1)
      })
      return { ...state, form: { ...state.form, featuredDeals: withRemovedStore } }
    },

    addAdditionalStoresSection(state, payload: boolean) {
      if (payload) {
        return { ...state, form: { ...state.form, additionalStores: { title: "Additional Stores", stores: [] } } }
      } else {
        return { ...state, form: { ...state.form, additionalStores: null } }
      }
    },
    addAdditionalStore(state, payload: AJStore) {
      const curSection = state.form.additionalStores
      if (curSection) {
        return { ...state, form: { ...state.form, additionalStores: { title: "Additional Stores", stores: [...curSection.stores, payload] } } }
      }
    }
  },
  effects: (dispatch) => ({
  }),
});
export interface RootModel extends Models<RootModel> {
  editModel: typeof editModel;
}

export const models: RootModel = { editModel };

export const store = init<RootModel>({
  models,
  plugins: [
    createSelectPlugin({ selectorCreator: createCachedSelector }),
    immerPlugin()
  ],
})
export type PageStore = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>