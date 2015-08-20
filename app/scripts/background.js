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
    orderPage: 'http://www.duiba.com.cn/Dorder/orderRecord/1452?orderType=devOrder&orderTimeType=create&startDay={currentDay}&endDay={currentDay}&exchangeStatus=success&max=5000', //订单页
    salesPage: 'http://www.duiba.com.cn/appDataReport/itemDetailSearch?appId=1452&max=1000&orderBy=orderCount&state=desc&dateBetween={currentDay}+-+{currentDay}',
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

// 启动
chrome.browserAction.onClicked.addListener(function(tab){
    if(~tab.url.indexOf('www.duiba.com.cn/appDataReport')) {
        
    }
});

// 登录后打开兑吧订单页