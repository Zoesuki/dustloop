const puppeteer = require('puppeteer-core');

(async () => {
    // const browser = await puppeteer.launch({
    //     headless: false,
    //     defaultViewport: { width: 1920, height: 1080 },
    //     executablePath: 'D:\\code\\webshot\\node_modules\\puppeteer\\chrome-win\\chrome.exe'
    // });
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: { width: 1920, height: 1080 }
    });

    // const browser = await puppeteer.launch()

    const pages = await browser.pages();
    console.log(pages);
    
    const page = pages[0];
    // const page = await browser.newPage();
    // await page.goto('https://www.dustloop.com/w/BBCF/Susano%27o');
    // await page.evaluate(() => {
    //     window.scrollTo({
    //         top: document.body.scrollHeight,
    //         behavior: 'smooth'
    //     });
    // });
    const element = await page.$('#\\36 A');
    const currentElement = await element.evaluateHandle(el => {
        const parent = el.parentElement;
        console.log('Parent element:', parent);
        if (!parent) return null;
        const nextSibling = parent.nextElementSibling;
        console.log('Next sibling element:', nextSibling);
        return nextSibling || null;
    });
    console.log('已找到',currentElement);
    
    // console.log(await parentElement.evaluate(el => el.outerHTML));
    
    await currentElement.screenshot({path: './static/example.png'}); // path: 截屏文件保存路径
    console.log('截图完成');
    
})();