import type { EmoParms } from '../base/emo-parms'

export interface ImgsurlParms extends EmoParms {
  required: Required
}
interface Required {
  url: string
}
export const IMGSURL_DEFAULT_PARMS: ImgsurlParms = {
  required: {
    url: ''
  }
}
