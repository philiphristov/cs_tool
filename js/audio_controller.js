/*
Audio Functionality
Enable Audio Recordings of User's asnwers, that can be saved to the DB
*/

function add_audio_html(){

	var rec_audio_div = jQuery("<span></span>");

	rec_audio_div.append('<i id = "record_audio_btn" style="font-size: 36px;" class="fa fa-microphone"></i>');
	rec_audio_div.attr("id", "rec_audio");

	jQuery("#left_menu_content_ger").find(".user_input_container").append(rec_audio_div);

	rec_audio_div.on("click", function(){
		record_audio_test();
	})

}






function save_audio(submitted_answer_id, audio_data){
	var form_data = new FormData();
	form_data.append('file', audio_data);
	form_data.append('action', 'save_audio');
	form_data.append('submitted_answer_id',submitted_answer_id);

	jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: form_data,
			processData: false,
    		contentType: false,
			success : function( response ) {
				console.log("FILE SAVED");
				console.log(JSON.parse(response));
			}
	}); 

}

function startTimer(duration, display) {
    var timer = duration,  seconds;
    setInterval(function () {   
        seconds = parseInt(timer % 60, 10);

        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(seconds);

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}


function record_audio_test(){

	var timer = jQuery("<span id= 'recording_timer'></span>").text("");
	jQuery(leftmenu_contents[current_language]).find(".user_input_container").append(timer);

	var recording_time = 3;
	startTimer(recording_time, timer);

	navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
		const media_recorder = new MediaRecorder(stream);
		media_recorder.start(1000);

		const audio_chuncks = [];

		media_recorder.addEventListener("dataavailable", event => {
	      audio_chuncks.push(event.data);
	      console.log(event.data);
	    });

		media_recorder.addEventListener("stop", () => {

	      const audio_blob = new Blob(audio_chuncks, { 'type' : 'audio/mpeg-3; codecs=opus' });
	      const audio_url = URL.createObjectURL(audio_blob);

	      //save audio recording to the database
	      //save_audio(123,audio_blob);

     	  visualize_audio(audio_url);   
	    });

	    setTimeout(() => {
	      media_recorder.stop();
	      timer.remove();
	    }, recording_time * 1000);

	})

}

function visualize_audio(audio_url){
	// var delete_audio = jQuery('<i id = "delete_audio_btn" style="font-size: 36px;" class="fa fa-times-circle"></i>'); // <i class="far fa-times-circle"></i>  // fa fa-trash


	jQuery("#rec_audio").hide();

	wavesurfer.load(audio_url);

	wavesurfer.on('ready', function () {
		jQuery("#waveform").css("display", "block");
		jQuery("#play_audio_btn").css("display", "block");
		// jQuery("#waveform").append(delete_audio);

		wavesurfer.empty();
	 	wavesurfer.drawBuffer();

	 	setDynamicContent();
	    wavesurfer.play();
	});

	// delete_audio.on("click", function(){
	// 	console.log("delete");
	// 	jQuery("#waveform").css("display", "none");
	// 	jQuery("#rec_audio").css("display", "inline-block");
	// })

	jQuery(window).resize(function() {
	 	wavesurfer.empty();
	 	wavesurfer.drawBuffer();
	});


}


function add_wavesurfer(){
	var audio_div = jQuery("<span></span>");
	audio_div.attr("id", "waveform");

	var play_audio_btn = jQuery('<i id="play_audio_btn" style="font-size: 40px;" class="fa fa-play"></i>'); 
	var delete_audio = jQuery('<i id = "delete_audio_btn" style="font-size: 36px;" class="fa fa-times-circle"></i>');

	jQuery(leftmenu_contents[current_language]).find(".row_2").append(audio_div);
	jQuery(leftmenu_contents[current_language]).find(".row_2").find(audio_div).prepend(play_audio_btn);
	jQuery("#waveform").append(delete_audio);

	setDynamicContent();

	audio_div.css("display", "none");
	jQuery("#play_audio_btn").css("display", "none");


	var wavesurfer = WaveSurfer.create({
		    container: '#waveform',
		    waveColor: '#D2EDD4',
		    progressColor: '#46B54D',
		    barWidth: 1,
		    barHeight: 10,
		    maxCanvasWidth: 150,
		    height:40,
		    hideScrollbar: true
		});

	play_audio_btn.on("click", function(){
		console.log("click");
		wavesurfer.play();
	})

	delete_audio.on("click", function(){
		console.log("delete");
		jQuery("#waveform").css("display", "none");
		jQuery("#rec_audio").css("display", "inline-block");
	})

	return wavesurfer;
}

function onStop() {
    mediaRecorder.stop();
    mediaRecorder.stream.stop();
}