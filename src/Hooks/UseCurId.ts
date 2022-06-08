import * as React from 'react'

const CurIdContext = React.createContext<undefined | string>(undefined)

export function useCurId() {
  const cid = React.useContext(CurIdContext)
  return cid!
}