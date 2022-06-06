import * as React from 'react'
import { colorCodeToColor, SlideFormData } from '../../Models/Models'
import { StoreFinder } from '../SearchAndAddStore'


const emptySlideFormData: SlideFormData = {
  headline_copy: "",
  background_image_url: "",
  text_color_id: 1,
  store: null
}


export const SlideCreator: React.FC<{ mbInitialSlide?: SlideFormData, onDoneSettingFields: (sfd: SlideFormData) => void }> = ({ mbInitialSlide, onDoneSettingFields }) => {
  const [slide, setSlide] = React.useState<SlideFormData>(mbInitialSlide ?? emptySlideFormData)


  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-10">Slide</h3>
      {/* <p>{JSON.stringify(slide)}</p> */}
      <FormInput
        label={"Headline Copy"}
        width="80%"
        value={slide?.headline_copy ?? ""}
        onInput={e => setSlide(s => ({ ...s, headline_copy: e.target.value }))}
      />
      <div className="flex items-center w-full">
        <FormInput
          label={"Background Image Url"}
          width="90%"
          value={slide?.background_image_url ?? ""}
          onInput={e => setSlide(s => ({ ...s, background_image_url: e.target.value }))}
        />
        {slide.background_image_url.length > 0
          ?
          (<img className="ml-4" src={slide.background_image_url} style={{ width: 100 }} />)
          :
          (<></>)
        }
      </div>
      <div style={{ height: 300 }}>
        <FormLabel label="Store" />
        <div className="flex w-4/6">
          <StoreFinder
            mbInitialStore={slide.store}
            onSelect={store => {
              setSlide(s => ({ ...s, store }))
            }}
          />
        </div>
        <div className="flex items-center">
          <div className="form-control max-w-md" style={{ marginBottom: 10, display: 'flex' }}>
            <FormInput
              type='number'
              label={"Text Color Id"}
              value={slide?.text_color_id ? slide.text_color_id.toString() : ""}
              onInput={e => setSlide(s => ({ ...s, text_color_id: parseInt(e.target.value) }))}
            />
          </div>
          <div className="ml-8" style={{ width: 40, height: 40, backgroundColor: `${colorCodeToColor(slide.text_color_id)}`, border: '1px solid black' }} />
        </div>
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
      <div className="w-full flex justify-end">
        <button className="btn btn-primary w-2/6" type="button" onClick={() => {
          onDoneSettingFields(slide)
          setSlide(emptySlideFormData)
        }} >
          Add Slide
        </button>
      </div>
    </div>

  )
}


export const CarouselEditor: React.FC<{ curSlides: SlideFormData[], onAddSlide: (s: SlideFormData) => void }> = ({ curSlides, onAddSlide }) => {
  const [showSlideEditor, setShowSlideEditor] = React.useState(false)

  React.useEffect(() => {
    console.log("SHOW SLIDE EDITOR?! ", showSlideEditor)
  }, [showSlideEditor])

  return (
    <div className="flex p-8">
      {curSlides.map(cs => {
        return (
          <div className="flex flex-col border mr-8" style={{ width: 220, backgroundImage: `url(${cs.background_image_url})`, backgroundSize: 'cover' }}>
            {cs.store ?
              (
                <img src={cs.store.image_url} style={{ height: 30 }} />
              )
              :
              (<></>)
            }
            <h3 style={{ color: `${colorCodeToColor(cs.text_color_id)}` }}>{cs.headline_copy}</h3>
            {/* <img src={cs.background_image_url} /> */}
          </div>
        )
      })}
      <button type="button" className="w-64 h-64 items-center justify-center border" onClick={() => { setShowSlideEditor(b => !b) }} >
        Add Slide
      </button>
      <div className={"modal".concat(showSlideEditor ? " modal-open" : "")}>
        {/* <div className={"modal modal-open"}> */}
        <div className="modal-box max-w-screen-lg">
          <button onClick={() => { setShowSlideEditor(false) }} className="btn btn-outline btn-small absolute right-2 top-2">x</button>
          <SlideCreator
            onDoneSettingFields={slide => {
              onAddSlide(slide)
              setShowSlideEditor(false)
            }}
          />
          {/* <div className="modal-action">
            <label htmlFor="my-modal" className="btn">Add Slide</label>
          </div> */}
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


const FormInput: React.FC<{ label: string, value: string, width?: string, type?: React.HTMLInputTypeAttribute, onInput: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, type, value, onInput, width }) => {
  return (
    <div className="flex items-center my-8 w-full">
      <div className="form-control w-full" style={{ marginBottom: 10, display: 'flex' }}>
        <FormLabel label={label} />
        <input
          type={type ?? 'text'}
          className="input input-bordered max-w-full"
          style={{ width: width ?? "30%" }}
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

const FormLabel: React.FC<{ label: string }> = ({ label }) => {
  return (
    <label className="label" style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
      <span className="label-text">{label}</span>
    </label>
  )
}