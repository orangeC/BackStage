(function (owner) {
	owner.token = function (url,data,type,token,success){
        jQuery.ajax({
            url:"http://radar.3vcar.com" + url,
            data:data,
            dataType:'json',
            method:type,
            timeout:10000,
            headers:{
                'content-type': 'application/json',
                'Authorization':token
            },
            success:success
        });
    }
}(window.utils = {}));