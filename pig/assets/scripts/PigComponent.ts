// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

export enum PigState{
    InList = 1,
    InBottom = 2,
    Reset = 3,
    Removed = 4
}

@ccclass
export default class PigComponent extends cc.Component {
    pigId: Number = 0;
    overPigList: PigComponent[] = [];
    maskNode = null
    index = 0
    bottomIndex = 0
    isRemove = false
    startX = 0
    startY = 0
    curState = PigState.InList
    resetIndex = -1

    onLoad () {
    }
    // update (dt) {}
}
