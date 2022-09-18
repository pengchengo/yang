// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";

const {ccclass, property} = cc._decorator;

export enum PopType{
    Back3,
    Back1,
    Refresh,
    Revive
}

@ccclass
export default class PopLayer extends cc.Component {
    static Inst = null
    info
    // onLoad () {}

    start () {
        PopLayer.Inst = this
        this.node.active = false
    }

    static show(info){
        PopLayer.Inst.show(info)
    }

    show(info){
        GameComponent.showMask()
        this.info = info
        this.node.active = true
        let type = info.type
        this.node.getChildByName("back1").active = false
        this.node.getChildByName("back3").active = false
        this.node.getChildByName("refresh").active = false
        this.node.getChildByName("revive").active = false
        if(type == PopType.Back3){
            this.node.getChildByName("back3").active = true
        }else if(type == PopType.Back1){
            this.node.getChildByName("back1").active = true
        }else if(type == PopType.Refresh){
            this.node.getChildByName("refresh").active = true
        }else if(type == PopType.Revive){
            this.node.getChildByName("revive").active = true
        }
    }

    hide(){
        GameComponent.hideMask()
        this.node.active = false
    }

    onClickGet(){
        this.hide()
        if(this.info.getCallBack){
            this.info.getCallBack()
        }
    }

    onClickClose(){
        this.hide()
    }
    // update (dt) {}
}
