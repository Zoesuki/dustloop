import { Context, Schema ,h } from 'koishi'
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url'
import { resolve } from 'path'

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
        const element = await page.waitForSelector('#d-sidebar')
        // const imagePath = path.resolve(process.cwd(), 'static/example.png');
        await element.screenshot({path: './static/example.png'}); // path: 截屏文件保存路径
        await browser.close();
        await session.send(h.image(pathToFileURL(resolve(__dirname, '../../../static/example.png')).href));
      })();
    }
  })
}
