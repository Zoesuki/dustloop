import { Context, Schema ,h } from 'koishi'
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url'
import { resolve } from 'path'

export const name = 'dustloop'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

function getMainContainerByH3Content(h3Content) {
  const h3Elements = document.querySelectorAll('.mw-headline');
  let currentElement: any
  for (const h3 of h3Elements) {
      if (h3.textContent === h3Content) {
          currentElement = h3.parentElement;
          while (currentElement.nextElementSibling) {
              if (currentElement.nextElementSibling.classList.contains('main-container')) {
                  return currentElement.nextElementSibling;
              }
              currentElement = currentElement.nextElementSibling;
          }
      }
  }
  return currentElement;
}

export function apply(ctx: Context) {
  ctx.on('message', (session) => {
    let contents = session.content.split(' ')
    console.log(contents);
    if (contents[0] === '截图') {
      session.send('正在截图中...');
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.dustloop.com/w/BBCF/Susano'); // 打开页面
        console.log(await page.waitForSelector('#' + contents[1].toUpperCase()));
        // const element = await page.waitForSelector('#d-sidebar')
        // await element.screenshot({path: './static/example.png'}); // path: 截屏文件保存路径
        // await browser.close();
        // await session.send(h.image(pathToFileURL(resolve(__dirname, '../../../static/example.png')).href));
      })();
    }
  })
}
