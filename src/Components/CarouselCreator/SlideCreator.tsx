import { Lens } from 'monocle-ts'
import * as React from 'react'
import EdiText from 'react-editext'
import { SlideData } from '../../Models/Models'


interface SlideFormData {
  headline_copy: string
}

const emptySlideFormData: SlideFormData = {
  headline_copy: ""
}

export const SlideCreator: React.FC<{ mbInitialSlide?: SlideFormData, onDoneSettingFields: () => void }> = ({ mbInitialSlide, onDoneSettingFields }) => {
  const [slide, setSlide] = React.useState<SlideFormData>(mbInitialSlide ?? emptySlideFormData)

  return (
    <div>
      <h3 className="text-2xl font-bold mb-10">Banner</h3>
      <div style={{ marginBottom: 10, display: 'flex' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginRight: 10, fontWeight: 'bold' }}>
          Headline Copy:
        </label>
        <EdiText
          type="text"
          value={slide?.headline_copy ?? ""}
          onSave={(hc: string) => setSlide(s => ({ ...s, headline_copy: hc }))}
        />
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