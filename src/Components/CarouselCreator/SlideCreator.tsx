import { fromReadonly } from 'fp-ts-std/Array'
import { pipe } from 'fp-ts/lib/function'
import { indexArray } from 'monocle-ts/lib/Ix'
import * as React from 'react'
import { Backend } from '../../Backend/Api'
import { colorCodeToColor, Deal, SlideFormData } from '../../Models/Models'
import { StoreFinder } from '../SearchAndAddStore'


const emptySlideFormData: SlideFormData = {
  _tag: 'store',
  headline_copy: "",
  background_image_url: "",
  text_color_id: 1,
  store: null
}


export const SlideCreator: React.FC<{ mbInitialSlide?: SlideFormData, onDoneSettingFields: (sfd: SlideFormData) => void }> = ({ mbInitialSlide, onDoneSettingFields }) => {
  const [slide, setSlide] = React.useState<SlideFormData>(mbInitialSlide ?? emptySlideFormData)
  const [mbMatchingDeal, setMbMatchingDeal] = React.useState<Deal | null>(null)

  React.useEffect(() => {
    if (slide.dealId) {
      Backend.getDeal({ dealId: slide.dealId }).then(d => {
        setMbMatchingDeal(d)
      })
    }
  }, [slide])

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
        <div className="flex items-center w-full">
          <div className="form-control max-w-full" style={{ marginBottom: 10, display: 'flex' }}>
            <FormInput
              type="text"
              width="80%"
              label={"Deal Id? (optional)"}
              value={slide?.dealId ? slide.dealId.toString() : ""}
              onInput={e => setSlide(s => ({ ...s, dealId: parseInt(e.target.value), deal_id: parseInt(e.target.value) }))}
            />
          </div>
          {mbMatchingDeal
            ?
            (
              <div>
                <h3>{mbMatchingDeal.title}</h3>
                <img src={mbMatchingDeal.store.image_url} style={{ width: 30 }} />
              </div>
            )
            :
            (<></>)
          }
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
          Set Slide
        </button>
      </div>
    </div>

  )
}


export const CarouselEditor: React.FC<{ curSlides: SlideFormData[], onChangeSlides: (s: SlideFormData[]) => void, onRemove: (slide: SlideFormData) => void }> = ({ curSlides, onChangeSlides, onRemove }) => {
  const [showSlideEditor, setShowSlideEditor] = React.useState(false)
  const [curEditSlide, setCurEditSlide] = React.useState<null | SlideFormData>(null)

  React.useEffect(() => {
    console.log("SHOW SLIDE EDITOR?! ", showSlideEditor)
  }, [showSlideEditor])

  return (
    <div className="flex p-8">
      {curSlides.map(cs => {
        return (
          <div
            className="relative flex flex-col border  mr-8"
            style={{ width: 220, backgroundImage: `url(${cs.background_image_url})`, backgroundSize: 'cover' }}
          >
            <div
              onClick={() => { setShowSlideEditor(true); setCurEditSlide(cs) }}
              className="flex flex-col cursor-pointer w-full h-full"
            >
              {cs.store ?
                (
                  <img src={cs.store.image_url} style={{ height: 30 }} />
                )
                :
                (<></>)
              }
              <h3 style={{ color: `${colorCodeToColor(cs.text_color_id)}` }}>{cs.headline_copy}</h3>
            </div>
            <div className="z-20 flex  justify-between absolute bottom-0 left-0 right-0" style={{ height: 30 }}>
              <button
                className="flex justify-center items-center bg-white"
                style={{ height: 20, width: 20, border: '1px dashed black', borderRadius: 10 }}
                onClick={() => { onRemove(cs) }}
              >
                X
              </button>
              {/* <button
                className="btn btn-info"
                onClick={() => { setCurEditSlide(cs); setShowSlideEditor(true) }}
              >
                Edit
              </button> */}
            </div>
            {/* <img src={cs.background_image_url} /> */}
          </div>
        )
      })}
      <button
        type="button" className="w-64 h-64 items-center justify-center border"
        onClick={() => { setCurEditSlide(null); setShowSlideEditor(true) }}
      >
        Add Slide
      </button>
      <div className={"modal".concat(showSlideEditor ? " modal-open" : "")}>
        {/* <div className={"modal modal-open"}> */}
        <div className="modal-box max-w-screen-lg">
          <button onClick={() => { setShowSlideEditor(false) }} className="btn btn-outline btn-small absolute right-2 top-2">x</button>
          {showSlideEditor
            ?
            (
              <SlideCreator
                mbInitialSlide={curEditSlide ?? emptySlideFormData}
                onDoneSettingFields={slide => {
                  console.log("CUR EDIT SLIDE ! ", curEditSlide)
                  if (curEditSlide) {
                    const match = curSlides.findIndex(cs => cs.headline_copy === curEditSlide.headline_copy)
                    console.log("MATCH! ", match)
                    if (match !== -1) {
                      const lnz = indexArray<SlideFormData>().index(match)
                      onChangeSlides(pipe(lnz.set(slide)(curSlides), fromReadonly))
                    }
                  } else {
                    onChangeSlides([...curSlides, slide])
                  }
                  setShowSlideEditor(false)
                }}
              />
            )
            :
            (<></>)
          }
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