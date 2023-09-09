const puppeteer = require('puppeteer');
const { writeFile } = require('fs/promises');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.nike.com/w?q=Shoes&vst=Shoes');
  const pageContent = await page.content();
  const $ = cheerio.load(pageContent);

  const productsData = [];

  $('div.product-grid__items .product-card').each((index, element) => {
    const productName = $(element).find('.product-card__title').text().trim();
    const productPrice = $(element).find('.product-card__animation_wrapper').text().trim();
    const productDescription = $(element).find('.product-card__subtitle').text().trim();
    const productImage = $(element).find('.product-card__hero-image').attr('src');

    productsData.push({
      name: productName,
      description: productDescription,
      price: productPrice,
      image: productImage,
    });
  });

  await writeFile('products.json', JSON.stringify(productsData, null, 4));
  const csvWriter = createCsvWriter({
    path: 'products.csv',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'description', title: 'Description' },
      { id: 'price', title: 'Price' },
      { id: 'image', title: 'Image' },
    ],
  });

  await csvWriter.writeRecords(productsData);

  await browser.close();
})();
