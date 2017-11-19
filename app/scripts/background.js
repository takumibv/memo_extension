// Enable chromereload by uncommenting this line:
import 'chromereload/devonly'
const $ = require('jquery');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

chrome.browserAction.setBadgeText({
  text: `'Allo`
})
$(function(){
  console.log("jquery");
});
console.log(`'Allo 'Allo! Event Page for Browser Action`)
