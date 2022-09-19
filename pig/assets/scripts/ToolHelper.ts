import GameComponent from "./GameComponent"

export class _ToolHelper {
    cancelMusicKey = "cancelMusicKey"
    cancelSoundKey = "cancelSoundKey"
    cancelMusic = false
    cancelSound = false

    scheduleMap = {}

    init(){
        this.cancelMusic = cc.sys.localStorage.getItem(this.cancelMusicKey)
        this.cancelSound = cc.sys.localStorage.getItem(this.cancelSoundKey)
    }

    hasMusic(){
        if(!this.cancelMusic){
            return true
        }else{
            return false
        }
    }

    changeMusic(){
        if(this.cancelMusic){
            this.cancelMusic = false
            cc.sys.localStorage.setItem(this.cancelMusicKey, false)
        }else{
            this.cancelMusic = true
            cc.sys.localStorage.setItem(this.cancelMusicKey, true)
        }
    }

    hasSound(){
        if(!this.cancelSound){
            return true
        }else{
            return false
        }
    }

    changeSound(){
        if(this.cancelSound){
            this.cancelSound = false
            cc.sys.localStorage.setItem(this.cancelSoundKey, false)
        }else{
            this.cancelSound = true
            cc.sys.localStorage.setItem(this.cancelSoundKey, true)
        }
    }

    scheduleOnce(key, time, callBack){
        let info = {} as any
        info.time = time
        info.callBack = callBack
        this.scheduleMap[key] = info
    }

    scheduleClear(key){
        this.scheduleMap[key] = null
    }

    update(dt){
        for (let key in this.scheduleMap) {
            let info = this.scheduleMap[key]
            if (info){
                if(info.isStop){
                    continue
                }
                info.time = info.time - dt
                if(info.time <= 0){
                    this.scheduleMap[key] = null
                    info.callBack()
                }
            }
        }
    }

    showTip(content){
        let tipCom = cc.instantiate(GameComponent.Inst.node.getChildByName("tipUI"))
        tipCom.active = true
        tipCom.getChildByName("content").getComponent(cc.Label).string = content
        GameComponent.Inst.node.addChild(tipCom)
        //tipCom.x = cc.winSize.width/2
        //tipCom.y = cc.winSize.height/2
        cc.tween(tipCom)
            .by(1,{y:400})
            .removeSelf()
            .start()
    }

    shuffle(array) {
        var m = array.length,
            t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    isInNode(node, touchPos){
        let point = node.convertToNodeSpaceAR(touchPos)
        if(point.x > -node.width/2 && point.x < node.width/2 && point.y > -node.height/2 && point.y < node.height/2){
            return true
        }else{
            return false
        }
    }

    playMusic(){
        if(!this.hasMusic()){
            return
        }
        cc.resources.load("music/bgm", cc.AudioClip, (err, audio: cc.AudioClip) => {
            cc.audioEngine.playMusic(audio, true)
        })
    }

    stopMusic(){
        cc.audioEngine.stopMusic()
    }

    playEffect(name){
        if(!this.hasSound()){
            return
        }
        cc.resources.load("music/"+name, cc.AudioClip, (err, audio: cc.AudioClip) => {
            cc.audioEngine.playEffect(audio, false)
        })
    }

    getPigIdList(){
        let idList = []
        for(let i = 1; i <= 14; i++){
            idList.push(i)
        }
        ToolHelper.shuffle(idList)
        let pigIdList = []
        for(let i = 0; i < idList.length; i++){
            if(i < 10){
                for(let j = 0; j < 15; j++){
                    pigIdList.push(idList[i])
                }
            }else{
                for(let j = 0; j < 15; j++){
                    pigIdList.push(idList[i])
                }
            }
        }
        ToolHelper.shuffle(pigIdList)
        return pigIdList
    }
}

export const ToolHelper = new _ToolHelper();