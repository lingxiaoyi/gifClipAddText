var gif_frames = 0;

var progressWrapper = document.getElementById('progressWrapper');
var progressText = document.getElementById('progressText');
var view = document.getElementById('view');
var drop = document.getElementById('drop');

var canvas_sprite = new fabric.Canvas('merge');
let TextPosition = ['', '', '']; //所有文字元素的信息
document.getElementById('import-gif').addEventListener('change', function(e) {
  var file = e.target.files[0];

  if (/gif$/.test(file.type)) {
    progress('Loadging...');
    loadBuffer(
      file,
      function(buf) {
        var gif;
        progress('Parsing...');
        gif = new Gif();
        gif.onparse = function() {
          progress('Please wait...');
          setTimeout(function() {
            buildView(gif, file.name, true);
            progress();
          }, 20);
        };
        gif.onerror = function(e) {
          progress();
          alert(e);
        };
        gif.onprogress = function(e) {
          progress('Parsing...' + (((100 * e.loaded) / e.total) | 0) + '%');
        };
        gif.parse(buf);
      },
      function(e) {
        alert(e);
      },
      function(e) {
        progress('Loading...' + (((100 * e.loaded) / e.total) | 0) + '%');
      }
    );
  } else {
    alert('"' + file.name + '" not GIF');
  }
});

function progress(msg) {
  if (msg) {
    progressWrapper.style.display = 'block';
    progressText.textContent = msg;
  } else {
    progressWrapper.style.display = 'none';
  }
}

function loadBuffer(file, onload, onerror, onprogress) {
  var fr;
  fr = new FileReader();
  fr.onload = function() {
    onload(this.result);
  };
  fr.onerror = function() {
    if (onerror) {
      onerror(this.error);
    }
  };
  fr.onprogress = function(e) {
    if (onprogress) {
      onprogress(e);
    }
  };
  fr.readAsArrayBuffer(file);
}

let $select = $('#select');

