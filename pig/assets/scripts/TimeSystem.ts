
export class _TimeSystem {
    NEXTFIVETIMEKEY = "TimeSystem_NEXTFIVETIMEKEY"
    nextFiveTime = 0

    passTime = 0
    oneDaySecond = 24*3600
    serverTimestamp = 0
    localTimestamp = 0
    scheduleMap = {}
    timeUpdateList = []
    timeUpdateMap = {}
    secondUpdateMap = {}

    updateMap = {}

    getServerTime(){
        return (this.serverTimestamp + Math.round(new Date().getTime() / 1000) - this.localTimestamp)
    }

    getTimeByHour(hour){
        let serverTime = this.getServerTime()
        var date = new Date(serverTime*1000);
        date.setHours(hour)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        return Math.floor(date.getTime()/1000)
    }

    getNextFiveTime(){
        let serverTime = this.getServerTime()
        let fiveTime = this.getTimeByHour(5)
        if(fiveTime < serverTime){
            return fiveTime + this.oneDaySecond
        }else{
            return fiveTime
        }
    }

    //距离早上5点的时间
    getLeftTimeToFive(){
        let serverTime = this.getServerTime()
        let endTime = this.getTimeByHour(5)
        if(endTime > serverTime){
            return endTime - serverTime
        }else{
            return endTime - serverTime + this.oneDaySecond
        }
    }

    getLeftTimeToNextDay(){
        let serverTime = this.getServerTime()
        let endTime = this.getTimeByHour(0)
        return endTime + this.oneDaySecond - serverTime 
    }

    updateTimestamp(timestamp){
        this.serverTimestamp = timestamp
        this.localTimestamp = Math.round(new Date().getTime() / 1000)
    }

    update(dt){
        for(let node in this.updateMap){
            let callBack = this.updateMap[node]
            if(callBack){
                callBack(dt)
            }
        }

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

        for (let key in this.secondUpdateMap) {
            let info = this.secondUpdateMap[key]
            if(info){
                info.time = info.time + dt
                if (info.time >= 1){
                    info.time = 0
                    if(info.callBack){
                        info.callBack()
                    }else{
                        this.secondUpdateMap[key] = undefined
                    }
                }
            }
        }

        for(let i = this.timeUpdateList.length - 1; i >=0; i--){
            let info = this.timeUpdateList[i]
            info.passTime = info.passTime + dt
            if(info.passTime >= info.time){
                info.callBack(1)
                this.timeUpdateList.splice(i, 1)
            }else{
                info.callBack(info.passTime/info.time)
            }
        }
        for(let key in this.timeUpdateMap){
            let info = this.timeUpdateMap[key]
            if(info){
                info.passTime = info.passTime + dt
                if(info.passTime >= info.time){
                    this.timeUpdateMap[key] = null
                    info.callBack(1)
                }else{
                    info.callBack(info.passTime/info.time)
                }
            }
        }
        this.passTime = this.passTime + dt
        if(this.passTime > 1){
            this.passTime = 0
        }
    }

    scheduleOnceSetStop(key, value){
        let info = this.scheduleMap[key]
        if(info){
            info.isStop = value
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
    
    registSecondUpdate(key, callBack) {
        let info = {} as any
        info.time = 0
        info.callBack = callBack
        this.secondUpdateMap[key] = info
    }

    unregistSecondUpdate(key){
        this.secondUpdateMap[key] = undefined
    }

    registUpdate(obj, callBack){
        this.updateMap[obj] = callBack
    }

    unregistUpdate(obj){
        this.updateMap[obj] = undefined
    }

    timeUpdate(time, callBack){
        let info = {} as any
        info.time = time
        info.passTime = 0
        info.callBack = callBack
        this.timeUpdateList.push(info)
    }

    timeMapUpdate(key, time, callBack){
        let info = {} as any
        info.time = time
        info.passTime = 0
        info.callBack = callBack
        this.timeUpdateMap[key] = info
    }
    
    clearTimeMapUpdate(key){
        this.timeUpdateMap[key] = null
    }

    getTimeStr(time){
        let day = Math.floor(time/this.oneDaySecond)
        time = time%this.oneDaySecond
        let hour = Math.floor(time/3600)
        let min = Math.floor(time%3600/60)
        let sec = time%60
        let des = ""
        if(day > 0){
            des = des + day + "天"
            return des
        }
        if(hour > 0){
            des = des + hour + "时"
        }
        if(min > 0){
            des = des + min + "分"
        }
        if(hour == 0 && sec > 0){
            des = des + sec + "秒"
        }
        return des
    }

    isNextDay(recTime){
        if(!recTime){
            return true
        }
        let recDate = new Date(recTime*1000);
        let serverTime = this.getServerTime()
        var nowDate = new Date(serverTime*1000);
        if(recDate.getDate() != nowDate.getDate() || recDate.getMonth() != nowDate.getMonth() || recDate.getFullYear() != nowDate.getFullYear()){
            return true
        }else{
            return false
        }
    }

    getYearMonthDay(time){
        var date = new Date(time*1000);
        return date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate()
    }
}

export const TimeSystem = new _TimeSystem();