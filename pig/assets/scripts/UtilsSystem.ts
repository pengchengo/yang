import { PoolSystem } from "./PoolSystem"
import { TimeSystem } from "./TimeSystem"

export class _UtilsSystem {
    lastPlayCoinTime = 0

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

    showTip(content, state = 0){
        let tipCom = PoolSystem.createObj(PoolSystem.TipCom)
        tipCom.getChild("content").text = content
        tipCom.x = fgui.GRoot.inst.width/2
        tipCom.y = fgui.GRoot.inst.height/2
        tipCom.getController("state").selectedIndex = state
        TimeSystem.timeUpdate(1, (scale)=>{
            tipCom.y = cc.winSize.height/2 - 200*scale
            if(scale == 1){
                PoolSystem.revert(PoolSystem.TipCom, tipCom)
            }
        })
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

    scheduleOnce(time, callBack){
        setTimeout(()=>{
            if(callBack){
                callBack()
            }
        }, time)
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

    addLineFeed(words){
        let newWords = ""
        for(let i = 0; i < words.length; i++){
            newWords = newWords + words[i]
            if(i < (words.length-1)){
                newWords = newWords + "\n"
            }
        }
        return newWords
    }

    checkTouchNode(node, touchPos){
        let point = node.convertToNodeSpaceAR(touchPos)
        if(point.x > -node.width/2 && point.x < node.width/2 && point.y > -node.height/2 && point.y < node.height/2){
            return true
        }else{
            return false
        }
    }

    touchInNode(node, worldPos){
        let point = node.convertToNodeSpaceAR(worldPos);
        let collider = node.getComponent(cc.PolygonCollider)
        if(collider){
            if (cc.Intersection.pointInPolygon(point, collider.points)) {
                return true
            }else{
                return false
            }
        }else{
            if(point.x > -node.width/2 && point.x < node.width/2 && point.y > -node.height/2 && point.y < node.height/2){
                return true
            }else{
                return false
            }
        }
    }

    computeArea(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const area1 = (ax2 - ax1) * (ay2 - ay1), area2 = (bx2 - bx1) * (by2 - by1);
        const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1), overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1);
        const overlapArea = Math.max(overlapWidth, 0) * Math.max(overlapHeight, 0);
        return area1 + area2 - overlapArea;
    }
}

export const UtilsSystem = new _UtilsSystem();