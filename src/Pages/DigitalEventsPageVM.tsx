import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import produce from 'immer'
import { url } from 'inspector'
import createCachedSelector from 're-reselect'
import { Root } from 'react-dom/client'
import { empty } from 'rxjs'
import { AJStore, Deal, HeadlessDigitalEvent, HeadlessDigitalEventContent, Section } from '../Models'

export type PageState = {
  de: HeadlessDigitalEvent
  mbServerState: HeadlessDigitalEvent | null

  isFetching: boolean
  showSuccess: boolean
}

export const emptyFormState: HeadlessDigitalEventContent = {
  pageTitle: '',
  banner: { title: '', cashBackString: '', backgroundImageUrl: null },
  sections: [],
  featuredStores: [],
  additionalStores: null
  // featuredDeals: [],
}

const emptyDE_State: HeadlessDigitalEvent = {
  title: '',
  last_published_at: null,
  last_saved_at: null,
  content: emptyFormState
}

const emptyPageState: PageState = {
  de: emptyDE_State,
  mbServerState: null,
  isFetching: false,
  showSuccess: false
}

export const editModel = createModel<RootModel>()({
  state: emptyPageState, // initial state
  reducers: {
    // handle state changes with pure functions
    setDigitalEvent(state, payload: HeadlessDigitalEvent) {
      return { ...state, de: payload }
    },
    setServerDigitalEvent(state, payload: HeadlessDigitalEvent) {
      return { ...state, mbServerState: payload }
    },
    setShowSuccess(state, payload: boolean) {
      return { ...state, showSuccess: payload }
    },
    setPageTitle(state, payload: string) {
      return { ...state, de: { ...state.de, content: { ...state.de.content, pageTitle: payload } } }
    },

    setBannerTitle(state, payload: string) {
      const withNewTitle = { ...state.de.content, banner: { ...state.de.content.banner, title: payload } }
      return { ...state, de: { ...state.de, content: withNewTitle } }
    },
    setBannerCachback(state, payload: string) {
      const withNewForm = { ...state.de.content, banner: { ...state.de.content.banner, cashBackString: payload } }
      return { ...state, de: { ...state.de, content: withNewForm } }
    },
    setBannerImageUrl(state, payload: string) {
      const withNewForm = { ...state.de.content, banner: { ...state.de.content.banner, backgroundImageUrl: payload } }
      return { ...state, de: { ...state.de, content: withNewForm } }
    },

    addFeaturedStore(state, payload: AJStore) {
      // const withNewSections: Section[] = state.de.content.sections.map(s => {
      //   s.modifyIfFeaturedStore(fss => fss.withAddedStore(payload))

      //   return s
      // })
      const withNewForm = produce(state.de.content, draft => {
        draft.featuredStores.push(payload)
      })
      return { ...state, de: { ...state.de, content: { ...withNewForm, sections: [] } } }
    },
    removeFeaturedStore(state, payload: string) {
      // const withRemovedStoreSections = state.de.content.sections.map(s => {
      //   s.modifyIfFeaturedStore(ffs => ffs.withRemovedStore(payload))
      //   return s
      // })
      const withRemovedStore = produce(state.de.content.featuredStores, draft => {
        const index = draft.findIndex(s => s.url_slug === payload)
        if (index !== -1) draft.splice(index, 1)
      })
      return { ...state, de: { ...state.de, content: { ...state.de.content, featuredStores: withRemovedStore, sections: [] } } }
    },
    // addFeaturedDeal(state, payload: Deal) {
    //   const withNewForm = produce(state.de.content, draft => {
    //     draft.featuredDeals.push(payload)
    //   })
    //   return { ...state, form: withNewForm }
    // },
    // removeFeaturedDeal(state, payload: number) {
    //   const withRemovedStore = produce(state.de.content.featuredDeals, draft => {
    //     const index = draft.findIndex(s => s.id === payload)
    //     if (index !== -1) draft.splice(index, 1)
    //   })
    //   return { ...state, form: { ...state.de.content, featuredDeals: withRemovedStore } }
    // },

    addAdditionalStoresSection(state, payload: boolean) {
      if (payload) {
        return { ...state, de: { ...state.de, content: { ...state.de.content, additionalStores: { title: "Additional Stores", stores: [] } } } }
      } else {
        return { ...state, de: { ...state.de, content: { ...state.de.content, additionalStores: null } } }
      }
    },
    addAdditionalStore(state, payload: AJStore) {
      const curSection = state.de.content.additionalStores
      if (curSection) {
        const content: HeadlessDigitalEventContent = { ...state.de.content, additionalStores: { title: "Additional Stores", stores: [...curSection.stores, payload] } }
        const de: HeadlessDigitalEvent = { ...state.de, content }
        return { ...state, de }
      }
    }
  },
  effects: (dispatch) => ({
    async syncDigitalEvent(payload: string, rootState) {
      console.log("SYNCING! ", payload)
      const r = await fetch(`http://localhost:3000/headless_digital_events/${payload}`)
      console.log("RESULT OF GETTING DE! ", r.status)
      const j: HeadlessDigitalEvent = await r.json()
      // console.log("JJJ!!! ", JSON.stringify(j))
      dispatch.editModel.setServerDigitalEvent(j)
      dispatch.editModel.setDigitalEvent(j)
    },
    async finishShowSuccess() {
      setTimeout(() => {
        dispatch.editModel.setShowSuccess(false)
      }, 1000)
    }
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