import { AJStore } from "../Models/Models"
import * as React from 'react'

export const StoreIcon: React.FC<{ ajStore: AJStore, onRemove?: () => void, height?: number }> = ({ ajStore, onRemove, height }) => (
  <div style={{ width: height ? 100 : 180, height: height ?? 200, border: '1px solid black', marginRight: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    {ajStore.name}
    <img src={ajStore.image_url} style={{ height: 30, width: 'auto', maxWidth: 150 }} />
    {onRemove
      ?
      (
        <button onClick={() => {
          console.log("CLICKED THIS! ")
          onRemove()
        }}>
          X
        </button>
      )
      :
      (<></>)
    }
  </div>
)