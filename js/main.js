!(function (global) {

    canvasWidth = $(window).width();
    canvasHeight = $(window).height();
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d');

    var isMouseDown = false;
    var isUseEraser = false;
    var lastLocation = { x: 0, y: 0 };
    var lastTimeStep = 0;
    var lastLineWidth = -1;
    var strokeColor = "red";
    var drawType = "pen";
    var isWriting = false;

    var curSelectTool = $('#pen');

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;



    var drawstrategy = {

        pen: function () {
            return 5;
        },

        chineseBrush: function (d, t, maxWidth, minWidth) {
            var v = d / t;
            var resultLineWidth;
            if (v <= 0.1) {
                resultLineWidth = maxWidth;
            } else if (v >= 10) {
                resultLineWidth = minWidth;
            } else {
                resultLineWidth = maxWidth - (v - 0.1) / (10 - 0.1) * (maxWidth - minWidth)
            }
            if (lastLineWidth === -1) return resultLineWidth;
            return lastLineWidth * 2 / 3 + resultLineWidth * 1 / 3;
        },

        brush: function () {
            return 20
        }


    }

    function drawGrid(color) {

       
        var width = canvasWidth - 120;
        var height = width;
        var startPos = { x: 60, y: 150};
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(width + startPos.x, startPos.y);
        ctx.lineTo(width + startPos.x, height + startPos.y);
        ctx.lineTo(startPos.x, height + startPos.y);
        ctx.closePath();

        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(startPos.x + width, startPos.y + height);

        ctx.moveTo(startPos.x + width, startPos.y);
        ctx.lineTo(startPos.x, height + startPos.y);

        ctx.moveTo(width/ 2 + startPos.x , startPos.y);
        ctx.lineTo(width / 2 + startPos.x, height + startPos.y);

        ctx.moveTo(startPos.x, height / 2 + startPos.y);
        ctx.lineTo(width + startPos.x, height / 2 + startPos.y);

        ctx.lineWidth = 1
        ctx.stroke()

        ctx.restore();
    }

    function drawPoint(pos) {

        ctx.beginPath();
        ctx.fillStyle = strokeColor;
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2, true)
        ctx.fill();
        ctx.closePath();

    }
    function beginStrok(pos) {
        isMouseDown = true;
        lastLocation = windowToCanvas(pos.x, pos.y);
        lastTimeStep = new Date().getTime();
        if(isUseEraser) return;
        drawPoint(lastLocation);
    }


    
    function moveStrok(pos) {
        var curLocation = windowToCanvas(pos.x, pos.y);
        var curTimeStep = new Date().getTime();
        var distance = calcDistance(lastLocation, curLocation);
        var period = curTimeStep - lastTimeStep;

        var lineWidth = drawstrategy[drawType](distance, period, 20, 1);
        //draw
        draw(lastLocation, curLocation, lineWidth, strokeColor);
        lastLocation = curLocation;
        lastTimeStep = curTimeStep;
        lastLineWidth = lineWidth;
    }

    function endStrok() {
        isMouseDown = false;
    }

    function useEraser(pos, offset) {
        ctx.clearRect(pos.x - 15, pos.y - 15, 30, 30);
    }
    //视口坐标转化为Canvas坐标
    function windowToCanvas(x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: Math.round(x - bbox.left),
            y: Math.round(y - bbox.top)
        }
    }

    //画线
    function draw(loc1, loc2, lineWidth, strokeColor) {
        ctx.beginPath();
        ctx.moveTo(loc1.x, loc1.y);
        ctx.lineTo(loc2.x, loc2.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }


    //计算线的两端的距离
    function calcDistance(loc1, loc2) {
        return Math.sqrt((loc2.x - loc1.x) * (loc2.x - loc1.x) + (loc2.y - loc1.y) * (loc2.y - loc1.y));
    }

    //监听draw 事件
    function listenDrawEvent() {

        var SupportTouch = "ontouchstart" in document.documentElement;

        var strokeEvent = SupportTouch ?
            {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'

            } :
            {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            }

        canvas.addEventListener(strokeEvent.start, function (e) {
            e.preventDefault();
            var pos = {
                x: e.clientX || e.touches[0].pageX,
                y: e.clientY || e.touches[0].pageY
            }
            beginStrok(pos);
        });

        canvas.addEventListener(strokeEvent.move, function (e) {
            e.preventDefault();
            if (!isMouseDown) return;
            var pos = {
                x: e.clientX || e.touches[0].pageX,
                y: e.clientY || e.touches[0].pageY
            }
            if (isUseEraser) {
                useEraser(pos)
                drawGrid('#777')
            }
            else {
                moveStrok(pos);
               
            }
        });

        canvas.addEventListener(strokeEvent.end, function (e) {
            e.preventDefault();
            endStrok();
        });

        if (SupportTouch) return;

        canvas.onmouseout = function (e) {
            e.preventDefault();
            isMouseDown = false;
        };
    }

    listenDrawEvent();
    
    $('#controller').css('width', canvasWidth + 'px');

    $('#pen').click(function (e) {
        isUseEraser = false;
        drawType = 'pen';
        curSelectTool.removeClass('active');
        $(this).addClass('active');
        curSelectTool = $(this)

    });

    $('#chineseBrush').click(function (e) {
        isUseEraser = false;
        drawType = 'chineseBrush'
        curSelectTool.removeClass('active');
        $(this).addClass('active');
        curSelectTool = $(this)

    });

    $('#brush').click(function (e) {
        isUseEraser = false;
        drawType = 'brush'
        curSelectTool.removeClass('active');
        $(this).addClass('active');
        curSelectTool = $(this)
    });

    $('#eraser').click(function (e) {
        isUseEraser = true;
        curSelectTool.removeClass('active');
        $(this).addClass('active');
        curSelectTool = $(this)
    });

    $('#clear').click(function () {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        if (isWriting) {
            drawGrid('#777');
        }
    });

    $('#download').click(function () {
        var url = canvas.toDataURL('image/png');
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = "canvas"
        a.click();
        document.body.removeChild(a);
    });

    $(".color_btn").click(function () {
        $('.color_btn').removeClass("color_btn_selected");
        $(this).addClass("color_btn_selected");
        strokeColor = $(this).css("background-color");
    })

    $('#painting').click(function (e) {
        $(this).addClass('operator_selective');
        $('#writing').removeClass('operator_selective');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        isWriting = false;
    });

    $('#writing').click(function (e) {
        $(this).addClass('operator_selective');
        $('#painting').removeClass('operator_selective');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        drawGrid('#777');
        isWriting = true;
    });

})(this);




































