import * as React from 'react'
import { AJStore } from '../Models/Models'
import Async from 'react-select/async'
import { Backend } from '../Backend/Api'
import { match } from 'assert'
import { isMobileDevice } from 'react-select/dist/declarations/src/utils'
import Select from 'react-select/dist/declarations/src/Select'
import { GroupBase } from 'react-select'

type SearchAndAddStoreModalContentProps = {
  closeModal: () => void
  onChange: (p: { value: string, label: string } | null) => void
  setMatchingStores: (stores: AJStore[]) => void
  selectedStoreSlug: string | null | undefined
  onAdd: (storeSlug: string) => void
}

export const SearchAndAddStoreModalContent: React.FC<SearchAndAddStoreModalContentProps> = ({ closeModal, onChange, setMatchingStores, selectedStoreSlug, onAdd }) => {
  return (
    <div className="width-full">
      <div className="width-full flex justify-end mb-20">
        <button onClick={closeModal}>close</button>
      </div>

      <div>
        <Async
          defaultValue={undefined as (undefined | { value: string, label: string })}
          placeholder={<div>Search for store</div>}
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


export const StoreFinder: React.FC<{ mbInitialStore: AJStore | null, onSelect: (s: AJStore) => void }> = ({ mbInitialStore, onSelect }) => {
  const [selectedStore, setSelectedStore] = React.useState<AJStore | null>(mbInitialStore)
  const [matchingStores, setMatchingStores] = React.useState<AJStore[]>([])

  React.useEffect(() => {
    console.log("MB INITIAL! ", mbInitialStore)
    setSelectedStore(mbInitialStore)
  }, [mbInitialStore])

  return (
    <div className="w-full">
      <Async
        defaultValue={undefined as (undefined | { value: string, label: string })}
        placeholder={<div>Search for store</div>}
        value={selectedStore ? ({ value: selectedStore.url_slug, label: selectedStore.name }) : undefined}
        onChange={p => {
          if (p?.value) {
            const mbMatchingStore = matchingStores.find(ms => ms.url_slug === p.value)
            if (mbMatchingStore) {
              setSelectedStore(mbMatchingStore)
              onSelect(mbMatchingStore)
            }
          }
        }}
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
  )
}