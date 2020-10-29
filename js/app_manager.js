/**
 * AppManager
 */

class AppManager {
	constructor() {
		this.data_loader = new DataLoader()
		this.data_manager = new DataManager()
		this.ui_controller = new UIController()
		this.map_controller = new MapController()

		this.state = new Object()
	}

	/**
	 * First Ajax calls, loading initial data
	 * @return {[type]} [description]
	 */
	init_app() {
		console.log("App Running")

		var success_get_translations = function(response) {
			console.log("SUCCESS 1")
			// appManager.data_manager.addData("translations", JSON.parse(response))
			appManager.data_manager.translations = JSON.parse(response)
			appManager.data_manager.init_translations(appManager.data_manager.translations)
		}

		var success_request_user_data = function(response) {
			console.log("SUCCESS 2")
			appManager.data_manager.declare_user_data(JSON.parse(response));
		}

		var success_getConceptCount = function(response) {
			console.log("SUCCESS 3 ")
			appManager.data_manager.addData("important_concepts_count", JSON.parse(response))
		}

		var success_getBordersGeoData = function(response) {
			console.log("SUCCESS 4")

			var response = JSON.parse(response);
			var coords = response.polygon;
			var center = response.center;

			// init image upload form
			appManager.ui_controller.image_uploader.init_image_upload_form();

			appManager.map_controller.addGeometryAlps(coords, center);
			appManager.ui_controller.initTool();


		}

		var on_error = function(jqXHR, exception) {
			if (jqXHR.status === 401) {
				alert('HTTP Error 401 Unauthorized.');
			} else {
				alert('Uncaught Error.\n' + jqXHR.responseText);
			}
		}

		let ajax_get_translations = this.data_loader.init_ajax_call("POST", { action: "get_translations" }, success_get_translations, on_error, false)
		let ajax_request_user_data = this.data_loader.init_ajax_call("POST", { action: "request_user_data" }, success_request_user_data, on_error, false)
		let ajax_getConceptCount = this.data_loader.init_ajax_call("POST", { action: "getConceptCount" }, success_getConceptCount, on_error, false)
		let ajax_getBordersGeoData = this.data_loader.init_ajax_call("POST", { action: "getBordersGeoData", geoData: 'alpenKonvention' }, success_getBordersGeoData, on_error, false)

		ajax_get_translations.execute()
			.then(function() { ajax_request_user_data.execute() })
			.then(function() { ajax_getConceptCount.execute() })
			.then(function() { ajax_getBordersGeoData.execute() })

	}

	/**
	 * Initializes the CS-Tool. Performes Ajax Calls to fetch data(locations, user entries) from the server. The gathered data is then stored in global variables.
	 */
	startMainTool() {

		console.log("START MAIN TOOL")
		var current_language = appManager.data_manager.current_language

		appManager.data_loader.create_cookie(current_language);

		var menu_content = jQuery(appManager.data_manager.getTranslation("leftmenu_contents"));

		jQuery('#left_menu').append(menu_content);
		menu_content.show();

		//audio data visualization
		// wavesurfer = add_wavesurfer();

		//translating text in register modal
		if (!appManager.data_manager.user_data.userLoggedIn) {
			appManager.ui_controller.add_translation_register_modal();
		}

		if (appManager.data_manager.selected_dialect !== "") {
			appManager.ui_controller.display_dialect();
		}

		if (!appManager.data_manager.user_data.language_is_set) appManager.ui_controller.showCustomBackdrop();

		jQuery('#submitanswer').on('click', function() {
			console.log('submit button: Before saveword() ' + appManager.ui_controller.submit_button_clicked);

			if (!appManager.ui_controller.submit_button_clicked) {
				appManager.data_loader.saveWord();
				appManager.ui_controller.submit_button_clicked = true;
				setTimeout(function() {
					appManager.ui_controller.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + appManager.ui_controller.submit_button_clicked);*/
				}, 1000);


			}

		})

		/**
		 * set user language -> to be saved as current_language in the wp_db
		 */
		if (!appManager.data_manager.user_data.language_is_set) {
			jQuery.ajax({
				url: ajax_object.ajax_url,
				type: 'POST',
				data: {
					action: 'save_lang_for_user',
					lang: current_language
				},
				success: function(response) {
					/*console.log("language saved");
					console.log("Saved language: " + JSON.parse(response));*/
				}
			});
		}

