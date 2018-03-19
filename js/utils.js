const log = console.log.bind(console)

const _e = (sel) => document.querySelector(sel)
const _es = (sel) => document.querySelectorAll(sel)

const hexToRgb = (hex) => {
    hex = hex.split('#').join('')
    const rgb = []
    for(let i = 0; i < hex.length / 2; i++) {
        const index = 2 * i
        const value = hex.slice(index, index+2)
        rgb.push(value)
    }
    const [r, g, b, a=255] = rgb.map((i) => parseInt(i, 16))
    return Color.new(r, g, b, a)
}

const bindEvent = (ele, action, callback) => {
    if(Array.isArray(action)) {
        action.forEach((i) => {
            ele.addEventListener(i, callback)
        })
    } else {
        ele.addEventListener(action, callback)
    }
}

const addEvents = (eles, action, callback) => {
    eles = Array.from(eles)
    eles.forEach((e) => {
        e.addEventListener(action, callback)
    })
}

const unBindEvent = (ele, action, callback) => {
    if(Array.isArray(action)) {
        action.forEach((i) => {
            ele.removeEventListener(i, callback)
        })
    } else {
        ele.removeEventListener(action, callback)
    }
}

const aInb = (a, b) => {
    // a = {x, y}; b = {x, y, w, h}
    if(a.x > b.x && a.x < b.x + b.w) {
        if(a.y > b.y && a.y < b.y + b.h) {
            return true
        }
    }
    return false
}

const pointInfo = (s, e) => {
    // s = {x, y}; e = {x, y}
    let x
    let y
    if(s.x > e.x) {
        x = e.x
    } else {
        x = s.x
    }
    if(s.y > e.y) {
        y = e.y
    } else {
        y = s.y
    }
    const w = Math.abs(s.x - e.x)
    const h = Math.abs(s.y - e.y)
    return { x, y, w, h }
}