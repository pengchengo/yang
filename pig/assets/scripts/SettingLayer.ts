// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";
import { ToolHelper } from "./ToolHelper";

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
        this.refreshBtn()
    }

    hide(){
        GameComponent.hideMask()
        this.node.active = false
    }

    refreshBtn(){
        if(ToolHelper.hasMusic()){
            this.node.getChildByName("btnMusic").getChildByName("open").active = true
        }else{
            this.node.getChildByName("btnMusic").getChildByName("open").active = false
        }
        if(ToolHelper.hasSound()){
            this.node.getChildByName("btnSound").getChildByName("open").active = true
        }else{
            this.node.getChildByName("btnSound").getChildByName("open").active = false
        }
    }

    onClickEffect(){
        ToolHelper.playEffect("click")
        ToolHelper.changeSound()
        this.refreshBtn()
    }

    onClickMusic(){
        ToolHelper.playEffect("click")
        if(ToolHelper.hasMusic()){
            ToolHelper.changeMusic()
            ToolHelper.stopMusic()
        }else{
            ToolHelper.changeMusic()
            ToolHelper.playMusic()
        }
        this.refreshBtn()
    }

    onClickClose(){
        ToolHelper.playEffect("click")
        this.hide()
    }

    onClickRestart(){
        ToolHelper.playEffect("click")
        this.hide()
        GameComponent.Inst.restartLevel()
    }
    // update (dt) {}
}
