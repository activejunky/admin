import * as React from 'react'
import { Link } from 'react-router-dom'
import { Backend } from '../Backend/Api'
import { HeadlessDigitalEvent } from '../Models/Models'
import * as A from 'fp-ts/Array'


export const AllDigitalEventsPage: React.FC<{}> = ({ }) => {
  const [allEvents, setAllEvents] = React.useState<HeadlessDigitalEvent[] | null>(null)
  const [isShowingCreateModal, setIsShowingCreateModal] = React.useState(false)

  React.useEffect(() => {
    Backend.allDigitalEvents().then(r => {
      setAllEvents(r)
    }).catch(e => {
      console.error("FAILED TO FETCH DIGI EVENTS! ", e)
    })
  }, [])

  return (
    <div className="flex w-screen h-screen pt-32">
      <div className="w-1/4 h-screen"></div>
      {allEvents
        ?
        (<AllEvents events={allEvents} />)
        :
        (<div>Loading...</div>)
      }
    </div>
  )
}

const AllEvents: React.FC<{ events: HeadlessDigitalEvent[] }> = ({ events }) => {
  return (
    <div className="h-1/2 w-1/2 bg-blue-100 overflow-auto">
      <table className="relative w-full border">
        <thead >
          <tr>
            <th className="sticky top-0 px-6 py-3">
              Title
            </th>
            <th className="sticky top-0 px-6 py-3">
              Last Saved At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {events.map(hde => <EventRow key={hde.id} hde={hde} />)}
        </tbody>
      </table>
    </div>
  )
}

const EventRow: React.FC<{ hde: HeadlessDigitalEvent }> = ({ hde }) => {
  return (
    <tr className="border-b">
      <td className="py-8">
        <Link to={`${hde.id}`} style={{ borderBottom: '1px solid black' }} >
          {hde.title}
        </Link>
      </td>
      <td className="px-32">
        {hde.last_saved_at}
      </td>
    </tr>
  )
}

