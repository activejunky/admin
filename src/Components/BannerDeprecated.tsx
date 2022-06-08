import * as React from 'react'
import * as O from 'fp-ts/Option'
import EdiText from 'react-editext'
import { useDispatch, useSelector } from 'react-redux'
import { Backend, s3BaseUrl } from '../Backend/Api'
import { useCurId } from '../Hooks/UseCurId'
import { Handoff, HeadlessDigitalEvent } from '../Models/Models'
import { Dispatch, RootState } from '../Pages/CreateDigitalEventsPageVM'
import { StoreIcon } from '../Views/StoreIcon'
import { EditHandoffModal } from './HandoffModal'



const EditBanner: React.FC<{ mbInitialDE?: HeadlessDigitalEvent }> = ({ mbInitialDE }) => {
  const banner = useSelector((state: RootState) => state.editModel.de.content.banner)
  const dispatch = useDispatch<Dispatch>()
  const [savedTitle, setSavedTitle] = React.useState(banner.title)
  const [savedMainCopy, setSavedMainCopy] = React.useState(banner.main_copy ?? "")
  const [savedCashbackStr, setCachbackStr] = React.useState(banner.cashBackString)
  const [handoff, setHandoff] = React.useState(banner.handoff)
  const [savedImageUrl, ssiurl] = React.useState(banner.backgroundImageUrl ?? "")
  const [textColorId, setSavedTextColorId] = React.useState(banner.text_color_id ?? 0)
  const curId = useCurId()
  const [isHandoffModalOpen, setIsHandoffModalOpen] = React.useState(false)

  React.useEffect(() => {
    setSavedTitle(banner.title)
    setCachbackStr(banner.cashBackString)
    ssiurl(banner.backgroundImageUrl ?? "")
    setHandoff(banner.handoff)
    setSavedTextColorId(banner.text_color_id ?? 0)
    setSavedMainCopy(banner.main_copy ?? "")
  }, [banner])

  const setBannerTitle = (v: string) => {
    // setSavedTitle(v)
    dispatch.editModel.setBannerTitle(v)
  }

  const setCashbackText = (v: string) => {
    dispatch.editModel.setBannerCachback(v)
  }

  const setBannerImageUrl = (v: string) => {
    dispatch.editModel.setBannerImageUrl(v)
  }

  const setBannerTextColorId = (v: string) => {
    dispatch.editModel.setBannerTextColorId(parseInt(v))
  }

  const divStyleBase: React.CSSProperties = {
    width: '100%', border: '3px solid black', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
  }


  React.useEffect(() => {
    console.log("SAVED IMAGE URL! ", savedImageUrl)
  }, [savedImageUrl])

  const onInputFile = (evt: React.FormEvent<HTMLInputElement>) => {
    const files = evt.currentTarget.files
    if (files) {
      dispatch.editModel.setIsFetching(O.some(''))
      Backend.uploadImage(files[0], curId).then(r => {
        console.log("UPLOADED FILE! ")
        const s3Url = `${s3BaseUrl}/${curId}`
        dispatch.editModel.setBannerImageUrl(s3Url)
        dispatch.editModel.setIsFetching(O.none)
      })
    }
  }

  return (
    <div style={divStyleBase}>
      <h3 className="text-2xl font-bold mb-10">Banner</h3>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Headline Copy:
        </label>
        <EdiText type="text" value={savedTitle} onSave={setBannerTitle} />
      </div>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Main Copy:
        </label>
        <EdiText type="text" value={savedMainCopy} onSave={mc => {
          dispatch.editModel.setBannerMainCopy(mc)
        }} />
      </div>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Cashback Text:
        </label>
        <EdiText type="text" value={savedCashbackStr} onSave={setCashbackText} />
      </div>

      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Text Color Id:
        </label>
        <EdiText type="text" value={textColorId.toString()} onSave={setBannerTextColorId} />
      </div>

      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Handoff:
        </label>
        {handoff ?
          (
            <CurHandoffView handoff={handoff} onEdit={() => setIsHandoffModalOpen(f => !f)} />
          )
          :
          (
            <button
              className="border p-2 rounded-med rounded-md"
              onClick={() => { setIsHandoffModalOpen(f => !f) }}>
              Set handoff
            </button>
          )
        }
        <EditHandoffModal
          modalProps={{
            isOpen: isHandoffModalOpen,
            onRequestClose: () => { setIsHandoffModalOpen(false) }
          }}
          // onClose={() => { setIsHandoffModalOpen(false) }}
          onConfirmAdd={(handoff) => {
            dispatch.editModel.setBannerHandoff(handoff)
            setIsHandoffModalOpen(false)

          }}
          onSubmit={() => { }}
        />
      </div>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Background Image Url:
        </label>
        <EdiText type="text" value={savedImageUrl} onSave={setBannerImageUrl} />
        {banner.backgroundImageUrl
          ?
          (<img src={banner.backgroundImageUrl} style={{ width: 200, height: 100, border: '1px solid black' }} />)
          :
          (<></>)
        }
        <input type="file" title='Upload file' onChange={onInputFile} />
      </div>
    </div>
  )
}

const CurHandoffView: React.FC<{ handoff: Handoff, onEdit: () => void }> = ({ handoff, onEdit }) => {
  switch (handoff.tag) {
    case 'storeHandoff':
      return (
        <div className="flex items-center">
          <StoreIcon ajStore={handoff.store} height={100} />
          <button
            className="border p-2 rounded-med rounded-md"
            onClick={onEdit}>
            Edit
          </button>
        </div>
      )
    case 'dealHandoff':
      return (
        <div className="flex items-center">
          <div>Deal Id: {handoff.dealId}</div>
          <StoreIcon ajStore={handoff.store} height={100} />
          <button
            className="border p-2 rounded-med rounded-md"
            onClick={onEdit}>
            Edit
          </button>
        </div>
      )
    case 'customUrlHandoff':
      return (
        <></>
      )

  }
}
