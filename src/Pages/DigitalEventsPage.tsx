import * as React from 'react'
import Modal from 'react-modal'
import { Provider, useDispatch, useSelector } from "react-redux"
import Select from "react-select"
import { AJStore, Dispatch, RootState, store } from './DigitalEventsPageVM'

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





export const DigitalEventsPage: React.FC<{}> = ({ }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', padding: 20 }}>
      <h1>Digital Events</h1>

      <Provider store={store}>
        <div><Preview /></div>
        <EditPageTitle />
        <EditBanner />
        <EditFeaturedStores />
      </Provider>
    </div>
  )
}

const Preview: React.FC<{}> = ({ }) => {
  const fullPage = useSelector((state: RootState) => state)

  return (
    <div>{JSON.stringify(fullPage)}</div>
  )
}

const EditPageTitle: React.FC<{}> = ({ }) => {
  const dispatch = useDispatch<Dispatch>()
  const inputPageTitle = useSelector((state: RootState) => state.editModel.pageTitle)

  const setPageTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    dispatch.editModel.setPageTitle(e.currentTarget.value)
  }, [])

  return (
    <div>
      <input type="text" value={inputPageTitle} onChange={setPageTitle} />
    </div>
  )
}


const EditBanner: React.FC<{}> = ({ }) => {
  const banner = useSelector((state: RootState) => state.editModel.banner)
  const dispatch = useDispatch<Dispatch>()

  const setBannerTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    dispatch.editModel.setBannerTitle(e.currentTarget.value)
  }, [])

  const setCashbackText = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    dispatch.editModel.setBannerCachback(e.currentTarget.value)
  }, [])

  return (
    <div style={{ width: '80%', border: '3px solid black', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h3>Banner</h3>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        Title:
        <input type="text" value={banner.title} onChange={setBannerTitle} style={{ fontSize: 30, border: '1px solid red', display: 'flex', flexShrink: 1 }} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        Cashback Text:
        <input type="text" value={banner.cashBackString} onChange={setCashbackText} style={{ fontSize: 20, display: 'flex', flexShrink: 1 }} />
      </label>
    </div>
  )
}

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
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [mbStores, setMbStores] = React.useState<null | Store[]>(null)
  const [selectedStore, setSelectedStore] = React.useState<null | string>()
  const stores = useSelector((state: RootState) => state.editModel.stores)
  const dispatch = useDispatch<Dispatch>()

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
      dispatch.editModel.addFeaturedStore(newStore)
      setIsShowingModal(false)
    }
  }, [mbStores])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h3>Featured Stores</h3>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {stores.map(s => (
          <StoreIcon ajStore={s} onRemove={() => { dispatch.editModel.removeFeaturedStore(s.url_slug) }} />
        ))}

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

const StoreIcon: React.FC<{ ajStore: AJStore, onRemove: () => void }> = ({ ajStore, onRemove }) => (
  <div style={{ width: 100, height: 200, border: '1px solid black', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    {ajStore.name}
    <img src={ajStore.image_url} style={{ width: 20, height: 20 }} />
    <button onClick={onRemove}>X</button>
  </div>
)
