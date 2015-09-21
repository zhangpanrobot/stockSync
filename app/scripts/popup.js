'use strict';

function requestTo(obj) { //send to background
	chrome.extension.sendRequest(obj);
}
$(document).ready(function() {
	var picker = $('.ope_type li').eq(0).find('input').pickadate();
	$('.ope_type li').on('click', function(e) {
		var index = $(this).index();
		if (!index) {

		} else { //同步新增商品
			requestTo({
				cmd: 'productList'
			});
		}
	});
});

var data = {
	"14442": {
		"pro_name": "WE迷你音箱A06",
		"pro_description": "\t\t\t\t\t\t\t\t<h4>商品名称：X-Mini™ &nbsp;WE超便携迷你音箱 手机音箱 钥匙扣音箱 支持蓝牙 NFC功能 （5色随机发货）</h4><h4>商品描述：</h4><div>X-mini WE音箱（蓝牙型）细节X-mini胶囊音箱一贯秉承“小身材，好声音”的理念，新一代产品的声音更加出色。X-mini WE以全新的外观和尺寸为便携式音箱提供了崭新的视角，能够支持NFC和蓝牙连接。Xmi Pte又一次将外形和功能完美结合。<br>主要特点<br>1. 超级便携：只要系在挂绳或钥匙链上，就可以带着它去任何地方<br>2. 超常播放时间：长达6小时连续播放，可用小USB口充电<br>3. 无线连接：可通过蓝牙或NFC与智能手机相连<br><br>详细参数<br>尺寸（高X直径）: 44mm x 38mm<br>净重: 48g<br>扬声器: 磁性屏蔽31mm (3.6Ω)<br>高音输出: 1.5W<br>频响: 200Hz-20kHz<br>信噪比: ≥80dB<br>失真: ≤0.3%<br>播放时间:最长6 小时<br>电池容量: 230mAh<br>充电电压: 5V (USB)<br>蓝牙参数：工作频率范围: 2.4GHz – 2.48GHz<br>无线距离:最远10米<br>蓝牙兼容: v3.0（拥有轻触即配对的NFC功能）<br>蓝牙支持文件: A2DP立体声<br><p><b>【关于红包商城】</b></p>\n\n<p><b>1、 </b><b>商城全部商品一件包邮。</b></p>\n\n<p><b>2、 </b><b>所有商品正品保证，质量保障。如有疑问请咨询官方客服QQ：800099439</b></p>\n\n<p><b>3、 </b><b>本商品不支持无理由退换。请用户在收取快递时，当面检查包裹，如签收即默认商品没有破损，如有破损请勿签收，直接拒收即可，我们会安排重新发货。</b></p>\n\n<p><b>4、 </b><b>商城工作时间为周一至周五，下单通过审核后48小时内发货，审核时间为1-3个工作日。周六日不发货。</b></p>\n\n<p><b>5、 </b><b>本商品不支持以下城市购买：西藏，海南，云南、港澳台及海外。</b></p></div>\n\t\t\t\t\t\t\t",
		"picture1": [
			"http://yun.duiba.com.cn/images/xovvvvng2z.png",
			"http://yun.duiba.com.cn/images/0nzfdy63oq.png",
			"http://yun.duiba.com.cn/images/2nr2d2bjlh.png",
			"http://yun.duiba.com.cn/images/oa7etbbij0.png",
			"http://yun.duiba.com.cn/images/06wn8prbjo.png"
		],
		"picture2": "http://yun.duiba.com.cn/images/mgnzbkya8o.png",
		"picture3": "http://yun.duiba.com.cn/images/x3g79qy7ps.png",
		"pro_left_quantity": "500",
		"pro_convert_price": "33000"
	}
}