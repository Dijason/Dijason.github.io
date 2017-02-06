/**
 * 0 1 2
 * 3 4 5
 * 6 7 8
 *
 * support retina mode
 */

window.onload = function () {
    var $canvas = document.querySelector('#canvas');
    var gesture = new Gesture($canvas, {
        cols: 5
    });
    var result = gesture.getGestureResult();
    console.log(result)
};

var getPixelRatio = function (context) {
    var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
};

function Gesture($canvas, opts) {
    var context = $canvas.getContext('2d');
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;
    var ratio = getPixelRatio(context);
    var radius = 10 * ratio;
    var canvasWidth = winWidth * ratio;
    var canvasHeight = winHeight * ratio;
    var points = [];
    var gestureResult = [];
    var defaultConfig = {
        lineWidth: 2,
        strokeColor: '#000',
        fillColor: '#fff'
    };

    opts = opts || {};
    opts = Object.assign(defaultConfig, opts); //assign兼容性
    $canvas.style.width = winWidth + 'px';
    $canvas.style.height = winHeight + 'px';
    $canvas.width = canvasWidth;
    $canvas.height = canvasHeight;

    this.getGestureResult = function () {
        return gestureResult;
    }

    function init() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        drawPoints(opts.cols);
        bindEvent();
    }

    /*num为平方数*/
    function drawPoints(cols) {
        cols = cols || 3;
        var num = cols * cols;
        points = [];
        var space = cols + 1;
        var interval = canvasWidth / space;
        for (var i = 0; i < num; i++) {
            var col = i % cols;
            var row = parseInt(i / cols);
            var x = (col + 1) * interval;
            var y = (row + 1) * interval;
            var point = {x: x, y: y, index: i};
            points.push(point);
            drawCircle(point, opts);
        }
    }

    function drawCircle(point, styleOpt) {
        styleOpt = styleOpt || {};
        var lineWidth = styleOpt.lineWidth || 2;
        var strokeColor = styleOpt.strokeColor || '#000';
        var fillColor = styleOpt.fillColor || '#fff';

        context.save();
        context.translate(point.x, point.y);
        context.lineWidth = lineWidth;
        context.fillStyle = fillColor;
        context.strokeStyle = strokeColor;

        context.beginPath();
        context.arc(0, 0, radius, 0, 2 * Math.PI, false);
        context.closePath();

        context.fill();
        context.stroke();
        context.restore();
    }

    function bindEvent() {
        $canvas.addEventListener('touchstart', touchStartHandler);
        $canvas.addEventListener('touchmove', touchMoveHandler);
        $canvas.addEventListener('touchend', touchEndHandler);

        var prePoint;
        var drawPaths;

        function resetContext() {
            if (gestureResult.length) {
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                drawPoints(opts.cols);
            }
            gestureResult = [];
            drawPaths = {};
            prePoint = {index: -1};
        }

        function touchStartHandler(ev) {
            var pos = ev.changedTouches[0];
            resetContext();
            pointHandler(pos);
        }

        function touchMoveHandler(ev) {
            var pos = ev.changedTouches[0];
            pointHandler(pos);
        }

        function touchEndHandler(ev) {
            var pos = ev.changedTouches[0];
            pointHandler(pos);
        }

        function pointHandler(pos) {
            var point = checkInPoint(pos);
            if (point != -1 && prePoint.index != point.index) {
                gestureResult.push(point.index);
                if (!point.isFilled) {
                    point.isFilled = true;
                    drawCircle(point, {
                        fillColor: '#000'
                    });
                }

                var betweenPoints = [prePoint.index, point.index];
                var keyA = betweenPoints.join('_');
                var keyB = betweenPoints.reverse().join('_');
                if (!drawPaths[keyA] && !drawPaths[keyB]) {
                    drawPaths[keyA] = true;
                    drawPaths[keyB] = true;
                    drawLine(prePoint, point, opts);
                }

                prePoint = point;
            }
        }
    }

    function checkInPoint(pos) {
        for (var i = 0, len = points.length; i < len; i++) {
            var point = points[i];
            var tmpX = pos.clientX || pos.pageX || pos.screenX;
            var tmpY = pos.clientY || pos.pageY || pos.screenY;
            var diffX = Math.abs(tmpX * ratio - point.x);
            var diffY = Math.abs(tmpY * ratio - point.y);
            var distance = Math.pow(diffX, 2) + Math.pow(diffY, 2);
            distance = Math.sqrt(distance);

            if (distance <= radius) {
                return point;
            }
        }

        return -1;
    }

    function drawLine(point1, point2, styleOpt) {
        styleOpt = styleOpt || {};
        var lineWidth = styleOpt.lineWidth || 2;
        var strokeColor = styleOpt.strokeColor || '#000';

        context.save();
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeColor;

        context.beginPath();
        context.moveTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
        context.closePath();

        context.stroke();
        context.restore();
    }

    init();
}