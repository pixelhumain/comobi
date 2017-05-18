
MeteoricCamera.stopStream = function(st) {
  if(!st) {
    return;
  }

  if(st.stop) {
    st.stop();
    return;
  }

  if(st.getTracks) {
    var tracks = st.getTracks();
    for(var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      if(track && track.stop) {
        track.stop();
      }
    }
  }
};

MeteoricCamera.initViewfinder = function () {
  MeteoricCamera.waitingForPermission.set(true);

  var video = this.find('video');

  // stream webcam video to the <video> element
  /*var success = function(newStream) {
    MeteoricCamera.stream = newStream;

    if (navigator.mozGetUserMedia) {
      video.mozSrcObject = MeteoricCamera.stream;
    } else {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL.createObjectURL(MeteoricCamera.stream);
    }
    video.play();

    MeteoricCamera.waitingForPermission.set(false);
  };*/

  // user declined or there was some other error
  var failure = function(err) {
    MeteoricCamera.error.set(err);
  };

  var promisifiedOldGUM = function(constraints) {

    var getUserMedia = (
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if(!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });

  }

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if(navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if(navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
  }

  // tons of different browser prefixes
/*  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );*/

//enlever
/*  if (! navigator.getUserMedia) {
    // no browser support, sorry
    failure('BROWSER_NOT_SUPPORTED');
    return;
  }*/
//enlever

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
})
.then(function(newStream) {
  MeteoricCamera.stream = newStream;

  /*if (navigator.mozGetUserMedia) {
    video.mozSrcObject = MeteoricCamera.stream;
  } else {
    var vendorURL = window.URL || window.webkitURL;
    video.src = vendorURL.createObjectURL(MeteoricCamera.stream);
  }*/

  video.src = window.URL.createObjectURL(MeteoricCamera.stream);
  video.onloadedmetadata = function(e) {
    video.play();
  };

  MeteoricCamera.waitingForPermission.set(false);

  // resize viewfinder to a reasonable size, not necessarily photo size
  var viewfinderWidth = 320;
  var viewfinderHeight = 568;
  var resized = false;
  video.addEventListener('canplay', function() {
    if (! resized) {
      viewfinderHeight = video.videoHeight / (video.videoWidth / viewfinderWidth);
      video.setAttribute('width', viewfinderWidth);
      video.setAttribute('height', viewfinderHeight);
      resized = true;
    }
  }, false);

  //var video = document.querySelector('video');
  //video.src = window.URL.createObjectURL(stream);
  /*video.onloadedmetadata = function(e) {
    video.play();
  };*/
})
.catch(function(err) {
  //console.log(err.name + ": " + err.message);
  failure('BROWSER_NOT_SUPPORTED');
  //return;
});

  // initiate request for webcam
  /*navigator.getUserMedia({
    video: true,
    audio: false
  }, success, failure);*/


};

Template.viewfinder.rendered = function() {
  MeteoricCamera.initViewfinder.call(this);
};

Template.viewfinder.events({
  'click [data-action="take-photo"]': function (event, template) {
    var video = template.find('video');
    var canvas = template.find('canvas');

    canvas.width = MeteoricCamera.canvasWidth;
    canvas.height = MeteoricCamera.canvasHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, MeteoricCamera.canvasWidth, MeteoricCamera.canvasHeight);
    var data = canvas.toDataURL('image/jpeg', MeteoricCamera.quality);
    MeteoricCamera.photo.set(data);
    //MeteoricCamera.stream.stop();
    MeteoricCamera.stopStream(MeteoricCamera.stream);
  },

  'click [data-action="use-photo"]': function (event, template) {
    MeteoricCamera.closeAndCallback(null, MeteoricCamera.photo.get());
  },

  'click [data-action="retake-photo"]': function (event, template) {
    MeteoricCamera.photo.set(null);
    Meteor.setTimeout(function () {
      MeteoricCamera.initViewfinder.call(template);
    }, 100);
  },

  'click [data-action="cancel"]': function (event, template) {
    if (MeteoricCamera.permissionDeniedError()) {
      MeteoricCamera.closeAndCallback(new Meteor.Error('permissionDenied', 'Camera permissions were denied.'));
    } else if (MeteoricCamera.browserNotSupportedError()) {
      MeteoricCamera.closeAndCallback(new Meteor.Error('browserNotSupported', 'This browser isn\'t supported.'));
    } else if (MeteoricCamera.error.get()) {
      MeteoricCamera.closeAndCallback(new Meteor.Error('unknownError', 'There was an error while accessing the camera.'));
    } else {
      MeteoricCamera.closeAndCallback(new Meteor.Error('cancel', 'Photo taking was cancelled.'));
    }

    if (MeteoricCamera.stream) {
      //MeteoricCamera.stream.stop();
      MeteoricCamera.stopStream(MeteoricCamera.stream);
    }
  }
});

Template.viewfinder.helpers({
  'waitingForPermission': function () {
    return MeteoricCamera.waitingForPermission.get();
  },

  photo: function () {
    return MeteoricCamera.photo.get();
  },

  error: function () {
    return MeteoricCamera.error.get();
  },
  _takephoto: function () {
    return __('Take photo');
  },
  permissionDeniedError: MeteoricCamera.permissionDeniedError,
  browserNotSupportedError: MeteoricCamera.browserNotSupportedError
});
