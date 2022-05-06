import { sensitiveHeaders } from 'http2'
import { useObservableEagerState } from 'observable-hooks'
import * as React from 'react'
import Modal from 'react-modal'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'
import Select, { SelectOptionActionMeta } from "react-select";

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
  banner: BannerContent
}

const emptyState: State = {
  pageTitle: '',
  banner: { title: '', cashBackString: '' }
}

type BannerContent = {
  title: string
  cashBackString: string
}

const pageStateAtm = atom({
  key: 'pageState',
  default: emptyState
})

const PageStateCtx = React.createContext<Rx.BehaviorSubject<State>>(new Rx.BehaviorSubject(emptyState))

export const DigitalEventsPage: React.FC<{}> = ({ }) => {
  const pageState$ = React.useMemo(() => new Rx.BehaviorSubject(emptyState), [])
  const pageState = useRecoilValue(pageStateAtm)

  return (
    <div style={{ width: '100vw', height: '100vh', padding: 20 }}>
      <h1>Digital Events</h1>
      <div>{JSON.stringify(pageState)}</div>

      <PageStateCtx.Provider value={pageState$}>
        <EditPageTitle />
        <EditBanner />
        <EditFeaturedStores />
      </PageStateCtx.Provider>
    </div>
  )
}

const EditPageTitle: React.FC<{}> = ({ }) => {
  const [ps, setPs] = useRecoilState(pageStateAtm)

  const setPageTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPs(cp => ({ ...cp, pageTitle: e.currentTarget.value }))
  }, [])

  return (
    <div>
      <input type="text" value={ps.pageTitle} onChange={setPageTitle} />
    </div>
  )
}


const EditBanner: React.FC<{}> = ({ }) => {
  const [ps, setPs] = useRecoilState(pageStateAtm)

  const setBannerTitle = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPs(cp => ({ ...cp, banner: { ...cp.banner, title: e.currentTarget.value } }))
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

const CustomControl = () => (
  <Select
    defaultValue={options[0]}
    formatOptionLabel={({ value, label, customAbbreviation }) => (
      <div style={{ display: "flex", flexDirection: 'column' }}>
        <div>{label}</div>
        <div style={{ marginLeft: "10px", color: "#ccc" }}>
          {customAbbreviation}
        </div>
      </div>
    )}
    options={options}
  />
);

const EditFeaturedStores: React.FC<{}> = ({ }) => {
  const [ps, setPs] = useRecoilState(pageStateAtm)
  const [isShowingModal, setIsShowingModal] = React.useState(false)

  function openModal() {
    setIsShowingModal(true);
  }

  function closeModal() {
    setIsShowingModal(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h3>Featured Stores</h3>

      <div style={{ width: 100, height: 200, border: '1px dotted black' }} onClick={openModal}>
        Add Store
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
          <CustomControl />
          <div>
            <button onClick={() => { }}>Add</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