function buildView(gif, fname, preRender) {
  var canvas_frame, context, frames;
  let imgWidth = '';
  let imgHeight = '';

  canvas_frame = document.createElement('canvas');
  canvas_frame.width = gif.header.width;
  canvas_frame.height = gif.header.height;
  canvas_frame.title = 'w=' + canvas_frame.width + ' h=' + canvas_frame.height;
  context = canvas_frame.getContext('2d');
  frames = gif.createFrameImages(context, preRender, !preRender);
  gif_frames = frames.length;
  canvas_sprite.clear();
  frames.forEach(function(frame, i) {
    var canvas_frame;
    canvas_frame = document.createElement('canvas');
    canvas_frame.width = frame.image.width;
    canvas_frame.height = frame.image.height;
    canvas_frame.getContext('2d').putImageData(frame.image, 0, 0);
    canvas_frame.title =
      'w=' +
      frame.image.width +
      ' h=' +
      frame.image.height +
      ' delay=' +
      frame.delay +
      ' disposal=' +
      frame.disposalMethod;

    if (frames.length > 1) {
      let img = new fabric.Image.fromURL(canvas_frame.toDataURL(), function(img) {
        TotalWidth = img.getWidth() * gif_frames;
        ScalingRatio = 1 /* canvas_sprite_width / TotalWidth */; //缩放比 画布大小/图片真实大小
        imgWidth = img.getWidth();
        imgHeight = img.getHeight();
        img.set({ selectable: false, fill: '#000000' });
        img.left = img.getWidth() * i;
        width = img.getWidth() * i + 1;
        canvas_sprite.setHeight(img.getHeight());
        canvas_sprite.setWidth(img.getWidth() * (i + 1)); //画布大小固定成800
        canvas_sprite.add(img);
        //加线进来
        let Line = new fabric.Line([img.getWidth() * i, 0, img.getWidth() * i, img.getHeight()], {
          selectable: false,
          fill: '#000000',
          stroke: 'rgba(0,0,0,0.8)' //笔触颜色
        });
        canvas_sprite.add(Line);
        canvas_sprite.renderAll();
        if (i == frames.length - 1) {
          $('#view').append('<img src="' + canvas_sprite.toDataURL('png') + '">');
        }
        //假如自定义的图形 加载完最后一帧图片再
        if (i === frames.length - 1) {
          $select.val('3');
          $select.change();
        }
      });
    } else {
      alert('无效的GIF');
    }
  });
  let framesArr = [];
  let rects = [];
  let texts = [];
  $select.unbind('change');
  $select.change(function() {
    let clipPartNum = $(this).val();
    let length = frames.length;
    let residue = length % clipPartNum;
    let average = (length - residue) / clipPartNum; //整除值
    framesArr = []; //将每段的帧数放进数组
    let t = '';
    TextPosition = [];
    $('.option').html('');
    rects.forEach(function(item) {
      canvas_sprite.remove(item);
    });
    texts.forEach(function(item) {
      canvas_sprite.remove(item);
    });
    rects = [];
    texts = [];
    for (let index = 0; index < clipPartNum; index++) {
      if (index === 1) {
        framesArr.push(average + residue);
      } else {
        framesArr.push(average);
      }
      $('.option').append(`<div class="item">
        <div class="n">第${index + 1}段</div>
        <input class="num" type="text" />
        <div class="add">+</div>
        <div class="reduce">-</div>
        <input class="giftext" type="text" value="文字测试${index + 1}" />
        <input class="textNumMax" type="text" value="4" />
        <input class="textNumLimit" type="text" value="4" />
        <label>是否填充文字：</label>
        是<input type="radio" name="radio${index + 1}" value="1" checked="checked"/>
        否<input type="radio" name="radio${index + 1}" value="0"/>
      </div>`);
    }
    let $inputNum = $('.option .item .num');
    let $inputText = $('.option .item .giftext');
    let $add = $('.option .item .add');
    let $reduce = $('.option .item .reduce');
    let $textNumMax = $('.option .item .textNumMax');
    let $textNumLimit = $('.option .item .textNumLimit');
    let $inputRadio = $('.option .item input:radio');
    console.log('framesArr', framesArr);
    $textNumMax.change(function(params) {
      renderFrames();
    });
    $textNumLimit.change(function(params) {
      renderFrames();
    });
    $inputRadio.click(function(params) {
      /* $(this)
        .parent()
        .find('input:radio')
        .attr('checked', false);
      $(this).attr('checked', 'checked'); */
      renderFrames();
    });
    $add.unbind('click');
    $reduce.unbind('click');
    $add.click(function() {
      let framesArrIndex = $(this)
        .prev()
        .data('framesArrIndex');

      if (framesArrIndex === framesArr.length - 1) {
        if (framesArr[0] === 1) {
          alert('不能再加了已经最大了');
          return;
        }
        framesArr[0]--;
      } else {
        if (framesArr[framesArrIndex + 1] === 1) {
          alert('不能再加了已经最大了');
          return;
        }
        framesArr[framesArrIndex + 1]--;
      }

      framesArr[framesArrIndex]++;
      renderFrames();
    });
    $reduce.click(function() {
      let framesArrIndex = $(this)
        .prev()
        .prev()
        .data('framesArrIndex');
      if (framesArr[framesArrIndex] === 1) {
        alert('不能再减了已经最小了');
        return;
      }
      framesArr[framesArrIndex]--;
      if (framesArrIndex === framesArr.length - 1) {
        framesArr[0]++;
      } else {
        framesArr[framesArrIndex + 1]++;
      }

      renderFrames();
    });

    renderFrames();
    function renderFrames() {
      $inputNum.each(function(i) {
        let $that = $(this);
        $(this).val(framesArr[i]);
        $(this).data('framesArrIndex', i);
        if (rects.length) {
          rects.forEach(function(item, i) {
            let left = 0;
            for (let index = 0; index < i; index++) {
              left += framesArr[index] * imgWidth;
            }
            item.set({
              left: left,
              width: imgWidth * framesArr[i], //方形的宽度
              height: imgHeight //方形的高度
            });
          });
          TextPosition[i] = {
            ...TextPosition[i],
            textNumMax: $that
              .parent()
              .find('.textNumMax')
              .val(),
            textNumMin: $that
              .parent()
              .find('.textNumLimit')
              .val(),
            isAddText: !!(
              $that
                .parent()
                .find(`input[name=radio${i + 1}]:checked`)
                .val() / 1
            )
          };
          canvas_sprite.renderAll();
        } else {
          let bgColor = ['rgba(0,0,0,0.3)', 'rgb(4, 250, 37, 0.3)', 'rgb(41, 4, 250, .3)', 'rgb(41, 4, 10, .3)'];
          t = setTimeout(() => {
            let left = 0;
            for (let index = 0; index < i; index++) {
              left += framesArr[index] * imgWidth;
            }
            let rect = new fabric.Rect({
              left: left, //距离画布左侧的距离，单位是像素
              top: 0, //距离画布上边的距离
              fill: bgColor[i], //填充的颜色
              width: imgWidth * framesArr[i], //方形的宽度
              height: imgHeight, //方形的高度
              selectable: false
            });
            rects.push(rect);
            canvas_sprite.add(rect);
            //加文字进去
            texts[i] = new fabric.Text($inputText.eq(i).val(), {
              left: left, //距离画布左侧的距离，单位是像素
              top: 0, //距离画布上边的距离
              fontSize: 14, //文字大小
              lockRotation: true,
              fontSize: 20,
              fill: 'red',
              index: i
            });
            TextPosition[i] = {
              left,
              top: 0,
              textWidth: texts[i].width,
              textHeight: texts[i].height,
              frames: framesArr[i],
              imgWidth,
              imgHeight,
              textNumMax: $that
                .parent()
                .find('.textNumMax')
                .val(),
              textNumMin: $that
                .parent()
                .find('.textNumLimit')
                .val(),
              isAddText: !!(
                $that
                  .parent()
                  .find(`input[name=radio${i + 1}]:checked`)
                  .val() / 1
              )
            };
            //texts.push(Text);
            canvas_sprite.add(texts[i]);
            //clearTimeout(t);
          }, 10);
        }
      });
    }
  });

  canvas_sprite.on('object:moving', function(e) {
    //console.log('moving a rectangle', e);
    let $inputText = $('.option .item .giftext');
    let arrText = [];
    $inputText.each(function(i) {
      arrText.push($(this).val());
    });
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
    let { top, left, width, height, fontSize } = e.target;
    let index = arrText.findIndex(function(text) {
      return text === e.target.text;
    });
    TextPosition[index] = {
      left,
      top,
      textWidth: width,
      textHeight: height,
      fontSize,
      frames: framesArr[index],
      imgWidth,
      imgHeight
    };
  });
}

document.getElementById('btn').onclick = function() {
  console.log('TextPosition', TextPosition);
};
