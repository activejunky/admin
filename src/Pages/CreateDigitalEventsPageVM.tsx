import { createModel, init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import createSelectPlugin from '@rematch/select'
import { pipe } from 'fp-ts/lib/function'
import { fromSet } from 'fp-ts/lib/ReadonlySet'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as OpI from 'monocle-ts/lib/index'
import * as ROA from 'fp-ts/ReadonlyArray'
import { iteratorSymbol } from 'immer/dist/internal'
import { Lens } from 'monocle-ts'
import { indexArray, indexReadonlyArray } from 'monocle-ts/lib/Ix'
import * as Op from 'monocle-ts/lib/Optional'
import createCachedSelector from 're-reselect'
import { Backend } from '../Backend/Api'
import { HandoffSelect } from '../Components/HandoffModal'
import { AdditionalStoresSection, AJStore, BannerContent, carouselToBanner, Deal, FeaturedDealsSection, Handoff, HeadlessDigitalEvent, HeadlessDigitalEventContent, HeadlessDigitalEventResponseObj, isAdditionalStoresSection, isFeaturedDealsSection, isKnownSection, Modelenz, Section, SlideFormData, unsafeIndexArray } from '../Models/Models'
import { unsafeUpdateAt } from 'fp-ts/lib/Array'
import src from 'react-select/dist/declarations/src'

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
const deAdditionalStoresSectionL = (
  deSectionsL
    .composeTraversal(Modelenz.sectionsTraversal)
    .composePrism(Modelenz.SectionPrisms.knownSectionP)
    .composePrism(Modelenz.SectionPrisms.knownToAdditionalStoresP)
)

export const emptyFormState: HeadlessDigitalEventContent = {
  pageTitle: '',
  banner: { title: '', cashBackString: '', backgroundImageUrl: null },
  sections: [{ tag: 'KNOWN', section: { tag: 'FEATURED_DEALS', deals: [], dealRows: [[]] } }],
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

    setSlug(state, payload: string) {
      const slugL = Lens.fromPath<PageState>()(['de', 'title'])
      return pipe(state, slugL.modify(_ => payload))
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
      const withCarousel = pipe(state, deCarouselL.set(payload))
      const mbBanner = carouselToBanner(payload)
      if (mbBanner) {
        const withBanner = pipe(withCarousel, deBannerL.set(mbBanner))
        return withBanner
      }

      return withCarousel
    },
    setSection(state, payload: { sectionId: number, section: Section }) {
      const indexL = Op.index(payload.sectionId)(deSectionsL.asOptional())
      const withUpdate = indexL.set(payload.section)(state)
      return withUpdate
    },
    addFeaturedDeal(state, payload: { deal: Deal, rowIndex: number }) {
      return deSectionsL.modify(sections => {
        return sections.map(s => {
          const lnz = (
            Modelenz.featuredDealsP
              .composeLens(Lens.fromProp<FeaturedDealsSection>()('dealRows'))
              .composeLens(unsafeIndexArray<Deal[]>().at(payload.rowIndex))
          )
          return lnz.modify(dids => pipe(dids, A.append(payload.deal)))(s)
        })
      })(state)
    },
    removeFeaturedDeal(state, payload: { dealId: number, rowIndex: number }) {
      return deSectionsL.modify(sections => {
        return sections.map(section => {
          const lnz = (
            Modelenz.featuredDealsP
              .composeLens(Lens.fromProp<FeaturedDealsSection>()('dealRows'))
              .composeLens(unsafeIndexArray<Deal[]>().at(payload.rowIndex))
          )
          return lnz.modify(ss => ss.filter(s => s.id !== payload.dealId))(section)
        })
      })(state)
    },
    addAdditionalStoresSection(state, payload: boolean) {
      if (payload) {
        return deSectionsL.modify(s => ([...s, { tag: 'KNOWN', section: { tag: 'ADDITIONAL_STORES', title: '', stores: [], storeRows: [[]] } }]))(state)
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
    addAdditionalStoresSectionRow(state, payload: boolean) {
      const lnz = (
        deAdditionalStoresSectionL
          .composeLens(Lens.fromProp<AdditionalStoresSection>()('storeRows'))
      )
      if (payload) {
        return lnz.modify(srs => pipe(srs, A.append([] as AJStore[])))(state)
      }

      return state
    },
    addAdditionalStore(state, payload: AJStore) {
      return deSectionsL.modify(ss => {
        return ss.map(s => {
          const lnz = Modelenz.additionalStoresP.composeLens(Lens.fromProp<AdditionalStoresSection>()('stores'))
          return lnz.modify(ss => ([...ss, payload]))(s)
        })
      })(state)
    },
    addAdditionalStoreInRow(state, payload: { store: AJStore, rowIndex: number }) {
      const lnz = (
        deAdditionalStoresSectionL
          .composeLens(Lens.fromProp<AdditionalStoresSection>()('storeRows'))
          .composeLens(unsafeIndexArray<AJStore[]>().at(payload.rowIndex))
      )

      return lnz.modify(ss => ([...ss, payload.store]))(state)
    },
    removeAdditionalStore(state, payload: string) {
      return deSectionsL.modify(sections => {
        return sections.map(section => {
          const lnz = Modelenz.additionalStoresP.composeLens(Lens.fromProp<AdditionalStoresSection>()('stores'))
          return lnz.modify(ss => ss.filter(s => s.url_slug != payload))(section)
        })
      })(state)
    },
    removeAdditionalStoreFromRow(state, payload: { storeSlug: string, rowIndex: number }) {
      const lnz = (
        deAdditionalStoresSectionL
          .composeLens(Lens.fromProp<AdditionalStoresSection>()('storeRows'))
          .composeLens(unsafeIndexArray<AJStore[]>().at(payload.rowIndex))
      )

      return lnz.modify(ss => ss.filter(s => s.url_slug !== payload.storeSlug))(state)
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