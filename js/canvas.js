const link = (oldV, newV, draw, x, color) => {
    if(oldV === null) {
        return
    }
    const diff = newV - oldV
    if(Math.abs(diff) > 0) {
        const dice = diff / Math.abs(diff)
        for (let i = 1; i < Math.abs(diff); i++) {
            const y = oldV + i * dice
            draw(Point.new(x-1, y), color)
        }
    }
}

const Pen = {
    small: 0,
    big: 1,
}

class Canvas extends NewObject {
    constructor(selector) {
        super()
        const canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        this.frame = 60
        this.color = Color.black()
        // 默认填充颜色
        this.fillColor = Color.red()
        // 系统停机开关
        this._end = this.noop
        
        this.pen = Pen.small
        
        // 保存每一次操作改变的座标信息
        this._history = []
        // 当前操作中改变的座标信息
        this._hold = {}
        // 当前动作触发的函数(move)
        this.handle = this.noop
        this.startHandle = this.noop
        this.endHandle = this.noop
        // 当前动作长期执行的函数数组
        this.startHandleL = []
        this.endHandleL = []
        // 起始 & 目前 的鼠标座标
        this.s = {}
        this.e = {}
        // 是否需要刷新
        this.new = false
        
        this.run()
    }
    
    noop() {}
    
    run() {
        const cls = this
        let down = false
        
        cls.s = Point.new(0, 0)
        cls.e = Point.new(0, 0)
    
        const start = (event) => {
            down = true
            cls.new = false
            cls.s.x = event.offsetX
            cls.s.y = event.offsetY
            cls.startHandle()
            for(let i = 0; i < cls.startHandleL.length; i++) {
                const f = cls.startHandleL[i]
                const r = f()
                if(r) {
                    break
                }
            }
        }
    
        const end = () => {
            if(down) {
                down = false
                cls.endHandle()
                cls.endHandleL.forEach((i) => i())
                cls.save()
            }
        }
    
        const move = (event) => {
            if(down) {
                cls.e.x = event.offsetX
                cls.e.y = event.offsetY
                if(cls.handle !== cls.noop) {
                    cls.new = true
                }
                
            }
        }
    
        const timer = setInterval(() => {
            if(cls.new) {
                log('执行 handler')
                cls.new = false
                cls.handle()
                cls.render()
            }
        }, 1000 / cls.frame)
    
        bindEvent(cls.canvas, 'mousedown', start)
        bindEvent(cls.canvas, 'mousemove', move)
        bindEvent(cls.canvas, ['mouseup', 'mouseout'], end)
        
        cls._end = () => {
            log('cls._end')
            clearInterval(timer)
            unBindEvent(cls.canvas, 'mousedown', start)
            unBindEvent(cls.canvas, 'mousemove', move)
            unBindEvent(cls.canvas, ['mouseup', 'mouseout'], end)
        }
    }
    
