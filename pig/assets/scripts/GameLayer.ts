// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";
import PopLayer, { PopType } from "./PopLayer";
import SettingLayer from "./SettingLayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameLayer extends cc.Component {
    static Inst = null

    // onLoad () {}

    start () {
        GameLayer.Inst = this
    }

    static show(){
        GameLayer.Inst.show()
    }

    show(){
        this.node.active = true
    }

    hide(){
        this.node.active = false
    }

    public onClickBtn1(){
        PopLayer.show({type:PopType.Back1, getCallBack:()=>{
            GameComponent.Inst.backOne()
        }})
    }

    public onClickBtn3(){
        PopLayer.show({type:PopType.Back3, getCallBack:()=>{
            GameComponent.Inst.backThree()
        }})
    }

    public onClickBtnRefresh(){
        PopLayer.show({type:PopType.Refresh, getCallBack:()=>{

        }})
    }

    public onClickSetting(){
        SettingLayer.show()
    }
    // update (dt) {}
}
