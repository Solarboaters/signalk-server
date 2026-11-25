const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('fs')
const assert = require('node:assert/strict')
;(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox']})
 const page = await browser.newPage({viewport:{width:1366,height:430}})
 const errors=[]
 page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message)})
 await page.route('**/skServer/**', async route => {
   const pathname=new URL(route.request().url()).pathname
   const plugins=Array.from({length:77},(_,i)=>({id:`test-plugin-${i}`,name:`Test plugin ${String(i).padStart(2,'0')}`,packageName:`test-plugin-${i}`,schema:{properties:{}},data:{enabled:true,configuration:{}}}))
   const body=pathname.endsWith('/plugins')?plugins:pathname.endsWith('/webapps')?[{name:'test-logbook',signalk:{displayName:'Logbook'}}]:pathname.endsWith('/loginStatus')?{status:'loggedIn',userLevel:'admin'}:pathname.endsWith('/appstore/available')?{available:[],installed:[],installing:[],updates:[]}:['addons','requests','devices','reconciledGroups','multiSourcePaths','positionSources','ignoredInstanceConflicts','n2kDeviceStatus'].some(x=>pathname.endsWith('/'+x))?[]:{}
   await route.fulfill({json:body})
 })
 await page.route(url => url.pathname === '/signalk' || url.pathname.startsWith('/signalk/'), route => route.fulfill({json:{}}))
 await page.goto('http://127.0.0.1:4173/repro.html#/apps/configuration/-')
 await page.locator('.plugin-list-container tbody tr').first().waitFor({timeout:90000})
 const results=[]
 for(const size of [{width:1366,height:430},{width:1366,height:768},{width:1199,height:430}]){
  await page.setViewportSize(size)
  results.push(await page.locator('.plugin-list-container').evaluate(el=>({width:innerWidth,height:innerHeight,listHeight:el.clientHeight,scrollHeight:el.scrollHeight,rows:el.querySelectorAll('tbody tr').length,overflow:getComputedStyle(el).overflowY})))
 }
 await page.setViewportSize({width:1366,height:430})
 await page.screenshot({path:`ui-full-${process.argv[2]||'before'}.png`,fullPage:false})
 await page.locator('.plugin-list-container tbody tr').last().click()
 results.push({lastPluginSelected:await page.locator('.plugin-list-container tbody tr').last().getAttribute('class')})
 await page.getByPlaceholder('Filter installed plugins...').fill('Test plugin 76')
 results.push(await page.locator('.plugin-list-container').evaluate(el=>({filteredRows:el.querySelectorAll('tbody tr').length,filteredHeight:el.clientHeight})))
 await page.goto('http://127.0.0.1:4173/repro.html#/e/test_logbook')
 await page.waitForTimeout(1000)
 results.push({tabTitle:await page.title(),errors})
 if (process.argv[2] === 'after') {
  assert(results[0].listHeight >= 290)
  assert.equal(results[0].rows, 77)
  assert.equal(results[1].listHeight, 486)
  assert.equal(results[2].listHeight, results[2].scrollHeight)
  assert.equal(results[3].lastPluginSelected, 'table-active')
  assert.equal(results[4].filteredRows, 1)
  assert(results[4].filteredHeight < 100)
  assert.equal(results[5].tabTitle, 'Logbook')
  assert.deepEqual(errors, [])
 }
 fs.writeFileSync(`ui-full-${process.argv[2]||'before'}.json`,JSON.stringify(results,null,2))
 console.log(JSON.stringify(results))
 await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
