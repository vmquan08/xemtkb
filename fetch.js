import axios from 'axios';
import { createRequire } from 'node:module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

const base_url = 'https://thptbencat.edu.vn';
const sheet_name = 'TKBLop';

async function getScheduleLink() {
    const response = await axios.get(base_url + '/category/thoi-khoa-bieu');
    const $ = cheerio.load(response.data);
    const href = $('.col-sm-9 a').attr('href');
    const fullLink = base_url + href;
    
    const res = await axios.get(fullLink);
    const $$ = cheerio.load(res.data);
    const ggsheetLink = $$('a[href*="https://docs.google.com/spreadsheets/d/"]').attr('href');

    return ggsheetLink;
}

async function main() {
    const ggsheetLink = await getScheduleLink();
    const csvLink = ggsheetLink.replace(/\/edit.*$/, `/gviz/tq?tqx=out:csv&sheet=${sheet_name}`);
    const res = await axios.get(csvLink);
    
    const rows = res.data.split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    fs.writeFileSync('data/schedule.json', JSON.stringify(rows, null, 2));
}

main();
