function sendInfo(cmd, info, id) {
    chrome.tabs.sendRequest(id, {
        cmd: cmd,
        data: info
    });
}

function sendRequest(url, method, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            currentTime = this.getResponseHeader('Date');
            callback(xhr.responseText);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            callback({
                "fail": true,
                "data": xhr.responseText
            });
        }
    }
    xhr.onerror = function() {
        callback({
            "fail": true,
            "data": xhr.responseText
        });
    };
    if(method == 'GET') {
        xhr.open('GET', url, true);
        xhr.send();
    } else {
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(data);
    }
}

//流程
var config = {
    productEnv: 'http://mall-admin.hongbaosuoping.com/',
    devEnv: 'http://b-mall-admin.aa123bb.com/'
};

var orderData = {};

var dataUrl = {
    salesPage: 'http://www.duiba.com.cn/appDataReport/itemDetailSearch?appId=1452&max=1000&orderBy=orderCount&state=desc&dateBetween={currentDay}+-+{currentDay}',//订单页
    getProduct: 'product/get_product_list/',
    getProductDetails: 'product/details/?productid=',
    setProduct: 'product/add/'
};

chrome.extension.onRequest.addListener(function(msg, sender) {
    var id = sender.tab.id;
    switch(msg.cmd) {
        case 'orderData':
            orderData = msg.data;
            productNameToId(orderData);
            break;
        default:
            break;
    }
});

function getProductId(name, count) {
    var data = "sell_out=0&page=1&high_rank=0&pro_state=1&pro_name=" + name;
    sendRequest(config.devEnv + dataUrl.getProduct, 'POST', data, function(data) {
        if(!data.fail) {
            data = JSON.parse(data);
            if(data.status && data.data && data.data.length) {
                // id对应数量
                if(count == 0) return;
                countToProductId[data.data[0].pro_id] = count;
            }
        }
    });
}

function paramSerialize(data) {
    var keys = Object.keys(data);
    var str = '';
    keys.forEach(function(item, index) {
        str += (item + '=' + data[item] + '&');
    });
    return str.slice(0,-1);
}

function setProduct(id, data) {
    console.log(id);
    console.log(data);
    sendRequest(config.devEnv + dataUrl.setProduct, 'POST', data, function(data) {
        if(!data.fail) {
            data = JSON.parse(data);
            if(data.status && data.data && data.data.length) {
                // id对应数量
                if(count == 0) return;
                countToProductId[data.data[0].pro_id] = count;
            }
        }
    });
}

// 商品详情
function getProductDetails(id) {
    sendRequest(config.devEnv + dataUrl.getProductDetails + id, 'GET', '', function(data){
        if(!data.fail) {
            data = JSON.parse(data);
            if(data.status == 1 && data.data) {
                // 更新库存
                data.data.pro_left_quantity -= countToProductId[id];
                setProduct(id, data.data);
            }
        }
    });
}

function getProductListDetails(obj){
    var ids = Object.keys(obj);
    ids.forEach(function(item) {
        getProductDetails(item);
    });
}

setTimeout(function(){
    getProductListDetails.call(null, countToProductId);
}, 10000);

var countToProductId = {};

//打开所有id product窗口, 根据product_id与tabid去设定库存
function ProductPage(obj) {
    chrome.tabs.create(function(){

    });
}

//印射可以得到的Id跟商品名
function productNameToId(obj){
    var productNames = Object.keys(obj);
    productNames.forEach(function(item, index) {
        getProductId(item, obj[item]);
    });
}

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