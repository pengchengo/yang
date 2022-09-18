import GameComponent from "./GameComponent"

export class _ToolSystem {
    scheduleMap = {}

    scheduleOnce(key, time, callBack){
        let info = {} as any
        info.time = time
        info.callBack = callBack
        this.scheduleMap[key] = info
    }

    scheduleClear(key){
        this.scheduleMap[key] = null
    }

    update(dt){
        for (let key in this.scheduleMap) {
            let info = this.scheduleMap[key]
            if (info){
                if(info.isStop){
                    continue
                }
                info.time = info.time - dt
                if(info.time <= 0){
                    this.scheduleMap[key] = null
                    info.callBack()
                }
            }
        }
    }

    getRandomNum(Min, Max) {
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
    }

    getMapNum(map){
        let num = 0
        for(let k in map){
            num++
        }
        return num
    }

    showTip(content){
        let tipCom = cc.instantiate(GameComponent.Inst.node.getChildByName("tipUI"))
        tipCom.active = true
        tipCom.getChildByName("content").getComponent(cc.Label).string = content
        GameComponent.Inst.node.addChild(tipCom)
        //tipCom.x = cc.winSize.width/2
        //tipCom.y = cc.winSize.height/2
        cc.tween(tipCom)
            .by(1,{y:400})
            .removeSelf()
            .start()
    }

    lerp(a, b, w) {
        return a + w*(b-a);
    }

    getRandomFromArr(arr: Array<any>) {//数组随机取结果
        return arr[Math.floor(Math.random() * arr.length)];
    }

    
    fixLabel(label, width, min = 1){
        let scale = Math.min(min, width/(label.actualWidth))
        label.scaleX = scale
        label.scaleY = scale
    }

    shuffle(array) {
        var m = array.length,
            t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    isPad(){
        if(cc.winSize.width/cc.winSize.height >= 0.75){
            return true
        }else{
            return false
        }
    }

    isInNode(node, touchPos){
        let point = node.convertToNodeSpaceAR(touchPos)
        if(point.x > -node.width/2 && point.x < node.width/2 && point.y > -node.height/2 && point.y < node.height/2){
            return true
        }else{
            return false
        }
    }
}

export const ToolSystem = new _ToolSystem();