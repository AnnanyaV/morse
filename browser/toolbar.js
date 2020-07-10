'use strict'

// Declaring all the variables/constants used.

var video = document.querySelector("video");
const vgaButton = document.querySelector('#vga');
const hdButton = document.querySelector('#hd');
const fullHdButton = document.querySelector('#full-hd');
const pause = document.getElementById('pause');
const resume = document.getElementById('resume');
const try1 = document.getElementById("try1");
var video2 = document.getElementById("video2");
const start_recording = document.getElementById('btn-start-recording');
const stop_recording = document.getElementById('btn-stop-recording');
const pipButton = document.getElementById("pipButton");
const pipButton1 = document.getElementById("pipButton1");
var recorder;
const filterSelect = document.querySelector('select#filter');

//Function to capture user media

function captureCamera(callback) {
    navigator.mediaDevices.getUserMedia(constraints).then(function (camera) {
        callback(camera);
    }).catch(function (error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
    });
}




//For screen recording
function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () { };
    }, false);
    stream.addEventListener('inactive', function () {
        callback();
        callback = function () { };
    }, false);
    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            callback();
            callback = function () { };
        }, false);
        track.addEventListener('inactive', function () {
            callback();
            callback = function () { };
        }, false);
    });
}


//Function that captures the screen

function captureScreen(callback) {
    invokeGetDisplayMedia(function (screen) {
        addStreamStopListener(screen, function () {
            stop_recording.click();
        });
        callback(screen);
    }, function (error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'monitor',
            logicalSurface: true,
            cursor: 'always'
        }
    };

    displaymediastreamconstraints = {
        video: true
    };

    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
    else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

//Constraints without effects
var constraints = {
    audio: true,
    video: true
}

//Constraints changed as per the constraints of camera resolution.

vgaButton.onclick = () => {
    constraints = { audio: true, video: { width: { exact: 1280 }, height: { exact: 720 } } }
    console.log('vga');
};

hdButton.onclick = () => {
    constraints = { audio: true, video: { width: { exact: 1280 }, height: { exact: 720 } } }
    console.log('HD');

};

fullHdButton.onclick = () => {
    constraints = { audio: true, video: { width: { exact: 640 }, height: { exact: 480 } } }
    console.log('Full HD');
};

//Pause and Resume

pause.onclick = function (recorder) {
    this.disabled = true;
    resume.disabled = false;
    recorder.pauseRecording();
}

resume.onclick = function (recorder) {
    this.disabled = true;
    pause.disabled = false;
    recorder.resumeRecording();
}





stop_recording.onclick = function () {
    this.disabled = true;
    start_recording.disabled = false;
    recorder.stopRecording(stopRecordingCallback);
};

// Recording camera


document.getElementById('camera').onclick = function () {
    start_recording.disabled = false;
    pipButton.disabled = false;

    //Adding filters
    filterSelect.onchange = function () {
        video.className = filterSelect.value;
        video2.className = filterSelect.value;
    };

    var recorder;

    start_recording.onclick = function () {
        this.disabled = true;
        pause.disabled = false;
        resume.disabled = true;
        captureCamera(function (camera) {
            video.muted = true;
            video.volume = 0;
            video.srcObject = camera;

            recorder = RecordRTC(camera, {
                type: 'video'
            });

            recorder.startRecording();

            // release camera on stopRecording
            recorder.camera = camera;

            stop_recording.disabled = false;
        });
    };

    pause.onclick = function () {
        this.disabled = true;
        resume.disabled = false;
        recorder.pauseRecording();
    }

    resume.onclick = function () {
        this.disabled = true;
        pause.disabled = false;
        recorder.resumeRecording();
    }

    //Storing and re rendering the recorded media in another space
    function stopRecordingCallback() {
        video2.src = video2.srcObject = null;
        pause.disabled = true;
        resume.disabled = true;
        video2.muted = false;
        video2.volume = 1;
        video2.src = URL.createObjectURL(recorder.getBlob());

        recorder.camera.stop();
        recorder.destroy();
        recorder = null;
    }

    document.getElementById('btn-stop-recording').onclick = function () {
        this.disabled = true;
        document.getElementById('btn-start-recording').disabled = false
        document.getElementById('pause').disabled = true
        document.getElementById('resume').disabled = true
        pipButton.disabled = true;
        recorder.stopRecording(stopRecordingCallback);
    };


}

// Screen Recording

document.getElementById('screen').onclick = function () {
    document.getElementById('btn-start-recording').disabled = false;
    pipButton.disabled = false;

    if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
        var error = 'Your browser does NOT support the getDisplayMedia API.';
        document.querySelector('h1').innerHTML = error;

        document.querySelector('video').style.display = 'none';
        document.getElementById('btn-start-recording').style.display = 'none';
        document.getElementById('btn-stop-recording').style.display = 'none';
        throw new Error(error);
    }


    function stopRecordingCallback() {
        video2.src = video2.srcObject = null;
        video2.src = URL.createObjectURL(recorder.getBlob());

        recorder.screen.stop();
        recorder.destroy();
        recorder = null;

        document.getElementById('btn-start-recording').disabled = false;
    }

    var recorder;

    document.getElementById('btn-start-recording').onclick = function () {
        this.disabled = true;
        document.getElementById('pause').disabled = false;
        captureScreen(function (screen) {
            video.srcObject = screen;

            recorder = RecordRTC(screen, {
                type: 'video'
            });

            recorder.startRecording();

            // release screen on stopRecording
            recorder.screen = screen;

            document.getElementById('btn-stop-recording').disabled = false;
        });
    };

    pause.onclick = function () {
        this.disabled = true;
        resume.disabled = false;
        recorder.pauseRecording();
    }

    resume.onclick = function () {
        this.disabled = true;
        pause.disabled = false;
        recorder.resumeRecording();
    }



    document.getElementById('btn-stop-recording').onclick = function () {
        pipButton.disabled = true;
        this.disabled = true;
        document.getElementById('btn-start-recording').disabled = false;
        document.getElementById('pause').disabled = true;
        document.getElementById('resume').disabled = true;
        recorder.stopRecording(stopRecordingCallback);
    };
}