!(function (global) {

    function fullScreen(canvas) {
        var pageWidth = document.documentElement.clientWidth;
        var pageHeight = document.documentElement.clientHeight;
        canvas.width = pageWidth;
        canvas.height = pageHeight;
    }



    function PurcyCanvas(canvas, eraser, color, rough) {
        this.isEraser = false;
        this.isUseing = false;
        this.canvas = canvas;
        this.eraser = eraser;
        this.ctx;
        this.lastX = 0;
        this.lastY = 0;
        this.color = color || 'black';
        this.rough = rough || 5;
    }

    PurcyCanvas.prototype.init = function () {

        this.ctx = canvas.getContext('2d');

        fullScreen(this.canvas)

        window.onresize = function () {
            fullScreen(canvas);
        }
        this.listenPaintEvent();

        this.eraser.addEventListener('click', function () {
            this.isEraser = !this.isEraser;
            if (this.isEraser) {
                this.eraser.textContent = '画笔';
            } else {
                this.eraser.textContent = '橡皮擦';
            }
        }.bind(this));

    }

    PurcyCanvas.prototype.listenPaintEvent = function () {

        var isSupportTouch = 'ontouchstart' in document.documentElement;
        var paintEvent = isSupportTouch ?
            {
                start: "touchstart",
                move: "touchmove",
                end: "touchend",
            }
            :
            {
                start: "mousedown",
                move: "mousemove",
                end: "mouseup",
            };

        //画笔开始
        this.canvas.addEventListener(paintEvent.start, function (e) {
            var x = e.clientX || e.touches[0].clientX;
            var y = e.clientY || e.touches[0].clientY;
            this.isUsing = true;
            if (this.isEraser) {
                this.ctx.clearRect(x - 5, y - 5, 10, 10);
            } else {
                this.lastX = x;
                this.lastY = y;
            }

        }.bind(this));
        //画笔移动
        this.canvas.addEventListener(paintEvent.move, function (e) {
            if (!this.isUsing == true) return;
            //相对于视口的位置
            var x = e.clientX || e.touches[0].clientX;
            var y = e.clientY || e.touches[0].clientY;
            if (this.isEraser) {
                this.ctx.clearRect(x - 5, y - 5, 10, 10);
            }
            else {
                if (Math.abs(x - this.lastX) < 0.1 && Math.abs(y - this.lastY) < 0.1) return;
                this.drawLine(this.lastX, this.lastY, x, y, this.rough, this.color);
                this.lastX = x;
                this.lastY = y;
            }
        }.bind(this));
        //画笔画画
        document.addEventListener(paintEvent.end, function (e) {
            console.log(333);
            this.isUsing = false;
        }.bind(this));

    }

    PurcyCanvas.prototype.drawLine = function (x1, y1, x2, y2, rough, color) {
        this.ctx.beginPath();
        this.ctx.lineWidth = rough;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    global.PurcyCanvas = PurcyCanvas;

})(this);



