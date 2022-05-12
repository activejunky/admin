import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import produce from 'immer'
import { url } from 'inspector'
import createCachedSelector from 're-reselect'
import { Root } from 'react-dom/client'
import { empty } from 'rxjs'
import { AJStore, Deal, HeadlessDigitalEvent, HeadlessDigitalEventContent, Section } from '../Models'
import { pipe } from 'fp-ts/lib/function'
import { Lens, LensFromPath } from 'monocle-ts'
import { Backend } from '../Backend/Api'

export type PageState = {
  de: HeadlessDigitalEvent
  mbServerState: HeadlessDigitalEvent | null

  isFetching: boolean
  showSuccess: boolean
}

const deL = Lens.fromProp<PageState>()('de')
const contentL = deL.compose(Lens.fromProp<HeadlessDigitalEvent>()('content'))
const bannerL = contentL.compose(Lens.fromProp<HeadlessDigitalEventContent>()('banner'))


export const emptyFormState: HeadlessDigitalEventContent = {
  pageTitle: '',
  banner: { title: '', cashBackString: '', backgroundImageUrl: null },
  sections: [],
  featuredStores: [],
  additionalStores: null
  // featuredDeals: [],
}

const emptyDE_State: HeadlessDigitalEvent = {
  id: '',
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
      const pageTitleL = Lens.fromPath<PageState>()(['de', 'content', 'pageTitle'])
      return pipe(state, pageTitleL.modify(_ => payload))
    },

    setBannerTitle(state, payload: string) {
      const bannerTitleL = Lens.fromPath<PageState>()(['de', 'content', 'banner', 'title'])
      return pipe(state, bannerTitleL.modify(_ => payload))
    },
    setBannerCachback(state, payload: string) {
      return pipe(state, bannerL.modify(b => ({ ...b, cashBackString: payload })))
    },
    setBannerImageUrl(state, payload: string) {
      return pipe(state, bannerL.modify(b => ({ ...b, backgroundImageUrl: payload })))
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
      const hde = await Backend.digitalEvent(payload)
      // console.log("JJJ!!! ", JSON.stringify(j))
      dispatch.editModel.setServerDigitalEvent(hde)
      dispatch.editModel.setDigitalEvent(hde)
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