import { Lens } from 'monocle-ts'
import * as React from 'react'
import EdiText from 'react-editext'
import { SlideData, SlideFormData } from '../../Models/Models'


const emptySlideFormData: SlideFormData = {
  headline_copy: "",
  background_image_url: "",
  text_color_id: 1
}


export const SlideCreator: React.FC<{ mbInitialSlide?: SlideFormData, onDoneSettingFields: (sfd: SlideFormData) => void }> = ({ mbInitialSlide, onDoneSettingFields }) => {
  const [slide, setSlide] = React.useState<SlideFormData>(mbInitialSlide ?? emptySlideFormData)

  return (
    <div>
      <h3 className="text-2xl font-bold mb-10">Slide</h3>
      {/* <p>{JSON.stringify(slide)}</p> */}
      <FormInput
        label={"Headline Copy"}
        value={slide?.headline_copy ?? ""}
        onInput={e => setSlide(s => ({ ...s, headline_copy: e.target.value }))}
      />
      <div className="flex items-center">
        <div className="form-control max-w-md" style={{ marginBottom: 10, display: 'flex' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
            <span className="label-text">Background Image Url</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full max-w-md"
            onChange={e => {
              e.preventDefault()
              setSlide(cs => ({
                ...cs, background_image_url: e.target.value
              }))
            }}
          />
        </div>
        {slide.background_image_url.length > 0
          ?
          (<img className="ml-8" src={slide.background_image_url} />)
          :
          (<></>)
        }
      </div>
      {/* <label htmlFor="my-modal" className="btn modal-button">open modal</label>

      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Congratulations random Interner user!</h3>
          <p className="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p>
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn">Yay!</label>
          </div>
        </div>
      </div> */}
      {/* <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Cashback Text:
        </label>
        <EdiText type="text" value={savedCashbackStr} onSave={setCashbackText} />
      </div> */}
      <button className="btn btn-primary" type="button" onClick={() => { onDoneSettingFields(slide) }} >
        Add
      </button>
    </div>

  )
}


export const CarouselEditor: React.FC<{ curSlides: SlideFormData[] }> = ({ curSlides }) => {
  const [showSlideEditor, setShowSlideEditor] = React.useState(false)

  React.useEffect(() => {
    console.log("SHOW SLIDE EDITOR?! ", showSlideEditor)
  }, [showSlideEditor])

  return (
    <div className="flex p-8">
      {curSlides.map(cs => {
        return (
          <div>
            <h3>{cs.headline_copy}</h3>
          </div>
        )
      })}
      <button type="button" className="w-64 h-64 items-center justify-center border" onClick={() => { setShowSlideEditor(b => !b) }} >Add Slide</button>
      {/* <div className={"modal".concat(showSlideEditor ? " modal-open" : "")}> */}
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <button onClick={() => { setShowSlideEditor(false) }} className="btn btn-outline btn-small absolute right-2 top-2">x</button>
          <SlideCreator onDoneSettingFields={_ => { setShowSlideEditor(false) }} />
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn">Add Slide</label>
          </div>
        </div>
      </div>
      {/* <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Cashback Text:
        </label>
        <EdiText type="text" value={savedCashbackStr} onSave={setCashbackText} />
      </div> */}
    </div>
  )
}


const FormInput: React.FC<{ label: string, value: string, onInput: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onInput }) => {
  return (
    <div className="flex items-center my-8">
      <div className="form-control max-w-md" style={{ marginBottom: 10, display: 'flex' }}>
        <label className="label" style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          <span className="label-text">{label}</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-md"
          value={value}
          onChange={e => {
            e.preventDefault()
            onInput(e)
          }}
        />
      </div>
    </div>
  )
}