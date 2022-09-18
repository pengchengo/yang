// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

export enum PigState{
    CanMove = 1,
    InSlot = 2,
    MoveUp = 3,
    IsDestroyed = 4
}

@ccclass
export default class PigComponent extends cc.Component {
    onLoad () {
    }
    // update (dt) {}
}
