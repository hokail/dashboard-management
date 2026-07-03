import dayjs from "dayjs";

//格式化时间间隔
export function getTimeDiff(startStr, endStr) {
    const diffMs = dayjs(endStr).diff(dayjs(startStr))
    const dur = dayjs.duration(diffMs)

    return {
        days: dur.asDays().toFixed(0),
        hours: dur.hours(),
        minutes: dur.minutes(),
        seconds: dur.seconds(),
        milliseconds: dur.milliseconds(),

        // 格式化输出
        formatted: `${dur.asDays().toFixed(0)}天${dur.hours()}小时${dur.minutes()}分钟${dur.seconds()}秒`
    }
}

// 判断时间是否在范围内
export function isInRange(target, start, end) {
    if (!start || !end) return true
    return (
        (target.isAfter(start) || target.isSame(start)) &&
        (target.isBefore(end) || target.isSame(end))
    )
}

//防抖
export function debounce(fn, delay){
    let timer = null
    return function (){
        if(!timer){
            fn.apply(this, arguments)
        }
        clearTimeout(timer)
        timer = setTimeout(()=>{
            fn.apply(this, arguments)

            // 重置timer,否则之后timer不为null,不会进入立即执行的步骤
            timer = null
        },delay)

    }
}

//节流
export function throttle(fn, delay){
    let timer = null
    return function (){
        if(timer){
            return
        }
        fn.apply(this, arguments)
        timer = setTimeout(()=>{

            // clearTimeout(timer)只是阻止定时器的执行，但timer依然存在不为null
            // 重置timer,否则之后timer不为null
            timer = null
        },delay)
    }
}