import * as React from 'react'
import { Link } from 'react-router-dom'
import { Backend } from '../Backend/Api'
import { HeadlessDigitalEvent } from '../Models'
import * as A from 'fp-ts/Array'


export const AllDigitalEventsPage: React.FC<{}> = ({ }) => {
  const [allEvents, setAllEvents] = React.useState<HeadlessDigitalEvent[] | null>(null)

  React.useEffect(() => {
    Backend.allDigitalEvents().then(r => {
      setAllEvents(r)
    }).catch(e => {
      console.error("FAILED TO FETCH DIGI EVENTS! ", e)
    })
  }, [])

  return (
    <div>
      All Digital Events
      <ul>
        {allEvents
          ?
          (<AllEvents events={allEvents} />)
          :
          (<></>)
        }
      </ul>
    </div>
  )
}

const AllEvents: React.FC<{ events: HeadlessDigitalEvent[] }> = ({ events }) => {
  return (
    <ul>
      {events.map(hde => <EventRow key={hde.id} hde={hde} />)}
    </ul>
  )
}

const EventRow: React.FC<{ hde: HeadlessDigitalEvent }> = ({ hde }) => {
  return (
    <li>
      <Link to={`${hde.id}`} style={{ borderBottom: '1px solid black' }} >
        {hde.title}
      </Link>
    </li>
  )
}

