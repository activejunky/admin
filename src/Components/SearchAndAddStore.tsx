import * as React from 'react'
import { AJStore } from '../Models/Models'
import Async from 'react-select/async'
import { Backend } from '../Backend/Api'

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