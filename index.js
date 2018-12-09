var imgUpload = document.getElementById('imgUpload');

// Tạo img_canvas dùng để hiển thị ảnh cần edit
var img_canvas  = document.getElementById('img_canvas');
var img_ctx = img_canvas.getContext("2d");
// Tạo light_canvas để lưu context của img_canvas đã thay đổi độ sáng
var light_canvas = document.getElementById('light_canvas');
var light_ctx = light_canvas.getContext('2d');
var tmp_idata;
var idata;

//Hàm đọc ảnh
function readImage() {
    if ( this.files && this.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
           var img = new Image();
           img.src = e.target.result;
           img.onload = function() {
              img_ctx.drawImage(img, 0, 0, 512, 512);
              tmp_idata = img_ctx.getImageData(0 , 0, 512, 512);
              idata = img_ctx.getImageData(0 , 0, 512, 512);
              light_ctx.putImageData(idata,0,0); 
           };
        };       
        FR.readAsDataURL( this.files[0] );
    }
}

imgUpload.onchange = readImage;


var drawer_canvas, drawer_ctx, flag = false,
    prevX = 0,      // tọa độ x trước đó của mouse point 
    currX = 0,      // tọa độ x hiện tại của mouse point      
    prevY = 0,      // tọa độ y trước đó của moue point
    currY = 0,      // tọa độ y hiện tại của mouse point
    dot_flag = false;

// Thay đổi giá trị của brush từ slider
var slider1 = document.getElementById("BrRange");
var output1 = document.getElementById("br");
output1.innerHTML = slider1.value; // Display the default slider value
var bRange = 1;
    
slider1.oninput = function() {
  bRange = this.value;
  output1.innerHTML = slider1.value;
}

// Thay đổi giá trị của brush shadow từ slider
var slider2 = document.getElementById("ShdwRange");
var output2 = document.getElementById("brsw");
output2.innerHTML = slider2.value; // Display the default slider value
var swRange = 1;
    
slider2.oninput = function() {
  swRange = this.value;
  output2.innerHTML = slider2.value;
}

// Chọn màu 
var colorPiker = document.getElementById("SetColor");
var bcolor = "#30f873";
colorPiker.oninput = function() {
  bcolor = this.value;
}

// Tạo drawer_canvas dùng để vẽ 
drawer_canvas = document.getElementById('drawer_canvas');
drawer_ctx = drawer_canvas.getContext("2d");

// Hàm ghi nhận thao tác chuột để vẽ trên canvas2
function start_draw() {
  drawer_canvas.addEventListener("mousemove", function (e) {
    drawxy('move', e)
  }, false);  
  drawer_canvas.addEventListener("mousedown", function (e) {
    drawxy('down', e)
  }, false);
  drawer_canvas.addEventListener("mouseup", function (e) {
    drawxy('up', e)
  }, false);
  drawer_canvas.addEventListener("mouseout", function (e) {
    drawxy('out', e)
  }, false);
}


// Hàm cập nhật vị trí tọa độ của mouse point để vẽ
// res là tham số kiểu chuỗi dùng để chỉ thao tác của chuột 
function drawxy(res, e) {
  if (res == 'move') {
    if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - drawer_canvas.offsetLeft;
      currY = e.clientY - drawer_canvas.offsetTop;
      draw();
    }
  }
  if (res == 'down') {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - drawer_canvas.offsetLeft;
    currY = e.clientY - drawer_canvas.offsetTop;
    
    flag = true;
  }
  if (res == 'up' || res == "out") {
    flag = false;
  }
  
}    

// Hàm vẽ line từ tọa độ trước đó đến tọa độ hiện tại
function draw() {
  drawer_ctx.beginPath();
  drawer_ctx.moveTo(prevX, prevY);
  drawer_ctx.lineTo(currX, currY);
  drawer_ctx.strokeStyle = bcolor;
  drawer_ctx.lineWidth = bRange;
  drawer_ctx.lineJoin = drawer_ctx.lineCap = 'round';  // Làm cho đường thẳng tròn ở hai đầu và ở chỗ nối
  drawer_ctx.shadowBlur = swRange;
  drawer_ctx.shadowColor = bcolor;
  drawer_ctx.stroke();
  drawer_ctx.closePath();
}

// Hàm ghi nhận thao tác chuột để xóa trên canvas2
function start_erase() {
  drawer_canvas.addEventListener("mousemove", function (e) {
    erasexy('move', e)
  }, false);  
  drawer_canvas.addEventListener("mousedown", function (e) {
    erasexy('down', e)
  }, false);
  drawer_canvas.addEventListener("mouseup", function (e) {
    erasexy('up', e)
  }, false);
  drawer_canvas.addEventListener("mouseout", function (e) {
    erasexy('out', e)
  }, false);
}


