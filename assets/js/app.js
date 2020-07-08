var $ = Dom7;
var app = new Framework7({
  id: 'hairchanger.chirag.galaiya',
  root: '#app',
  theme: 'md',
});
var mainView = app.views.create('.view');

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
});

document.querySelector("#splash button").addEventListener("click", () => {
	navigator.permissions.query({name: 'camera'}).then(async(permissionObj) => {
		if (permissionObj.state == "granted") {
			await faceapi.loadTinyFaceDetectorModel('assets/models/tiny_face_detector_model-weights_manifest.json')
			await faceapi.loadFaceLandmarkTinyModel('assets/models/face_landmark_68_tiny_model-weights_manifest.json')
			const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
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
    

  
////////////////////////// The 2 Main functions ///////////////////////////////////////////  
  
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

    setTimeout(() => onPlay())
}