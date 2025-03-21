import { Context, Schema ,h } from 'koishi'
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'url'
import { resolve } from 'path'

export const name = 'dustloop'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

function getCharacterName(input) {
  // 定义映射关系
  const statusMap = {
    Susano: 'Susano',
    黑面: 'Susano',
    素盏鸣尊: 'Susano',
    麻衣: 'Mai_Natsume'
  };
  // 校验输入类型
  if (typeof input !== 'string') {
    throw new TypeError('请输入一个字符串');
  }
  // 查找映射结果
  const result = statusMap[input];
  // 处理未知输入
  if (result === undefined) {
    return '';
  }
  return result;
}

export function apply(ctx: Context) {
  ctx.on('message', async (session) => {
    let contents = session.content.split(' ')
    console.log(contents);
    if (contents[0] === '截图') {
      session.send('正在截图中...');
      const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        protocolTimeout: 240000,
        defaultViewport: { width: 1920, height: 1080 }
      });
      // const browser = await puppeteer.launch()
      // const pages = await browser.pages();
      let targetPage = await browser.newPage();;
      const orderName = contents[2].toUpperCase(); // 提取指令名称
      // let processedOrderName = orderName;
      // if (orderName.startsWith('J')) {
      //   processedOrderName = 'j.' + orderName.slice(1);
      // } else {
      //   processedOrderName = processedOrderName.replace(/(d+)([A-Z])/g, '\\3$1 $2');
      // }
      const characterName = getCharacterName(contents[1])
      const targetUrl = 'https://www.dustloop.com/w/BBCF/' + characterName;
      if(!targetUrl){
        session.send('未找到角色');
        return;
      }
      await targetPage.setViewport({ width: 1920, height: 1080 });
      try {
        await targetPage.goto(targetUrl, { timeout: 120000, waitUntil: 'networkidle2' });
      } catch (error) {
        console.error('页面加载失败:', error);
        session.send('页面加载超时，请稍后重试');
        await targetPage.close();
        return;
      }
      const elements = await targetPage.$$('h3');
      let targetElement = null;
      
      for (const element of elements) {
        const hasTargetText = await element.evaluate(async (el, name) => {
          const checkChildrenRecursively = (node, depth = 0) => {
            if (depth > 3) return false;
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(name)) {
              return true;
            }
            for (const child of node.childNodes) {
              if (checkChildrenRecursively(child, depth + 1)) {
                return true;
              }
            }
            return false;
          };
          return checkChildrenRecursively(el);
        }, orderName);

        if (hasTargetText) {
          const parent = await element.evaluateHandle(el => el.parentElement);
          if (!parent) continue;
          targetElement = await parent.evaluateHandle(el => el.nextElementSibling);
          console.log('已找到目标元素');
          break;
        }
      }
      
      if (!targetElement) {
        session.send('未找到对应技能信息');
        await targetPage.close();
        return;
      }
      
      const currentElement = targetElement;
      await currentElement.screenshot({path: `./static/${characterName}_${orderName}.png`}); // path: 截屏文件保存路径
      await session.send(h.image(pathToFileURL(resolve(__dirname, `../../../static/${characterName}_${orderName}.png`)).href));
      await targetPage.close();
    }
  })
}
