// Wrap in an IIFE to avoid polluting the global name space.
(function (document, window) {
  console.log("[HTML5 Video] cme-ga4html5vid.js loading ...");

  let userID = (typeof cmeGa4Html5VidUserId !== "undefined") ? cmeGa4Html5VidUserId : 0;
  let userIdx = (typeof cmeGa4Html5VidUserIdCdIndex !== "undefined") ? cmeGa4Html5VidUserIdCdIndex : 0;

  // Use the post or page slug as the label.
  function getEventLabel(e) {
    return decodeURIComponent(
      e.target.currentSrc.split("/")[
        e.target.currentSrc.split("/").length - 1
      ]
    );
  }

  // Send something to GA.
  function sendToGA(args) {
    // Only set user ID dimension if we have a valid ID.
    if (userID > 0) {
      window[args.ga]('set', 'userId', userID);
      window[args.ga]('set', 'dimension' + userIdx, userID);
    }

    window[args.ga](
      "send",
      "event",
      "HTML5 Video", // category
      args.action, // action
      getEventLabel(args.e) // label
    );
  }

  // Percent buckets ( 25%-75% )
  var divisor = 25;
  // Object for saving video player status.
  var videos_status = {};
  // Handle player events.
  function eventHandler(e) {
    let _ga = window.GoogleAnalyticsObject;
    let args = {};

    switch (e.type) {
      // This event type is sent every time the player updated it's current time,
      // We're using for the % of the video played.
      case "timeupdate":
        // Let's set the save the current player's video time in our 
        // status object
        videos_status[e.target.id].current = Math.round(e.target.currentTime);
        // We just want to send the percent events once
        var pct = Math.floor(
          (100 * videos_status[e.target.id].current) / e.target.duration
        );
        for (var j in videos_status[e.target.id]._progress_markers) {
          if (pct >= j && j > videos_status[e.target.id].greatest_marker) {
            videos_status[e.target.id].greatest_marker = j;
          }
        }
        // Current bucket hasn't been already sent to GA?. 
        // Then, let's push it to GA.
        if (
          videos_status[e.target.id].greatest_marker &&
          !videos_status[e.target.id]._progress_markers[
            videos_status[e.target.id].greatest_marker
          ]
        ) {
          videos_status[e.target.id]._progress_markers[
            videos_status[e.target.id].greatest_marker
          ] = true;

          args = {
            'ga': _ga,
            'action': videos_status[e.target.id].greatest_marker + "%", 
            'e': e
          }
          sendToGA(args);
        }
        break;
      case "play":
        args = {
          'ga': _ga,
          'action': 'Played video', 
          'e': e
        }
        sendToGA(args);
        break;
      case "pause":
        args = {
          'ga': _ga,
          'action': 'Paused video', 
          'e': e
        }
        sendToGA(args);
        break;
      // If the viewer ends playing the video, an Finish video will be pushed ( This equals to % played = 100 )
      case "ended":
        args = {
          'ga': _ga,
          'action': '100%', 
          'e': e
        }
        sendToGA(args);
        break;
      default:
        break;
    }
  }
  // We need to configure the listeners
  // Let's grab all the the "video" objects on the current page
  var videos = document.getElementsByTagName("video");
  for (var i = 0; i < videos.length; i++) {
    // In order to have some id to reference in our status object, we are adding an id to the video objects
    // that don't have an id attribute.
    var videoTagId;
    if (!videos[i].getAttribute("id")) {
      // Generate a random alphanumeric string to use is as the id
      videoTagId = "html5_video_" + Math.random().toString(36).slice(2);
      videos[i].setAttribute("id", videoTagId);
    } // Current video has alredy a id attribute, then let's use it <img draggable="false" class="emoji" alt="?" src="https://s.w.org/images/core/emoji/2/svg/1f642.svg">
    else {
      videoTagId = videos[i].getAttribute("id");
    }
    // Video Status Object declaration
    videos_status[videoTagId] = {};
    // We'll save the highest percent mark played by the viewer in the current video.
    videos_status[videoTagId].greatest_marker = 0;
    // Let's set the progress markers, so we can know afterwards which ones have been already sent.
    videos_status[videoTagId]._progress_markers = {};
    for (j = 0; j < 100; j++) {
      videos_status[videoTagId].progress_point =
        divisor * Math.floor(j / divisor);
      videos_status[videoTagId]._progress_markers[
        videos_status[videoTagId].progress_point
      ] = false;
    }
    // On page DOM, all players currentTime is 0
    videos_status[videoTagId].current = 0;
    // Now we're setting the event listeners.
    videos[i].addEventListener("play", eventHandler, false);
    videos[i].addEventListener("pause", eventHandler, false);
    videos[i].addEventListener("ended", eventHandler, false);
    videos[i].addEventListener("timeupdate", eventHandler, false);
    videos[i].addEventListener("ended", eventHandler, false);
  }
})(document, window);
