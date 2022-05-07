import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import createSelectPlugin from '@rematch/select'
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

const selectPlugin = createSelectPlugin<RootModel>({ selectorCreator: createCachedSelector })
export const store = init({
  models,
  plugins: [selectPlugin],
})
export type PageStore = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>