/*************
 * Author: Poo Hwang
 * Email: blacklaw00@gmail.com
 * Description: Module writed for baidu geek competition
 **************/

function MGPlayer(deviceid, playerCfg) {
    ext = {
        deviceid: deviceid,
        onAcceSensorChanged: function (x, y, z) {
            // console.log(x);j
        },
        onMotionAction: function (actID) {

        }
    };
    return $.extend(ext, playerCfg);
}


function MotionDevice(wsURI, customExt) {
    websocket = new WebSocket(wsURI);
    ext = {
        players: {},
        getPlayerByID: function (id) {
            return this.players[id];
        },
        _onPlayerJoin: function (deviceid) {
            this.players[deviceid] = new MGPlayer(deviceid, this.player);
            console.log("player join" + deviceid)
            this.onPlayerJoin(deviceid);
        },
        onPlayerJoin: function () {

        },
        _onPlayerExit: function (deviceid) {
            this.onPlayerExit(deviceid);
            delete(this.players[deviceid]);

            console.log("player exit" + deviceid)
        },
        onPlayerExit: function () {

        },
        sendAction: function (action, params) {
            this.send(JSON.stringify(
                    $.extend(
                        {action: ""},
                        {action: action, params: JSON.stringify(params)}
                    )
                )
            );
            // alert("sendActon");
        },
        onConnected: function () {

        },
        openGame: function (roomid, game) {
            this.sendAction("openGame", {roomid: roomid, game: game});
        },
        createRoom: function () {
            this.sendAction("createRoom");
        },
        onRoomCreated: function () {

        },
        joinRoom: function (roomid, type) {

            this.sendAction("joinRoom", {roomid: roomid, type: type});
        },
        onGameIDArrive: function (id) {

        },
        onAction: function (action, params) {
            objStr = "this.{action}('{params}');".replace("{action}", action).replace("{params}", params);
            eval(objStr);
        },
        onmessage: function (e) {
            var msg = JSON.parse(e.data);
//			console.log(e.action);
            this.onAction(msg.action, msg.params);
        },
        onPredicted: function (res) {
//          console.log(res);
        },
        onJoinResult: function () {
            console.log("join success");
        },
        queryDeviceID: function (dealFun) {
            this.sendAction("queryDeviceID");
            if (dealFun != null) {
                this.onDeviceIDArrive = dealFun;
            }
        },
        onDeviceIDArrive: function (dID) {
            // console.log("Device ID:" + dID);
        },
        acceSensorChange: function (vs) {
            // this.sendAction("acceSensorChange",
            //             	 	[event.accelerationIncludingGravity.x,
            //             	 	event.accelerationIncludingGravity.y,
            //             	 	event.accelerationIncludingGravity.z]
            //             	 	)
            this.sendAction("acceSensorChange", vs
            )
        },
        // Player private function
        _onAcceSensorChanged: function (vs) {
            var se = JSON.parse(vs);
            var deviceid = se.deviceid;
            var params = JSON.parse(se.params);
            this.players[deviceid].onAcceSensorChanged(params[0], params[1], params[2]);
        },
        _onMotionAction: function (as) {
            var se = JSON.parse(as);
            var deviceid = se.deviceid;
            // console.log(se.params.action);
            this.players[deviceid].onMotionAction(se.params.action);
        },
        textArrive: function (text) {
            // console.log("Text Arrive:" + text);
        },
        onUserIn: function (hello) {

        },
        onUserLeave: function () {

        }
    };
    ext = $.extend(ext, customExt);
    return $.extend(websocket, ext)
};


MGUtils = {
    qruri: function (type, game, roomid) {

        var clientURI = window.location.origin + "/mg/client.html";
        var search = "type=" + type + "&game=" + game + "&roomid=" + roomid;
        return clientURI + "?" + search;

    },
    upOrDown: function (callback) {
        var attr = {
            callback: callback,
            test: function () {
                console.log(this.bbc);
            },
            cfg: {
                qx: 4,
                qy: 4,
                qz: 7,
                qtime: 200
            },
            lastTime: 0,
            break: true,
            push: function (x, y, z) {
                if (Math.abs(z) > this.cfg.qz && Math.abs(y) < this.cfg.qy && Math.abs(x) < this.cfg.qx) {
                    if (new Date().getTime() - this.lastTime > this.cfg.qtime) {
                        this.callback(z > 0, false);
                    }
                    this.break = false;
                } else {
                    this.lastTime = new Date().getTime();
                    if (!this.break){
                        this.break = true;
                        this.callback(null, true);
                    }
                }
            }
        }
        return attr;
    }
};

$.deparam = function (searchStr) {
    if (searchStr.charAt(0) == "?") {
        searchStr = searchStr.slice(1);
    }
//	console.log(searchStr);
//	console.log('{"' + decodeURI(searchStr.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    return JSON.parse('{"' + decodeURI(searchStr.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
}
