function $(selector) {
    return document.querySelectorAll(selector);
}

function requestTo(obj) { //send to background
    chrome.extension.sendRequest(obj);
}

var currentPage = location.href;

function getDuibaData(){
    var orders = $('tbody tr.title');
    var orderData = {};
    [].slice.call(orders).forEach(function(item){
       orderData[item.querySelector('span').innerText] =  item.querySelector('td:nth-child(6)').innerText;
    });
    //数据传给background
    requestTo({
        cmd: "orderData",
        data: orderData
    });
}

function init(){
    if(~currentPage.indexOf('http://www.duiba.com.cn/appDataReport/itemDetailSearch')) {
        // 兑吧订单页
        // 得到兑吧销量
        getDuibaData();
    }
}

init();

chrome.extension.onRequest.addListener(function(msg, sender) {
    switch(msg.cmd) {
        case 'init':
            // init();
            break;
        default:
            break;
    }
});


// 更新红包后台库存(减去兑吧销量)
// 得到的结果更新到兑吧各商品库存