		/**
		 * Get all images links from server.
		 * @async
		 * @function gets image links
		 * @return {Array} images
		 */
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getImage',
			},
			success: function(response) {
				var images = JSON.parse(response);
				appManager.data_manager.addData("images", images)
			}
		});

		/**
		 * Get locations in current language
		 * @async
		 * @function getTableData
		 */
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getlocations',
				lang: current_language
			},
			success: function(response) {
				var locations = JSON.parse(response);
				appManager.data_manager.addData("locations", locations)

				var location_data = appManager.data_manager.getTableData(locations, "location");
				appManager.data_manager.addData("location_data", location_data)
				appManager.data_manager.initLocationsModal();
			}
		});


		/*ajax call for all the concepts in the choosen language*/
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getKonzepte',
				lang: current_language
			},
			success: function(response) {

				appManager.data_manager.addData("concepts_cur_lang", JSON.parse(response));
				let concepts_cur_lang = appManager.data_manager.getData("concepts_cur_lang");

				//init concept data with all concept data
				let concept_data = appManager.data_manager.getTableData(concepts_cur_lang.data_value, "concept");
				appManager.data_manager.addData("concept_data", concept_data);

				appManager.data_manager.va_phase = 0;

				appManager.data_manager.initConceptModal();

				appManager.ui_controller.allow_select = true;

				let concepts_index_by_id = appManager.data_manager.createConceptIndexList(concepts_cur_lang.data_value);
				appManager.data_manager.addData("concepts_index_by_id", concepts_index_by_id)

				appManager.data_loader.get_submited_answers(function() {
					appManager.ui_controller.setDynamicContent();
					jQuery('#left_menu').css('opacity', '0');
					jQuery('#left_menu').show();
					appManager.ui_controller.offsetHeight = document.getElementById('left_menu').offsetHeight;
					jQuery('#left_menu').css('bottom', -appManager.ui_controller.offsetHeight);

					jQuery('#left_menu').css('opacity', '1');
					jQuery('#left_menu').animate({
						bottom: '+=' + appManager.ui_controller.offsetHeight
					}, 400, 'swing', function() {
						setTimeout(function() {
							appManager.ui_controller.menu_is_up();
						}, 500); // set timeout to display toolpits after menu is up and everything else is displayed
					});
				});

				appManager.data_loader.get_submited_answers_current_user(function() {
					var unanswered_concepts = appManager.data_manager.createUnansweredIndex();
				});


				/**
				 * AUDIO Recording FUNCTION
				 */
				//add_audio_html();


				jQuery('#left_menu').hammer().bind("swipedown", function() {
					if (jQuery(this).is(':visible')) {
						jQuery(this).animate({
							bottom: '-=' + appManager.ui_controller.offsetHeight
						}, 400, 'swing', function() {
							jQuery(this).hide();
							jQuery('#fake_arrow').show();
						});
						jQuery('.popover').hide();
					}
				});

				jQuery('#swipe-up-div').hammer().bind("swipedown", function() {
					if (jQuery('#left_menu').is(':visible')) {
						jQuery('#left_menu').animate({
							bottom: '-=' + appManager.ui_controller.offsetHeight
						}, 400, 'swing', function() {
							jQuery('#left_menu').hide();
							jQuery('#fake_arrow').show();
						});
						jQuery('.popover').hide();
					}
				});


				jQuery('#swipe-up-div').hammer().bind("swipeup", function() {
					if (jQuery('#left_menu').is(':hidden')) {
						jQuery('#left_menu').show().animate({
							bottom: '+=' + appManager.ui_controller.offsetHeight
						}, 400, 'swing', function() {
							jQuery('.popover').show();
						});
						jQuery('#fake_arrow').hide();
					}
				});

				jQuery('#fake_arrow').hammer().bind("swipeup", function() {
					if (jQuery('#left_menu').is(':hidden')) {
						jQuery('#left_menu').show().animate({
							bottom: '+=' + appManager.ui_controller.offsetHeight
						}, 400, 'swing', function() {
							jQuery('.popover').show();
						});
						jQuery('#fake_arrow').hide();

					}
				});


				jQuery('#left_menu').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});
				jQuery('#swipe-up-div').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});
				jQuery('#fake_arrow').data("hammer").get('swipe').set({
					direction: Hammer.DIRECTION_ALL
				});



				jQuery('#word_span').on('click', function() {
					appManager.ui_controller.handleWordSpanClick();
				});

				jQuery('#location_span').on('click', function() {
					appManager.ui_controller.handleLocationSpanClick();
				})


				jQuery('#user_input').on('keyup', function() {

					if (appManager.ui_controller.process_restarted) {
						appManager.map_controller.closeAllInfoWindows();
						appManager.ui_controller.process_restarted = false;
					}

					if (appManager.ui_controller.concept_selected && appManager.ui_controller.location_selected && appManager.ui_controller.stage == 3) {
						appManager.ui_controller.word_entered = true;

						setTimeout(function() {

							appManager.ui_controller.showPopUp();
						}, 100);

					}

				})


			} //success

		});

		console.log("MAIN TOOL STARTED")


	}

}

jQuery(document).on('ready', function() {
	appManager = new AppManager()

	appManager.map_controller.initMap()

	appManager.init_app()
})