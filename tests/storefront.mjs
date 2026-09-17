// Browser regression suite. Set PLAYWRIGHT_MODULE / CHROMIUM_EXECUTABLE if needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products } from '../src/data/products.js';
import { galleryImages, imagePreview } from '../src/media.js';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE || '/opt/homebrew/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || '/Users/mustafa/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const origin=process.env.TEST_ORIGIN || 'http://localhost:3000';
fs.mkdirSync('work/qa',{recursive:true});
const errors=[];const results=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});
function monitor(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error' && !m.text().includes('503'))errors.push(m.text());});}
monitor(page);
async function go(route,p=page){await p.goto(origin+'/#/'+route);await p.locator('main').waitFor();await p.evaluate(()=>document.fonts.ready);}
async function decoded(p=page){await p.locator('.primary-photograph').evaluate(img=>img.decode());}
async function photoRect(p=page){return p.locator('.product-stage').evaluate(stage=>{const r=stage.getBoundingClientRect(),i=stage.querySelector('img');const scale=Math.min(r.width/i.naturalWidth,r.height/i.naturalHeight);const w=i.naturalWidth*scale,h=i.naturalHeight*scale;return{x:r.x+(r.width-w)/2,y:r.y+(r.height-h)/2,w,h};});}
async function validateZoom(p=page){
 const state=await p.locator('.gallery-primary').evaluate(root=>{
  const stage=root.querySelector('.product-stage'),photo=stage.querySelector('img'),lens=root.querySelector('.zoom-lens'),panel=root.querySelector('.zoom-preview'),zoom=panel.querySelector('img');
  const s=stage.getBoundingClientRect(),l=lens.getBoundingClientRect(),z=zoom.getBoundingClientRect(),r=panel.getBoundingClientRect();
  const fit=Math.min(s.width/photo.naturalWidth,s.height/photo.naturalHeight),w=photo.naturalWidth*fit,h=photo.naturalHeight*fit;
  const ix=s.x+(s.width-w)/2,iy=s.y+(s.height-h)/2;
  return{active:panel.classList.contains('is-active'),lens:{x:l.x-ix,y:l.y-iy,w:l.width,h:l.height},image:{w,h},preview:{w:r.width,h:r.height},offset:{x:r.x-z.x,y:r.y-z.y},zoom:{w:z.width,h:z.height},natural:photo.naturalWidth};
 });
 assert.ok(state.active,'magnifier activates on actual image');
 const {lens:l,image:i,zoom:z,preview:r,offset:o}=state;
 assert.ok(l.x>=-.2 && l.y>=-.2 && l.x+l.w<=i.w+.2 && l.y+l.h<=i.h+.2,'lens is inside actual image');
 const factor=z.w/i.w;
 assert.ok(Math.abs(l.w*factor-r.w)<1 && Math.abs(l.h*factor-r.h)<1,'lens covers exact preview area');
 assert.ok(Math.abs(l.x*factor-o.x)<1 && Math.abs(l.y*factor-o.y)<1,'preview translates to lens crop');
 assert.ok(z.w<=state.natural+.1,'zoom never exceeds original pixels');
 return state;
}
try{
 const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/original-catalog.json',import.meta.url)));
 assert.deepEqual(products.slice(0,baseline.length),baseline,'all original product records unchanged');
 assert.equal(products.length,16);assert.equal(new Set(products.map(p=>p.id)).size,16);
 for(const product of products){
  assert.ok(product.sizes.length);assert.ok(!('price' in product));
  for(const src of galleryImages(product)){
   assert.ok(fs.existsSync('public'+src),src);
   for(const width of [160,480,960])assert.ok(fs.existsSync('public'+imagePreview(src,width)));
  }
 }
 results.push('Original 13 product records unchanged; 3 sourced additions; all gallery assets and derivatives exist.');
 for(const route of ['', 'shop', ...products.map(p=>'product/'+p.slug),'about','contact','faq','size-guide','shipping-returns','missing-route','product/missing']){
  await go(route);assert.equal(await page.locator('h1').count(),1,route);
  if(route.startsWith('product/') && route!=='product/missing')await decoded();
 }
 results.push('All 16 PDPs, all supporting routes, and missing-route states render.');
 for(const width of [1440,1280,1024]){
  await page.setViewportSize({width,height:1000});
  for(const slug of ['blue-gingham-dress-x4991','red-ruffle-dress-x5672','pink-floral-top-x5010','ivory-tulip-dress-x5014']){
   await go('product/'+slug);await decoded();
   const r=await photoRect();
   for(const [label,x,y] of [['top-left',.005,.005],['top-right',.995,.005],['bottom-left',.005,.995],['bottom-right',.995,.995],['center',.5,.5]]){
    await page.mouse.move(r.x+r.w*x,r.y+r.h*y);await page.waitForTimeout(160);await validateZoom();
    if(width===1440 && slug==='blue-gingham-dress-x4991')await page.screenshot({animations:'disabled',path:`work/qa/zoom-${label}.png`});
   }
   // Sweep the photograph, checking every sampled position for flicker or stale bounds.
   for(let n=0;n<=12;n++){await page.mouse.move(r.x+r.w*(.01+.98*n/12),r.y+r.h*(.01+.98*n/12));await validateZoom();}
   await page.mouse.move(20,150);await page.waitForTimeout(150);assert.equal(await page.locator('.zoom-preview.is-active').count(),0);
   if(await page.locator('.thumbnail-rail button').count()>1){
    await page.locator('.thumbnail-rail button').nth(1).click();await decoded();const next=await photoRect();await page.mouse.move(next.x+next.w/2,next.y+next.h/2);await validateZoom();
   }
  }
 }
 results.push('Magnifier: 60 corner/center checks and 156 sweep samples pass across 3 widths and 4 image shapes; thumbnail switching and route remounts pass.');
 // Resize while zooming and confirm calculations are rebuilt on the next movement.
 await page.setViewportSize({width:1280,height:900});await decoded();let r=await photoRect();await page.mouse.move(r.x+r.w*.6,r.y+r.h*.6);await validateZoom();
 await page.setViewportSize({width:1440,height:1000});await decoded();r=await photoRect();await page.mouse.move(r.x+r.w*.4,r.y+r.h*.4);await validateZoom();
 await go('shop');await page.getByRole('button',{name:'Tops',exact:true}).click();assert.equal(await page.locator('.product-card').count(),5);
 await page.getByLabel('Filter by size').selectOption('1-2Y');assert.equal(await page.locator('.product-card').count(),1);
 await page.getByLabel('Filter by colour').selectOption('Pink');assert.equal(await page.locator('.product-card').count(),0);
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.locator('.product-card').count(),16);
 await page.getByRole('button',{name:'Search products',exact:true}).click();await page.getByLabel('Search the collection',{exact:true}).fill('LX0063');assert.equal(await page.locator('.search-results>a').count(),1);
 await page.locator('.search-results>a').click();await page.waitForURL('**/#/product/sage-babydoll-blouse-lx0063');assert.equal(await page.locator('.search-dialog').count(),0);
 assert.ok(await page.getByRole('button',{name:'Select a size to add'}).isDisabled());
 await page.getByRole('button',{name:'1-2Y',exact:true}).click();await page.getByRole('button',{name:'Increase quantity',exact:true}).click();await page.getByRole('button',{name:'Add to bag',exact:true}).click();
 assert.ok(await page.locator('.drawer-layer').evaluate(d=>d.open));assert.match(await page.locator('.cart-item').innerText(),/Sage Sleeveless Babydoll Blouse/);
 for(let n=0;n<10;n++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.querySelector('.drawer-layer').contains(document.activeElement)));}
 await page.locator('.cart-item').getByRole('button',{name:'Increase quantity'}).click();assert.equal(await page.locator('.cart-item .quantity-control span').innerText(),'3');
 await page.keyboard.press('Escape');await page.reload();await page.getByRole('button',{name:'Open bag, 3 items'}).click();assert.equal(await page.locator('.cart-item .quantity-control span').innerText(),'3');
 await page.addInitScript(()=>{window.open=(url)=>{window.__orderUrl=url;return null;};});await page.reload();await page.getByRole('button',{name:'Open bag, 3 items'}).click();
 await page.getByRole('button',{name:'Enquire on WhatsApp'}).click();const order=await page.evaluate(()=>window.__orderUrl);assert.match(decodeURIComponent(order),/LX0063/);assert.match(decodeURIComponent(order),/Size: 1-2Y/);assert.match(decodeURIComponent(order),/Qty: 3/);
 await page.getByRole('button',{name:'Remove',exact:true}).click();assert.ok(await page.getByText('Your bag is waiting.').isVisible());await page.keyboard.press('Escape');
 // Add every new item through quick add, using only its real supplied sizes.
 for(const product of products.slice(13)){
  await go('shop');const card=page.locator('.product-card').filter({has:page.getByRole('heading',{name:product.name,exact:true})});
  await card.getByRole('button',{name:'Quick add '+product.name,exact:true}).click();await card.getByRole('button',{name:'2-3Y',exact:true}).click();await page.keyboard.press('Escape');
 }
 await page.getByRole('button',{name:'Open bag, 3 items'}).click();assert.equal(await page.locator('.cart-item').count(),3);await page.screenshot({animations:'disabled',path:'work/qa/bag-verified.png'});await page.keyboard.press('Escape');
 results.push('Search, combined filters, all new quick-add items, real sizes, quantities, removal, persistence, focus trap, and WhatsApp enquiry payload pass. No message sent.');
 for(const width of [1440,1280,1024,768,430,390,375]){
  await page.setViewportSize({width,height:900});
  for(const route of ['','shop','product/ivory-tulip-dress-x5014','size-guide']){
   await go(route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow at ${width}`);
  }
 }
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const mobile=await touch.newPage();monitor(mobile);
 await go('product/ivory-tulip-dress-x5014',mobile);await decoded(mobile);await mobile.getByRole('button',{name:'Expand Ivory Tulip Dress photograph'}).tap();assert.ok(await mobile.locator('.image-viewer').evaluate(d=>d.open));assert.equal(await mobile.locator('.zoom-preview.is-active').count(),0);
 await mobile.getByRole('button',{name:'+ Zoom in',exact:true}).tap();assert.ok(await mobile.locator('.viewer-viewport').evaluate(el=>el.scrollWidth>el.clientWidth && el.scrollHeight>el.clientHeight));
 const cdp=await touch.newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:90,y:210}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await mobile.waitForTimeout(250);const pan=await mobile.locator('.viewer-viewport').evaluate(el=>({x:el.scrollLeft,y:el.scrollTop}));assert.ok(pan.x>0 && pan.y>0);await mobile.screenshot({animations:'disabled',path:'work/qa/mobile-zoom.png'});
 await mobile.getByRole('button',{name:'Next image',exact:true}).tap();assert.equal(await mobile.locator('.viewer-viewport.is-zoomed').count(),0);await mobile.getByRole('button',{name:'Close image viewer'}).tap();assert.equal(await mobile.locator('.image-viewer').count(),0);
 await mobile.getByRole('button',{name:'Open menu',exact:true}).tap();await mobile.locator('.main-nav').getByRole('link',{name:'Dresses',exact:true}).tap();await mobile.waitForURL('**/#/shop?type=Dress');await mobile.locator('.shop-page').waitFor();assert.equal(await mobile.locator('.product-card').count(),7);
 await mobile.getByRole('button',{name:'Search products',exact:true}).tap();await mobile.getByLabel('Search the collection',{exact:true}).fill('X5013');await mobile.screenshot({animations:'disabled',path:'work/qa/mobile-search.png'});assert.equal(await mobile.locator('.search-results>a').count(),1);await mobile.getByRole('button',{name:'Close search',exact:true}).tap();
 await page.emulateMedia({reducedMotion:'reduce'});await go('');assert.equal(await page.locator('.fashion-hero-images').evaluate(e=>getComputedStyle(e).animationName),'none');
 results.push('Seven responsive widths pass; touch gallery expands, zooms, pans by touch, switches photos and closes; mobile menu/search and reduced motion pass.');
 assert.deepEqual(errors,[],'browser errors');results.push('No browser console errors or uncaught exceptions.');
 console.log(results.join('\n'));fs.writeFileSync('work/qa/test-results.json',JSON.stringify({passed:true,results,errors},null,2));
}finally{await browser.close();}
