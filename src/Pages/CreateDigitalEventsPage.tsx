import * as O from 'fp-ts/Option'
import * as React from 'react'
import EdiText from 'react-editext'
import LoadingOverlay from 'react-loading-overlay-ts'
import Modal from 'react-modal'
import { Provider, useDispatch, useSelector } from "react-redux"
import { useLocation, useParams } from 'react-router-dom'
import Async from 'react-select/async'
import { toast, ToastContainer, ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Backend, baseUrl, s3BaseUrl } from '../Backend/Api'
import { AdditionalStoresSection, AJStore, Deal, FeaturedDealsSection, Handoff, HeadlessDigitalEvent, isAdditionalStoresSection, isFeaturedDealsSection, isKnownSection, knownSectionSectionT } from '../Models/Models'
import { AJStoreDnD } from './CreateDigitalEvents/ItemSorter'
import { Dispatch, editModel, RootState, store } from './CreateDigitalEventsPageVM'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { boolean } from 'fp-ts'
import { EditHandoffModal } from '../Components/HandoffModal'
import { SearchAndAddStoreModalContent } from '../Components/SearchAndAddStore'
import { StoreIcon } from '../Views/StoreIcon'
import { onErrorResumeNext } from 'rxjs'
import { DealTile } from '../Components/DealView'
import { CarouselEditor, SlideCreator } from '../Components/CarouselCreator/SlideCreator'
import { Root } from 'react-dom/client'
import { unsafeDeleteAt } from 'fp-ts/lib/Array'

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
  const [isCopiedToClip, setCopyToClip] = React.useState<{ value: string, copied: boolean }>({ value: id ? deepLink(id) : '', copied: false })

  return (
    <div style={{ width: '90vw', height: '100vh', padding: 20 }}>
      <h1>Create Digital Event</h1>

      <Provider store={store}>
        <CurIdContext.Provider value={id}>
          {/* <div><Preview /></div> */}
          <ControlPanel />
          <div style={{ display: 'flex' }}>
            <input type="text" value={`${isCopiedToClip.value}`} className="border" />
            <CopyToClipboard text={isCopiedToClip.value}
              onCopy={() => {
                setCopyToClip(v => ({ ...v, copied: true }))
                toast.success("Copied to clipboard!", { hideProgressBar: true })
              }}>
              <button className='border border-stone-600 rounded-md'>Copy Dynamic link to clipboard</button>
            </CopyToClipboard>
          </div>
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

    Backend.getDeal({ dealId: 96371 }).then(r => {
      console.log(`RESULT OF GETTING DEAL ${JSON.stringify(r)}`)
    })
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
        <EditSlug />
        <EditPageTitle />
        {/* <SectionContainer>
          <EditBanner />
        </SectionContainer> */}
        <CarouselEditorSection />
        {/* <SectionContainer>
          <EditFeaturedStores />
        </SectionContainer> */}
        <CmsSections />
      </LoadingOverlay>
    </>
  )
}

const CarouselEditorSection: React.FC<{}> = ({ }) => {
  const carousel = useSelector((state: RootState) => state.editModel.de.content.carousel)
  const dispatch = useDispatch<Dispatch>()

  return (
    <SectionContainer>
      <div className="flex flex-col w-full items-start">
        <h3 className="text-2xl font-bold">Carousel</h3>
        <CarouselEditor
          curSlides={carousel ?? []}
          onChangeSlides={slides => {
            dispatch.editModel.setCarousel(slides)
          }}
          onRemove={slide => {
            const match = carousel?.findIndex(ss => ss.headline_copy === slide.headline_copy)
            if (carousel && match && match !== -1) {
              dispatch.editModel.setCarousel(unsafeDeleteAt(match, carousel))
            }
          }}
        />
      </div>
    </SectionContainer>
  )
}


