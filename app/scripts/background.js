function dataFormat(date) {
    function convertNum(num) {
        if (String(num).length == 1) {
            return '0' + num;
        } else {
            return num;
        }
    }
    var currentDay = new Date(date.getTime() - 1000 * 60 * 60 * 24);
    var finalDate = currentDay.getFullYear() + '-' + convertNum(currentDay.getMonth() + 1) + '-' + convertNum(currentDay.getDate());
    return finalDate;
}

var executed = false;
// 一天只执行一次
function executedTimeCheck() {
    var yesterdayDate = dataFormat(new Date());
    var executedDay = localStorage.getItem('executedDay');
    if (executedDay) {
        // 当天已执行则停止执行
        (function() {
            var executedDayObj = JSON.parse(executedDay);
            if (~executedDayObj.indexOf(yesterdayDate)) {
                executed = true;
            } else {
                executedDayObj.push(yesterdayDate);
                localStorage.setItem('executedDay', JSON.stringify(executedDayObj));
                executed = false;
            }
        })();
    } else {
        executedDay = [];
        executedDay.push(yesterdayDate);
        localStorage.setItem('executedDay', JSON.stringify(executedDay));
        executed = false;
    }
}

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
    if (method == 'GET') {
        xhr.open('GET', url, true);
        xhr.send();
    } else {
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    salesPage: 'http://www.duiba.com.cn/appDataReport/itemDetailSearch?appId=1452&max=1000&orderBy=orderCount&state=desc&dateBetween={currentDay}+-+{currentDay}', //订单页
    getProduct: 'product/get_product_list/',
    getProductDetails: 'product/details/?productid=',
    setProduct: 'product/add/'
};

chrome.extension.onRequest.addListener(function(msg, sender) {
    var id = sender.tab.id;
    switch (msg.cmd) {
        case 'orderData':
            orderData = msg.data;
            productNameToId(orderData);
            break;
        default:
            break;
    }
});

var nametoId = {};

function getProductId(name, count) {
    var data = "sell_out=0&page=1&high_rank=0&pro_state=1&pro_name=" + name;
    sendRequest(config.devEnv + dataUrl.getProduct, 'POST', data, function(data) {
        if (!data.fail) {
            data = JSON.parse(data);
            if (data.status && data.data && data.data.length) {
                // id对应数量
                if (count == 0) return;
                nametoId[data.data[0].pro_id] = name;
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
    return str.slice(0, -1);
}

function setProduct(id, data) {
    data.id = id;
    var picture1 = data.img.map(function(item) {
        return item.path;
    }).join();
    var paramData = {
        productid: data.id,
        pro_shop: data.pro_shop, //商家id
        pro_type: data.pro_type, //商品类型(id)
        pro_name: data.pro_name, //商品标题
        pro_description: data.pro_description, //商品描述
        pro_rank: data.pro_rank || 1, //商品排序
        pro_settle_price: data.pro_settle_price, //结算价
        pro_convert_price: data.pro_convert_price, //兑换价格
        pro_trade_price: data.pro_trade_price, //购买价
        pro_buy_level: data.pro_buy_level || 1, //可购买的最低用户等级
        pro_left_quantity: data.pro_left_quantity, //库存
        picture1: picture1, //详情图
        picture2: data.pro_thumb_logo, //缩略图
        picture3: data.pro_thumb_img, //图标
        pro_lock_area: data.pro_lock_area, //不包邮省份, 多个以逗号分隔
        snap_switch: data.snap_switch //是否开启了抢购
    };

    if (data.snap_switch === "true") {
        paramData.su_title = data.snap.su_title; //抢购标题
        paramData.su_start_date = data.snap.su_start_date; //活动开始日期
        paramData.su_end_date = data.snap.su_end_date; //活动结束日期
        paramData.su_quantity = data.snap.su_quantity; //活动数量
        paramData.su_settle_price = data.snap.su_settle_price; //抢购结算价格
        paramData.su_convert_price = data.snap.su_convert_price; //抢购红包兑换价格
        paramData.su_trade_price = data.snap.su_trade_price; // 抢购用户购买价格
        paramData.pro_lock_area = data.snap.pro_lock_area; //不包邮省份; 多个以逗号分隔
        paramData.su_end_type = data.snap.su_end_type || 1; //抢购时间过后
        paramData.su_start_time = '00:00:00';
        paramData.su_end_time = '23:59:59';
    }


    sendRequest(config.devEnv + dataUrl.setProduct, 'POST', paramSerialize(paramData), function(data) {
        if (!data.fail) {
            console.log(id);
            successCount++;
            checkSuccess(successCount);
        }
        // 成功更新N个
        // 检查返回

    });

    updateDb(data.pro_name);

}

var successCount = 0;

// 检查返回
function checkSuccess(length) {
    var conutIds = Object.keys(countToProductId);
    if (conutIds.length == length) {
        var successGoods = [];
        conutIds.forEach(function(item, index) {
            successGoods[index] = "商品名: " + nametoId[item] + ';商品数量: ' + countToProductId[item];
        });
        alert('成功更新' + length + '个商品库存;' + successGoods.join(','));
        successCount = 0;
    }
}

// 更新兑吧
function updateDb(title) {
    var url = 'http://www.duiba.com.cn/devItem/appItems/1452?itemName=' + title;
    // chrome.tabs.create()
}

// 商品详情
function getProductDetails(id) {
    sendRequest(config.devEnv + dataUrl.getProductDetails + id, 'GET', '', function(data) {
        if (!data.fail) {
            data = JSON.parse(data);
            if (data.status == 1 && data.data) {
                // 更新库存
                data.data.pro_left_quantity -= countToProductId[id];
                console.log(countToProductId[id]);
                setProduct(id, data.data);
            }
        }
    });
}

function getProductListDetails(obj) {
    var ids = Object.keys(obj);
    ids.forEach(function(item) {
        getProductDetails(item);
    });
}

var countToProductId = {};

//打开所有id product窗口, 根据product_id与tabid去设定库存
function ProductPage(obj) {
    chrome.tabs.create(function() {

    });
}

//印射可以得到的Id跟商品名
function productNameToId(obj) {
    var productNames = Object.keys(obj);
    productNames.forEach(function(item, index) {
        getProductId(item, obj[item]);
    });
    setTimeout(function() {
        getProductListDetails(countToProductId);
    }, 10000);
}


// 启动
chrome.browserAction.onClicked.addListener(function(tab) {
    executedTimeCheck();


    if (~tab.url.indexOf('www.duiba.com.cn')) {
        if (!executed) {
            chrome.tabs.create({
                index: tab.index + 1,
                active: true,
                url: dataUrl.salesPage.replace(/{currentDay}/g, dataFormat(new Date()))
            }, function(tab) {
                sendInfo('init', '', tab.id);
            });
        } else {
            // 提示已更新
            alert('今日已更新');
        }
    }
});

//一天过后, executed变为false


