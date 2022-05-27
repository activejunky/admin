import * as React from 'react'
import Select from 'react-select'
import Modal from 'react-modal'
import { Handoff } from '../Models/Models'
import { IterationStatement } from 'typescript'
import { AdditionalStoresSection, AJStore, Deal, FeaturedDealsSection, HeadlessDigitalEvent, isAdditionalStoresSection, isFeaturedDealsSection, isKnownSection } from '../Models/Models'
import { SearchAndAddStoreModalContent } from './SearchAndAddStore'

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

export type HandoffSelect = { tag: 'store', storeSlug: string | null } | { tag: 'deal', dealId: null | number }

export const EditHandoffModal: React.FC<Props> = ({ modalProps, onConfirmAdd }) => {
  const [curType, setCurType] = React.useState<HandoffSelect | null>(null)
  const [searchMatchingStores, setSearchMatchingStores] = React.useState<null | AJStore[]>()

  const setStoreId = (e: React.FormEvent<HTMLInputElement>) => {
    const storeSlug = e.currentTarget.value
    setCurType({ tag: 'store', storeSlug })
  }

  const setDealId = (e: React.FormEvent<HTMLInputElement>) => {
    const dealId = parseInt(e.currentTarget.value)
    setCurType({ tag: 'deal', dealId })
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
              setCurType({ tag: 'store', storeSlug: null })
              return
            }
            if (p?.value && p.value === 'deal') {
              setCurType({ tag: 'deal', dealId: null })
              return
            }
          }}
        />
        {curType
          ?
          (
            curType.tag === 'store'
              ?
              (
                <div>
                  {/* <input className='border' type="text" value={curType.storeSlug ?? ""} placeholder="store id" style={{ width: 300 }} onChange={setStoreId} /> */}
                  <SearchAndAddStoreModalContent
                    closeModal={() => { }}
                    onChange={p => {
                      if (p && searchMatchingStores) {
                        const store = searchMatchingStores.find(s => s.url_slug === p.value)
                        console.log("MATCHING STORE! ", p, store)
                        if (store) {
                          setCurType({ tag: 'store', storeSlug: store.url_slug })
                        }
                      }
                    }}
                    setMatchingStores={(stores) => { setSearchMatchingStores(stores) }}
                    selectedStoreSlug={curType.storeSlug}
                    onAdd={(storeSlug) => {
                      onConfirmAdd(curType)
                    }}
                  />
                </div>
              )
              :
              (
                <div>
                  <input className='border' type="text" value={curType.dealId?.toString()} placeholder="deal id" style={{ width: 300 }} onChange={setDealId} />
                  <p>Deal id! {curType.dealId}</p>
                </div>
              )
          )
          :
          (<></>)
        }
      </div>
    </Modal>
  )
}