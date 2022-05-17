import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as React from 'react'
import EdiText from 'react-editext'
import LoadingOverlay from 'react-loading-overlay-ts'
import Modal from 'react-modal'
import { Provider, useDispatch, useSelector } from "react-redux"
import { useLocation, useParams } from 'react-router-dom'
import Select from "react-select"
import Async from 'react-select/async'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Backend, s3BaseUrl } from '../Backend/Api'
import { AdditionalStoresSection, AJStore, FeaturedStoresSection, featuredStoresSectionT, HeadlessDigitalEvent, isAdditionalStoresSection, isFeaturedStoresSection, isKnownSection, knownSectionT, Section } from '../Models'
import { AJStoreDnD } from './CreateDigitalEvents/ItemSorter'
import { Dispatch, RootState, store } from './CreateDigitalEventsPageVM'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    height: '80vh',
    zIndex: 100
  },
};



const CurIdContext = React.createContext<undefined | string>(undefined)
function useCurId() {
  const cid = React.useContext(CurIdContext)
  return cid!
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
function useBearerTkn() {
  const query = useQuery()
  const tkn = query.get('tkn')
  return tkn!
}

export const DigitalEventsPage: React.FC<{}> = ({ }) => {
  const { id } = useParams()

  return (
    <div style={{ width: '90vw', height: '100vh', padding: 20 }}>
      <h1>Create Digital Event</h1>

      <Provider store={store}>
        <CurIdContext.Provider value={id}>
          {/* <div><Preview /></div> */}
          <ControlPanel />
          <AllSections />
        </CurIdContext.Provider>
      </Provider>

    </div>
  )
}

const AllSections: React.FC<{}> = ({ }) => {
  const dispatch = useDispatch<Dispatch>()
  const id = useCurId()
  const isLoading = useSelector((s: RootState) => s.editModel.isFetching)

  React.useEffect(() => {
    dispatch.editModel.syncDigitalEvent(id)
  }, [])

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
      <LoadingOverlay
        active={O.isSome(isLoading)}
        spinner
        text={O.toNullable(isLoading) ?? ''}
      >
        <EditPageTitle />
        <SectionContainer>
          <EditBanner />
        </SectionContainer>
        {/* <SectionContainer>
          <EditFeaturedStores />
        </SectionContainer> */}
        <CmsSections />
      </LoadingOverlay>
      {/* <SectionContainer>
        <EditFeaturedDeals />
      </SectionContainer> */}
    </>
  )
}


const CmsSections: React.FC<{}> = ({ }) => {
  const sections = useSelector((rs: RootState) => rs.editModel.de.content.sections)
  const dispatch = useDispatch<Dispatch>()

  React.useEffect(() => {
    console.log("SECTIONS! ", sections)
  }, [sections])
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sections.map(s => {
        if (isKnownSection(s)) {
          // if (isFeaturedStoresSection(s.section)) {
          //   return <div>Featured! {s.section.stores.map(s => s.name).join(',')}</div>
          // }

          if (isFeaturedStoresSection(s.section)) {
            return (
              <SectionContainer>
                <EditFeaturedStores section={s.section} />
              </SectionContainer>
            )
          }

          if (isAdditionalStoresSection(s.section)) {
            return (
              <SectionContainer onRemove={() => { dispatch.editModel.addAdditionalStoresSection(false) }}>
                <EditAdditionalStores section={s.section} />
              </SectionContainer>
            )
          }

        }

        return (<></>)
      })}
      {sections.filter(s => isKnownSection(s) && isAdditionalStoresSection(s.section)).length === 0
        ?
        (

          <div style={{ width: '100%', display: 'flex', marginTop: 20, marginBottom: 20, height: 30 }}>
            <button onClick={() => { dispatch.editModel.addAdditionalStoresSection(true) }}>
              Add Additional Stores Section
            </button>
          </div>
        )
        :
        (<></>)
      }
    </div>
  )
}



