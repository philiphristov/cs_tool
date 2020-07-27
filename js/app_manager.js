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

	init_app() {
		console.log("App Running")
		this.data_manager.test()

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
			.then(function(){ajax_request_user_data.execute()})
			.then(function(){ajax_getConceptCount.execute()})
			.then(function(){ajax_getBordersGeoData.execute()})

	}

	/**
	 * Initializes the CS-Tool. Performes Ajax Calls to fetch data(locations, user entries) from the server. The gathered data is then stored in global variables.
	 */
	startMainTool() {

		create_cookie(current_language);

		var menu_content = jQuery(leftmenu_contents[current_language]);

		jQuery('#left_menu').append(menu_content);
		menu_content.show();

		//audio data visualization
		// wavesurfer = add_wavesurfer();

		//translating text in register modal
		if (!userLoggedIn) {
			console.log(current_language)
			appManager.ui_controller.add_translation_register_modal();
		}

		if (selected_dialect !== "") {
			appManager.ui_controller.display_dialect();
		}

		if (!language_is_set) appManager.ui_controller.showCustomBackdrop();

		jQuery('#submitanswer').on('click', function() {
			console.log('submit button: Before saveword() ' + submit_button_clicked);

			if (!submit_button_clicked) {
				appManager.data_loader.saveWord();
				submit_button_clicked = true;
				setTimeout(function() {
					submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/
				}, 1000);


			}

		})

		/*set user language -> to be saved as current_language in the wp_db*/
		if (!language_is_set) { // (crowder_lang/*.localeCompare("") == 0*/ || current_language != crowder_lang || /*crowder_lang.localeCompare("-1") ||*/ crowder_lang == -1 ) && userLoggedIn

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

		/*ajax call to get all locations in the choosen language*/
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
				images = JSON.parse(response);
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
				locations = JSON.parse(response);

				location_data = appManager.data_manager.getTableData(locations, "location");
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
				// appManager.data_manager.addData("concept_data", JSON.parse(response));
				// let concept_data = appManager.data_manager.getData("concept_data");

				appManager.data_manager.addData("concepts_cur_lang", JSON.parse(response));
				let concepts_cur_lang = appManager.data_manager.getData("concepts_cur_lang");

				//init image upload form
				appManager.ui_controller.image_uploader.init_image_upload_form();


				//init concept data with all concept data
				let concept_data = appManager.data_manager.getTableData(concepts_cur_lang.data_value, "concept");
				appManager.data_manager.addData("concept_data", concept_data);


				va_phase = 0;

				appManager.data_manager.initConceptModal();

				allow_select = true;

				let concepts_index_by_id = appManager.data_manager.createConceptIndexList(concepts_cur_lang.data_value);
				appManager.data_manager.addData("concepts_index_by_id", concepts_index_by_id)

				appManager.data_loader.get_submited_answers(function() {
					appManager.ui_controller.setDynamicContent();
					jQuery('#left_menu').css('opacity', '0');
					jQuery('#left_menu').show();
					offsetHeight = document.getElementById('left_menu').offsetHeight;
					jQuery('#left_menu').css('bottom', -offsetHeight);

					jQuery('#left_menu').css('opacity', '1');
					jQuery('#left_menu').animate({
						bottom: '+=' + offsetHeight
					}, 400, 'swing', function() {
						setTimeout(function() {
							appManager.ui_controller.menu_is_up();
						}, 500); // set timeout to display toolpits after menu is up and everything else is displayed
					});
				});

				appManager.data_loader.get_submited_answers_current_user(function() {
					unanswered_concepts = appManager.data_manager.createUnansweredIndex();
				});


				/*
				AUDIO FUNCTION
				*/
				//add_audio_html();


				jQuery('#left_menu').hammer().bind("swipedown", function() {
					if (jQuery(this).is(':visible')) {
						jQuery(this).animate({
							bottom: '-=' + offsetHeight
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
							bottom: '-=' + offsetHeight
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
							bottom: '+=' + offsetHeight
						}, 400, 'swing', function() {
							jQuery('.popover').show();
						});
						jQuery('#fake_arrow').hide();
					}
				});

				jQuery('#fake_arrow').hammer().bind("swipeup", function() {
					if (jQuery('#left_menu').is(':hidden')) {
						jQuery('#left_menu').show().animate({
							bottom: '+=' + offsetHeight
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

					if (process_restarted) {
						appManager.map_controller.closeAllInfoWindows();
						process_restarted = false;
					}

					if (concept_selected && location_selected && stage == 3) {
						word_entered = true;

						setTimeout(function() {

							showPopUp();
						}, 100);

					}



				})



			} //success

		});



	}

}

jQuery(document).on('ready', function() {
	appManager = new AppManager()

	appManager.map_controller.initMap()

	appManager.init_app()
})