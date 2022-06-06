import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import { pipe } from 'fp-ts/lib/function'
import { fromSet } from 'fp-ts/lib/ReadonlySet'
import * as O from 'fp-ts/Option'
import * as ROA from 'fp-ts/ReadonlyArray'
import { iteratorSymbol } from 'immer/dist/internal'
import { Lens } from 'monocle-ts'
import * as Op from 'monocle-ts/lib/Optional'
import createCachedSelector from 're-reselect'
import { Backend } from '../Backend/Api'
import { HandoffSelect } from '../Components/HandoffModal'
import { AdditionalStoresSection, AJStore, BannerContent, Deal, FeaturedDealsSection, Handoff, HeadlessDigitalEvent, HeadlessDigitalEventContent, HeadlessDigitalEventResponseObj, isAdditionalStoresSection, isKnownSection, Modelenz, Section, SlideFormData } from '../Models/Models'

export type PageState = {
  de: HeadlessDigitalEvent
  mbServerState: HeadlessDigitalEventResponseObj | null

  isFetching: O.Option<string>
  showSuccess: boolean
}

const deL = Lens.fromProp<PageState>()('de')
const deContentL = deL.compose(Lens.fromProp<HeadlessDigitalEvent>()('content'))
const deBannerL = deContentL.compose(Lens.fromProp<HeadlessDigitalEventContent>()('banner'))
const deCarouselL = deContentL.compose(Lens.fromProp<HeadlessDigitalEventContent>()('carousel'))
const deSectionsL = deContentL.compose(Lens.fromProp<HeadlessDigitalEventContent>()('sections')) as unknown as Lens<PageState, readonly Section[]>

export const emptyFormState: HeadlessDigitalEventContent = {
  pageTitle: '',
  banner: { title: '', cashBackString: '', backgroundImageUrl: null },
  sections: [{ tag: 'KNOWN', section: { tag: 'FEATURED_DEALS', deals: [] } }],
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
  isFetching: O.none,
  showSuccess: false
}

function toHandoff(s: HandoffSelect): O.Option<Handoff> {
  if (s.tag === 'store' && s.store) {
    return O.some({ tag: 'storeHandoff', store: s.store })
  }

  if (s.tag === 'deal' && s.dealId && s.store) {
    return O.some({ tag: 'dealHandoff', store: s.store, dealId: s.dealId })
  }

  return O.none
}

export const editModel = createModel<RootModel>()({
  state: emptyPageState, // initial state
  reducers: {
    // handle state changes with pure functions
    setIsFetching(state, payload: O.Option<string>) {
      return { ...state, isFetching: payload }
    },
    setDigitalEvent(state, payload: HeadlessDigitalEvent) {
      return { ...state, de: payload }
    },
    setServerDigitalEvent(state, payload: HeadlessDigitalEventResponseObj) {
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
      return pipe(state, deBannerL.modify(b => ({ ...b, cashBackString: payload })))
    },
    setBannerImageUrl(state, payload: string) {
      return pipe(state, deBannerL.modify(b => ({ ...b, backgroundImageUrl: payload })))
    },
    setBannerTextColorId(state, payload: number) {
      return pipe(state, deBannerL.modify(b => ({ ...b, text_color_id: payload })))
    },
    setBannerMainCopy(state, payload: string) {
      return pipe(state, deBannerL.modify(b => ({ ...b, main_copy: payload })))
    },
    setBannerHandoff(state, payload: HandoffSelect) {
      const mbHandoff = toHandoff(payload)
      if (O.isSome(mbHandoff)) {
        return pipe(state, deBannerL.modify(b => ({ ...b, handoff: mbHandoff.value })))
      }
      return state
    },
    setCarousel(state, payload: SlideFormData[]) {
      return pipe(state, deCarouselL.set(payload))
    },
    setSection(state, payload: { sectionId: number, section: Section }) {
      const indexL = Op.index(payload.sectionId)(deSectionsL.asOptional())
      const withUpdate = indexL.set(payload.section)(state)
      return withUpdate
    },
    addFeaturedDeal(state, payload: Deal) {
      return deSectionsL.modify(sections => {
        return sections.map(s => {
          const lnz = Modelenz.featuredDealsP.composeLens(Lens.fromProp<FeaturedDealsSection>()('deals'))
          return lnz.modify(dids => ([...dids, payload]))(s)
        })
      })(state)
    },
    removeFeaturedDeal(state, payload: Deal) {
      return deSectionsL.modify(sections => {
        return sections.map(section => {
          const lnz = Modelenz.featuredDealsP.composeLens(Lens.fromProp<FeaturedDealsSection>()('deals'))
          return lnz.modify(ss => ss.filter(s => s.id !== payload.id))(section)
        })
      })(state)
    },
    addAdditionalStoresSection(state, payload: boolean) {
      if (payload) {
        return deSectionsL.modify(s => ([...s, { tag: 'KNOWN', section: { tag: 'ADDITIONAL_STORES', title: '', stores: [] } }]))(state)
      }
      return deSectionsL.modify(ss => pipe(ss, ROA.filter(s => !(isKnownSection(s) && isAdditionalStoresSection(s.section)))))(state)
    },
    setAdditionalStoresSectionTitle(state, payload: string) {
      return deSectionsL.modify(ss => {
        return ss.map(s => {
          const lnz = Modelenz.additionalStoresP.composeLens(Lens.fromProp<AdditionalStoresSection>()('title'))
          return lnz.set(payload)(s)
        })
      })(state)
    },
    addAdditionalStore(state, payload: AJStore) {
      return deSectionsL.modify(ss => {
        return ss.map(s => {
          const lnz = Modelenz.additionalStoresP.composeLens(Lens.fromProp<AdditionalStoresSection>()('stores'))
          return lnz.modify(ss => ([...ss, payload]))(s)
        })
      })(state)
    },
    removeAdditionalStore(state, payload: string) {
      return deSectionsL.modify(sections => {
        return sections.map(section => {
          const lnz = Modelenz.additionalStoresP.composeLens(Lens.fromProp<AdditionalStoresSection>()('stores'))
          return lnz.modify(ss => ss.filter(s => s.url_slug != payload))(section)
        })
      })(state)
    },
  },
  effects: (dispatch) => ({
    async syncDigitalEvent(payload: string, rootState) {
      dispatch.editModel.setIsFetching(O.some('Loading...'))
      const hder = await Backend.digitalEvent(payload)
      // console.log("JJJ!!! ", JSON.stringify(j))
      dispatch.editModel.setServerDigitalEvent(hder)
      dispatch.editModel.setIsFetching(O.none)
      const hde = { ...hder, content: hder.content ?? emptyFormState }
      console.log("HDE ! ", hde)
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