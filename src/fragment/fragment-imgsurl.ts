import { Setting } from 'obsidian'
import type Emo from '../main'
import { EmoFragment } from '../base/emo-fragment'
import { HostingProvider } from '../config'
import { t } from '../lang/helpers'

export class ImgsurlFragment extends EmoFragment {
  constructor (el: HTMLElement, plugin: Emo) {
    super(HostingProvider.ImgsURL, el, plugin)
  }

  display (el: HTMLElement, plugin: Emo): void {
    const parms = plugin.config.imgsurl_parms
    el.createEl('h3', { text: t('ImgsURL Settings') })

    new Setting(el)
      .setName('Upload URL')
      .addText((text) => {
        text
          .setValue(parms.required.url)
          .onChange(async (value) => {
            parms.required.url = value
            await plugin.saveSettings()
          })
      })
  }
}
