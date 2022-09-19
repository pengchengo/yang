// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameLayer from "./GameLayer";
import PigComponent, { PigState } from "./PigComponent";
import PopLayer, { PopType } from "./PopLayer";
import ResultLayer from "./ResultLayer";
import { ToolSystem } from "./ToolSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameComponent extends cc.Component {
    static Inst = null
    pigAtlas = null
    pigCfg1 = [1,2,3,3,3,2,2,2,3,1,1,1,1,1,3,3,2,2]
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
    hsCptList = []
    maskLayer = null
    back3Num = 0
    back1Num = 0
    refreshNum = 0
    useBack3Num = 0
    firstLevel = null
    randomLevel = null
    tipAnim = null

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        ToolSystem.init()
        ToolSystem.playMusic()
        GameComponent.Inst = this
        this.node = this.node
        this.restartLevel()
    }
    
    restartLevel(){
        this.back3Num = 0
        this.back1Num = 0
        this.refreshNum = 0
        this.useBack3Num = 0
        this.slotPosList = []
        this.effectList = []
        this.hs3Map = {}
        if(this.firstLevel){
            this.firstLevel.destroy()
            this.firstLevel = null
        }
        if(this.randomLevel){
            this.randomLevel.destroy()
            this.randomLevel = null
        }
        this.initMask()
        this.node.getChildByName("uiRoot").active = true
        this.tipAnim = this.node.getChildByName("tipAnim")
        this.tipAnim.active = false
        let slotList = this.node.getChildByName("slotList")
        for (let i = 1; i <= this.slotNum; i++) {
            let item = slotList.getChildByName("s"+i)
            let effect = item.getChildByName("effect")
            effect.active = false
            this.effectList.push(effect)
            this.slotPosList.push(item)
        }
        this.node.getChildByName("pigList1").active = false
        this.node.getChildByName("pigList2").active = false
        
        cc.resources.load("pig",cc.SpriteAtlas,(err: Error, atlas:cc.SpriteAtlas)=>{
            this.pigAtlas = atlas
            this.initPigList1()
            this.initTouch()
        })
    }

    initMask(){
        this.maskLayer = this.node.getChildByName("uiRoot").getChildByName("maskLayer")
        this.maskLayer.active = false
        this.maskLayer.on(cc.Node.EventType.TOUCH_START, (evt)=>{
        })
    }

    static showMask(){
        GameComponent.Inst.maskLayer.active = true
    }

    static hideMask(){
        GameComponent.Inst.maskLayer.active = false
    }

    public onClickBtn1(){
        PopLayer.show(()=>{
            this.backOne()
        })
    }

    public onClickBtn3(){
        this.backThree()
    }

    public onClickBtnRefresh(){
        let pigIdList = []
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigCpt = this.pigCptList[i]
            pigIdList.push(pigCpt.pigId)
        }
        ToolSystem.shuffle(pigIdList)
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigCpt = this.pigCptList[i]
            pigCpt.pigId = pigIdList[i]
            pigCpt.icon.destroy()
            let name = ""
            if(pigCpt.pigId < 10){
                name = "1000" + pigCpt.pigId
            }else{
                name = "100" + pigCpt.pigId
            }
            let icon = this.maskCp(pigCpt.node, this.pigAtlas.getSpriteFrame(name), "icon")
            icon.scale = 1
            pigCpt.icon = icon
        }
    }

    update(dt){
        ToolSystem.update(dt)
    }

    refreshMk(cpt){
        for(let i = 0; i < cpt.upPigList.length; i++){
            let overCpt = cpt.upPigList[i]
            if(overCpt.curState == PigState.CanMove){
                return true
            }
            if(overCpt.node.active && overCpt.curState == PigState.CanMove && this.refreshMk(overCpt)){
                return true
            }
        }
        return false
    }

    refreshBlack(){
        for(let i = 0; i < this.pigCptList.length; i++){
            let cpt = this.pigCptList[i]
            if(this.refreshMk(cpt)){
                cpt.mk.active = true
            }else{
                cpt.mk.active = false
            }
        }
    }

    getEmptyPos(){
        for(let i = 1; i <= 3; i++){
            if(!this.hs3Map[i]){
                return i
            }
        }
        return 0
    }

    backThree(){
        this.useBack3Num = this.useBack3Num + 1
        let slotList = this.node.getChildByName("slotList")
        for(let i = 3; i >= 1; i--){
            let cpt = this.slotPigList[0]
            if(cpt){
                let resetPos = this.getEmptyPos()
                if(!resetPos){
                    break
                }
                this.slotPigList.splice(0, 1)
                cpt.curState = PigState.MoveUp
                cpt.resetIndex = resetPos
                this.hs3Map[cpt.resetIndex] = true
                let posNode = this.node.getChildByName("b"+resetPos)
                cpt.node.x = posNode.x
                cpt.node.y = posNode.y
                cpt.node.zIndex = this.pigCptList.length+2
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

    backOne(){
        if(!this.canUseOne()){
            return
        }
        let lastCpt = this.hsCptList[this.hsCptList.length-1]
        if(lastCpt.curState == PigState.IsDestroyed){
            return
        }
        lastCpt.node.x = lastCpt.startX
        lastCpt.node.y = lastCpt.startY
        lastCpt.curState = PigState.CanMove
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
        this.refreshBlack()
    }

    initPigList1(){
        let pigRoot = cc.instantiate(this.node.getChildByName("pigList1"))
        this.node.getChildByName("levelRoot").addChild(pigRoot)
        pigRoot.active = true
        this.firstLevel = pigRoot
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
        this.refreshBlack()
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigNode = this.pigCptList[i].node
            let endY = pigNode.y
            pigNode.y = pigNode.y + 1000
            let delayTime = 1
            if(i >= 9){
                delayTime = 1.2
            }
            cc.tween(pigNode)
                .delay(delayTime)
                .to(0.3, { y: endY })
                .start()
        }

    }

    setPig(cpt, id, index){
        cpt.startX = cpt.node.x
        cpt.startY = cpt.node.y
        cpt.curState = PigState.CanMove
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

    initPigList2(){
        this.randomLevel = cc.instantiate(this.node.getChildByName("pigList2"))
        this.node.getChildByName("levelRoot").addChild(this.randomLevel)
        this.randomLevel.active = true
        this.pigCptList = []
        this.slotPigList = []
        this.hsCptList = []
        let iconList = []
        for(let i = 1; i <= 14; i++){
            iconList.push(i)
        }
        ToolSystem.shuffle(iconList)
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
        ToolSystem.shuffle(itemIdList)
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
        checkNode(this.randomLevel)
        for (let i = 0; i < this.pigCptList.length; i++) {
            let pigCpt = this.pigCptList[i]
            this.setUpList(pigCpt)
        }
        this.refreshBlack()
        this.tipAnim.x = 1334
        this.tipAnim.active = true
        cc.tween(this.tipAnim)
            .delay(1)
            .to(0.5, { x: 0 }, { easing: 'backOut' })
            .delay(1)
            .to(0.5, { x: -1334 }, { easing: 'backOut' })
            .call(()=>{
                this.tipAnim.active = false
            })
            .start()
        this.randomLevel.x = 1000
        cc.tween(this.randomLevel)
            .delay(0.1)
            .to(1, { position: cc.v2(0, 0) }, { easing: 'backOut' })
            .start()
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
                let bx2 = otherCpt.node.x + this.pigWidth
                let by2 = otherCpt.node.y + this.pigHeight
                const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1), overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1);
                const overlapArea = Math.max(overlapWidth, 0) * Math.max(overlapHeight, 0);
                if(overlapArea > this.pigArea/8){
                    cpt.upPigList.push(otherCpt)
                }
            }
        }
    }

    initTouch(){
        let touchBeginPos = null
        let curScene = cc.director.getScene();
        let touchBg = curScene.getChildByName("Canvas").getChildByName("touch")
        touchBg.off(cc.Node.EventType.TOUCH_START)
        touchBg.on(cc.Node.EventType.TOUCH_START, (evt)=>{
            if(this.slotPigList.length >= this.slotNum){
                return
            }
            touchBeginPos = evt.getLocation();
            for(let i = 0; i < this.pigCptList.length; i++){
                let cpt = this.pigCptList[i]
                if (ToolSystem.isInNode(cpt.icon, touchBeginPos) && !this.refreshMk(cpt)) {
                    this.pigCptList.splice(i, 1)
                    this.MovetoSlot(cpt)
                    this.refreshBlack()
                    ToolSystem.playEffect("click")
                    break
                }
            }
        })
    }

    findLose(){
        if(this.slotPigList.length >= this.slotNum){
            if(GameComponent.Inst.useBack3Num > 0){
                ResultLayer.show(false)
                return
            }
            if(GameComponent.Inst.back3Num > 0){
                GameComponent.Inst.back3Num = GameComponent.Inst.back3Num - 1
                GameComponent.Inst.backThree()
                GameLayer.Inst.refreshBtn()
            }else{
                PopLayer.show({type:PopType.Revive, getCallBack:()=>{
                    GameComponent.Inst.backThree()
                    GameLayer.Inst.refreshBtn()
                }})
            }
        }
    }

    canBack3(){
        if(this.slotPigList.length <= 0){
            return false
        }
        if(this.getEmptyPos()){
            return true
        }else{
            return false
        }
    }

    canUseOne(){
        if(this.hsCptList.length <= 0){
            return false
        }
        let lastCpt = this.hsCptList[this.hsCptList.length-1]
        if(lastCpt.curState == PigState.IsDestroyed){
            return false
        }
        return true
    }

    disappearEffect(cpt){
        ToolSystem.playEffect("compose")
        let effect = this.effectList[cpt.bottomIndex]
        effect.active = true
        effect.getComponent(cc.ParticleSystem).resetSystem();
        cc.tween(effect)
            .delay(0.5)
            .call(()=>{
                effect.active = false
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
            this.findLose()
            return
        }
        let cpt1 = this.slotPigList[pigCpt.bottomIndex-2]
        let cpt2 = this.slotPigList[pigCpt.bottomIndex-1]
        if(pigCpt.pigId != cpt1.pigId || pigCpt.pigId != cpt2.pigId){
            moveRight()
            this.findLose()
            return
        }
        pigCpt.curState = PigState.IsDestroyed
        cpt1.curState = PigState.IsDestroyed
        cpt2.curState = PigState.IsDestroyed
        ToolSystem.scheduleOnce("checkFinish", this.fnt+1, ()=>{
            if(this.pigCptList.length == 0){
                if(this.randomLevel){
                    ResultLayer.show(true)
                }else{
                    this.node.getChildByName("pigList1").active = false
                    this.initPigList2()
                }
            }
        })
        cc.tween(this.node)
            .delay(this.fnt)
            .call(()=>{
                //SoundMgr.playSound("yangremove")
                this.disappearEffect(cpt1)
                this.disappearEffect(cpt2)
                this.disappearEffect(pigCpt)
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

    MovetoSlot(pigCpt){
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
        pigCpt.curState = PigState.InSlot
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
            })
            .start()
    }
}
