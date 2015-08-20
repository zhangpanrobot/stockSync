function sendInfo(cmd, info, id) {
    chrome.tabs.sendRequest(id, {
        cmd: cmd,
        data: info
    });
}

//流程
var config = {
    productEnv: 'http://mall-admin.hongbaosuoping.com/',
    devEnv: 'http://b-mall-admin.aa123bb.com/'
};

var orderData = {};

var dataUrl = {
    salesPage: 'http://www.duiba.com.cn/appDataReport/itemDetailSearch?appId=1452&max=1000&orderBy=orderCount&state=desc&dateBetween={currentDay}+-+{currentDay}',//订单页
    getProduct: '/product/get_product_list/',
    getProductDetails: 'public/#!/productUpdate?product_id=',
    setProduct: ''
};

chrome.extension.onRequest.addListener(function(msg, sender) {
    var id = sender.tab.id;
    switch(msg.cmd) {
        case 'orderData':
            orderData = msg.data;
            break;
        default:
            break;
    }
});

function dataFormat(date) {
    function convertNum(num){
        if(String(num).length ==1 ) {
            return '0' + num;
        } else {
            return num;
        }
    }
    var currentDay = new Date(date.getTime() - 1000*60*60*24);
    console.log(currentDay.getDate());
    var finalDate = currentDay.getFullYear() + '-' + convertNum(currentDay.getMonth() + 1) + '-' + convertNum(currentDay.getDate());
    return finalDate;
}

// 启动
chrome.browserAction.onClicked.addListener(function(tab){
    console.log(tab);
    if(~tab.url.indexOf('www.duiba.com.cn')) {
        chrome.tabs.create({
            index: tab.index + 1,
            active: true,
            url: dataUrl.salesPage.replace(/{currentDay}/g, dataFormat(new Date()))
        }, function(tab) {
            sendInfo('init', '', tab.id);
        });
    }
});

// 登录后打开兑吧订单页