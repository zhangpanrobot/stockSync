'use strict';

console.log('\'Allo \'Allo! Popup');

chrome.browserAction.onClicked.addListener(function(tab){
    console.log(tab);
});
