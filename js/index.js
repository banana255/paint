const download = (canvas, filename) => {
    const data = canvas.canvas.toDataURL('png')
    const a = document.createElement('a')
    a.href = data
    a.download = filename + '.png'
    a.click()
}

const bindFeature = (canvas) => {
    addEvents(_es('.feature'), 'click', function(event) {
        const { type } = this.dataset
        _e('.active') && _e('.active').classList.remove('active')
        this.classList.add('active')
        switch (type) {
            case 'back':
                canvas.back()
                break
            case 'pencil':
                canvas.runPencil()
                break
            case 'clear':
                canvas.clear()
                break
            case 'rect':
                canvas.runRect()
                break
            case 'line':
                canvas.runLine()
                break
            case 'circle':
                canvas.runEllipse()
                break
            case 'zoomIn':
                canvas.zoomIn()
                break
            case 'zoomOut':
                canvas.zoomOut()
                break
        }
    })
}

const bindStatus = (canvas) => {
    addEvents(_es('.status'), 'click', function(event) {
        const { status } = this.dataset
        _e('.status-active') && _e('.status-active').classList.remove('status-active')
        this.classList.add('status-active')
        switch (status) {
            case 'smallPoint':
                canvas.pensize = Pen.small
                break
            case 'bigPoint':
                canvas.pensize = Pen.big
                break
        }
    })
}

const bindColor = (canvas) => {
    _e('.colors').addEventListener('click', (event) => {
        const { color } = event.target.dataset
        if(color !== undefined) {
            canvas.color = hexToRgb(color)
            _e('#id-color-current').style.background = color
        }
    })
}

const bindDownload = (canvas) => {
    _e('.download').addEventListener('click', () => {
        const filename = prompt('请输入将要下载的图片名', 'bananas')
        if(filename !== null) {
            download(canvas, filename)
        }
    })
}

const bindEvents = (canvas) => {
    bindFeature(canvas)
    bindColor(canvas)
    bindDownload(canvas)
    bindStatus(canvas)
}

const __main = function() {
    const canvas = Canvas.new('#id-paint')
    
    bindEvents(canvas)
    
}

__main()