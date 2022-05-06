import { sensitiveHeaders } from 'http2'
import { useObservableEagerState } from 'observable-hooks'
import * as React from 'react'
import Modal from 'react-modal'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'
import Select, { SelectOptionActionMeta } from "react-select";
import * as Dux from '@nll/dux/Store'
import { actionCreatorFactory, actionFactory } from '@nll/dux/Actions'
import { caseFn, reducerFn } from '@nll/dux/Reducers'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    height: '80vh'
  },
};

type State = {
  pageTitle: string
  banner: BannerContent,
  stores: Store[]
}

const emptyState: State = {
  pageTitle: '',
  banner: { title: '', cashBackString: '' },
  stores: []
}

type BannerContent = {
  title: string
  cashBackString: string
}

const pageStateAtm = atom({
  key: 'pageState',
  default: emptyState
})

const PageStateCtx = React.createContext<null | Dux.Store<State>>(null)

const actions = actionCreatorFactory("CREATE_DE_PAGE")

function useStoreValue<V>(store: Dux.Store<State>, selector: Dux.Selector<State, V>) {
  const v$ = React.useMemo(() => store.select(selector) as unknown as Rx.Observable<V>, [])
  const v = useObservableEagerState(v$)
  return v
}

class VM {
  public store: Dux.Store<State>


  constructor() {
    this.store = Dux.createStore(emptyState)

    const reducer = reducerFn<State>(
      caseFn(VM.Actions.setPageTitle, (state, { value }) => ({ ...state, pageTitle: value })),

      caseFn(VM.Actions.Banner.setBannerTitle, (state, { value }) => ({ ...state, banner: { ...state.banner, title: value } }))
    );
    this.store.addReducers(reducer)
  }

  static Actions = class {
    static setPageTitle = actions.simple<string>("SET_PAGE_TITLE")

    static Banner = class {
      static setBannerTitle = actions.simple<string>("SET_BANNER_TITLE")
    }
  }
}

function useStore() {
  const s = React.useContext(PageStateCtx)
  return s!
}

export const DigitalEventsPage: React.FC<{}> = ({ }) => {
  const vm = React.useMemo(() => new VM(), [])
  const pageState = useRecoilValue(pageStateAtm)

  return (
    <div style={{ width: '100vw', height: '100vh', padding: 20 }}>
      <h1>Digital Events</h1>
      <div>{JSON.stringify(pageState)}</div>

      <PageStateCtx.Provider value={vm.store}>
        <div><Preview /></div>
        <EditPageTitle />
        <EditBanner />
        <EditFeaturedStores />
      </PageStateCtx.Provider>
    </div>
  )
}

const Preview: React.FC<{}> = ({ }) => {
  const store = useStore()
  const p = useStoreValue(store, s => s)

  return (
    <div>{JSON.stringify(p)}</div>
  )
}

const EditPageTitle: React.FC<{}> = ({ }) => {
  const store = useStore()
  const curTitle = useStoreValue(store, (s) => s.pageTitle)
  const [ps, setPs] = useRecoilState(pageStateAtm)

  const setPageTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPs(cp => ({ ...cp, pageTitle: e.currentTarget.value }))
    store.dispatch(VM.Actions.setPageTitle(e.currentTarget.value))
  }, [])

  return (
    <div>
      <input type="text" value={curTitle} onChange={setPageTitle} />
    </div>
  )
}


const EditBanner: React.FC<{}> = ({ }) => {
  const store = useStore()
  const [ps, setPs] = useRecoilState(pageStateAtm)

  const setBannerTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPs(cp => ({ ...cp, banner: { ...cp.banner, title: e.currentTarget.value } }))
    store.dispatch(VM.Actions.Banner.setBannerTitle(e.currentTarget.value))
  }, [])

  const setCashbackText = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPs(cp => ({ ...cp, banner: { ...cp.banner, cashBackString: e.currentTarget.value } }))
  }, [])

  return (
    <div style={{ width: '80%', border: '3px solid black', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h3>Banner</h3>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        Title:
        <input type="text" value={ps.banner.title} onChange={setBannerTitle} style={{ fontSize: 30, border: '1px solid red', display: 'flex', flexShrink: 1 }} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        Cashback Text:
        <input type="text" value={ps.banner.cashBackString} onChange={setCashbackText} style={{ fontSize: 20, display: 'flex', flexShrink: 1 }} />
      </label>
    </div>
  )
}




const options = [
  { value: "Abe", label: "Abe", customAbbreviation: "A" },
  { value: "John", label: "John", customAbbreviation: "J" },
  { value: "Dustin", label: "Dustin", customAbbreviation: "D" }
];


type Store = { id: number, url_slug: string, name: string, image_url: string }

type HomepageData = {
  store_carousels: { stores: Store[] }[]
}

async function fetchHomePage(): Promise<HomepageData> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": "-1",
  });

  const url = "/api/homepages/content.json"
  const r = await fetch(url, { headers })
  console.log("R! ", r)
  const j: HomepageData = await r.json()
  console.log("J!", j)
  return j
}

const EditFeaturedStores: React.FC<{}> = ({ }) => {
  const [ps, setPs] = useRecoilState(pageStateAtm)
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [mbStores, setMbStores] = React.useState<null | Store[]>(null)
  const [selectedStore, setSelectedStore] = React.useState<null | string>()

  React.useEffect(() => {
    fetchHomePage().then(hp => {
      console.log("MB STORES! ", hp.store_carousels)
      setMbStores(hp.store_carousels.flatMap(sc => sc.stores))
    })
      .catch(e => {
        console.error("FAILED! ", e)
      })
  }, [])

  function openModal() {
    setIsShowingModal(true);
  }

  function closeModal() {
    setIsShowingModal(false);
  }

  const onAdd = React.useCallback((storeSlug: string) => {
    console.log("MB STORES! ", mbStores)
    if (mbStores) {
      const newStore = mbStores.find(s => s.url_slug == storeSlug)!
      console.log("NEW STORE! ", newStore)
      setPs(s => ({ ...s, stores: [...s.stores, newStore] }))
      setIsShowingModal(false)
    }
  }, [mbStores])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h3>Featured Stores</h3>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {ps.stores.map(s => {
          return (
            <div style={{ width: 100, height: 200, border: '1px solid black', marginRight: 20 }}>{s.name}</div>
          )
        })}

        <div style={{ width: 100, height: 200, border: '1px dotted black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={openModal}>
          Add Store
          <p>+</p>
        </div>

      </div>

      <Modal
        isOpen={isShowingModal}
        onAfterOpen={() => { }}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div style={{ width: '100%' }}>
          <button onClick={closeModal}>close</button>
          {mbStores ?
            (
              <div>
                <Select
                  defaultValue={{ value: mbStores[0].url_slug, label: mbStores[0].name }}
                  onChange={p => { setSelectedStore(p?.value) }}
                  formatOptionLabel={({ value, label }) => (
                    <div style={{ display: "flex", flexDirection: 'column' }}>
                      <div>{label}</div>
                    </div>
                  )}
                  options={mbStores.map(s => ({ value: s.url_slug, label: s.name }))}
                />
              </div>
            )
            :
            (<></>)
          }
          <div>
            {selectedStore
              ?
              (

                <button onClick={() => onAdd(selectedStore)}>
                  Add
                </button>
              )
              :
              (<></>)
            }
          </div>
        </div>
      </Modal>
    </div>
  )
}
