(function(owner) {
    // 现在时间
    owner.fromnow = function(dateStr) {
        var from = this.from(dateStr).getTime();

        var now = new Date().getTime();
        var diff = now - from;
        var word = diff > 0 ? '前' : '后';

        var minute = Math.abs(diff / 1000 / 60);
        var hour = Math.abs(minute / 60);
        var day = Math.abs(hour / 24);
        var week = Math.abs(day / 7);

        if(week >= 1) return this.format(dateStr, 'yyyy-MM-dd');
        if(day >= 1) return '' + parseInt(day) + '天' + word;
        if(hour >= 1) return '' + parseInt(hour) + '小时' + word;
        if(minute >= 1) return '' + parseInt(minute) + '分钟' + word;
        return "刚刚";
    };
    owner.tonow = function(dateStr,level) {
    	if(level=='05' || level=='06' || level=='07') return '无';
    	
        var to = this.from(dateStr);
        var now = new Date();
        var diff = Date.parse(to.getFullYear().toString() + '/' + (to.getMonth() + 1).toString() + '/' + to.getDate().toString()) -
            Date.parse(now.getFullYear().toString() + '/' + (now.getMonth() + 1).toString() + '/' + now.getDate().toString());

        var day = parseInt(diff / 1000 / 60 / 60 / 24);
        if(day == 0) return '今日回访';
        if(day > 0) return day.toString() + '天后回访';
        return '超期' + Math.abs(day).toString() + '天';
    };
    // 格式化
    owner.format = function(dateStr, fmt) {
        var target = this.from(dateStr);

        var o = {
            "M+": target.getMonth() + 1,
            "d+": target.getDate(),
            "h+": target.getHours(),
            "m+": target.getMinutes(),
            "s+": target.getSeconds(),
        };
        var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (target.getFullYear() + "").substr(4 - RegExp.$1.length));
        if(/(w|W)/g.test(fmt)) fmt = fmt.replace(RegExp.$1, week[target.getDay()]);

        for(var k in o)
            if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

        return fmt;
    };
    // 转换
    owner.from = function(dateStr) {
        if(dateStr instanceof Date) return dateStr;

        var myDate = null;
        switch(typeof dateStr) {
            case 'string':
                // 如果是UTC时间
                var isUtc = dateStr.indexOf('T') > -1;
                if(isUtc) dateStr = dateStr.replace(/T/g, ' ').replace(/Z/g,'');
                
                dateStr = dateStr.replace(/-/g, '/').substring(0, 19);
                myDate = new Date(dateStr);
                
                if(isUtc) myDate = new Date(myDate.valueOf() + 8*60*60*1000);
                break;
            case 'number':
                myDate = new Date(dateStr);
                break;
        }

        return myDate;
    };
    // 比较大小
    owner.diff = function(strBegin, strEnd, format) {
        var begin = this.from(strBegin).getTime();
        var end = this.from(strEnd).getTime();

        var diff = end - begin;
        var seconds = Math.abs(diff / 1000);
        var frt = {
            'f': 1 ,
            's': 1000,
            'm': 1000 * 60,
            'h': 1000 * 60 * 60,
            'd': 1000 * 60 * 68 * 24
        };
        if(!format) format = 'f';
        return diff / frt[format];
    };
}(window.moment = {}));