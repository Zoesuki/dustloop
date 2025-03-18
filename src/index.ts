import { Context, Schema } from 'koishi'
import puppeteer from 'puppeteer';

export const name = 'dustloop'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.on('message', (session) => {
    if (session.content === '截图') {
      session.send('正在截图中...');
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://forum.koishi.xyz/'); // 打开页面
        const element = await page.waitForSelector('#main-outlet')
        await element.screenshot({path: './static/example.png'}); // path: 截屏文件保存路径
        await browser.close();
      })();
    }
  })
}
