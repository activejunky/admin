import { sensitiveHeaders } from 'http2'
import * as React from 'react'
import Modal from 'react-modal'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

interface DigitalEventContent {
  pageTitle: string
}

const emptyContent: DigitalEventContent = {
  pageTitle: ''
}

function useInput() {
  const [value, setValue] = React.useState("");
  const input = <input value={value} onChange={e => setValue(e.target.value)} type={"text"} />;
  return [value, input];
}

type State = {
  pageTitle: string
}

type Props = {}

export class DigitalEventsPage extends React.Component<Props, State> {
  state = {
    pageTitle: "",
  };

  onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({ pageTitle: e.currentTarget.value });
  };

  render() {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', border: '3px solid red', alignItems: 'flex-start', padding: 20 }}>
        <h1>Digital Event Page</h1>
        <div>{JSON.stringify(this.state)}</div>
        <form>
          <label>
            Page Title
            <input type="text" value={this.state.pageTitle} onChange={this.onChange} />
          </label>
        </form>

      </div>
    );
  }
}

export const DigitalEventsPageHooks: React.FC<{}> = ({ }) => {
  const [isShowingModal, setShowingModal] = React.useState(false)

  const [fullEvent, setFullEvent] = React.useState<DigitalEventContent>(emptyContent)

  function closeModal() {
    setShowingModal(false)
  }

  const onEnterPageTitle = (e: React.FormEvent<HTMLInputElement>) => {
    console.log("EV!! ", e.currentTarget.value)
    e.preventDefault()
    const mbValue = e.currentTarget.value
    if (mbValue) {
      setFullEvent(fe => {
        console.log("SETTING EVENT! ", fe, e.currentTarget.value ?? '')
        return { ...fe, pageTitle: mbValue }
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', border: '3px solid red' }}>
      <h3>Featured Stores</h3>

      <form>
        <label>
          Page Title:
          <input type="text" name="pageTitle" onChange={onEnterPageTitle} />
        </label>
      </form>

      {/* <div>
        {JSON.stringify(fullEvent)}
      </div> */}
      <div
        style={{ width: 100, height: 100, border: '1px solid black' }}
        onClick={() => { setShowingModal(m => !m) }}
      >
        Add Store
      </div>


      <Modal
        isOpen={isShowingModal}
        onAfterOpen={() => { }}
        onRequestClose={() => { setShowingModal(false) }}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={closeModal}>close</button>
        <div>I am a modal</div>
        <form>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </Modal>
    </div>
  )
}