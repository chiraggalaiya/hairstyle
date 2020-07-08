var $ = Dom7;
var app = new Framework7({
  id: 'hairchanger.chirag.galaiya',
  root: '#app',
  theme: 'md',
});
var mainView = app.views.create('.view');

var cam_running = true;
var stream;

var gestureArea = document.querySelector('#hairstyle');
var scaleElement = document.querySelector('#hairstyle img');
function dragMoveListener (event) {
  var target = event.target;
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
	target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}
window.dragMoveListener = dragMoveListener;
var angleScale = {
  angle: 0,
  scale: 1
}

window.addEventListener("load", async () => {
	navigator.permissions.query({name: 'camera'}).then((permissionObj) => {
		if (permissionObj.state != "granted") {
			navigator.getUserMedia({video:true}, (s)=> {
				s.getTracks().forEach(function(track) {
					track.stop();
				});
			},(e)=>{});
		}
	}).catch((e) => {});
	document.querySelector("#splash button").classList.add("animate__fadeInDown");
	for (var i = 0; i < hairstyles.length; i++) {
		document.querySelector(".hairstyle-selector").innerHTML += '<div class="card" onclick="changeHair(this);"><img src="'+hairstyles[i]+'" /></div>';
	}
	interact(gestureArea).gesturable({
		listeners: {
			start (event) {
				angleScale.angle -= event.angle;
			}, move (event) {
				var currentAngle = event.angle + angleScale.angle;
				var currentScale = event.scale * angleScale.scale;
				scaleElement.style.webkitTransform = scaleElement.style.transform = 'rotate(' + currentAngle + 'deg)' + 'scale(' + currentScale + ')';
				dragMoveListener(event);
			}
		}
	}).draggable({
		listeners: { move: dragMoveListener },
		modifiers: [
			interact.modifiers.restrict({
				restriction: document.querySelector(".effects-cont")
			})
		]
	});
});

document.querySelector("#splash button").addEventListener("click", () => {
	navigator.permissions.query({name: 'camera'}).then(async(permissionObj) => {
		if (permissionObj.state == "granted") {
			await faceapi.loadTinyFaceDetectorModel('assets/models/tiny_face_detector_model-weights_manifest.json')
			await faceapi.loadFaceLandmarkTinyModel('assets/models/face_landmark_68_tiny_model-weights_manifest.json')
			stream = await navigator.mediaDevices.getUserMedia({ video: {} })
			const videoEl = document.getElementById('inputVideo')
			videoEl.srcObject = stream;
		} else {
			app.toast.create({
				text: 'Please grant camera permission',
				closeButton: true,
			}).open();
			navigator.permissions.query({name: 'camera'}).then((permissionObj) => {
				if (permissionObj.state != "granted") {
					navigator.getUserMedia({video:true}, (s)=> {
						s.getTracks().forEach(function(track) {
							track.stop();
						});
					},(e)=>{});
				}
			}).catch((e) => {});
		}
	}).catch((e) => {});
});

function resizeCanvasAndResults(dimensions, canvas, results) {
  const { width, height } = dimensions instanceof HTMLVideoElement
    ? faceapi.getMediaDimensions(dimensions)
    : dimensions
  canvas.width = width
  canvas.height = height

  return results.map(res => res.forSize(width, height))
}

  
function drawLandmarks(dimensions, canvas, results, withBoxes = false) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)
  if (withBoxes) {
      faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
  }
  const faceLandmarks = resizedResults.map(det => det.landmarks)
  const drawLandmarksOptions = { lineWidth: 2, drawLines: true, color: '#2affcf' }
  faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions)
}    

async function onPlay() {
	document.querySelector(".cam-cont").style.transform = "translate(-"+(document.querySelector(".cam-cont video").clientWidth/2-window.innerWidth/2).toString()+"px, 0px)";
	document.querySelector("#splash").classList.add("animate__rotateOutDownLeft");
	setTimeout(() => { document.querySelector("#splash").style.display = "none"; }, 1000);
   const videoEl = document.getElementById('inputVideo')
   const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold : 0.3 }) 

   
   result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks(true)
   if (result) {
		 if (document.querySelector("#cam-tick-btn").classList.contains("disabled")) { document.querySelector("#cam-tick-btn").classList.remove("disabled"); }
       drawLandmarks(videoEl, document.getElementById('overlay'), [result], false)
      //console.log(Math.round(result._unshiftedLandmarks._positions[0]._x), Math.round(result._unshiftedLandmarks._positions[0]._y));
   } else {
		 document.getElementById('overlay').getContext('2d').clearRect(0, 0, document.getElementById('overlay').width, document.getElementById('overlay').height);
		 if (document.querySelector("#cam-tick-btn").classList.contains("disabled") == false) { document.querySelector("#cam-tick-btn").classList.add("disabled"); }
	 }
	setTimeout(() => {
		if (cam_running) {
			onPlay()
		}
	}, 50);
}

const cropCanvas = (sourceCanvas,left,top,width,height) => {
    let destCanvas = document.createElement('canvas');
    destCanvas.width = width;
    destCanvas.height = height;
    destCanvas.getContext("2d").drawImage(
        sourceCanvas,
        left,top,width,height,  // source rect with content to crop
        0,0,width,height);      // newCanvas, same size as source rect
    return destCanvas;
}

document.querySelector("#cam-tick-btn").addEventListener("click", () => {
	cam_running = false;
 	document.getElementById('overlay').getContext('2d').clearRect(0, 0, document.getElementById('overlay').width, document.getElementById('overlay').height);
	document.getElementById('overlay').getContext('2d').drawImage(document.getElementById('inputVideo'), 0,0, document.getElementById('overlay').width, document.getElementById('overlay').height);
	var snap = cropCanvas(document.getElementById('overlay'),(document.getElementById('overlay').height/document.querySelector(".cam-cont video").clientHeight)*(document.querySelector(".cam-cont video").clientWidth/2-window.innerWidth/2),0,(document.getElementById('overlay').height/document.querySelector(".cam-cont video").clientHeight)*window.innerWidth,document.getElementById('overlay').height).toDataURL("image/png");
	document.querySelector("#effects img").src = snap;
	setTimeout(() => {
		document.querySelector('#effects').style.display = "block";
		document.querySelector('#overlay').remove();
		document.querySelector('#cam video').remove();
		document.querySelector("#cam-tick-btn").classList.add("animate__zoomOut");
		setTimeout(() => {
			document.querySelector('#cam').remove();
			document.querySelector("#effects .effects-cont").style.transform = "scale(.7)";
			document.querySelector("#effects .effects-cont").style.top = "-8%";
		}, 1000);
	}, 100);
});

function changeHair(t) {
	document.querySelector(".selected").classList.remove("selected");
	t.classList.add("selected");
	if (t.innerHTML.includes("<p")) {
		document.querySelector("#hairstyle").style.display = "none";
	} else {
		document.querySelector("#hairstyle").style.display = "block";
		document.querySelector("#hairstyle img").src = t.querySelector("img").src;
	}
}