const ControlPanel: React.FC<{}> = ({ }) => {
  const id = useCurId()
  const de = useSelector((r: RootState) => r.editModel.de)
  const tkn = useBearerTkn()
  const dispatch = useDispatch<Dispatch>()

  const curForm = de.content

  const onSaveDraft = React.useCallback(() => {
    console.log("CUR FORM! ", curForm)
    dispatch.editModel.setIsFetching(O.some('Saving...'))
    Backend.saveDraft(tkn, id, curForm).then(_ => {
      dispatch.editModel.setIsFetching(O.none)
      dispatch.editModel.syncDigitalEvent(id)
      toast.success("Saved!")
    })
  }, [tkn, id, curForm])

  const onPublishDraft = React.useCallback(() => {
    console.log("CUR FORM! ", curForm)
    Backend.publishDraft(tkn, id).then(_ => {
      console.log("FINISHED SAVING! ")
      toast.success("Published!")
    })
  }, [tkn, id])

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: 'lightgray', padding: '10xp', height: 100 }}>
      <div style={{ width: '100%', position: 'absolute', left: 0, top: 10, bottom: 10, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
        <button className="bg-blue-500 text-white py-2 px-4 mr-10" onClick={() => { onSaveDraft() }}>

          Save Draft
        </button>
        {/* <button style={{ marginRight: 30 }}>Preview</button> */}
        <button className="bg-orange-500 text-white py-2 px-4" onClick={() => { onPublishDraft() }}>Publish</button>
      </div>

      <div style={{ width: '200px', position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
        <div>Last saved at: </div>
        <div>{de.last_saved_at ? (new Date(de.last_saved_at).toString()) : ""}</div>
      </div>
    </div>
  )
}

const Preview: React.FC<{}> = ({ }) => {
  const fullPage = useSelector((state: RootState) => state)

  return (
    <div>{JSON.stringify(fullPage.editModel.de.content.sections)}</div>
  )
}

const EditPageTitle: React.FC<{}> = ({ }) => {
  const dispatch = useDispatch<Dispatch>()
  const inputPageTitle = useSelector((state: RootState) => state.editModel.de.content.pageTitle)
  const [value, setTitle] = React.useState(inputPageTitle);

  React.useEffect(() => {
    console.log("INPUT PAGE TITLE! ", inputPageTitle)
    setTitle(inputPageTitle)
  }, [inputPageTitle])

  const handleSave = (val: string) => {
    console.log('Edited Value -> ', val);
    dispatch.editModel.setPageTitle(val)
  }

  return (
    <div className='mt-10' style={{ width: '100%', display: 'flex', marginBottom: 30, alignItems: 'center' }}>
      <h3 className="text-2xl font-bold" style={{ marginRight: 18 }}>Page Title</h3>
      <EdiText type="text" value={value} onSave={(val) => { handleSave(val) }} />
    </div>
  )
}


const EditBanner: React.FC<{ mbInitialDE?: HeadlessDigitalEvent }> = ({ mbInitialDE }) => {
  const banner = useSelector((state: RootState) => state.editModel.de.content.banner)
  const dispatch = useDispatch<Dispatch>()
  const [savedTitle, setSavedTitle] = React.useState(banner.title)
  const [savedCashbackStr, setCachbackStr] = React.useState(banner.cashBackString)
  const [savedImageUrl, ssiurl] = React.useState(banner.backgroundImageUrl ?? "")
  const curId = useCurId()

  React.useEffect(() => {
    setSavedTitle(banner.title)
    setCachbackStr(banner.cashBackString)
    ssiurl(banner.backgroundImageUrl ?? "")
  }, [banner])

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
    width: '100%', border: '3px solid black', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
  }

  const divStyle = savedImageUrl ? {
    ...divStyleBase, backgroundImage: `url(${savedImageUrl})`
  } : divStyleBase

  React.useEffect(() => {
    console.log("SAVED IMAGE URL! ", savedImageUrl)
  }, [savedImageUrl])

  const onInputFile = (evt: React.FormEvent<HTMLInputElement>) => {
    const files = evt.currentTarget.files
    if (files) {
      dispatch.editModel.setIsFetching(O.some(''))
      Backend.uploadImage(files[0], curId).then(r => {
        console.log("UPLOADED FILE! ")
        const s3Url = `${s3BaseUrl}/${curId}`
        dispatch.editModel.setBannerImageUrl(s3Url)
        dispatch.editModel.setIsFetching(O.none)
      })
    }
  }

  return (
    <div style={divStyleBase}>
      <h3 className="text-2xl font-bold mb-10">Banner</h3>
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
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Image Url:
        </label>
        <EdiText type="text" value={savedImageUrl} onSave={setBannerImageUrl} />
        {banner.backgroundImageUrl
          ?
          (<img src={banner.backgroundImageUrl} style={{ width: 200, height: 100, border: '1px solid black' }} />)
          :
          (<></>)
        }
        <input type="file" title='Upload file' onChange={onInputFile} />
      </div>
    </div>
  )
}


async function loadStoreOptions(p: { searchTerms: string }) {
  const stores = await Backend.getStores(p)
  return stores.map(s => ({ label: s.name, value: s.url_slug }))
}

const EditFeaturedStores: React.FC<{ section: FeaturedStoresSection }> = ({ section }) => {
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [mbAvailableStores, setMbStores] = React.useState<null | AJStore[]>(null)
  const [selectedStore, setSelectedStore] = React.useState<null | string>()
  const stores = section.stores
  const dispatch = useDispatch<Dispatch>()


  function openModal() {
    setIsShowingModal(true);
    Backend.getStores({ searchTerms: '' }).then(s => {
      setMbStores(s)
    }).catch(e => {
      console.log("FAILED TO GET STORES! ", e)
    })
  }

  function closeModal() {
    setIsShowingModal(false);
  }

  const onAdd = React.useCallback((storeSlug: string) => {
    console.log("MB STORES! ", mbAvailableStores)
    if (mbAvailableStores) {
      const newStore = mbAvailableStores.find(s => s.url_slug == storeSlug)!
      console.log("NEW STORE! ", newStore)
      dispatch.editModel.addFeaturedStore(newStore)
      setIsShowingModal(false)
    }
  }, [mbAvailableStores])


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <h3 className="text-2xl font-bold">Featured Stores</h3>
        <OutlineButton title="Add Store" onClick={openModal} />
      </div>


      <div style={{ display: 'flex', flexDirection: 'row' }}>

        <AJStoreDnD
          stores={stores}
          onRemove={(slug) => {
            dispatch.editModel.removeFeaturedStore(slug)
          }}
        />
        {/* {stores.map(s => (
          <StoreIcon ajStore={s} onRemove={() => { dispatch.editModel.removeFeaturedStore(s.url_slug) }} />
        ))} */}


      </div>

      <Modal
        isOpen={isShowingModal}
        onAfterOpen={() => { }}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <SearchAndAddStoreModalContent
          closeModal={closeModal}
          onChange={p => { setSelectedStore(p?.value) }}
          setMatchingStores={setMbStores}
          onAdd={onAdd}
          selectedStoreSlug={selectedStore}
        />
      </Modal>
    </div>
  )
}


