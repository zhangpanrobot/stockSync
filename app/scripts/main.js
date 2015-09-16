function $(selector, ele) {
    return (ele || document).querySelectorAll(selector);
}

function $$(selector, ele) {
    return (ele || document).querySelector(selector);
}

function requestTo(obj) { //send to background
    chrome.extension.sendRequest(obj);
}

function getDuibaData() {
    var orders = $('tbody tr.title');
    var orderData = {};
    [].slice.call(orders).forEach(function(item) {
        orderData[item.querySelector('span').innerText] = item.querySelector('td:nth-child(6)').innerText;
    });
    //数据传给background
    requestTo({
        cmd: "orderData",
        data: orderData
    });
}

function getNewProducts() {
    var productsEle = $('tbody tr');
    var productData = {};
    [].slice.call(productsEle).forEach(function(item) {
        productData[$$('input', item).getAttribute('data-itemid')] = {
            pro_name: $$('.item-info h2', item).innerText,
            pro_left_quantity: $$('td>span', item).innerText
        };
    });
    requestTo({
        msg: productList_data,
        data: productData
    });
}

function getOneProduct() {
    var data = {};
    data.pro_description = $$('#description').value;
    data.picture1 = [].slice.call($('.view-img')).map(function(item){
        return item.src;
    });
    data.picture2 = $$('.smallImg').src;
    data.picture3 = $$('img.logo').src;
    data.pro_convert_price = $$('#credits').value;
    requestTo({
        msg: 'oneProduct',
        id: paramParse('appItemId'),
        data: data
    });
}

function init() {
    var currentPage = location.href;
    if (~currentPage.indexOf('appDataReport/itemDetailSearch')) {
        // 兑吧订单页
        // 得到兑吧销量
        getDuibaData();
    } else if (~currentPage.indexOf('devItem/appItems')) {
        getNewProducts();
    } else if(~currentPage.indexOf('devItem/editAppItem')) {
        getOneProduct();
    }
}

init();

chrome.extension.onRequest.addListener(function(msg, sender) {
    switch (msg.cmd) {
        case 'init':
            // init();
            break;
        default:
            break;
    }
});

// 参数解析
function paramParse(key) {
    if (!location.search) return;
    var paramArr = location.search.slice(1).split('&');
    var paramPair = {};
    paramArr.forEach(function(item) {
        var param = item.split('=');
        paramPair[param[0]] = param[1];
    });
    if (key) return paramPair[key];
    return paramPair;
}
// 更新红包后台库存(减去兑吧销量)
// 得到的结果更新到兑吧各商品库存