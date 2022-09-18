// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";
import { ToolSystem } from "./ToolSystem";

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
        if(ToolSystem.hasMusic()){
            this.node.getChildByName("btnMusic").getChildByName("open").active = true
        }else{
            this.node.getChildByName("btnMusic").getChildByName("open").active = false
        }
        if(ToolSystem.hasSound()){
            this.node.getChildByName("btnSound").getChildByName("open").active = true
        }else{
            this.node.getChildByName("btnSound").getChildByName("open").active = false
        }
    }

    onClickEffect(){
        ToolSystem.changeSound()
        this.refreshBtn()
    }

    onClickMusic(){
        if(ToolSystem.hasMusic()){
            ToolSystem.changeMusic()
            ToolSystem.stopMusic()
        }else{
            ToolSystem.changeMusic()
            ToolSystem.playMusic()
        }
        this.refreshBtn()
    }

    onClickClose(){
        this.hide()
    }

    onClickRestart(){
        this.hide()
        GameComponent.Inst.restartLevel()
    }
    // update (dt) {}
}
