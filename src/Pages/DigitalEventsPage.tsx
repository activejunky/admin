import { sensitiveHeaders } from 'http2'
import { useObservableEagerState } from 'observable-hooks'
import * as React from 'react'
import Modal from 'react-modal'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'

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
    <div>
      <h1>Digital Events</h1>
      <div>{JSON.stringify(pageState)}</div>

      <PageStateCtx.Provider value={pageState$}>
        <EditPageTitle />
        <EditBanner />
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
    <div style={{ width: '80%', border: '1px solid black', display: 'flex', flexDirection: 'column' }}>
      <input type="text" value={ps.banner.title} onChange={setBannerTitle} style={{ fontSize: 30, border: '1px solid red', display: 'flex', flexShrink: 1 }} />
      <input type="text" value={ps.banner.cashBackString} onChange={setCashbackText} style={{ fontSize: 20, width: '100%' }} />
    </div>
  )
}