    render() {
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    
    clear(color=Color.white()) {
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color, true)
            }
        }
        this.handle = this.noop
        this._history = []
        this._hold = {}
        this.new = true
    }
    
    giveup() {
        Object.keys(this._hold).forEach((i) => {
            const {x, y, c} = this._hold[i]
            this._setPixel(x, y, c)
        })
        this._hold = {}
    }
    
    _setPixel(x, y, color, clear=false) {
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        
        const key =  `${x}${y}`
        if(!clear && this._hold[key] === undefined ) {
            const c = Color.new(p[i], p[i+1], p[i+2], p[i+3])
            this._hold[key] = { x, y, c }
        }
        
        let {r, g, b, a} = color
        // r g b a
        p[i] = r
        p[i+1] = g
        p[i+2] = b
        p[i+3] = a
    }
    
    drawPoint(point, color=Color.black()) {
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, color)
            }
        }
    }
    drawLine(p1, p2, color=Color.black()) {
        // p1 p2 分别是起点和终点,
        let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y]
        let dx = x2 - x1
        let dy = y2 - y1
        const direX = dx / Math.abs(dx)
        const direY = dy / Math.abs(dy)
        if(Math.abs(dx) > Math.abs(dy)) {
            for(let i = 0; i < Math.abs(dx); i++) {
                const x = x1 + i * direX
    
                const y = y1 + Math.round(i * dy / Math.abs(dx))
                const p = Point.new(x, y)
                this.drawPoint(p, color)
                
                
                // const yn1 = y1 + Math.floor(i * dy / Math.abs(dx))
                // const yn2 = y1 + Math.ceil(i * dy / Math.abs(dx))
                // const p1 = Point.new(x, yn1)
                // const p2 = Point.new(x, yn2)
                // this.drawPoint(p1, color)
                // this.drawPoint(p2, color)
            }
        } else {
            for(let i = 0; i < Math.abs(dy); i++) {
                const y = y1 + i * direY
                const x = x1 + Math.round(i * dx / Math.abs(dy))
                const p = Point.new(x, y)
                this.drawPoint(p, color)
    
                // const xn1 = x1 + Math.floor(i * dx / Math.abs(dy))
                // const xn2 = x1 + Math.ceil(i * dx / Math.abs(dy))
                // const p1 = Point.new(xn1, y)
                // const p2 = Point.new(xn2, y)
                //
                // this.drawPoint(p1, color)
                // this.drawPoint(p2, color)
            }
        }
    }
    drawRect(upperLeft, size, fillColor=null, borderColor=Color.black()) {
        const { x ,y } = upperLeft
        const { w, h } = size
        const ah = Math.abs(h)
        const dh = h / ah
        for(let i = 0; i < ah; i++) {
            const s = Point.new(x, y + i * dh)
            const e = Point.new(x + w, y + i * dh)
            if(i === 0 || i === ah - 1) {
                this.drawLine(s, e, borderColor)
            } else if(fillColor !== null) {
                this.drawLine(s, e, fillColor)
            }
            this.drawPoint(s, borderColor)
            this.drawPoint(e, borderColor)
        }
    }
    drawEllipse(upperLeft, size, fillColor=null, borderColor=Color.black()) {
        if(size.w === 0 || size.h === 0) {
            return
        }
        
        // 椭圆标准方程的参数
        const a = size.w / 2
        const b = size.h / 2
        const h  = upperLeft.x + a
        const k = upperLeft.y + b
        let prev = {y1: null, y2: null}
        
        for (let i = 0; i <= size.w; i++) {
            const x = upperLeft.x + i
            const yk2 = (1 - (x - h)**2 / a**2) * b**2
            const yk = Math.sqrt(yk2)
            const y1 = Math.round(yk + k)
            const y2 = Math.round(-yk + k)
            // console.log('x, y1, y2', x, y1, y2)
            this.drawPoint(Point.new(x, y1), borderColor)
            this.drawPoint(Point.new(x, y2), borderColor)
            link(prev.y1, y1, this.drawPoint.bind(this), x, borderColor)
            link(prev.y2, y2, this.drawPoint.bind(this), x, borderColor)
            prev = { y1, y2 }
        }
    }

    runLine() {
        const cls = this
        cls.handle = () => {
            cls.giveup()
            cls.drawLine(cls.s, cls.e, cls.color)
        }
    }
    runRect() {
        const cls = this
        cls.handle = () => {
            cls.giveup()
            const x = cls.e.x
            const y = cls.e.y
            const size = Size.new(x - cls.s.x, y - cls.s.y)
            cls.drawRect(cls.s, size, null, cls.color)
        }
    }
    runPencil() {
        const cls = this
        cls.handle = () => {
            cls.drawLine(cls.s, cls.e, cls.color)
            cls.s.x = cls.e.x
            cls.s.y = cls.e.y
        }
    }
    runEllipse() {
        const cls = this
        cls.handle = () => {
            cls.giveup()
            const ex = cls.e.x
            const ey = cls.e.y
            const sx = cls.s.x
            const sy = cls.s.y
            const size = Size.new(Math.abs(ex - sx), Math.abs(ey - sy))
            const upperLeft = Point.new(Math.min(sx, ex), Math.min(sy, ey))
            cls.drawEllipse(upperLeft, size, null, cls.color)
        }
    }
    
    save() {
        const cls = this
        if(Object.keys(cls._hold).length !== 0) {
            // log('保存了')
            const pixels = JSON.parse(JSON.stringify(cls._hold))
            cls._history.push(pixels)
            cls._hold = {}
        }
    }
    
    back() {
        const cls = this
        cls.handle = cls.noop
        if(cls._history.length === 0) {
            return
        }
        const pixels = cls._history.pop()
        Object.keys(pixels).forEach((i) => {
            const {x, y, c} = pixels[i]
            cls._setPixel(x, y, c, true)
        })
        cls.new = true
    }
    
    zoomIn() {
        const cls = this
        if(cls.w >= 1200) {
            return
        }
        cls.w = cls.canvas.width = cls.w + 200
        cls.h = cls.canvas.height = cls.h + 150
        cls.render()
        cls.pixels = cls.context.getImageData(0, 0, cls.w, cls.h)
    }
    
    zoomOut() {
        const cls = this
        if(cls.w <= 400) {
            return
        }
        cls.w = cls.canvas.width = cls.w - 200
        cls.h = cls.canvas.height = cls.h - 150
        cls.render()
        cls.pixels = cls.context.getImageData(0, 0, cls.w, cls.h)
    }
}

