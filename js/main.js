//const axios = require('axios');
var canvas = new fabric.Canvas('canvas');
let reactPosition = '';
fabric.Image.fromURL('./img/7.jpg', function(oImg) {
  console.log('oImg', oImg);
  canvas.setHeight(oImg.height);
  canvas.setWidth(oImg.width);
  oImg.set({
    selectable: false
  });
  canvas.add(oImg);
  var rect = new fabric.Rect({
    left: oImg.width / 2 - oImg.width / 5 / 2, //距离画布左侧的距离，单位是像素
    top: 0, //距离画布上边的距离
    fill: 'red', //填充的颜色
    width: oImg.width / 5, //方形的宽度
    height: oImg.height / 5 //方形的高度
  });
  reactPosition = {
    left: oImg.width / 2 - oImg.width / 5 / 2, //距离画布左侧的距离，单位是像素
    top: 0, //距离画布上边的距离
    width: oImg.width / 5, //方形的宽度
    height: oImg.height / 5 //方形的高度
  };
  rect.on('moving', function(e) {
    var obj = e.target;
    // if object is too big ignore
    if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
      return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height ||
      obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width
    ) {
      obj.top = Math.min(
        obj.top,
        obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left
      );
    }
    console.log('moving a rectangle', e);
    let { top, left, width, height } = e.target;
    reactPosition = { left, top, width, height };
  });
  rect.on('rotating', function(e) {
    //rotating
    console.log('rotating a rectangle', e);
  });
  canvas.add(rect);
  rect.moveTo(999);
});
document.getElementById('btn').onclick = function(params) {
  console.log('reactPosition', reactPosition);
};

