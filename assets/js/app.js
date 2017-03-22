(function (owner) {
    // 保存本地存储
    var setStorage = function (key, value) {
        localStorage.setItem('$' + key, value);
    };
    // 获取本地存储
    var getStorage = function (key) {
        return localStorage.getItem('$' + key);
    }


    // -------------------用户相关的---------------------------------------
    // 创建用户信息
    owner.setuser = function (token) {
        setStorage("account", token);
    };
    // 获取账号信息
    owner.getuser = function () {
        return getStorage("account");
    };


    // -------------------图片相关的---------------------------------------
    //图片上传
    owner.upload = function (element, success) {
        $(element).on('change', function () {
            // 判断是否有文件
            if (this.files.length == 0) return;
            // 判断是不是图片类型
            var file = this.files[0];
            if (!file.type.match(/image.*/)) return;

            var reader = new FileReader();
            reader.readAsDataURL(file);

            var tag = this.getAttribute("data-tag") || '';
            reader.onload = function (e) {
                // 压缩数据
                var img = new Image;
                img.src = this.result;
                var canvas = document.createElement("canvas");
                var drawer = canvas.getContext("2d");
                canvas.width = 800;
                canvas.height = 800 * (img.height / img.width);
                drawer.drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataURL = canvas.toDataURL('image/png');
                // 调用回调
                $.ajax({
                    url: 'http://image.3vcar.com/file/uploadapp',
                    data: { image: dataURL, tag: tag },
                    dataType: 'json',
                    type: 'post',
                    timeout: 100000,
                    success: success,
                    error: function (xhr, type, errorThrown) {
                    }
                });
            };
        });
    };

    // 图片地址
    owner.image = function (url) {
        return "http://image.3vcar.com" + url;
    };
    owner.url = function () {
        return "http://open.3vcar.com";
    };

    // -------------------通用的--------------------------------------- 
    // 数据请求
    owner.send = function (url, data, type, success) {
        jQuery.ajax({
            url:"http://radar.3vcar.com" + url, 
            data: data,
            dataType: 'json',
            type: type,
            timeout: 10000,
            headers: {
                'Authorization': owner.getuser()
            },
            success: success,
            error: function (xhr, type, errorThrown) {
                // todo: 异常处理
                if (xhr.status == 401) {
                    owner.notice('warning', '请求失败, 请重试');
                }
            }
        });

    };


    // -------------------工具相关的--------------------------------------- 
    // 弹窗消息
    owner.notice = function (type, message) {
        // type 'info','success','warning','danger'
        $.notify({
            icon: "pe-7s-bell",
            message: message

        }, {
            type: type,
            timer: 4000,
            placement: {
                from: 'top',
                align: 'right'
            }
        });
    };

    owner.getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };

    owner.getQuery = function () {
        var query = window.location.search.substr(1);

        var pos = 0;
        var res = [];
        for (var i = 0; i < query.length; i++) {
            var q = query[i];
            // 获取key
            if (q == '=') {
                var key = unescape(query.substring(pos, i));
                res.push(key);
                pos = i + 1;
                continue;
            }
            // 获取value
            if (q == '&') {
                var value = unescape(query.substring(pos, i));
                res.push(value);
                pos = i + 1;
                continue;
            }
        }

        // 处理
        var value = unescape(query.substring(pos, query.length));
        res.push(value);

        // 组合为对象
        var obj = {};
        for (var i = 0; i < res.length; i = i + 2) {
            obj[res[i]] = res[i + 1];
        }
        return obj;
    };

    owner.inArray = function (val, array, lower) {
        var has = false;
        for (var a in array) {
            var lval = lower ? val.toLowerCase() : val;
            var larr = lower ? array[a].toLowerCase() : array[a];

            if (lval == larr) {
                has = true;
                break;
            }
        }
        return has;
    };

    owner.fullLocation = function (href, arg, removes) {
        var args = {};
        var path = href;

        if (href.indexOf('?') > -1) {
            var query = location.search.substring(1);
            var pairs = query.split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');//查找name=value  
                if (pos == -1) {//如果没有找到就跳过  
                    continue;
                }
                var argname = pairs[i].substring(0, pos).toLowerCase();
                var value = pairs[i].substring(pos + 1);

                if (value) args[argname] = unescape(value);
            }
            path = href.substring(0, href.indexOf('?'));
        }

        for (var ar in arg) {
            var has = false;
            var arl = ar.toLowerCase();
            if (exports.inArray(arl, removes, true)) continue;

            for (var ars in args) {
                if (arl == ars) {
                    has = true;
                    if (arg[ar]) {
                        args[ars] = arg[ar];
                    } else {
                        delete args[ars];
                    }
                    break;
                }
            }
            if (!has && arg[ar]) {
                args[arl] = arg[ar];
            }
        }

        var params = $.param(args);
        return path + "?" + params;
    };

    owner.handleActive = function (activeName, excepedUrls) {
        var urls = window.location.pathname;
        urls = urls.replace(/^\/|\/$/g, '');

        var len = urls.lastIndexOf('/') == urls.indexOf('/') ? urls.length : urls.lastIndexOf('/');
        var targetUrl = urls.substring(0, len).toLowerCase();

        for (var url in excepedUrls) {
            if (targetUrl == excepedUrls[url].href) break;
            var eUrls = excepedUrls[url].urls
            for (var eu in eUrls) {
                if (targetUrl == eUrls[eu]) {
                    targetUrl = excepedUrls[url].href;
                    break;
                }
            }
        }

        return targetUrl;
        // $(menu + " li").removeClass(activeName);
        // $(menu + " li a[href='" + targetUrl + "']").parent().addClass(activeName);
    };


    // -------------------时间相关的---------------------------------------
    // 现在时间
    owner.fromnow = function (dateStr) {
        var from = this.from(dateStr).getTime();

        var now = new Date().getTime();
        var diff = now - from;
        var word = diff > 0 ? '前' : '后';

        var minute = Math.abs(diff / 1000 / 60);
        var hour = Math.abs(minute / 60);
        var day = Math.abs(hour / 24);
        var week = Math.abs(day / 7);

        if (week >= 1) return this.format(dateStr, 'yyyy-MM-dd');
        if (day >= 1) return '' + parseInt(day) + '天' + word;
        if (hour >= 1) return '' + parseInt(hour) + '小时' + word;
        if (minute >= 1) return '' + parseInt(minute) + '分钟' + word;
        return "刚刚";
    };
    owner.tonow = function (dateStr, level) {
        if (level == '05' || level == '06' || level == '07') return '无';

        var to = this.from(dateStr);
        var now = new Date();
        var diff = Date.parse(to.getFullYear().toString() + '/' + (to.getMonth() + 1).toString() + '/' + to.getDate().toString()) -
            Date.parse(now.getFullYear().toString() + '/' + (now.getMonth() + 1).toString() + '/' + now.getDate().toString());

        var day = parseInt(diff / 1000 / 60 / 60 / 24);
        if (day == 0) return '今日回访';
        if (day > 0) return day.toString() + '天后回访';
        return '超期' + Math.abs(day).toString() + '天';
    };
    // 格式化
    owner.format = function (dateStr, fmt) {
        var target = this.from(dateStr);

        var o = {
            "M+": target.getMonth() + 1,
            "d+": target.getDate(),
            "h+": target.getHours(),
            "m+": target.getMinutes(),
            "s+": target.getSeconds(),
        };
        var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (target.getFullYear() + "").substr(4 - RegExp.$1.length));
        if (/(w|W)/g.test(fmt)) fmt = fmt.replace(RegExp.$1, week[target.getDay()]);

        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

        return fmt;
    };
    // 转换
    owner.from = function (dateStr) {
        if (dateStr instanceof Date) return dateStr;

        var myDate = null;
        switch (typeof dateStr) {
            case 'string':
                // 如果是UTC时间
                var isUtc = dateStr.indexOf('T') > -1;
                if (isUtc) dateStr = dateStr.replace(/T/g, ' ').replace(/Z/g, '');

                dateStr = dateStr.replace(/-/g, '/').substring(0, 19);
                myDate = new Date(dateStr);

                if (isUtc) myDate = new Date(myDate.valueOf() + 8 * 60 * 60 * 1000);
                break;
            case 'number':
                myDate = new Date(dateStr);
                break;
        }

        return myDate;
    };
    // 比较大小
    owner.diff = function (strBegin, strEnd, format) {
        var begin = this.from(strBegin).getTime();
        var end = this.from(strEnd).getTime();

        var diff = end - begin;
        var seconds = Math.abs(diff / 1000);
        var frt = {
            'f': 1,
            's': 1000,
            'm': 1000 * 60,
            'h': 1000 * 60 * 60,
            'd': 1000 * 60 * 68 * 24
        };
        if (!format) format = 'f';
        return diff / frt[format];
    };
    // -------------------时间相关的---------------------------------------


}(window.app = {}));