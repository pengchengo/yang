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
    pigWidth = 90
    pigHeight = 100
    pigArea = 90*100
    fnt = 0.1
    levelNode
    slotNum = 7
    pigCptList = []
    slotPigList = []
    slotPosList = []
    hs3Map = {}
    effectList = []
    isPlayAnim = false
    hsCptList = []
    retiveTime = 0
    sceneAnim = null
    isPause = false

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node = this.node
        this.slotPosList = []
        this.effectList = []
        this.hs3Map = {}
        this.isPlayAnim = false
        this.sceneAnim = this.node.getChildByName("anim")
        this.sceneAnim.active = false
        let posList = this.node.getChildByName("posList")
        for (let i = 1; i <= this.slotNum; i++) {
            let item = posList.getChildByName("pos"+i)
            let flash = item.getChildByName("flash")
            flash.active = false
            this.effectList.push(flash)
            this.slotPosList.push(item)
        }
        let pigList1 = this.node.getChildByName("pigList1")
        this.node.getChildByName("pigList2").active = false
        this.isPause = false
        
        cc.resources.load("pig",cc.SpriteAtlas,(err: Error, atlas:cc.SpriteAtlas)=>{
            this.pigAtlas = atlas
            this.initPigList1(pigList1)
            this.registTouch()
        })
    }
    
    public onClickBtn1(){
        this.backOne()
    }

    public onClickBtn3(){
        this.backThree()
    }

    public onClickBtnRefresh(){

    }

    update(dt){
        TimeSystem.update(dt)
    }

    registBtn(){
    }

    needShowMask(cpt){
        for(let i = 0; i < cpt.upPigList.length; i++){
            let overCpt = cpt.upPigList[i]
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
            if(!this.hs3Map[i]){
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

    backThree(){
        let posList = this.node.getChildByName("posList")
        for(let i = 3; i >= 1; i--){
            let cpt = this.slotPigList[0]
            if(cpt){
                let resetPos = this.getBackEmptyPos()
                if(!resetPos){
                    break
                }
                this.slotPigList.splice(0, 1)
                cpt.curState = PigState.Reset
                cpt.resetIndex = resetPos
                this.hs3Map[cpt.resetIndex] = true
                let posNode = posList.getChildByName("resetpos"+resetPos)
                cpt.node.x = posNode.x
                cpt.node.y = posNode.y
                this.pigCptList.push(cpt)
                for(let j = this.hsCptList.length-1; j >= 0; j--){
                    if(this.hsCptList[j] == cpt){
                        this.hsCptList.splice(j, 1)
                        break
                    }
                }
            }
        }
        for(let i = 0; i < this.slotPigList.length; i++){
            let cpt = this.slotPigList[i]
            cpt.bottomIndex = i
            let tPos = this.slotPosList[cpt.bottomIndex]
            cpt.node.x = tPos.x
            cpt.node.y = tPos.y
        }
    }

    canBackOne(){
        if(this.hsCptList.length <= 0){
            return false
        }
        let lastCpt = this.hsCptList[this.hsCptList.length-1]
        if(lastCpt.curState == PigState.Removed){
            return false
        }
        return true
    }

    backOne(){
        if(this.hsCptList.length <= 0){
            return
        }
        let lastCpt = this.hsCptList[this.hsCptList.length-1]
        if(lastCpt.curState == PigState.Removed){
            return
        }
        lastCpt.node.x = lastCpt.startX
        lastCpt.node.y = lastCpt.startY
        lastCpt.curState = PigState.InList
        for(let i = lastCpt.bottomIndex+1; i < this.slotPigList.length; i++){
            let cpt = this.slotPigList[i]
            cpt.bottomIndex = cpt.bottomIndex - 1
            let tPos = this.slotPosList[cpt.bottomIndex]
            cpt.node.x = tPos.x
            cpt.node.y = tPos.y
        }
        this.slotPigList.splice(lastCpt.bottomIndex, 1)
        this.pigCptList.push(lastCpt)
        this.hsCptList.pop()
        this.refreshMask()
    }

    initPigList1(pigRoot){
        pigRoot.active = true
        this.pigCptList = []
        this.slotPigList = []
        this.hsCptList = []
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
        this.slotPigList = []
        this.hsCptList = []
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

    setUpList(cpt){
        cpt.upPigList = []
        let ax1 = cpt.node.x
        let ay1 = cpt.node.y
        let ax2 = cpt.node.x + this.pigWidth
        let ay2 = cpt.node.y + this.pigHeight
        for (let i = 0; i < this.pigCptList.length; i++) {
            let otherCpt = this.pigCptList[i]
            if(otherCpt.zIndex > cpt.zIndex){
                let bx1 = otherCpt.node.x
                let by1 = otherCpt.node.y
                var maxX,maxY,minX,minY
                maxX = ax1+this.pigWidth >= bx1+this.pigWidth ? ax1+this.pigWidth : bx1+this.pigWidth
                maxY = ay1+this.pigHeight >= by1+this.pigHeight ? ay1+this.pigHeight : by1+this.pigHeight
                minX = ax1 <= bx1 ? ax1 : bx1
                minY = ay1 <= by1 ? ay1 : by1
                if(maxX - minX < this.pigWidth+this.pigWidth && maxY - minY < this.pigHeight+this.pigHeight){
                    let bx2 = otherCpt.node.x + this.pigWidth
                    let by2 = otherCpt.node.y + this.pigHeight
                    const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1), overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1);
                    const overlapArea = Math.max(overlapWidth, 0) * Math.max(overlapHeight, 0);
                    if(overlapArea > this.pigArea/6.5){
                        cpt.upPigList.push(otherCpt)
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
            if(this.slotPigList.length >= this.slotNum){
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
        if(this.slotPigList.length >= this.slotNum){
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
        let flash = this.effectList[cpt.bottomIndex]
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

    removePigs(pigCpt, moveList){
        let moveRight = ()=>{
            for(let i = 0; i < moveList.length; i++){
                let cpt = moveList[i]
                cpt.bottomIndex = cpt.bottomIndex + 1
                let tPos = this.slotPosList[cpt.bottomIndex]
                cc.Tween.stopAllByTarget(cpt.node)
                cc.tween(cpt.node)
                    .to(this.fnt, { position: cc.v2(tPos.x, tPos.y) })
                    .start()
            }
        }
        if(pigCpt.bottomIndex < 2){
            moveRight()
            this.checkLose()
            return
        }
        let cpt1 = this.slotPigList[pigCpt.bottomIndex-2]
        let cpt2 = this.slotPigList[pigCpt.bottomIndex-1]
        if(pigCpt.pigId != cpt1.pigId || pigCpt.pigId != cpt2.pigId){
            moveRight()
            this.checkLose()
            return
        }
        pigCpt.curState = PigState.Removed
        cpt1.curState = PigState.Removed
        cpt2.curState = PigState.Removed
        TimeSystem.scheduleOnce("checkFinish", this.fnt+1, ()=>{
            this.checkFinishGame()
        })
        cc.tween(this.node)
            .delay(this.fnt)
            .call(()=>{
                //SoundMgr.playSound("yangremove")
                this.composeAnim(cpt1)
                this.composeAnim(cpt2)
                this.composeAnim(pigCpt)
            })
            .start()
        this.slotPigList.splice(pigCpt.bottomIndex-2, 3)
        for(let i = 0; i < moveList.length; i++){
            let cpt = moveList[i]
            cpt.bottomIndex = cpt.bottomIndex + 1
            let pos1 = this.slotPosList[cpt.bottomIndex]
            cpt.bottomIndex = cpt.bottomIndex - 3
            let pos2 = this.slotPosList[cpt.bottomIndex]
            cc.Tween.stopAllByTarget(cpt.node)
            cc.tween(cpt.node)
                .to(this.fnt, { position: cc.v2(pos1.x, pos1.y) })
                .to(this.fnt, { position: cc.v2(pos2.x, pos2.y) })
                .start()
        }
    }

    flyToBottom(pigCpt){
        this.hs3Map[pigCpt.resetIndex] = false
        let moveList = []
        let insertIndex = -1
        if(this.slotPigList.length <= 1){
            insertIndex = this.slotPigList.length
        }else{
            for(let i = 0; i < this.slotPigList.length; i++){
                if(insertIndex != -1){
                    moveList.push(this.slotPigList[i])
                }else if(this.slotPigList[i].pigId == pigCpt.pigId && (!this.slotPigList[i+1] || this.slotPigList[i+1].pigId != pigCpt.pigId)){
                    insertIndex = i+1
                }
            }
            if(insertIndex == -1){
                insertIndex = this.slotPigList.length
            }
        }
        pigCpt.curState = PigState.InBottom
        this.hsCptList.push(pigCpt)
        pigCpt.bottomIndex = insertIndex
        this.slotPigList.splice(insertIndex, 0, pigCpt)
        let targetNode = this.slotPosList[pigCpt.bottomIndex]
        //this.isPlayAnim = true
        
        this.removePigs(pigCpt, moveList)
        cc.Tween.stopAllByTarget(pigCpt.node)
        cc.tween(pigCpt.node)
            .to(this.fnt, { position: cc.v2(targetNode.x, targetNode.y) })
            .call(()=>{
                //this.isPlayAnim = false
                
            })
            .start()
        /*for(let i = 0; i < moveList.length; i++){
            let cpt = moveList[i]
            cpt.bottomIndex = cpt.bottomIndex + 1
            let tPos = this.slotPosList[cpt.bottomIndex]
            cc.Tween.stopAllByTarget(cpt.node)
            cc.tween(cpt.node)
                .to(this.fnt, { position: cc.v2(tPos.x, tPos.y) })
                .start()
        }*/
    }
    
    // update (dt) {}
}
