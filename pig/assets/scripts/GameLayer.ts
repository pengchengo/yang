// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameComponent from "./GameComponent";
import PopLayer, { PopType } from "./PopLayer";
import SettingLayer from "./SettingLayer";
import { ToolSystem } from "./ToolSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameLayer extends cc.Component {
    static Inst = null

    // onLoad () {}

    start () {
        GameLayer.Inst = this
        this.refreshBtn()
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
        if(GameComponent.Inst.back1Num > 0){
            if(!GameComponent.Inst.canUseOne()){
                ToolSystem.showTip("当前不可使用回退道具")
                return
            }
            GameComponent.Inst.back1Num = GameComponent.Inst.back1Num - 1
            GameComponent.Inst.backOne()
            this.refreshBtn()
        }else{
            PopLayer.show({type:PopType.Back1, getCallBack:()=>{
                GameComponent.Inst.back1Num = GameComponent.Inst.back1Num + 1
                this.refreshBtn()
            }})
        }
    }

    public onClickBtn3(){
        if(GameComponent.Inst.useBack3Num > 0){
            ToolSystem.showTip("上移道具只能使用一次")
            return
        }
        if(GameComponent.Inst.back3Num > 0){
            if(!GameComponent.Inst.canBack3()){
                ToolSystem.showTip("当前不可使用上移道具")
                return
            }
            GameComponent.Inst.back3Num = GameComponent.Inst.back3Num - 1
            GameComponent.Inst.backThree()
            this.refreshBtn()
        }else{
            PopLayer.show({type:PopType.Back3, getCallBack:()=>{
                GameComponent.Inst.back3Num = GameComponent.Inst.back3Num + 1
                this.refreshBtn()
            }})
        }
    }

    public onClickBtnRefresh(){
        if(GameComponent.Inst.refreshNum > 0){
            GameComponent.Inst.refreshNum = GameComponent.Inst.refreshNum - 1
            GameComponent.Inst.onClickBtnRefresh()
            this.refreshBtn()
        }else{
            PopLayer.show({type:PopType.Refresh, getCallBack:()=>{
                GameComponent.Inst.refreshNum = GameComponent.Inst.refreshNum + 1
                this.refreshBtn()
            }})
        }
    }

    public onClickSetting(){
        SettingLayer.show()
    }

    refreshBtn(){
        if(GameComponent.Inst.back1Num > 0){
            this.node.getChildByName("btn1").getChildByName("add").active = false
            this.node.getChildByName("btn1").getChildByName("addOne").active = true
        }else{
            this.node.getChildByName("btn1").getChildByName("add").active = true
            this.node.getChildByName("btn1").getChildByName("addOne").active = false
        }
        if(GameComponent.Inst.back3Num > 0){
            this.node.getChildByName("btn3").getChildByName("add").active = false
            this.node.getChildByName("btn3").getChildByName("addOne").active = true
        }else{
            this.node.getChildByName("btn3").getChildByName("add").active = true
            this.node.getChildByName("btn3").getChildByName("addOne").active = false
        }
        if(GameComponent.Inst.refreshNum > 0){
            this.node.getChildByName("btnRefresh").getChildByName("add").active = false
            this.node.getChildByName("btnRefresh").getChildByName("addOne").active = true
        }else{
            this.node.getChildByName("btnRefresh").getChildByName("add").active = true
            this.node.getChildByName("btnRefresh").getChildByName("addOne").active = false
        }
    }
    // update (dt) {}
}
