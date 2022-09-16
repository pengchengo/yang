// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import CrushComponent, { CrushState } from "./CrushComponent";
import { TimeSystem } from "./TimeSystem";
import { UtilsSystem } from "./UtilsSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameComponent extends cc.Component {
    areamPer = 1/6
    itemWidth = 89
    itemHeight = 99
    itemArea = 89*99
    flyTime = 0.1
    levelNode
    limitBottomNum = 7
    crushCptList = []
    bottomCptList = []
    bottomPosList = []
    resetMap = {}
    flashList = []
    isPlayAnim = false
    moveCptList = []
    passTime = 0
    backThreeTime = 0
    retiveTime = 0
    sceneAnim = null
    isPause = false

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.loadLevelSuccess()
    }

    loadLevelSuccess(){
        this.levelNode = this.node
        this.bottomPosList = []
        this.flashList = []
        this.resetMap = {}
        this.isPlayAnim = false
        this.backThreeTime = 0
        this.retiveTime = 0
        this.sceneAnim = this.levelNode.getChildByName("sceneAnim")
        this.sceneAnim.active = false
        let posList = this.levelNode.getChildByName("posList")
        for (let i = 1; i <= this.limitBottomNum; i++) {
            let item = posList.getChildByName("pos"+i)
            let flash = item.getChildByName("flash")
            flash.active = false
            this.flashList.push(flash)
            this.bottomPosList.push(item)
        }
        let level1 = this.levelNode.getChildByName("level1")
        this.levelNode.getChildByName("level2").active = false
        this.passTime = 0
        this.isPause = false
        this.initLevel(level1)
        this.registTouch()
        //this.registBtn()
    }
    
    update(dt){
        TimeSystem.update(dt)
        if(this.isPause){
            return
        }
        this.passTime = this.passTime + dt
    }

    registBtn(){
    }

    needShowMask(cpt){
        for(let i = 0; i < cpt.overCrushList.length; i++){
            let overCpt = cpt.overCrushList[i]
            if(overCpt.curState == CrushState.InList){
                return true
            }
            if(this.needShowMask(overCpt)){
                return true
            }
        }
        return false
    }

    refreshMask(){
        for(let i = 0; i < this.crushCptList.length; i++){
            let cpt = this.crushCptList[i]
            if(this.needShowMask(cpt)){
                cpt.maskNode.active = true
            }else{
                cpt.maskNode.active = false
            }
        }
    }

    getBackEmptyPos(){
        for(let i = 1; i <= 9; i++){
            if(!this.resetMap[i]){
                return i
            }
        }
        return 0
    }

    canBackThree(){
        if(this.getBackEmptyPos()){
            return true
        }else{
            return false
        }
    }

    backThree(isRevive){
        let posList = this.levelNode.getChildByName("posList")
        for(let i = 3; i >= 1; i--){
            let cpt = this.bottomCptList[0]
            if(cpt){
                let resetPos = this.getBackEmptyPos()
                if(!resetPos){
                    break
                }
                this.bottomCptList.splice(0, 1)
                cpt.curState = CrushState.Reset
                cpt.resetIndex = resetPos
                this.resetMap[cpt.resetIndex] = true
                let posNode = posList.getChildByName("resetpos"+resetPos)
                cpt.node.x = posNode.x
                cpt.node.y = posNode.y
                this.crushCptList.push(cpt)
                for(let j = this.moveCptList.length-1; j >= 0; j--){
                    if(this.moveCptList[j] == cpt){
                        this.moveCptList.splice(j, 1)
                        break
                    }
                }
            }
        }
        for(let i = 0; i < this.bottomCptList.length; i++){
            let cpt = this.bottomCptList[i]
            cpt.bottomIndex = i
            let tPos = this.bottomPosList[cpt.bottomIndex]
            cpt.node.x = tPos.x
            cpt.node.y = tPos.y
        }
        if(!isRevive){
            this.backThreeTime = this.backThreeTime + 1
        }
    }

    canBackOne(){
        if(this.moveCptList.length <= 0){
            return false
        }
        let lastCpt = this.moveCptList[this.moveCptList.length-1]
        if(lastCpt.curState == CrushState.Removed){
            return false
        }
        return true
    }

    backOne(){
        if(this.moveCptList.length <= 0){
            return
        }
        let lastCpt = this.moveCptList[this.moveCptList.length-1]
        if(lastCpt.curState == CrushState.Removed){
            return
        }
        lastCpt.node.x = lastCpt.startX
        lastCpt.node.y = lastCpt.startY
        lastCpt.curState = CrushState.InList
        for(let i = lastCpt.bottomIndex+1; i < this.bottomCptList.length; i++){
            let cpt = this.bottomCptList[i]
            cpt.bottomIndex = cpt.bottomIndex - 1
            let tPos = this.bottomPosList[cpt.bottomIndex]
            cpt.node.x = tPos.x
            cpt.node.y = tPos.y
        }
        this.bottomCptList.splice(lastCpt.bottomIndex, 1)
        this.crushCptList.push(lastCpt)
        this.moveCptList.pop()
        this.refreshMask()
    }

    initLevel(levelRoot){
        levelRoot.active = true
        this.crushCptList = []
        this.bottomCptList = []
        this.moveCptList = []
        //@ts-ignore
        let childList = levelRoot._children
        let index = 1
        for (let i = 0; i < childList.length; i++) {
            let child = childList[i]
            let crushCpt = child.getComponent(CrushComponent)
            if(crushCpt){
                crushCpt.index = index
                crushCpt.node.zIndex = index
                crushCpt.zIndex = index
                this.crushCptList.push(crushCpt)
                index = index + 1
            }
        }
        for (let i = 0; i < this.crushCptList.length; i++) {
            let crushCpt = this.crushCptList[i]
            this.autoResetOverList(crushCpt)
        }
        this.refreshMask()
        this.playMoveInAnim(levelRoot, 1)

    }

    playMoveInAnim(levelRoot,delayTime = 0){
        levelRoot.y = 1000
        cc.tween(levelRoot)
            .delay(delayTime)
            .to(1, { position: cc.v2(0, 0) }, { easing: 'backOut' })
            .start()
    }

    initRandomLevel(levelRoot){
        levelRoot.active = true
        this.crushCptList = []
        this.bottomCptList = []
        this.moveCptList = []
        let iconList = []
        for(let i = 1; i <= 14; i++){
            iconList.push(i)
        }
        UtilsSystem.shuffle(iconList)
        let itemIdList = []
        for(let i = 0; i < iconList.length; i++){
            if(i < 10){
                for(let j = 0; j < 15; j++){
                    itemIdList.push(iconList[i])
                }
            }else{
                for(let j = 0; j < 15; j++){
                    itemIdList.push(iconList[i])
                }
            }
        }
        UtilsSystem.shuffle(itemIdList)
        //@ts-ignore
        let childList = levelRoot._children
        let index = 0
        for (let i = 0; i < childList.length; i++) {
            let child = childList[i]
            let crushCpt = child.getComponent(CrushComponent)
            if(crushCpt){
                crushCpt.index = index
                crushCpt.zIndex = index
                crushCpt.init(itemIdList[index])
                this.crushCptList.push(crushCpt)
                index = index + 1
            }
        }
        for (let i = 0; i < this.crushCptList.length; i++) {
            let crushCpt = this.crushCptList[i]
            this.autoResetOverList(crushCpt)
        }
        console.log("this.crushCptList.length=",this.crushCptList.length)
        this.refreshMask()
        this.playMoveInAnim(levelRoot)
    }

    collide(ax1,ay1,bx1,by1) {
        var maxX,maxY,minX,minY

        maxX = ax1+this.itemWidth >= bx1+this.itemWidth ? ax1+this.itemWidth : bx1+this.itemWidth
        maxY = ay1+this.itemHeight >= by1+this.itemHeight ? ay1+this.itemHeight : by1+this.itemHeight
        minX = ax1 <= bx1 ? ax1 : bx1
        minY = ay1 <= by1 ? ay1 : by1

        if(maxX - minX < this.itemWidth+this.itemWidth && maxY - minY < this.itemHeight+this.itemHeight){
          return true
        }else{
          return false
        }
    }

    computeArea(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1), overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1);
        const overlapArea = Math.max(overlapWidth, 0) * Math.max(overlapHeight, 0);
        return overlapArea;//this.itemArea + this.itemArea - overlapArea;
    }

    autoResetOverList(cpt){
        cpt.overCrushList = []
        let ax1 = cpt.node.x
        let ay1 = cpt.node.y
        let ax2 = cpt.node.x + this.itemWidth
        let ay2 = cpt.node.y + this.itemHeight
        for (let i = 0; i < this.crushCptList.length; i++) {
            let otherCpt = this.crushCptList[i]
            if(otherCpt.zIndex > cpt.zIndex){
                let bx1 = otherCpt.node.x
                let by1 = otherCpt.node.y
                if(this.collide(ax1,ay1,bx1,by1)){
                    let bx2 = otherCpt.node.x + this.itemWidth
                    let by2 = otherCpt.node.y + this.itemHeight
                    let area = this.computeArea(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)
                    if(area/this.itemArea > this.areamPer){
                        cpt.overCrushList.push(otherCpt)
                    }
                }
            }
        }
    }

    registTouch(){
        let touchBeginPos = null
        let beginX = 0
        let beginY = 0
        let curScene = cc.director.getScene();
        let touchBg = curScene.getChildByName("Canvas").getChildByName("touchBg")
        let selectList = []
        touchBg.on(cc.Node.EventType.TOUCH_START, (evt)=>{
            if(this.isPlayAnim){
                return
            }
            if(this.bottomCptList.length >= this.limitBottomNum){
                return
            }
            touchBeginPos = evt.getLocation();
            let maxI = 0
            let maxCpt = null
            let maxZIndex = -1
            for(let i = 0; i < this.crushCptList.length; i++){
                let cpt = this.crushCptList[i]
                if (!this.needShowMask(cpt) && UtilsSystem.checkTouchNode(cpt.node, touchBeginPos)) {
                    if(cpt.zIndex > maxZIndex){
                        maxCpt = cpt
                        maxI = i
                        maxZIndex = cpt.node.zIndex
                    }
                }
            }
            if(maxCpt){
                //SoundMgr.playSound("yangclick")
                this.crushCptList.splice(maxI, 1)
                this.flyToBottom(maxCpt)
                this.refreshMask()
            }
        })
        touchBg.on(cc.Node.EventType.TOUCH_MOVE, (evt)=>{
        })
        touchBg.on(cc.Node.EventType.TOUCH_END, (evt)=>{
            
        })
    }

    playSceneAnim(callBack){
        this.sceneAnim.x = 1334
        this.sceneAnim.active = true
        cc.tween(this.sceneAnim)
            .to(0.5, { x: 0 }, { easing: 'backOut' })
            .delay(1)
            .to(0.5, { x: -1334 }, { easing: 'backOut' })
            .call(()=>{
                this.sceneAnim.active = false
                if(callBack){
                    callBack()
                }
            })
            .start()
    }

    checkFinishGame(){
        if(this.crushCptList.length == 0){
            let level2 = this.levelNode.getChildByName("level2")
            if(level2.active){
                //GameSystem.win()
            }else{
                this.levelNode.getChildByName("level1").active = false
                this.playSceneAnim(()=>{
                    this.initRandomLevel(level2)
                })
            }
        }
    }

    checkLose(){
        if(this.bottomCptList.length >= this.limitBottomNum){
            if(!this.canBackThree()){
                //GameSystem.lose()
                //GameSystem.loseAnimList = [this.levelNode.getChildByName("level2")]
                //GameSystem.loseAnim()
            }else{
                this.retiveTime = this.retiveTime + 1
                //SheepUI.showUI(SheepToolType.Revive)
            }
        }
    }

    composeAnim(cpt){
        let flash = this.flashList[cpt.bottomIndex]
        flash.active = true
        flash.getComponent(cc.ParticleSystem).resetSystem();
        cc.tween(flash)
            .delay(0.5)
            .call(()=>{
                flash.active = false
            })
            .start()
        cc.tween(cpt.node)
            .to(0.1, { scale: 0 })
            .call(()=>{
                cpt.node.active = false
            })
            .start()
    }

    checkRemoveItems(crushCpt, moveList){
        let moveRight = ()=>{
            for(let i = 0; i < moveList.length; i++){
                let cpt = moveList[i]
                cpt.bottomIndex = cpt.bottomIndex + 1
                let tPos = this.bottomPosList[cpt.bottomIndex]
                cc.Tween.stopAllByTarget(cpt.node)
                cc.tween(cpt.node)
                    .to(this.flyTime, { position: cc.v2(tPos.x, tPos.y) })
                    .start()
            }
        }
        if(crushCpt.bottomIndex < 2){
            moveRight()
            this.checkLose()
            return
        }
        let cpt1 = this.bottomCptList[crushCpt.bottomIndex-2]
        let cpt2 = this.bottomCptList[crushCpt.bottomIndex-1]
        if(crushCpt.crushId != cpt1.crushId || crushCpt.crushId != cpt2.crushId){
            moveRight()
            this.checkLose()
            return
        }
        crushCpt.curState = CrushState.Removed
        cpt1.curState = CrushState.Removed
        cpt2.curState = CrushState.Removed
        TimeSystem.scheduleOnce("checkFinish", this.flyTime+1, ()=>{
            this.checkFinishGame()
        })
        cc.tween(this.levelNode)
            .delay(this.flyTime)
            .call(()=>{
                //SoundMgr.playSound("yangremove")
                this.composeAnim(cpt1)
                this.composeAnim(cpt2)
                this.composeAnim(crushCpt)
            })
            .start()
        this.bottomCptList.splice(crushCpt.bottomIndex-2, 3)
        for(let i = 0; i < moveList.length; i++){
            let cpt = moveList[i]
            cpt.bottomIndex = cpt.bottomIndex + 1
            let pos1 = this.bottomPosList[cpt.bottomIndex]
            cpt.bottomIndex = cpt.bottomIndex - 3
            let pos2 = this.bottomPosList[cpt.bottomIndex]
            cc.Tween.stopAllByTarget(cpt.node)
            cc.tween(cpt.node)
                .to(this.flyTime, { position: cc.v2(pos1.x, pos1.y) })
                .to(this.flyTime, { position: cc.v2(pos2.x, pos2.y) })
                .start()
        }
    }

    flyToBottom(crushCpt){
        this.resetMap[crushCpt.resetIndex] = false
        let moveList = []
        let insertIndex = -1
        if(this.bottomCptList.length <= 1){
            insertIndex = this.bottomCptList.length
        }else{
            for(let i = 0; i < this.bottomCptList.length; i++){
                if(insertIndex != -1){
                    moveList.push(this.bottomCptList[i])
                }else if(this.bottomCptList[i].crushId == crushCpt.crushId && (!this.bottomCptList[i+1] || this.bottomCptList[i+1].crushId != crushCpt.crushId)){
                    insertIndex = i+1
                }
            }
            if(insertIndex == -1){
                insertIndex = this.bottomCptList.length
            }
        }
        crushCpt.curState = CrushState.InBottom
        this.moveCptList.push(crushCpt)
        crushCpt.bottomIndex = insertIndex
        this.bottomCptList.splice(insertIndex, 0, crushCpt)
        let targetNode = this.bottomPosList[crushCpt.bottomIndex]
        //this.isPlayAnim = true
        
        this.checkRemoveItems(crushCpt, moveList)
        cc.Tween.stopAllByTarget(crushCpt.node)
        cc.tween(crushCpt.node)
            .to(this.flyTime, { position: cc.v2(targetNode.x, targetNode.y) })
            .call(()=>{
                //this.isPlayAnim = false
                
            })
            .start()
        /*for(let i = 0; i < moveList.length; i++){
            let cpt = moveList[i]
            cpt.bottomIndex = cpt.bottomIndex + 1
            let tPos = this.bottomPosList[cpt.bottomIndex]
            cc.Tween.stopAllByTarget(cpt.node)
            cc.tween(cpt.node)
                .to(this.flyTime, { position: cc.v2(tPos.x, tPos.y) })
                .start()
        }*/
    }
    
    // update (dt) {}
}