function deepLink(id: string): string {
  return `${baseUrl}/digital_events/${id}`
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

          if (isFeaturedDealsSection(s.section)) {
            return (
              <SectionContainer key={s.section.tag}>
                <EditFeaturedDeals section={s.section} />
              </SectionContainer>
            )
          }

          if (isAdditionalStoresSection(s.section)) {
            return (
              <SectionContainer key={s.section.tag} onRemove={() => { dispatch.editModel.addAdditionalStoresSection(false) }}>
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
            <button className="btn" onClick={() => { dispatch.editModel.addAdditionalStoresSection(true) }}>
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
      toast.success("Saved!", { hideProgressBar: true })
    })
  }, [tkn, id, curForm])

  const onPublishDraft = React.useCallback(() => {
    console.log("CUR FORM! ", curForm)
    Backend.publishDraft(tkn, id).then(_ => {
      console.log("FINISHED SAVING! ")
      toast.success("Published!", { hideProgressBar: true })
    })
  }, [tkn, id])

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: 'lightgray', padding: '10xp', height: 100 }}>
      <div style={{ width: '100%', position: 'absolute', left: 0, top: 10, bottom: 10, display: 'flex', justifyContent: 'center', zIndex: 2 }}>
        <button className="bg-blue-500 text-white py-2 px-4 mr-10" onClick={() => { onSaveDraft() }}>

          Save
        </button>
        {/* <button style={{ marginRight: 30 }}>Preview</button> */}
        {/* <button className="bg-orange-500 text-white py-2 px-4" onClick={() => { onPublishDraft() }}>Publish</button> */}
      </div>

      <div style={{ width: '200px', position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
        <div>Last saved at: </div>
        <div>{de.last_saved_at ? (new Date(de.last_saved_at).toString()) : ""}</div>
      </div>
    </div>
  )
}

