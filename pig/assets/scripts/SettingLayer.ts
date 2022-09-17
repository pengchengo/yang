// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SettingLayer extends cc.Component {
    static Inst = null

    onLoad () {
    }

    start () {
        SettingLayer.Inst = this
        this.node.active = false
    }

    static show(){
        SettingLayer.Inst.show()
    }

    show(){
        GameComponent.showMask()
        this.node.active = true
    }

    hide(){
        GameComponent.hideMask()
        this.node.active = false
    }

    onClickEffect(){
        this.hide()
    }

    onClickMusic(){
        this.hide()
    }

    onClickClose(){
        this.hide()
    }

    onClickRestart(){
        this.hide()
    }
    // update (dt) {}
}
