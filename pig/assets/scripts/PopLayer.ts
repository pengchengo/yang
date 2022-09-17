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
