import type { App } from 'obsidian'
import {
  Notice,
  PluginSettingTab,
  Setting
} from 'obsidian'
import { HostingProvider } from './config'
import type Emo from './main'
import { t } from './lang/helpers'
import type { EmoFragment } from './base/emo-fragment'
import { CloudinaryFragment } from './fragment/fragment-cloudinary'
import { GithubFragment } from './fragment/fragment-github'
import { ImgbbFragment } from './fragment/fragment-imgbb'
import { ImgurlFragment } from './fragment/fragment-imgurl'
import { SmmsFragment } from './fragment/fragment-smms'
import { ImgurFragment } from './fragment/fragment-imgur'
import { ImgsurlFragment } from './fragment/fragment-imgsurl'
import { CatboxFragment } from './fragment/fragment-catbox'
import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY } from './base/constants'
import { CheveretoFragment } from './fragment/fragment-chevereto'
import { AlistFragment } from './fragment/fragment-alist'
import { EasyImageFragment } from './fragment/fragment-easyimage'
import {IS_DEV} from "./env";

export class EmoUploaderSettingTab extends PluginSettingTab {
  private readonly plugin: Emo
  constructor (app: App, plugin: Emo) {
    super(app, plugin)
    this.plugin = plugin
    this.setUpHandler()
  }

  display (): void {
    const { containerEl } = this
    containerEl.empty()

    // provide choices
    containerEl.createEl('h2', { text: 'Emo' })
    const pick = new Setting(containerEl)
      .setName(t('target hosting'))
      .setDesc(t('target hosting desc'))

    const fragmentList: EmoFragment[] = []
    fragmentList.push(new GithubFragment(containerEl, this.plugin))
    fragmentList.push(new ImgurFragment(containerEl, this.plugin))
    fragmentList.push(new CloudinaryFragment(containerEl, this.plugin))
    fragmentList.push(new SmmsFragment(containerEl, this.plugin))
    fragmentList.push(new ImgurlFragment(containerEl, this.plugin))
    fragmentList.push(new ImgsurlFragment(containerEl, this.plugin))
    fragmentList.push(new ImgbbFragment(containerEl, this.plugin))
    fragmentList.push(new CatboxFragment(containerEl, this.plugin))
    fragmentList.push(new CheveretoFragment(containerEl, this.plugin))
    fragmentList.push(new AlistFragment(containerEl, this.plugin))
    fragmentList.push(new EasyImageFragment(containerEl, this.plugin))

    // which one will show at the first time
    fragmentList.forEach(element => {
      element.update(this.plugin.config.choice)
    })

    const supportList: string[] = []
    for (const key in HostingProvider) {
      supportList.push(HostingProvider[key as keyof typeof HostingProvider])
    }

    pick.addDropdown((dropdown) => {
      supportList.forEach((record) => { dropdown.addOption(record, record) })
      dropdown.setValue(this.plugin.config.choice)
        .onChange(async (value) => {
          this.plugin.config.choice = value as HostingProvider
          await this.plugin.saveSettings()
          fragmentList.forEach(element => {
            element.update(this.plugin.config.choice) // update the tab when make a choice
          })
        })
    })
  }

  setUpHandler (): void {
    // handle Imgur auth
    this.plugin.registerObsidianProtocolHandler('emo-imgur-oauth', async (params) => {
      if (params.error !== undefined) {
        if(IS_DEV) {
          console.log(new Notice(t('auth error') + `${params.error}`))
        }
        return
      }
      const mappedData = params.hash.split('&').map((p) => {
        const sp = p.split('=')
        return [sp[0], sp[1]] as [string, string]
      })
      const map = new Map<string, string>(mappedData)
      localStorage.setItem(
        IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY,
        map.get('access_token') as string
      )
      this.display()
    })
  }
}