//Picture in Picture 

function stopRecordingCallback() {
    video2.src = video2.srcObject = null;
    video2.src = URL.createObjectURL(recorder.getBlob());

    recorder.screen.stop();
    recorder.destroy();
    recorder = null;

    document.getElementById('btn-start-recording').disabled = false;
}

stop_recording.onclick = function () {
    this.disabled = true;
    start_recording.disabled = false
    pause.disabled = true
    resume.disabled = true
    recorder.stopRecording(stopRecordingCallback);
};


pipButton.addEventListener("click", async () => {
    try {
        await video.requestPictureInPicture();
    } catch (error) {
        console.log('The video failed to load');
    }
});
// //Camera and Screen

document.getElementById('camscreen').onclick = function () {
    try {
        document.getElementById('btn-stop-recording').disabled = false
        document.getElementById('btn-start-recording').disabled = true
        document.getElementById('camera').disabled = true
        document.getElementById('screen').disabled = true
        document.getElementById('camscreen').disabled = true
        document.getElementById('cam_and_screen').disabled = false
        document.getElementById('pipButton').disabled = true
        captureCamera(function (camera) {
            video.muted = true;
            video.volume = 0;
            video.srcObject = camera;

            recorder = RecordRTC(camera, {
                type: 'video'
            });
            recorder.startRecording();

            // release camera on stopRecording
            recorder.camera = camera;

        });
    }
    catch (error) {
        console.log('Error');
        // Video failed to enter Picture-in-Picture mode.
    }
    captureScreen(function (screen) {
        video2.srcObject = screen;

        recorder = RecordRTC(screen, {
            type: 'video'
        });

        recorder.startRecording();

        // release screen on stopRecording
        recorder.screen = screen;

    });

    function stopRecordingCallback() {
        video2.src = video2.srcObject = null;
        video2.src = URL.createObjectURL(recorder.getBlob());

        recorder.screen.stop();
        recorder.destroy();
        recorder = null;

        document.getElementById('btn-start-recording').disabled = false;
    }

    stop_recording.onclick = function () {
        this.disabled = true;
        start_recording.disabled = false
        pause.disabled = true
        resume.disabled = true
        document.getElementById('camera').disabled = false
        document.getElementById('screen').disabled = false
        document.getElementById('camscreen').disabled = false
        document.getElementById('pipButton').disabled = false
        document.getElementById('cam_and_screen').disabled = true
        recorder.stopRecording(stopRecordingCallback);
    };

    pause.onclick = function () {
        this.disabled = true;
        resume.disabled = false;
        recorder.pauseRecording();
    }

    resume.onclick = function () {
        this.disabled = true;
        pause.disabled = false;
        recorder.resumeRecording();
    }

};



const cam_screen = document.getElementById('cam_and_screen');
cam_screen.addEventListener("click", async () => {
    try {
        await video.requestPictureInPicture();
    } catch (error) {
        console.log('failed')
    }

});