type SearchAndAddStoreModalContentProps = {
  closeModal: () => void
  onChange: (p: { value: string, label: string } | null) => void
  setMatchingStores: (stores: AJStore[]) => void
  selectedStoreSlug: string | null | undefined
  onAdd: (storeSlug: string) => void
}

const SearchAndAddStoreModalContent: React.FC<SearchAndAddStoreModalContentProps> = ({ closeModal, onChange, setMatchingStores, selectedStoreSlug, onAdd }) => {
  return (
    <div className="width-full">
      <div className="width-full flex justify-end mb-20">
        <button onClick={closeModal}>close</button>
      </div>

      <div>
        <Async
          defaultValue={{ value: '', label: '' }}
          onChange={onChange}
          formatOptionLabel={({ value, label }) => (
            <div style={{ display: "flex", flexDirection: 'column' }}>
              <div>{label}</div>
            </div>
          )}
          loadOptions={v => {
            async function getAndSet() {
              const stores = await Backend.getStores({ searchTerms: v })
              setMatchingStores(stores)
              return stores.map(s => ({ value: s.url_slug, label: s.name }))
            }
            return getAndSet()
          }}
        // defaultOptions={mbStores.map(s => ({ value: s.url_slug, label: s.name }))}
        />
      </div>
      <div className='w-full mt-20 border'>
        {selectedStoreSlug
          ?
          (
            <button
              className="w-full rounded bg-blue-500 hover:bg-blue-300 text-white py-2 px-4"
              onClick={() => onAdd(selectedStoreSlug)}
            >
              Add
            </button>
          )
          :
          (<></>)
        }
      </div>
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


// const EditFeaturedDeals: React.FC<{}> = ({ }) => {
//   const [isShowingModal, setIsShowingModal] = React.useState(false)
//   const [mbFetchedDeals, setFetchedDeals] = React.useState<null | Deal[]>(null)
//   const [selectedDeal, setSelectedDeal] = React.useState<null | number>()
//   const chosenDeals = useSelector((state: RootState) => state.editModel.de.content.featuredDeals)
//   const dispatch = useDispatch<Dispatch>()

//   React.useEffect(() => {
//     Backend.searchDeals("shoes").then(r => {
//       console.log("RESULT OF FETCHING DEALS! ", r)
//       setFetchedDeals(r)
//     })
//   }, [])

//   function openModal() {
//     setIsShowingModal(true);
//   }

//   function closeModal() {
//     setIsShowingModal(false);
//   }

//   const onAdd = React.useCallback((dealId: number) => {
//     console.log("MB DEALS! ", mbFetchedDeals)
//     if (mbFetchedDeals) {
//       const newDeal = mbFetchedDeals.find(s => s.id == dealId)!
//       console.log("NEW STORE! ", newDeal)
//       dispatch.editModel.addFeaturedDeal(newDeal)
//       setIsShowingModal(false)
//     }
//   }, [mbFetchedDeals])

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
//       <h3>Featured Deals</h3>

//       <div style={{ display: 'flex', flexDirection: 'row' }}>
//         {chosenDeals.map(d => (
//           <DealThumb deal={d} onRemove={() => { }} />
//         ))}

//         <div style={{ width: 100, height: 200, border: '1px dotted black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={openModal}>
//           Add Deal
//           <p>+</p>
//         </div>

//       </div>

//       <Modal
//         isOpen={isShowingModal}
//         onAfterOpen={() => { }}
//         onRequestClose={closeModal}
//         style={customStyles}
//         contentLabel="Example Modal"
//       >
//         <div style={{ width: '100%' }}>
//           <button onClick={closeModal}>close</button>
//           {mbFetchedDeals ?
//             (
//               <div>
//                 <Select
//                   defaultValue={{ value: mbFetchedDeals[0].id, label: mbFetchedDeals[0].title }}
//                   onChange={p => { setSelectedDeal(p?.value) }}
//                   formatOptionLabel={({ value, label }) => (
//                     <div style={{ display: "flex", flexDirection: 'column' }}>
//                       <div>{label}</div>
//                     </div>
//                   )}
//                   options={mbFetchedDeals.map(s => ({ value: s.id, label: s.title }))}
//                 />
//               </div>
//             )
//             :
//             (<></>)
//           }
//           <div>
//             {selectedDeal
//               ?
//               (

//                 <button onClick={() => onAdd(selectedDeal)}>
//                   Add
//                 </button>
//               )
//               :
//               (<></>)
//             }
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }

// const DealThumb: React.FC<{ deal: Deal, onRemove: () => void }> = ({ deal, onRemove }) => (
//   <div style={{ width: 100, height: 200, border: '1px solid black', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//     {deal.title}
//     <img src={deal.store.image_url} style={{ width: 20, height: 20 }} />
//     <button onClick={onRemove}>X</button>
//   </div>
// )

const SectionContainer: React.FC<React.PropsWithChildren<{ onRemove?: () => void }>> = ({ children, onRemove }) => {
  return (
    <div style={{ border: '1px solid gray', borderRadius: 5, minHeight: 200, width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
      {onRemove
        ?
        (

          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onRemove}>Remove Section</button>
          </div>
        )
        :
        (<></>)
      }
      {children}
    </div>
  )
}


const EditAdditionalStores: React.FC<{ section: AdditionalStoresSection }> = ({ section }) => {
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [mbStores, setMbStores] = React.useState<null | AJStore[]>(null)
  const [selectedStore, setSelectedStore] = React.useState<null | string>()
  const stores = section.stores
  const dispatch = useDispatch<Dispatch>()

  React.useEffect(() => {
    Backend.fetchHomePage().then(hp => {
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
      dispatch.editModel.addAdditionalStore(newStore)
      setIsShowingModal(false)
    }
  }, [mbStores])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <h3 className="text-2xl font-bold">Additional Stores</h3>
        <OutlineButton title="Add Store" onClick={openModal} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <AJStoreDnD
          stores={stores}
          onRemove={(slug) => {
            dispatch.editModel.removeAdditionalStore(slug)
          }}
        />
        {/* {stores.map(s => (
          <StoreIcon ajStore={s} onRemove={() => { dispatch.editModel.removeFeaturedStore(s.url_slug) }} />
        ))} */}
      </div>

      <Modal
        isOpen={isShowingModal}
        onAfterOpen={() => { }}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <SearchAndAddStoreModalContent
          closeModal={closeModal}
          onChange={p => { setSelectedStore(p?.value) }}
          setMatchingStores={setMbStores}
          onAdd={onAdd}
          selectedStoreSlug={selectedStore}
        />
      </Modal>
    </div>
  )
}


const OutlineButton: React.FC<{ title: string, onClick: () => void }> = ({ title, onClick }) => {
  return (
    <button
      className="rounded border border-blue-500 bg-transparent hover:bg-blue-500 hover:text-white py-2 px-4" style={{ marginLeft: 20 }}
      onClick={onClick}
    >
      {title}
    </button>
  )
}