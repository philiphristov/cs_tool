/**
 * DataLoader
 */
class DataLoader {
	constructor() {

	}

	init_ajax_call(type, ajax_data, success_callback, error_callback, async = false) {
		let ajax_call = new AjaxCaller(type, ajax_data, success_callback, error_callback, async).prepareAjax()
		// return ajax_call.get_results()
		return ajax_call
	}

	get_dialects(callbackOpenModal) {
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_dialects'
			},
			success: function(response) {

				appManager.data_manager.addData("dialect_array", JSON.parse(response));

				var dialect_array = appManager.data_manager.getData("dialect_array").data_value
				var dialect_data = appManager.data_manager.getTableData(dialect_array, "dialect");

				if (!appManager.data_manager.dialect_modal_initialized) {
					let datatable_dialects = appManager.data_manager.create_dialect_list_modal(jQuery("#dialect_modal"), dialect_data);
					console.log(datatable_dialects)
					appManager.data_manager.addData("datatable_dialects", datatable_dialects)
					appManager.data_manager.dialect_modal_initialized = true;
				}

				if (!jQuery("#welcome_modal").hasClass("in")) {
					appManager.ui_controller.showCustomModalBackdrop();
					if (callbackOpenModal) {
						callbackOpenModal();
					}
				}
			}

		});


	}


	get_submited_answers(callback) {

		if (!userLoggedIn) {
			addLoginToolTip();
			startLoginTimer();
		}

		check_user_aeusserungen();

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'send_location_submited_asnswers_count',
				lang: current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var location_data_count = data.data_count;
				var is_admin = data.can_edit;

				appManager.data_loader.get_aeussetungen_locations_curLang(location_data_count, is_admin, callback);

				aeusserungen_by_locationindex = new Object();
			}
		});


	}

	get_submited_answers_current_location(location_id, marker) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_location',
				lang: current_language,
				location_id: location_id
			},
			success: function(response) {

				var data = JSON.parse(response);
				var submited_anwerts_current_location = data.submited_data;
				var is_admin = data.can_edit;
				aeusserungen_by_locationindex[location_id] = submited_anwerts_current_location;

				//jQuery('#custom_backdrop i').css('top','0px');
				//jQuery('#custom_backdrop').hide().css('background','');
				jQuery('#custom_backdrop').fadeOut('slow');
				appManager.data_manager.openLocationListModal(marker);

			}
		});

	}


 getHighScoresFromDB(callback) {

  jQuery.ajax({
    url: ajax_object.ajax_url,
    type: 'POST',
    data: {
      action: 'getHighScores',
      lang: current_language,
      num: 10
    },
    success: function(response) {

      var result = JSON.parse(response);
      top_concepts = result["top_concepts"];
      top_users = result["top_users"];
      top_locations = result["top_locations"];

      if (typeof callback == "function")
        callback();

    }

  });
}

	/**
	 * Display markers for each location and the corresponding number of answers in each one.
	 * @param  {Array} arrayA   Indexed array(index: location id) of each location(name, center point).
	 * @param  {Boolean} can_edit Checks if the user can edit the answers(Only for admins).
	 *
	 */
	get_aeussetungen_locations_curLang(arrayA, can_edit, callback) {
		for (var key in arrayA) {
			if (arrayA.hasOwnProperty(key)) {
				if (arrayA[key].count != null) appManager.map_controller.display_location_markers(arrayA[key], can_edit);
			}
		}

		appManager.map_controller.pixioverlay.completeDraw(); //inital DRAW


		setTimeout(function() {

			jQuery('#custom_backdrop').fadeOut('slow', function() {
				jQuery(this).remove();
			});
			console.log("ALL POLYGONS LOADED");
			callback();

			//jQuery('#custom_backdrop').fadeOut(200,function(){jQuery(this).remove(); console.log("hide custom_backdrop");});
			//jQuery('#custom_backdrop').remove();
			//console.log(jQuery('#custom_backdrop'));
		}, 300);
	}


	get_submited_answers_current_user(callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_user',
				lang: current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var submited_answers_current_user = data.submited_answers_current_user;
				var is_admin = data.can_edit;

				add_submited_answers_to_index_submitedAnswers_array(submited_answers_current_user, is_admin);

				num_of_answers_by_id = createAnswersToEntryNumbers(submitedAnswers_indexed);
				checkEnteredConcepts_indexed();

				populate_concept_span(function() {
					console.log("test running")
				});
				callback();
				//init_left_menu();
			}

		});
	}

	/**
	 * Gets values from all answer-input fields and performs an ajax call with the user's answer to be saved in the database. 
	 * Performs all checks if all fields are filled correctly. And places a marker when the input is saved in the database.
	 * @function saveWord
	 */
	saveWord() {



		var input_word = jQuery("#user_input").val();
		var location = jQuery('#location_span').html();
		var location_id = jQuery('#location_span').attr('data-id_location');
		var concept = jQuery('#word_span').html();
		var concept_id = jQuery('#word_span').attr('data-id_concept');

		if (!current_user_age) {
			current_user_age = "";
		}

		//error handling, if user changes the va_phase after choosing a concept form a certain va_phase
		if (get_table_index_by_va_phase(concept_id)) {
			var concept_index = get_table_index_by_va_phase(concept_id);
		} else {
			if (va_phase == 1) {
				va_phase = 2;
			} else {
				va_phase = 1;
			}
			var concept_index = get_table_index_by_va_phase(concept_id);
		}




		/*Check if fields for Konzept and Region are filled*/
		if (input_word.localeCompare("") != 0 && location_id != null && concept_selected == true) {

			stage = 5;
			jQuery('#submitanswer').popover('hide');

			var answer = {
				concept: concept,
				user_input: input_word,
				location: location,
				location_id: location_id
			};

			if (!isDuplicate_indexed(answer)) {

				/**
				 * Gets user's ID. Used to generate a unique crowder_id cookie, when the user submits an answer.
				 * @async
				 * @function getUserID
				 */
				jQuery.ajax({
					url: ajax_object.ajax_url,
					type: 'POST',
					data: {
						action: 'getUserID',
					},
					success: function(response) {

						if (current_user == null) current_user = JSON.parse(response);

						createCookie("crowder_id", current_user);
						/**
						 * Send all data(location, location id, concept, concept id, user answer and current user id(not logged in users) or user name(logged in users)) to server.
						 * @function save_word_async
						 * @async
						 */
						jQuery.ajax({
							url: ajax_object.ajax_url,
							type: 'POST',
							data: {
								action: 'saveWord',
								gemeinde: location,
								gemeinde_id: location_id,
								konzept: concept,
								konzept_Id: concept_id,
								bezeichnung: input_word,
								current_user: current_user,
								current_language: current_language,
								current_dialect: selected_dialect,
								current_user_age: current_user_age

							},
							beforeSend: function() {

							},
							success: function(response) {

								var id_aeusserung = JSON.parse(response);

								if (id_aeusserung == null) return;

								jQuery('#image_modal').modal('hide');

								/**
								 * Load the location's polygon to be displayed on the map, when user's answer is successfully saved to the database.
								 * @function load_location_polygon
								 * @async
								 */
								jQuery.ajax({
									url: ajax_object.ajax_url,
									type: 'POST',
									data: {
										action: 'getChoosenGemeinde',
										location_id: location_id,
										searchedGemeinde: location,
										concept: concept,
										concept_id: concept_id,
										bezeichnung: input_word
									},
									success: function(response) {
										//add the location and it's id, it they do not exist in the data tables.
										var ob = {
											id: location_id,
											name: location
										};
										if (include(locations, ob) !== true) {
											locations.push(ob);
										}

										session_answer_count++;
										if (!userLoggedIn) checkLoginPopUp();

										var answer = {
											concept: concept,
											user_input: input_word,
											location: location,
											id_auesserung: id_aeusserung,
											concept_id: concept_id,
											concept_index: concept_index
										};

										submitedAnswers.push(answer);
										submitedAnswers_indexed[id_aeusserung] = answer;
										delete unanswered_concepts[concept_index];

										var entry = {};
										entry[id_aeusserung] = {
											author: current_user,
											id_aeusserung: id_aeusserung.toString(),
											id_concept: concept_id,
											id_geo: location_id,
											konzept: concept,
											ortsname: location,
											word: input_word,
											tokenisiert: "0"
										};

										if (aeusserungen_by_locationindex[location_id] == null) {
											aeusserungen_by_locationindex[location_id] = entry;
										} else {
											aeusserungen_by_locationindex[location_id][id_aeusserung] = {
												author: current_user,
												id_aeusserung: id_aeusserung.toString(),
												id_concept: concept_id,
												id_geo: location_id,
												konzept: concept,
												ortsname: location,
												word: input_word,
												tokenisiert: "0"
											};
										}

										remove_location_search_listener();
										add_user_marker(JSON.parse(response), id_aeusserung);
										change_feature_style(old_feature, check_user_aesserungen_in_location(location));

										setTimeout(function() {

											if (location_markers[location_id]) {
												change_marker(location_markers[location_id], 1, "green");
											} else {
												var obj = JSON.parse(response);
												var element = {
													count: "1",
													geo_data: {
														geo: obj.centerCoordinates,
														location_id: obj.location_id,
														userCheck: true
													},
													geo: obj.centerCoordinates,
													location_id: obj.location_id,
													userCheck: true,
													location_name: location
												};

												display_location_markers(element);
												pixioverlay.completeDraw();
											}

										}, 300);

										//prompt user to register/send data anonimously
										if (Object.keys(submitedAnswers_indexed).length == 1) {
											setTimeout(function() {
												openRegisterOrAnonymousModal();
											}, 1000);
										}

										jQuery('#word_span').data("id_concept", null);

										jQuery('.row_1').fadeOut().fadeIn();
										jQuery('.row_2').fadeOut(function() {
											jQuery('#submitanswer').popover('hide');

											jQuery('#user_input').val("");
											jQuery('#word_span').text(the_word_concept[current_language]);
											setTimeout(function() {

												jQuery('#word_span').popover('show');

												jQuery('.pop_word_span').parent().on('click', function() {
													handleWordSpanClick();
												}).addClass('c_hover');
											}, 1000);
											process_restarted = true;

										}).fadeIn();

										concept_selected = false;
										word_entered = false;
										stage = 3;

										deSelectTableEntry(concept_index);

										var entry = num_of_answers_by_id[parseInt(concept_id)];
										if (entry == null) num_of_answers_by_id[parseInt(concept_id)] = 1;
										else num_of_answers_by_id[parseInt(concept_id)] += 1;

										checkTableEntry(concept_id);


										var row = jQuery(datatable_concepts.row(concept_index).node());
										if (row.find('.num_of_answers').length == 0) {
											row.find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										} else {
											row.find('.num_of_answers').text(num_of_answers_by_id[parseInt(concept_id)]);
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										}

										current_concept_index = -1;

										var ua = navigator.userAgent.toLowerCase();
										var isAndroid = ua.indexOf("android") > -1;
										if (isAndroid) {
											map.panTo(location_markers[location_id].getPosition());
										}

									}
								});

							}
						});

					}
				});
			} else {

				for (var key in submitedAnswers_indexed) {
					if (submitedAnswers_indexed.hasOwnProperty(key)) {
						if (input_word.localeCompare(submitedAnswers_indexed[key].user_input) == 0 && concept.localeCompare(submitedAnswers_indexed[key].concept) == 0) {
							var id_auesserung = submitedAnswers_indexed[key].id_auesserung;
							var concept_id = submitedAnswers_indexed[key].concept_id;
							break;
						}
					}
				}


				editInputA(id_auesserung, concept_id, location_id, concept, false);




			}
		} else {
			jQuery('.message_modal_content').text(user_input_not_full[current_language]);
			jQuery('#message_modal').modal({
				backdrop: 'static',
				keyboard: false
			});
		}



	}


	save_user_dialect(user_name) {

		var parsed_name = user_name.replace(/\s/g, ".");
		console.log(parsed_name.toLowerCase());
		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'save_user_dialect',
				user_name: parsed_name.toLowerCase(),
				user_dialect: selected_dialect
			},
			success: function(response) {
				console.log("Dialect Added");
				console.log(JSON.parse(response));
			}
		});
	}

	/*When location is choosen show polygon will check if this location's polygon exists else it will get it from the database*/
	/**
	 * After Choosing a locations from the location data tables. Get the location's polygon and display it.
	 * @param  {String} g_location    [description]
	 * @param  {Int} g_location_id [description]
	 * @param  {Int} index         [description]
	 *
	 */
	get_display_polygon(g_location, g_location_id, zoom_active) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'getPolygonGemeinde',
				location_id: g_location_id,
				searchedGemeinde: g_location,
			},
			success: function(response) {

				existingLocations.push(JSON.parse(response).location_id);
				appManager.map_controller.addGeometry(JSON.parse(response).polygonCoordinates, JSON.parse(response));


				if (zoom_active) {
					if (appManager.map_controller.map.getZoom() > 6) {
						appManager.map_controller.map.setZoom(6);
					}
				}


				var lat = geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lat;
				var lng = geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lng;

				centerCoordinates_locations.push({
					'id': JSON.parse(response).location_id,
					'lat': lat,
					'lng': lng
				});

				if (zoom_active) {
					appManager.map_controller.map.flyTo([lat, lng], 10, { animate: true, duration: 0.5 });

					// map.panTo({
					//   lat: lat_g,
					//   lng: lng_g
					// });
					// setTimeout(function() {
					//   smoothZoom(map, 11, map.getZoom());
					// }, 200);
				}
				if (stage == 5) {
					stage = 6;

					setTimeout(function() {
						jQuery('#word_span').popover('show');
						appManager.ui_controller.displayTooltips(true);
					}, 2000);
				}

			}
		}); //ajax end

	}

}



class AjaxCaller {
	constructor(type, ajax_data, success_callback, error_callback, async) {
		this.type = type
		this.ajax_data = ajax_data
		this.success_callback = success_callback
		this.error_callback = error_callback
		this.async = async
	}

	get_results() {
		return jQuery.ajax({
			url: ajax_object.ajax_url,
			type: this.type,
			async: this.async,
			data: this.ajax_data,
			success: this.success_callback,
			error: this.error_callback
		});
	}


	prepareAjax() {
		var properties = {
			url: ajax_object.ajax_url,
			type: this.type,
			async: this.async,
			data: this.ajax_data,
			success: this.success_callback,
			error: this.error_callback
		}

		var defer = jQuery.Deferred();

		var promise = defer.promise();

		return jQuery.extend(promise, {
			execute: function() {
				return jQuery.ajax(properties).then(defer.resolve.bind(defer), defer.reject.bind(defer));
			}
		});
	}
}