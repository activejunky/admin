import * as React from 'react'
import Select from 'react-select'
import Modal from 'react-modal'
import { Handoff, Modelenz } from '../Models/Models'
import { IterationStatement } from 'typescript'
import { AdditionalStoresSection, AJStore, Deal, FeaturedDealsSection, HeadlessDigitalEvent, isAdditionalStoresSection, isFeaturedDealsSection, isKnownSection } from '../Models/Models'
import { SearchAndAddStoreModalContent } from './SearchAndAddStore'
import { Prism } from 'monocle-ts'
import * as P from 'monocle-ts/Prism'
import { pipe } from 'fp-ts/lib/function'

const options = [
  { value: 'store', label: 'store' },
  { value: 'deal', label: 'deal' },
  // { value: 'customUrl', label: 'customUrl' }
]


type Props = {
  modalProps: Modal.Props
  onConfirmAdd: (handoff: HandoffSelect) => void
  onSubmit: () => void
}

type StoreHandoffSelect = { tag: 'store', store: AJStore | null }
type DealHandoffSelect = { tag: 'deal', store: AJStore | null, dealId: null | number }

export type HandoffSelect = StoreHandoffSelect | DealHandoffSelect

function isStoreHandoff(hs: HandoffSelect): hs is StoreHandoffSelect { return hs.tag === 'store' }
function isDealHandoff(hs: HandoffSelect): hs is DealHandoffSelect { return hs.tag === 'deal' }
const handoffSelectStoreP = Prism.fromPredicate<HandoffSelect, StoreHandoffSelect>(isStoreHandoff)
const handoffSelectDealP = Prism.fromPredicate<HandoffSelect, DealHandoffSelect>(isDealHandoff)

type Mode = HandoffSelect | null
function isHandoffSelect(m: Mode): m is HandoffSelect { return m !== null }
const mp = pipe(Prism.fromPredicate<Mode, HandoffSelect>(isHandoffSelect), P.fromNullable)
const modeStoreP = pipe(mp, P.composePrism(handoffSelectStoreP))
const modeDealP = pipe(mp, P.composePrism(handoffSelectDealP))

export const EditHandoffModal: React.FC<Props> = ({ modalProps, onConfirmAdd }) => {
  const [curType, setCurType] = React.useState<HandoffSelect | null>(null)
  const [searchMatchingStores, setSearchMatchingStores] = React.useState<null | AJStore[]>()

  const setDealId = (e: React.FormEvent<HTMLInputElement>) => {
    const dealId = parseInt(e.currentTarget.value)
    setCurType(
      pipe(modeDealP, P.modify(dhs => ({ ...dhs, dealId })))
    )
  }

  return (
    <Modal {...modalProps}>
      <div>
        <h3>Select handoff type</h3>
        <Select
          options={options}
          onChange={p => {
            console.log("P! ", p?.label, p?.value)
            if (p?.value && p.value === 'store') {
              setCurType({ tag: 'store', store: null })
              return
            }
            if (p?.value && p.value === 'deal') {
              setCurType({ tag: 'deal', store: null, dealId: null })
              return
            }
          }}
        />
        {curType
          ?
          (
            (curType.tag === 'store' || curType.tag === 'deal')
              ?
              (
                <div>
                  {curType.tag === 'deal'
                    ?
                    (
                      <div className="mt-4">
                        <input className='border' type="text" value={curType.dealId?.toString()} placeholder="deal id" style={{ width: 300 }} onChange={setDealId} />
                      </div>
                    )
                    :
                    (<></>)
                  }
                  {/* <input className='border' type="text" value={curType.storeSlug ?? ""} placeholder="store id" style={{ width: 300 }} onChange={setStoreId} /> */}
                  <SearchAndAddStoreModalContent
                    closeModal={() => { }}
                    onChange={p => {
                      if (p && searchMatchingStores) {
                        const store = searchMatchingStores.find(s => s.url_slug === p.value)
                        console.log("MATCHING STORE! ", p, store)
                        if (store) {
                          if (curType.tag === 'store') {
                            setCurType({ tag: 'store', store })
                            return
                          }

                          if (curType.tag === 'deal') {
                            setCurType(ct =>
                              pipe(modeDealP, P.modify(dh => ({ ...dh, store })))(ct)
                            )
                            return
                          }
                        }
                      }
                    }}
                    setMatchingStores={(stores) => { setSearchMatchingStores(stores) }}
                    selectedStoreSlug={curType.store?.url_slug}
                    onAdd={(storeSlug) => {
                      onConfirmAdd(curType)
                    }}
                  />
                </div>
              )
              :
              (
                <></>
              )
          )
          :
          (<></>)
        }
      </div>
    </Modal>
  )
}