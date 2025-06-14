import type { RequestUrlParam } from 'obsidian'
import { request } from 'obsidian'
import type { ImgsurlParms } from '../parms/parms-imgsurl'
import { EmoFormData } from '../utils/emo-formdata'
import { EmoUploader } from '../base/emo-uploader'
import { CONTENT_TYPE_FORMDATA } from '../base/constants'

export class ImgsurlUploader extends EmoUploader {
  parms!: ImgsurlParms;
  constructor(imgsurlParms: ImgsurlParms) {
    super();
    this.parms = imgsurlParms;
  }

  // 只在 URL 末尾添加/upload
  formatUrl(str: string): string {
    return str.endsWith('/upload') ? str : str + '/upload';
  }

  // 只移除 URL 末尾的/upload
  removeTrailingUpload(str: string): string {
    return str.replace(/\/upload$/, '');
  }

  async upload (file: File): Promise<string> {
    const domain = this.formatUrl(this.parms.required.url);
    const formData = new EmoFormData()
    await formData.add('file', file)
    const req: RequestUrlParam = {
      url: domain,
      method: 'POST',
      headers: {
        'Content-Type': CONTENT_TYPE_FORMDATA
      },
      body: formData.getBody()
    }

    return await new Promise((resolve, reject) => {
      request(req).then((res) => {
        const json = JSON.parse(res);
        if (json.success) {
          const baseUrl = this.removeTrailingUpload(this.parms.required.url);
          const id = json.data.id;
          const type = json.data.type.split('/')[1];
          const url = `${baseUrl}/v2/${id}.${type}`;
          const markdownText = `![ImgsURL](${url as string})`;
          resolve(markdownText);
        } else {
          reject(new Error('Upload failed'));
        }
      }).catch(err => {
        reject(err)
      })
    })
  }
}