// Hàm cập nhật vị trí tọa độ của mouse point để vẽ
// res là tham số kiểu chuỗi dùng để chỉ hướng vẽ
function erasexy(res, e) {
  if (res == 'move') {
    if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - drawer_canvas.offsetLeft;
      currY = e.clientY - drawer_canvas.offsetTop;
      eraser();
    }
  }
  if (res == 'down') {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - drawer_canvas.offsetLeft;
    currY = e.clientY - drawer_canvas.offsetTop;
    
    flag = true;
  }
  if (res == 'up' || res == "out") {
    flag = false;
  }
  
} 

// Hàm xóa nội dung vẽ (sử dụng line)
function eraser() {
  drawer_ctx.fillStyle = bcolor;
  drawer_ctx.beginPath();
  drawer_ctx.moveTo(currX, currY);
  drawer_ctx.lineTo(currX, currY);
  drawer_ctx.lineWidth = bRange;
  drawer_ctx.fill();

}
 
// Destination là context đã có trước trên canvas
// Source là context hiện tại đang muốn thêm vào canvas
function DrawMode(eraserMode=false) {
  if(eraserMode==false) {
    // source-over có nghĩa là source sẽ nằm trên destination
    drawer_ctx.globalCompositeOperation = 'source-over';
    start_draw();
  }
  else  {
    // destination-out có nghĩa là xóa đi vùng giao nhau giữa source và destination
    drawer_ctx.globalCompositeOperation = 'destination-out';
    start_erase();
  }
}




// ----------
var brightness = document.getElementById("BrNessRange");
var output3 = document.getElementById("bness");
output3.innerHTML = brightness.value; // Display the default slider value
var b = 0;
var tmp1 = parseInt(b);       // Lấy giá trị độ sáng cộng thêm

brightness.oninput = function() {
  b = this.value;
  output3.innerHTML = brightness.value;
  
}


var contrast = document.getElementById("ContrRange");
var output4 = document.getElementById("btrast");
output4.innerHTML = contrast.value; // Display the default slider value
var con = 1;
var tmp2 = parseFloat(con);     // Lấy giá trị độ tương phản nhân thêm

contrast.oninput = function() {
  con = this.value;
  output4.innerHTML = contrast.value;
  
}


// -------------- B R I G H T N E S S   A N D   C O N T R A S T ----------------------


var gray_on = false;      // hiện trạng image có đang ở grayscale
var grayscaleMode=false;

function ChangeGrayscaleMode(){
  grayscaleMode = !grayscaleMode;
  ChangeLight();
}

function ChangeLight() {
  // idata = img_ctx.getImageData(0 , 0, 512, 512);    // lấy context từ ảnh gốc
  if(tmp1 != parseInt(b)){
    tmp1 = parseInt(b);
    idata = img_ctx.getImageData(0 , 0, 512, 512); 
    for(var i=0; i < idata.data.length; i+=4) {
      idata.data[i] += tmp1;
      idata.data[i+1] += tmp1;
      idata.data[i+2] += tmp1;
    }
  }
  
  if(tmp2 != parseFloat(con)) {
    tmp2 = parseFloat(con);
    idata = img_ctx.getImageData(0 , 0, 512, 512); 
    for(var i=0; i < idata.data.length; i+=4) {
      idata.data[i] *= tmp2;
      idata.data[i+1] *= tmp2;
      idata.data[i+2] *= tmp2;
    }
  } 
  
  if(grayscaleMode==true && gray_on==false) {
          for(var i=0; i<idata.data.length;i+=4){
            var red = idata.data[i];
            var green = idata.data[i+1];
            var blue = idata.data[i+2];
            var gray_value = (3*red+4*green+blue)>>>3;
            idata.data[i] = gray_value;
            idata.data[i+1] = gray_value;
            idata.data[i+2] = gray_value;
            }
          for(var i=0;i<idata.data.length;i++){
            tmp_idata.data[i] = idata.data[i];
          }         
          gray_on = true; 
  }
  // Nếu đang ở grayscale và tắt mode grayscale thì sẽ cập nhật lại màu sắc từ ảnh gốc
  else if(gray_on==true){
          tmp_idata = img_ctx.getImageData(0 , 0, 512, 512);
          for(var i=0; i<tmp_idata.data.length;i+=4){
            var red = tmp_idata.data[i];
            var green = tmp_idata.data[i+1];
            var blue = tmp_idata.data[i+2];
            idata.data[i] = red;
            idata.data[i+1] = green;
            idata.data[i+2] = blue;
          }
          gray_on = false;
  }             
  
  light_ctx.putImageData(idata,0,0);    // hiển thị kết quả trên light_canvas
}