const EditSlug: React.FC<{}> = ({ }) => {
  const dispatch = useDispatch<Dispatch>()
  const inputPageTitle = useSelector((state: RootState) => state.editModel.de.title)
  const [value, setTitle] = React.useState(inputPageTitle);

  React.useEffect(() => {
    setTitle(inputPageTitle)
  }, [inputPageTitle])

  const handleSave = (val: string) => {
    console.log('Edited Value -> ', val);
    dispatch.editModel.setSlug(val)
  }

  return (
    <div className='mt-10' style={{ width: '100%', display: 'flex', marginBottom: 30, alignItems: 'center' }}>
      <h3 className="text-l font-bold" style={{ marginRight: 18 }}>Slug</h3>
      <EdiText type="text" value={value} onSave={(val) => { handleSave(val) }} />
    </div>
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



const EditFeaturedDeals: React.FC<{ section: FeaturedDealsSection }> = ({ section }) => {
  const [isShowingModal, setIsShowingModal] = React.useState(false)
  const [inputDeal, setSelectedDeal] = React.useState<null | Deal>()
  const [matchingDeals, setMatchingDeals] = React.useState<null | Deal[]>()
  const dispatch = useDispatch<Dispatch>()
  const [curEditingRow, setCurEditingRow] = React.useState(0)
  const deals = section.deals


  function openModal() {
    setIsShowingModal(true);
  }

  function closeModal() {
    setIsShowingModal(false);
  }

  const onAdd = React.useCallback(() => {
    console.log("MB DEAL! ", inputDeal)
    if (inputDeal) {
      dispatch.editModel.addFeaturedDeal({ deal: inputDeal, rowIndex: curEditingRow })
      setIsShowingModal(false)
    }
  }, [inputDeal, curEditingRow])

  // const onInputDealId = (evt: React.FormEvent<HTMLInputElement>) => {
  //   evt.preventDefault()
  //   const mbNumber = parseInt(evt.currentTarget.value)
  //   if (mbNumber) {
  //     setDealId(mbNumber)
  //   }
  // }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <h3 className="text-2xl font-bold">Featured Deals</h3>
        {/* <OutlineButton title="Add Featured Deal" onClick={openModal} /> */}
      </div>

      <div className="flex flex-col w-full">
        {section.dealRows.map((dr, idx) => (
          <div className="flex flex-col w-full border border-2 border-orange-700 mt-8 h-64">
            <div className='flex flex-row-reverse w-full'>
              <button onClick={() => { dispatch.editModel.removeFeaturedDealRow(idx) }} className="border rounded-2xl">Remove row</button>
            </div>
            <div className="flex overflow-auto">
              {dr.map(d => {
                return (
                  <div style={{ width: '300px', height: '100%', marginRight: '4px' }}>
                    <DealTile deal={d} onRemove={() => { dispatch.editModel.removeFeaturedDeal({ dealId: d.id, rowIndex: idx }) }} />
                  </div>
                )
              })}
              <div className="h-full flex flex-col justify-center" >
                <OutlineButton title='Add Featured Deal to Row' onClick={() => {
                  setCurEditingRow(idx)
                  openModal()
                }} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex w-full mt-8">
          <button className="btn btn-info" onClick={() => { dispatch.editModel.addFeaturedDealRow(true) }}>Add featured deal row</button>
        </div>
        {/* <AJStoreDnD
          stores={stores}
          onRemove={(slug) => {
            dispatch.editModel.removeFeaturedStore(slug)
          }}
        /> */}


      </div>

      <Modal
        isOpen={isShowingModal}
        onAfterOpen={() => { }}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >


        <div className="flex flex-col w-full h-full border mt-12" style={{ border: '1px solid black' }}>
          <Async
            defaultValue={{ value: 0, label: '' }}
            onChange={p => {
              console.log("P! ", p)
              if (p) {
                const md = matchingDeals?.find(md => md.id === p.value)
                console.log("MD! ", md)
                if (md) {
                  setSelectedDeal(md)
                }
              }
            }}
            formatOptionLabel={({ value, label }) => (
              <div style={{ display: "flex", flexDirection: 'column', minWidth: 300 }}>
                <div>{label}</div>
              </div>
            )}
            loadOptions={v => {
              async function getAndSet() {
                console.log("SEARCHING WITH TERM! ", v)
                const mbDeal: Deal | null = await Backend.getDeal({ dealId: parseInt(v) })
                console.log("SETTING MATCHING DEALS! ", deals)
                setMatchingDeals([mbDeal])
                return [mbDeal].map(s => ({ value: s.id, label: `${s.title} - ${s.store.name}` }))
              }
              return getAndSet()
            }}
          // defaultOptions={mbStores.map(s => ({ value: s.url_slug, label: s.name }))}
          />
          {/* <input
            type="text" title='DealId' placeholder='deal Id'
            value={inputDealId?.toString() ?? ""}
            style={{ border: '1px solid black', width: '25%', height: 80 }}
            onChange={onInputDealId}
          /> */}
          <button
            className="w-4/6 rounded bg-blue-500 hover:bg-blue-300 text-white py-2 px-4 mt-4"
            onClick={onAdd}
          >
            Add
          </button>


        </div>
        {/* <SearchAndAddStoreModalContent
          closeModal={closeModal}
          onChange={p => { setDealId(p?.value) }}
          setMatchingStores={setMbStores}
          onAdd={onAdd}
          selectedStoreSlug={inputDealId}
        /> */}
      </Modal>
    </div>
  )
}






const SectionContainer: React.FC<React.PropsWithChildren<{ onRemove?: () => void }>> = ({ children, onRemove }) => {
  return (
    <div style={{ border: '1px solid gray', borderRadius: 5, minHeight: 200, width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
      {onRemove
        ?
        (

          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={onRemove}>Remove Section</button>
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
  const [curRowEdit, setCurRowEdit] = React.useState(0)
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
      console.log("CUR ROW EDIT! ", curRowEdit)
      dispatch.editModel.addAdditionalStoreInRow({ store: newStore, rowIndex: curRowEdit })
      setIsShowingModal(false)
    }
  }, [mbStores, curRowEdit])

  const handleSave = (va: string) => {
    dispatch.editModel.setAdditionalStoresSectionTitle(va)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 30 }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 30 }}>
        <h3 className="text-1xl font-bold" style={{ marginRight: 18 }}>Title</h3>
        <EdiText type="text" value={section.title} onSave={(val) => { handleSave(val) }} />
      </div>


      {section.storeRows ? (section.storeRows.map((stores, idx) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '200px', border: '1px solid orange' }}>
            <AJStoreDnD
              stores={stores}
              onRemove={(storeSlug) => {
                dispatch.editModel.removeAdditionalStoreFromRow({ rowIndex: idx, storeSlug })
              }}
            />
            <OutlineButton title="Add Store to Row" onClick={() => {
              setCurRowEdit(idx)
              openModal()
            }} />
            {/* {stores.map(s => (
          <StoreIcon ajStore={s} onRemove={() => { dispatch.editModel.removeFeaturedStore(s.url_slug) }} />
        ))} */}
          </div>
        )
      }))
        :
        (<></>)
      }

      <div style={{ width: '100%', display: 'flex', marginTop: '20px' }}>
        <OutlineButton title="Add Row" onClick={() => { dispatch.editModel.addAdditionalStoresSectionRow(true) }} />
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