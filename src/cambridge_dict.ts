import {launch, Browser, Page, ElementHandle} from 'puppeteer';
import { Vocabulary, Definition } from '.';

let browser: Browser;
async function ensureInitBrowser() {
    browser = browser || await launch();
    return browser;
}

async function lookup(queryText: string) : Promise<Vocabulary> {
    queryText = queryText.trim().replace(' ', '-');

    let browser = await ensureInitBrowser();
    let page : Page | undefined;
    try {
        console.time("open_page");
        let page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        let response = await page.goto("https://dictionary.cambridge.org/us/dictionary/english-chinese-traditional/" + queryText);
        console.timeEnd("open_page");

        console.time("parse");
        parse0(page);
        parse(await page.$('body'));
        //VocabularyImpl.parse(page)
        console.timeEnd("parse");

        // console.time("screenshot");
        // await page.screenshot({path: `${queryText}.png`, fullPage: true});
        // console.timeEnd("screenshot");
    } finally {
        if(page != undefined) await page.close();
    }
    return {} as Vocabulary;
}

async function parse(node: ElementHandle | null) {
    if(node == null) return;

    let selector = '#entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > div.h3.di-title.cdo-section-title-hw > span.headword > span.hw';
    let headword = await node.$eval(selector, element => element.textContent) || '';

    console.log(headword);
}

async function parse0(page: Page) {
    let s = '#entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > div.h3.di-title.cdo-section-title-hw > span.headword > span.hw';
    
    let headword = await page.evaluate((selector) => {
        return document.querySelector(selector).textContent;
    }, s);

    console.log(`parse0 ${headword}`);
}

class VocabularyImpl implements Vocabulary {
    static parse(page: Page) {
    }

    get selector() { return "div.di-body"};

    readonly pNode : ElementHandle;

    node : ElementHandle | undefined;
    _text:        string | undefined;
    _pos:         string | undefined;
    _ipa:         string | undefined;
    _audio:       string | undefined;
    _definitions: Definition[] | undefined;
    
    get version() {
        return 1;
    }

    // #entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > div.h3.di-title.cdo-section-title-hw > span.headword > span.hw
    get text() {
        if(this._text == null) {
            this._text = this.parseText();
        }
        return this._text;
    }

    // #entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > div.h3.di-title.cdo-section-title-hw > span.posgram.ico-bg > span.pos
    get pos() {
        return "";
    }

    // #entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > span:nth-child(3) > span:nth-child(2) > span
    get ipa() {
        return "";
    }

    // #entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-header > span:nth-child(3) > span:nth-child(1) > span.circle.circle-btn.sound.audio_play_button
    get audio() {
        return "";
    }

    // #entryContent > div.cdo-dblclick-area > div > div.di-body > div > div > div > div.pos-body >
    // ---> this is definition 1
    // div.sense-block                  .sense-body  .def-block                
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > p > b
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > span
    // ---> this is example 1
    //                                                                         .examp
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(2) > span.eg
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(2) > span.trans
    // ---> this is example 2
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(3) > span.eg
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(3) > span.trans
    // ---> this is example 1
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(4) > span.eg
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(1) > span > div:nth-child(4) > span.trans
    //
    // ---> this is definition 2
    // #english-chinese-traditional-1-1-1 > div > div:nth-child(2) > p > b
    // ---> this is phrase
    // #english-chinese-traditional-1-1-1 > div > div.phrase-block.pad-indent > span > span > span
    // ---> this is phrase def                                                                  
    // #english-chinese-traditional-1-1-1 > div > div.phrase-block.pad-indent > div > div > p > b.def
    // #english-chinese-traditional-1-1-1 > div > div.phrase-block.pad-indent > div > div > span > span.trans
    // #english-chinese-traditional-1-1-1 > div > div.phrase-block.pad-indent > div > div > span > div > span.eg
    // #english-chinese-traditional-1-1-1 > div > div.phrase-block.pad-indent > div > div > span > div > span.trans

    get definitions() {
        return [];
    }


    constructor(node: ElementHandle) {
        this.pNode = node;
    }

    static SELECTOR = ".di-body";

    build() {

    }

    parseText() : string {
        return "";
    }
}

(async () => {
    await lookup("absolutely");
    await lookup("jump");
})();