//---------------- C O N V O L U T I O N A L     F I L T E R S ---------------
// Tính tích chập theo kernel đưa vào
// - data lưu dữ liệu đã biến đổi
// - idata là dữ liệu nguồn
// - w là chiều rộng ảnh đề tính widthstep
// - widthstep dùng để điều chỉnh lên dòng hay xuống dòng
// - kernel_step dùng để điều chỉnh lùi cột hay tiến cột 
// - i_local là biến chỉ vị trí xung quanh i 
function convolution(data, idata, w, kernel, opaque=true, threshold=0){
  var kernel_step = [-1, -1, -1,0,0,0,1,1,1];
  for(var i = 0; i < idata.length; i++) {
    //   if(i%4==3) continue;
      var alphaFac = opaque ? 1 : 0;

      var g = 0;

      for(var k = 0; k < kernel.length; k+=1) {    
        var widthstep = w*kernel_step[k]*4;
        var i_local = i + widthstep + kernel_step[k]*4;

        // if(kernel_step[k]==0 && widthstep==0) continue;

        if(( i_local >= 0) && (i_local < idata.length)){
            var x = idata[i_local];
            var y = kernel[k];
            g += x*y;
        }   
      } 
    g = Math.abs(g);
    if(i%4==3) {
        g += alphaFac * (255 - g);
    }
    if(g > 255) {
        g = 255;
    }

    if(g < threshold) {
        g = 0;
    }
    data[i] = g;
  }
}
var sobel_kernel_x = [ 1,2,1,
                        0, 0, 0,
                        -1, -2,-1 ];
var sobel_kernel_y = [ 1, 0, -1,
                       2, 0, -2,
                       1, 0, -1 ];
var sobelMode = false;
var sobel_on = false;
function ChangeSobelMode() {
  sobelMode = !sobelMode;
  Sobelfilter();
}

function Sobelfilter() {
  if(sobelMode==true) {
    if(sobel_on==false) {
      var tmp_idata_x = light_ctx.getImageData(0, 0, 512, 512);
      var tmp_idata_y = light_ctx.getImageData(0, 0, 512, 512);
  
      convolution(tmp_idata_x.data, idata.data, 512, sobel_kernel_x);
      convolution(tmp_idata_y.data, idata.data, 512, sobel_kernel_y);
      var g_x=0;
      var g_y=0;
      var g=0;
      for(var i=0; i<tmp_idata_x.data.length;i++){
        if(i%4==3) idata.data[i] = 255;
        else {
          g_x = tmp_idata_x.data[i];
          g_y = tmp_idata_y.data[i];
          g = Math.sqrt(g_x*g_x + g_y*g_y);
          if(g>255) g = 255;
    
          idata.data[i] = g;
        }
        
      }
      sobel_on = true;
    }
  }
  else if(sobel_on==true) {             
        sobel_on = false;
        for(var i=0; i<tmp_idata.data.length;i++){
          idata.data[i] = tmp_idata.data[i];
        }
  }
  light_ctx.putImageData(idata,0,0);
}
// --------------- D O W N L O A D    I M A G E ----------------------------
// Tạo save_canvas để lưu context của drawer_canvas
var save_canvas = document.getElementById('save_canvas');
var save_ctx = save_canvas.getContext('2d');

// Ý tưởng hàm download là gộp nội dung của brightness_canvas(ảnh đã thay đổi độ sáng)
// và drawer_canvas(các thao tác vẽ) lại trên drawer_canvas
// click chuột phải để lưu ảnh

function downloadCanvas() {
  save_ctx.drawImage(light_canvas, 0, 0);    // lưu nội dung ảnh
  save_ctx.drawImage(drawer_canvas, 0, 0);    // lưu nội dung vẽ 


  var img    = save_canvas.toDataURL("image/png");
  document.write('<img src="'+img+'"/>');

}
  
document.getElementById('download').addEventListener('click', function() {
  downloadCanvas();
}, false);

function download() {
  
  drawer_ctx.globalCompositeOperation = 'destination-over'; // Chuyển chế độ để không mất ctx khi đang ở eraserMode
  save_ctx.drawImage(drawer_canvas, 0, 0);    // lưu nội dung vẽ 

  drawer_ctx.drawImage(light_canvas, 0, 0);   // vẽ ảnh đã được thay đổi ánh sáng
  drawer_ctx.drawImage(save_canvas, 0, 0);    // vẽ đè nội dung đã lưu lên ảnh 

  save_ctx.clearRect(0, 0, save_ctx.width, save_ctx.height); // làm sạch context để chuẩn bị cho lần download sau
  
  link.href = document.getElementById(canvasId).toDataURL();
  link.download = filename;
}