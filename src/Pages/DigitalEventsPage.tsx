import * as React from 'react'
import EdiText from 'react-editext'
import Modal from 'react-modal'
import { Provider, useDispatch, useSelector } from "react-redux"
import Select from "react-select"
import { StylesProps } from 'react-select/dist/declarations/src/styles'
import { Style } from 'util'
import { Backend } from '../Backend/Api'
import { AJStore, Deal } from '../Models'
import { Dispatch, RootState, store } from './DigitalEventsPageVM'

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
        {/* <div><Preview /></div> */}
        <ControlPanel />
        <EditPageTitle />
        <EditBanner />
        <EditFeaturedStores />
        <EditFeaturedDeals />
      </Provider>
    </div>
  )
}

const ControlPanel: React.FC<{}> = ({ }) => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray', padding: 10 }}>
      <button style={{ marginRight: 30 }}>Save Draft</button>
      <button>Publish</button>
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
  const inputPageTitle = useSelector((state: RootState) => state.editModel.form.pageTitle)
  const [value, _] = React.useState(inputPageTitle);


  const handleSave = (val: string) => {
    console.log('Edited Value -> ', val);
    dispatch.editModel.setPageTitle(value)
  };

  return (
    <div style={{ width: '100%', display: 'flex', marginBottom: 30, alignItems: 'center' }}>
      <h3 style={{ marginRight: 18 }}>Page Title</h3>
      <EdiText type="text" value={value} onSave={handleSave} />
    </div>
  )
}


const EditBanner: React.FC<{}> = ({ }) => {
  const banner = useSelector((state: RootState) => state.editModel.form.banner)
  const dispatch = useDispatch<Dispatch>()
  const [savedTitle, _] = React.useState(banner.title)
  const [savedCashbackStr, s] = React.useState(banner.cashBackString)
  const [savedImageUrl, ssiurl] = React.useState(banner.backgroundImageUrl ?? "")

  const setBannerTitle = (v: string) => {
    // setSavedTitle(v)
    dispatch.editModel.setBannerTitle(v)
  }

  const setCashbackText = (v: string) => {
    dispatch.editModel.setBannerCachback(v)
  }

  const setBannerImageUrl = (v: string) => {
    dispatch.editModel.setBannerImageUrl(v)
  }

  const divStyleBase: React.CSSProperties = {
    width: '80%', border: '3px solid black', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
  }

  const divStyle = savedImageUrl ? {
    ...divStyleBase, backgroundImage: `url(${savedImageUrl})`
  } : divStyleBase

  React.useEffect(() => {
    console.log("SAVED IMAGE URL! ", savedImageUrl)
  }, [savedImageUrl])

  return (
    <div style={banner.backgroundImageUrl ? { ...divStyleBase, backgroundImage: `url(${banner.backgroundImageUrl})` } : divStyleBase}>
      <h3>Banner</h3>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Title:
        </label>
        <EdiText type="text" value={savedTitle} onSave={setBannerTitle} />
      </div>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Cashback Text:
        </label>
        <EdiText type="text" value={savedCashbackStr} onSave={setCashbackText} />
      </div>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Image Url:
        </label>
        <EdiText type="text" value={savedImageUrl} onSave={setBannerImageUrl} />
      </div>
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
  const stores = useSelector((state: RootState) => state.editModel.form.featuredStores)
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
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


const EditFeaturedDeals: React.FC<{}> = ({ }) => {
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [mbFetchedDeals, setFetchedDeals] = React.useState<null | Deal[]>(null)
  const [selectedDeal, setSelectedDeal] = React.useState<null | number>()
  const chosenDeals = useSelector((state: RootState) => state.editModel.form.featuredDeals)
  const dispatch = useDispatch<Dispatch>()

  React.useEffect(() => {
    Backend.searchDeals("shoes").then(r => {
      console.log("RESULT OF FETCHING DEALS! ", r)
      setFetchedDeals(r)
    })
  }, [])

  function openModal() {
    setIsShowingModal(true);
  }

  function closeModal() {
    setIsShowingModal(false);
  }

  const onAdd = React.useCallback((dealId: number) => {
    console.log("MB DEALS! ", mbFetchedDeals)
    if (mbFetchedDeals) {
      const newDeal = mbFetchedDeals.find(s => s.id == dealId)!
      console.log("NEW STORE! ", newDeal)
      dispatch.editModel.addFeaturedDeal(newDeal)
      setIsShowingModal(false)
    }
  }, [mbFetchedDeals])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
      <h3>Featured Deals</h3>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {chosenDeals.map(d => (
          <DealThumb deal={d} onRemove={() => { }} />
        ))}

        <div style={{ width: 100, height: 200, border: '1px dotted black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={openModal}>
          Add Deal
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
          {mbFetchedDeals ?
            (
              <div>
                <Select
                  defaultValue={{ value: mbFetchedDeals[0].id, label: mbFetchedDeals[0].title }}
                  onChange={p => { setSelectedDeal(p?.value) }}
                  formatOptionLabel={({ value, label }) => (
                    <div style={{ display: "flex", flexDirection: 'column' }}>
                      <div>{label}</div>
                    </div>
                  )}
                  options={mbFetchedDeals.map(s => ({ value: s.id, label: s.title }))}
                />
              </div>
            )
            :
            (<></>)
          }
          <div>
            {selectedDeal
              ?
              (

                <button onClick={() => onAdd(selectedDeal)}>
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

const DealThumb: React.FC<{ deal: Deal, onRemove: () => void }> = ({ deal, onRemove }) => (
  <div style={{ width: 100, height: 200, border: '1px solid black', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    {deal.title}
    <img src={deal.store.image_url} style={{ width: 20, height: 20 }} />
    <button onClick={onRemove}>X</button>
  </div>
)