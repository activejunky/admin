import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import produce from 'immer'
import createCachedSelector from 're-reselect'
import { Root } from 'react-dom/client'
import { AJStore, Deal } from '../Models'

type BannerContent = {
  title: string
  cashBackString: string
}


export type PageState = {
  form: CreateDigitalEventFormInput

  isFetching: boolean
}

export type CreateDigitalEventFormInput = {
  pageTitle: string
  banner: BannerContent,
  featuredStores: AJStore[],
  featuredDeals: Deal[]
}

export const emptyFormState: CreateDigitalEventFormInput = {
  pageTitle: '',
  banner: { title: '', cashBackString: '' },
  featuredStores: [],
  featuredDeals: []
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

    addFeaturedStore(state, payload: AJStore) {
      const withNewForm = produce(state.form, draft => {
        draft.featuredStores.push(payload)
      })
      return { ...state, form: withNewForm }
    },
    removeFeaturedStore(state, payload: string) {
      const withRemovedStore = produce(state.form.featuredStores, draft => {
        const index = draft.findIndex(s => s.url_slug === payload)
        if (index !== -1) draft.splice(index, 1)
      })
      return { ...state, form: { ...state.form, featuredStores: withRemovedStore } }
    }
  },
  effects: (dispatch) => ({
    // async incrementAsync(payload: number, state) {
    //   console.log("This is current root state", state);
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    //   dispatch.count.increment(payload);
    // },
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