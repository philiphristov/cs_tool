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

		if (!appManager.data_manager.user_data.userLoggedIn) {
			appManager.ui_controller.addLoginToolTip();
			appManager.ui_controller.startLoginTimer();
		}

		appManager.data_manager.check_user_aeusserungen();

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'send_location_submited_asnswers_count',
				lang: appManager.data_manager.current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var location_data_count = data.data_count;
				var is_admin = data.can_edit;

				appManager.data_loader.get_aeussetungen_locations_curLang(location_data_count, is_admin, callback);

				var aeusserungen_by_locationindex = new Object();
				appManager.data_manager.addData("aeusserungen_by_locationindex", aeusserungen_by_locationindex);
			}
		});


	}

	get_submited_answers_current_location(location_id, marker) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_location',
				lang: appManager.data_manager.current_language,
				location_id: location_id
			},
			success: function(response) {

				var data = JSON.parse(response);
				var submited_anwerts_current_location = data.submited_data;
				var is_admin = data.can_edit;
				appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id] = submited_anwerts_current_location;

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
				lang: appManager.data_manager.current_language,
				num: 10
			},
			success: function(response) {

				var result = JSON.parse(response);
				appManager.data_manager.top_concepts = result["top_concepts"];
				appManager.data_manager.top_users = result["top_users"];
				appManager.data_manager.top_locations = result["top_locations"];

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


			// jQuery('#custom_backdrop').fadeOut(200,function(){jQuery(this).remove(); console.log("hide custom_backdrop");});
			jQuery('#custom_backdrop').remove();
			jQuery('#custom_backdrop').remove();
			jQuery("#welcomeback_modal").hide()
			callback();
			// console.log(jQuery('#custom_backdrop'));
		}, 300);
	}


	get_submited_answers_current_user(callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'get_submited_answers_current_user',
				lang: appManager.data_manager.current_language
			},
			success: function(response) {
				var data = JSON.parse(response);
				var submited_answers_current_user = data.submited_answers_current_user;
				var is_admin = data.can_edit;

				appManager.data_loader.add_submited_answers_to_index_submitedAnswers_array(submited_answers_current_user, is_admin);

				var num_of_answers_by_id = appManager.data_manager.createAnswersToEntryNumbers(appManager.data_manager.submitedAnswers_indexed);
				appManager.data_manager.addData("num_of_answers_by_id", num_of_answers_by_id)
				appManager.data_manager.checkEnteredConcepts_indexed();

				appManager.ui_controller.populate_concept_span(function() {
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

		if (!appManager.data_manager.user_data.current_user_age) {
			appManager.data_manager.user_data.current_user_age = "";
		}

		//error handling, if user changes the va_phase after choosing a concept form a certain va_phase
		if (appManager.data_loader.get_table_index_by_va_phase(concept_id)) {
			var concept_index = appManager.data_loader.get_table_index_by_va_phase(concept_id);
		} else {
			if (appManager.data_manager.va_phase == 1) {
				appManager.data_manager.va_phase = 2;
			} else {
				appManager.data_manager.va_phase = 1;
			}
			var concept_index = appManager.data_loader.get_table_index_by_va_phase(concept_id);
		}




		/*Check if fields for Konzept and Region are filled*/
		if (input_word.localeCompare("") != 0 && location_id != null && appManager.ui_controller.concept_selected == true) {

			appManager.ui_controller.stage = 5;
			jQuery('#submitanswer').popover('hide');

			var answer = {
				concept: concept,
				user_input: input_word,
				location: location,
				location_id: location_id
			};

			if (!appManager.data_manager.isDuplicate_indexed(answer)) {

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

						if (appManager.data_manager.user_data.current_user == null) {
							appManager.data_manager.user_data.current_user = JSON.parse(response);
						}

						appManager.data_loader.createCookie("crowder_id", appManager.data_manager.user_data.current_user);
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
								current_user: appManager.data_manager.user_data.current_user,
								current_language: appManager.data_manager.current_language,
								current_dialect: appManager.data_manager.selected_dialect,
								current_user_age: appManager.data_manager.user_data.current_user_age

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
										if (appManager.data_loader.include(appManager.data_manager.getData("locations").data_value, ob) !== true) {
											appManager.data_manager.getData("locations").data_value.push(ob);
										}

										appManager.data_manager.session_answer_count++;
										if (!appManager.data_manager.user_data.userLoggedIn) appManager.ui_controller.checkLoginPopUp();

										var answer = {
											concept: concept,
											user_input: input_word,
											location: location,
											id_auesserung: id_aeusserung,
											concept_id: concept_id,
											concept_index: concept_index
										};
										if (!appManager.data_manager.getData("submitedAnswers")) appManager.data_manager.addData("submitedAnswers", [])
										appManager.data_manager.getData("submitedAnswers").data_value.push(answer);
										appManager.data_manager.submitedAnswers_indexed[id_aeusserung] = answer;
										delete appManager.data_manager.unanswered_concepts[concept_index];

										var entry = {};
										entry[id_aeusserung] = {
											author: appManager.data_manager.user_data.current_user,
											id_aeusserung: id_aeusserung.toString(),
											id_concept: concept_id,
											id_geo: location_id,
											konzept: concept,
											ortsname: location,
											word: input_word,
											tokenisiert: "0"
										};

										if (appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id] == null) {
											appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id] = entry;
										} else {
											appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id][id_aeusserung] = {
												author: appManager.data_manager.user_data.current_user,
												id_aeusserung: id_aeusserung.toString(),
												id_concept: concept_id,
												id_geo: location_id,
												konzept: concept,
												ortsname: location,
												word: input_word,
												tokenisiert: "0"
											};
										}

										appManager.map_controller.remove_location_search_listener();
										appManager.map_controller.add_user_marker(JSON.parse(response), id_aeusserung);
										appManager.map_controller.change_feature_style(appManager.map_controller.old_feature, appManager.data_manager.check_user_aesserungen_in_location(location));

										setTimeout(function() {

											if (appManager.map_controller.location_markers[location_id]) {
												appManager.map_controller.change_marker(appManager.map_controller.location_markers[location_id], 1, "green");
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

												appManager.map_controller.display_location_markers(element);
												appManager.map_controller.pixioverlay.completeDraw();
											}

										}, 300);

										//prompt user to register/send data anonimously
										if (Object.keys(appManager.data_manager.submitedAnswers_indexed).length == 1) {
											setTimeout(function() {
												appManager.ui_controller.openRegisterOrAnonymousModal();
											}, 1000);
										}

										jQuery('#word_span').data("id_concept", null);

										jQuery('.row_1').fadeOut().fadeIn();
										jQuery('.row_2').fadeOut(function() {
											jQuery('#submitanswer').popover('hide');

											jQuery('#user_input').val("");
											jQuery('#word_span').text(appManager.data_manager.getTranslation("the_word_concept"));
											setTimeout(function() {

												jQuery('#word_span').popover('show');

												jQuery('.pop_word_span').parent().on('click', function() {
													appManager.ui_controller.handleWordSpanClick();
												}).addClass('c_hover');
											}, 1000);
											appManager.ui_controller.process_restarted = true;

										}).fadeIn();

										appManager.ui_controller.concept_selected = false;
										appManager.ui_controller.word_entered = false;
										appManager.ui_controller.stage = 3;

										appManager.ui_controller.deSelectTableEntry(concept_index);

										var entry = appManager.data_manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)];
										if (entry == null) appManager.data_manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)] = 1;
										else appManager.data_manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)] += 1;

										appManager.data_manager.checkTableEntry(concept_id);


										var row = jQuery(appManager.data_manager.getDataTable("datatable_concepts").row(concept_index).node());
										if (row.find('.num_of_answers').length == 0) {
											row.find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										} else {
											row.find('.num_of_answers').text(appManager.data_manager.getData("num_of_answers_by_id").data_value[parseInt(concept_id)]);
											if (row.find(".wiki_info").length == 1) row.find('.num_of_answers').addClass("answers_with_wiki");
										}

										appManager.data_manager.current_concept_index = -1;

										var ua = navigator.userAgent.toLowerCase();
										var isAndroid = ua.indexOf("android") > -1;
										if (isAndroid) {
											appManager.map_controller.map.panTo(appManager.map_controller.location_markers[location_id].getPosition());
										}

									}
								});

							}
						});

					}
				});
			} else {

				for (var key in appManager.data_manager.submitedAnswers_indexed) {
					if (appManager.data_manager.submitedAnswers_indexed.hasOwnProperty(key)) {
						if (input_word.localeCompare(appManager.data_manager.submitedAnswers_indexed[key].user_input) == 0 && concept.localeCompare(appManager.data_manager.submitedAnswers_indexed[key].concept) == 0) {
							var id_auesserung = appManager.data_manager.submitedAnswers_indexed[key].id_auesserung;
							var concept_id = appManager.data_manager.submitedAnswers_indexed[key].concept_id;
							break;
						}
					}
				}


				appManager.ui_controller.editInputA(id_auesserung, concept_id, location_id, concept, false);




			}
		} else {
			jQuery('.message_modal_content').text(appManager.data_manager.getTranslation("user_input_not_full"));
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
				user_dialect: appManager.data_manager.selected_dialect
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
				if (!appManager.data_manager.getData("existingLocations").data_value) appManager.data_manager.addData("existingLocations", [])
				appManager.data_manager.getData("existingLocations").data_value.push(JSON.parse(response).location_id);
				appManager.map_controller.addGeometry(JSON.parse(response).polygonCoordinates, JSON.parse(response));


				if (zoom_active) {
					if (appManager.map_controller.map.getZoom() > 6) {
						appManager.map_controller.map.setZoom(6);
					}
				}


				var lat = appManager.map_controller.geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lat;
				var lng = appManager.map_controller.geo_manager.parseGeoDataFormated(JSON.parse(response).centerCoordinates).geoData.lng;

				appManager.map_controller.centerCoordinates_locations.push({
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
				if (appManager.ui_controller.stage == 5) {
					appManager.ui_controller.stage = 6;

					setTimeout(function() {
						jQuery('#word_span').popover('show');
						appManager.ui_controller.displayTooltips(true);
					}, 2000);
				}

			}
		}); //ajax end

	}


	create_cookie(lang) {
		appManager.data_loader.createCookie("language_crowder", lang);
	}


	/**
	 * Creates a cookie with name, value and exp. date
	 * @param  {String} name  [description]
	 * @param  {String} value [description]
	 * @param  {Int} days  [description]
	 *
	 */
	createCookie(name, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		} else var expires = "";
		document.cookie = name + "=" + value + expires + "; path=/";
	}

	/**
 * Delete cookie.
 * @param  {String} name [description]
 *
 */
 eraseCookie(name) {
  createCookie(name, "", -1);
}


	add_submited_answers_to_index_submitedAnswers_array(arrayA, can_edit) {
		var result = {};
		var is_admin = can_edit;


		for (var i = 0; i < arrayA.length; i++) {
			var obj = arrayA[i];

			var concept_id = obj.id_concept;
			var concept = obj.konzept;
			var word_inputed = obj.word;
			var location_name = obj.ortsname;
			var id_auesserung = obj.id_aeusserung;
			var author = obj.author;

			if ((author.localeCompare(appManager.data_manager.user_data.current_user) == 0 && author.localeCompare("anonymousCrowder_90322") != 0) || is_admin) {


				var concept_idx = appManager.data_loader.get_table_index_by_va_phase(parseInt(concept_id));


				var answer = { concept: concept, user_input: word_inputed, location: location_name, id_auesserung: id_auesserung, concept_id: concept_id, concept_index: concept_idx };
				appManager.data_manager.submitedAnswers_indexed[parseInt(id_auesserung)] = answer;
			}

		}


	}

	get_table_index_by_va_phase(_concept_id) {

		var index;

		if (appManager.data_manager.getData("concepts_index_by_id").data_value[parseInt(_concept_id)]) {
			index = appManager.data_manager.getData("concepts_index_by_id").data_value[parseInt(_concept_id)].index;
		}

		return index;
	}


	get_location_and_display(lat, lng) {
		/*concept selected when in url:*/


		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'searchLocation',
				lat: lat,
				lng: lng,
			},
			success: function(response) {

				var data = JSON.parse(response);
				//console.log(data);
				var loc_name = data.name;
				var loc_id = data.id;
				//console.log(loc_name, loc_id);

				if (loc_name != null) {
					jQuery('#location_span').text(loc_name);
					jQuery('#location_span').attr("data-id_location", loc_id);
					//jQuery('#submitanswer').popover('hide');
					//stage = 5;
					appManager.ui_controller.location_selected = true;
					if (appManager.ui_controller.concept_selected !== true) {
						if (appManager.data_manager.url_concept_id) {
							appManager.ui_controller.concept_selected = true;
						} else {
							appManager.ui_controller.concept_selected = false;
						}
					}
					appManager.ui_controller.word_entered = false;
					appManager.ui_controller.tutorial_running = true;

					appManager.ui_controller.setDynamicContent('list');
					appManager.ui_controller.displayTooltips(true);
					appManager.ui_controller.showPopUp();


					appManager.map_controller.showPolygon(loc_name, loc_id, false);
					// jQuery('#custom_backdrop').hide().css('background','');
				} else {
					jQuery('#custom_backdrop').hide().css('background', '');
					console.log("Nothing found");
					jQuery('.message_modal_content').text(appManager.data_manager.getTranslation("nothing_found"));
					jQuery('#message_modal').modal({
						backdrop: 'static',
						keyboard: false
					});
				}

			}
		});


	}

	/**
	 * Used in saveWord(), checks if an location object allready exists in the locations array
	 * @param  {Array} arr Array of Objects
	 * @param  {Object} obj Single Object
	 * @return {Boolean}     True if object is in the array
	 */
	include(arr, obj) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id == obj.id) return true;
		}
	}



	sendSuggestEmail(entry, callback) {

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'sendSuggestEmail',
				entry: entry,
				user: current_user,
				email: user_email,
			},
			success: function(response) {

				callback();
			}

		});

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