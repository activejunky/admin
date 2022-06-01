import * as React from 'react'
import { Deal } from '../Models/Models'

export const DealTile: React.FC<{ deal: Deal, onRemove?: () => void }> = ({ deal, onRemove }) => {
  const d = deal
  return (
    <div className="border flex justify-center items-center mr-4 flex-col" style={{ width: 200, height: 250 }} key={d.id}>
      <img src={d.store.image_url} style={{ width: 30, height: 30 }} />
      <h3 style={{ fontWeight: 'bold' }}>{d.store.name}</h3>
      {`${d.title} - ${d.id}`}
      {onRemove
        ?
        (
          <button className="border rounded-md p-2" style={{ marginTop: 8 }} onClick={() => { onRemove() }}>
            X
          </button>
        )
        :
        (<></>)
      }
    </div>
  )
}