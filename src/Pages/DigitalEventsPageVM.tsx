import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import produce from 'immer'
import createCachedSelector from 're-reselect'
import { Root } from 'react-dom/client'

type BannerContent = {
  title: string
  cashBackString: string
}

export type AJStore = { id: number, url_slug: string, name: string, image_url: string }

export type PageState = {
  pageTitle: string
  banner: BannerContent,
  stores: AJStore[]
}

export const emptyState: PageState = {
  pageTitle: '',
  banner: { title: '', cashBackString: '' },
  stores: []
}

export const editModel = createModel<RootModel>()({
  state: emptyState, // initial state
  reducers: {
    // handle state changes with pure functions
    setPageTitle(state, payload: string) {
      return { ...state, pageTitle: payload };
    },

    setBannerTitle(state, payload: string) {
      return { ...state, banner: { ...state.banner, title: payload } }
    },
    setBannerCachback(state, payload: string) {
      return { ...state, banner: { ...state.banner, cashBackString: payload } }
    },

    addFeaturedStore(state, payload: AJStore) {
      return { ...state, stores: [...state.stores, payload] }
    },
    removeFeaturedStore(state, payload: string) {
      const withRemovedStore = produce(state.stores, draft => {
        const index = draft.findIndex(s => s.url_slug === payload)
        if (index !== -1) draft.splice(index, 1)
      })
      return { ...state, stores: withRemovedStore }
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