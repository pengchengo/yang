// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, Node, resources, SpriteAtlas, Color } from "cc";

const {ccclass, property} = _decorator;

export enum PigState{
    InList = 1,
    InBottom = 2,
    Reset = 3,
    Removed = 4
}

@ccclass
export default class PigComponent extends Component {
    @property({
        type:Number,
        tooltip:"不同物品的对应ID"
    })
    crushId: Number = 0;

    @property({
        type:[PigComponent],
        tooltip:"覆盖在其上一层的物品ID列表"
    })
    overPigList: PigComponent[] = [];

    /*@property({
        type:cc.Integer,
        tooltip:"放置物层级"
    })
    zorder: Number = 0;*/

    maskNode = null
    index = 0
    bottomIndex = 0
    isRemove = false
    startX = 0
    startY = 0
    curState = PigState.InList
    resetIndex = -1

    onLoad () {
        this.maskNode = this.node.getChildByName("mask")
    }

    start () {
        this.curState = PigState.InList
        this.startX = this.node.getPosition().x
        this.startY = this.node.getPosition().y
        //this.node.getChildByName("lbId").getComponent(cc.Label).string = this.crushId+""
        resources.load("sheep/sheep141",SpriteAtlas,(err: Error, atlas:SpriteAtlas)=>{
            let bgSprite = this.node.getComponent(Sprite)
            //bgSprite.spriteFrame = atlas.getSpriteFrame(GameSystem.lastLevelId+"_1")
            let maskNode = this.createSpriteNode(this.node, atlas.getSpriteFrame("141_2"))
            /*maskNode.zIndex = 2
            maskNode.opacity = 102
            maskNode.color = Color.WHITE*/
        })
    }

    init(crushId){
        this.crushId = crushId
        //@ts-ignore
        let childList = this.node._children
        for (let i = 0; i < childList.length; i++) {
            let child = childList[i]
            if (child.name != "mask"){//} && child.name != "Label") {
                child.destroy()
            }
            /*if(child.name = "Label"){
                child.zIndex = 1
            }*/
        }
        /*cc.resources.load("sheep/sheep"+GameSystem.lastLevelId,cc.SpriteAtlas,(err: Error, atlas:cc.SpriteAtlas)=>{
            let icon = this.createSpriteNode(this.node, atlas.getSpriteFrame(GameSystem.lastLevelId+"_1_"+crushId))
            //icon.scaleX = 1.11
            //icon.scaleY = 1.11
        })*/
    }

    createSpriteNode(rootNode, spriteFrame){
        let picNode = new Node()
        let sprite = picNode.addComponent(Sprite)
        sprite.spriteFrame = spriteFrame
        rootNode.addChild(picNode)
        return picNode
    }
    // update (dt) {}
}
