// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import PigComponent, { PigState } from "./PigComponent";
import { TimeSystem } from "./TimeSystem";
import { UtilsSystem } from "./UtilsSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameComponent extends cc.Component {
    pigAtlas = null
    pigCfg1 = [1,2,3,4,1,2,3,4,1,2,3,4]
    areamPer = 1/6
    pigWidth = 90
    pigHeight = 100
    itemArea = 90*100
    flyTime = 0.1
    levelNode
    limitBottomNum = 7
    pigCptList = []
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
        this.node = this.node
        this.bottomPosList = []
        this.flashList = []
        this.resetMap = {}
        this.isPlayAnim = false
        this.backThreeTime = 0
        this.retiveTime = 0
        this.sceneAnim = this.node.getChildByName("anim")
        this.sceneAnim.active = false
        let posList = this.node.getChildByName("posList")
        for (let i = 1; i <= this.limitBottomNum; i++) {
            let item = posList.getChildByName("pos"+i)
            let flash = item.getChildByName("flash")
            flash.active = false
            this.flashList.push(flash)
            this.bottomPosList.push(item)
        }
        let pigList1 = this.node.getChildByName("pigList1")
        this.node.getChildByName("pigList2").active = false
        this.passTime = 0
        this.isPause = false
        
        cc.resources.load("pig",cc.SpriteAtlas,(err: Error, atlas:cc.SpriteAtlas)=>{
            this.pigAtlas = atlas
            this.initPigList1(pigList1)
            this.registTouch()
        })
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
        for(let i = 0; i < cpt.overPigList.length; i++){
            let overCpt = cpt.overPigList[i]
            if(overCpt.curState == PigState.InList){
                return true
            }
            if(this.needShowMask(overCpt)){
                return true
            }
        }
        return false
    }

    refreshMask(){
        for(let i = 0; i < this.pigCptList.length; i++){
            let cpt = this.pigCptList[i]
            if(this.needShowMask(cpt)){
                cpt.mk.active = true
            }else{
                cpt.mk.active = false
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
        let posList = this.node.getChildByName("posList")
        for(let i = 3; i >= 1; i--){
            let cpt = this.bottomCptList[0]
            if(cpt){
                let resetPos = this.getBackEmptyPos()
                if(!resetPos){
                    break
                }
                this.bottomCptList.splice(0, 1)
                cpt.curState = PigState.Reset
                cpt.resetIndex = resetPos
                this.resetMap[cpt.resetIndex] = true
                let posNode = posList.getChildByName("resetpos"+resetPos)
                cpt.node.x = posNode.x
                cpt.node.y = posNode.y
                this.pigCptList.push(cpt)
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
        if(lastCpt.curState == PigState.Removed){
            return false
        }
        return true
    }

    backOne(){
        if(this.moveCptList.length <= 0){
            return
        }
        let lastCpt = this.moveCptList[this.moveCptList.length-1]
        if(lastCpt.curState == PigState.Removed){
            return
        }
        lastCpt.node.x = lastCpt.startX
        lastCpt.node.y = lastCpt.startY
        lastCpt.curState = PigState.InList
        for(let i = lastCpt.bottomIndex+1; i < this.bottomCptList.length; i++){
            let cpt = this.bottomCptList[i]
            cpt.bottomIndex = cpt.bottomIndex - 1
            let tPos = this.bottomPosList[cpt.bottomIndex]
            cpt.node.x = tPos.x
            cpt.node.y = tPos.y
        }
        this.bottomCptList.splice(lastCpt.bottomIndex, 1)
        this.pigCptList.push(lastCpt)
        this.moveCptList.pop()
        this.refreshMask()
    }

    initPigList1(pigRoot){
        pigRoot.active = true
        this.pigCptList = []
        this.bottomCptList = []
        this.moveCptList = []
        //@ts-ignore
        let childList = pigRoot._children
        let index = 1
        for (let i = 0; i < childList.length; i++) {
            let child = childList[i]
            let pigCpt = child.getComponent(PigComponent)
            if(pigCpt){
                this.setPig(pigCpt, this.pigCfg1[index-1], index)
                this.pigCptList.push(pigCpt)
                index = index + 1
            }
        }
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigCpt = this.pigCptList[i]
            this.setUpList(pigCpt)
        }
        this.refreshMask()
        this.playMoveInAnim(pigRoot, 1)

    }

    setPig(cpt, id, index){
        cpt.index = index
        cpt.node.zIndex = index
        cpt.zIndex = index
        cpt.pigId = id
        let atlas = this.pigAtlas
        let name = ""
        if(id < 10){
            name = "1000" + id
        }else{
            name = "100" + id
        }
        let icon = this.maskCp(cpt.node, atlas.getSpriteFrame(name), "icon")
        icon.scale = 1
        cpt.icon = icon
        let mk = this.maskCp(cpt.node, atlas.getSpriteFrame("mask"), "black")
        mk.zIndex = 2
        mk.scale = 1
        //mk.opacity = 102
        //mk.color = cc.Color.WHITE
        cpt.mk = mk
    }

    maskCp(r, s, name){
        let n = new cc.Node(name)
        let sprite = n.addComponent(cc.Sprite)
        sprite.spriteFrame = s
        r.addChild(n)
        return n
    }

    playMoveInAnim(pigRoot,delayTime = 0){
        pigRoot.y = 1000
        cc.tween(pigRoot)
            .delay(delayTime)
            .to(1, { position: cc.v2(0, 0) }, { easing: 'backOut' })
            .start()
    }

    initRandomLevel(pigRoot){
        pigRoot.active = true
        this.pigCptList = []
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
        
        
        let index = 0
        let checkNode = (root)=>{
            //@ts-ignore
            let childList = root._children
            for (let i = 0; i < childList.length; i++) {
                let child = childList[i]
                checkNode(child)
                let pigCpt = child.getComponent(PigComponent)
                if(pigCpt){
                    this.setPig(pigCpt, itemIdList[index], index)
                    this.pigCptList.push(pigCpt)
                    index = index + 1
                }
            }
        }
        checkNode(pigRoot)
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigCpt = this.pigCptList[i]
            this.setUpList(pigCpt)
        }
        console.log("this.pigCptList.length=",this.pigCptList.length)
        this.refreshMask()
        this.playMoveInAnim(pigRoot)
    }

    collide(ax1,ay1,bx1,by1) {
        var maxX,maxY,minX,minY

        maxX = ax1+this.pigWidth >= bx1+this.pigWidth ? ax1+this.pigWidth : bx1+this.pigWidth
        maxY = ay1+this.pigHeight >= by1+this.pigHeight ? ay1+this.pigHeight : by1+this.pigHeight
        minX = ax1 <= bx1 ? ax1 : bx1
        minY = ay1 <= by1 ? ay1 : by1

        if(maxX - minX < this.pigWidth+this.pigWidth && maxY - minY < this.pigHeight+this.pigHeight){
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

    setUpList(cpt){
        cpt.overPigList = []
        let ax1 = cpt.node.x
        let ay1 = cpt.node.y
        let ax2 = cpt.node.x + this.pigWidth
        let ay2 = cpt.node.y + this.pigHeight
        for (let i = 0; i < this.pigCptList.length; i++) {
            let otherCpt = this.pigCptList[i]
            if(otherCpt.zIndex > cpt.zIndex){
                let bx1 = otherCpt.node.x
                let by1 = otherCpt.node.y
                if(this.collide(ax1,ay1,bx1,by1)){
                    let bx2 = otherCpt.node.x + this.pigWidth
                    let by2 = otherCpt.node.y + this.pigHeight
                    let area = this.computeArea(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)
                    if(area/this.itemArea > this.areamPer){
                        cpt.overPigList.push(otherCpt)
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
            for(let i = 0; i < this.pigCptList.length; i++){
                let cpt = this.pigCptList[i]
                if (!this.needShowMask(cpt) && UtilsSystem.checkTouchNode(cpt.icon, touchBeginPos)) {
                    if(cpt.zIndex > maxZIndex){
                        maxCpt = cpt
                        maxI = i
                        maxZIndex = cpt.node.zIndex
                    }
                }
            }
            if(maxCpt){
                //SoundMgr.playSound("yangclick")
                this.pigCptList.splice(maxI, 1)
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
        if(this.pigCptList.length == 0){
            let pigList2 = this.node.getChildByName("pigList2")
            if(pigList2.active){
                //GameSystem.win()
            }else{
                this.node.getChildByName("pigList1").active = false
                this.playSceneAnim(()=>{
                    this.initRandomLevel(pigList2)
                })
            }
        }
    }

    checkLose(){
        if(this.bottomCptList.length >= this.limitBottomNum){
            if(!this.canBackThree()){
                //GameSystem.lose()
                //GameSystem.loseAnimList = [this.node.getChildByName("level2")]
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

    checkRemoveItems(pigCpt, moveList){
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
        if(pigCpt.bottomIndex < 2){
            moveRight()
            this.checkLose()
            return
        }
        let cpt1 = this.bottomCptList[pigCpt.bottomIndex-2]
        let cpt2 = this.bottomCptList[pigCpt.bottomIndex-1]
        if(pigCpt.pigId != cpt1.pigId || pigCpt.pigId != cpt2.pigId){
            moveRight()
            this.checkLose()
            return
        }
        pigCpt.curState = PigState.Removed
        cpt1.curState = PigState.Removed
        cpt2.curState = PigState.Removed
        TimeSystem.scheduleOnce("checkFinish", this.flyTime+1, ()=>{
            this.checkFinishGame()
        })
        cc.tween(this.node)
            .delay(this.flyTime)
            .call(()=>{
                //SoundMgr.playSound("yangremove")
                this.composeAnim(cpt1)
                this.composeAnim(cpt2)
                this.composeAnim(pigCpt)
            })
            .start()
        this.bottomCptList.splice(pigCpt.bottomIndex-2, 3)
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

    flyToBottom(pigCpt){
        this.resetMap[pigCpt.resetIndex] = false
        let moveList = []
        let insertIndex = -1
        if(this.bottomCptList.length <= 1){
            insertIndex = this.bottomCptList.length
        }else{
            for(let i = 0; i < this.bottomCptList.length; i++){
                if(insertIndex != -1){
                    moveList.push(this.bottomCptList[i])
                }else if(this.bottomCptList[i].pigId == pigCpt.pigId && (!this.bottomCptList[i+1] || this.bottomCptList[i+1].pigId != pigCpt.pigId)){
                    insertIndex = i+1
                }
            }
            if(insertIndex == -1){
                insertIndex = this.bottomCptList.length
            }
        }
        pigCpt.curState = PigState.InBottom
        this.moveCptList.push(pigCpt)
        pigCpt.bottomIndex = insertIndex
        this.bottomCptList.splice(insertIndex, 0, pigCpt)
        let targetNode = this.bottomPosList[pigCpt.bottomIndex]
        //this.isPlayAnim = true
        
        this.checkRemoveItems(pigCpt, moveList)
        cc.Tween.stopAllByTarget(pigCpt.node)
        cc.tween(pigCpt.node)
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
