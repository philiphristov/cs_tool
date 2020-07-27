/**
 * DataManager
 */
class DataManager {
	constructor() {
		this.data_list = new Object()
		this.datatable_list = new Object()
		this.modal_list = new Object()
		this.translations = new Object()
		this.user_data = new Object()
		this.dialect_modal_initialized = false
	}

	test() {
		console.log("working")
	}

	addData(key_data, new_data) {
		this.data_list[key_data] = new DataList(key_data, new_data)
	}

	getData(key_data) {
		return this.data_list[key_data]
	}

	addDataTable(key_data, new_data) {
		this.datatable_list[key_data] = new_data
	}

	getDataTable(key_data) {
		return this.datatable_list[key_data]
	}

	addModal(key_data, new_data) {
		this.modal_list[key_data] = new_data
	}

	getModal(key_data) {
		return this.modal_list[key_data]
	}

	addTranslation(key, value) {
		this.translations[key] = value
	}

	getTranslation(key, single_element = true, array_elements = false) {
		try {
			// if (arguments.length == 1) {
			// 			return this.translations[key][current_language]
			// 		} else if (arguments.length > 1) {
			// 			if (arguments[2]) {
			// 				return this.translations[key]
			// 			}else if (arguments[1]) {
			// 				return this.translations[key][arguments[1]]
			// 			}
			// 		}
			if (single_element) {
				return this.translations[key][current_language]
			} else if (array_elements) {
				return this.translations[key]
			} else {
				return this.translations[key][0]
			}

		} catch (e) {
			console.log(e)
		}

	}

	/**
	 * Saves user data in global variables.
	 * @param  {Object} obj [description]
	 *
	 */
	declare_user_data(obj) {
		userLoggedIn = obj.userLoggedIn;
		if (userLoggedIn) {
			language_is_set = obj.language_is_set;
			anonymousCrowder = false;
			current_user = obj.current_user;
			crowder_lang = obj.crowder_lang;
			user_email = obj.user_email;
			selected_dialect = obj.crowder_dialect;
			current_user_age = obj.crowder_age;
		} else {
			language_is_set = obj.language_is_set;
			anonymousCrowder = true;
			current_user = obj.current_user;
			crowder_lang = obj.crowder_lang; //null;
			selected_dialect = obj.crowder_dialect;
		}
		//console.log(obj);
		this.user_data = obj
	}



	/**
	 * Builds Arrays containg the data for each row that will be displayed in the data tables.
	 * @param  {Array} in_data Can be Concepts or Locations Arrays.
	 * @param  {String} origin  concept or location
	 * @return {Array}         Contains the html elements with the data for the data tables.
	 */
	getTableData(in_data, origin) {
		var data = [];

		var wikidata_img_url = url.plugins_Url + '/assets/images/wikidata.png';

		var wikidata_img = "<img class='wikidata_image' src='" + wikidata_img_url + "'/>"


		for (var i = 0; i < in_data.length; i++) {

			if (origin == 'dialect') {
				var res = { name: in_data[i].name, id: in_data[i].id_dialect, column1: {} };
			} else if (origin == 'concept') {
				var res = { va_phase: in_data[i].va_phase, column1: {}, concept_id: in_data[i].id, concept_name: in_data[i].name, qid: in_data[i].qid };
				if (in_data[i].qid != 0 && in_data[i].qid != null) {
					var wikidata_url = "https://www.wikidata.org/wiki/Q" + in_data[i].qid;

					// var wiki_el = '<div class="wiki_info"><div class="wikidata_container"><i title="Wikidata" class="fa fa-wikipedia-w wikidata_icon" href=" ' + wikidata_url + ' " aria-hidden="true">' + wikidata_img + '</i></div></div>';
					var wiki_el = '<div class="wiki_info"><div class="wikidata_container"><i class="wikidata_icon"  title="Wikidata" href=" ' + wikidata_url + ' " aria-hidden="true">' + wikidata_img + '</i></div></div>';

				} else {
					var wiki_el = "";
				}

			} else {
				var res = { column1: {} };
			}

			var name = in_data[i].name;
			var filtered_name = replaceSpecialChars(name);

			if (filtered_name != name) {
				filtered_name += " " + name;
			} else {
				filtered_name = name;
			}

			if (origin == 'concept' && i < important_concepts_count) {
				res.column1.html = '<div class="va_phase_hidden">' + filtered_name + ' va_phase=' + in_data[i].va_phase + ' </div><div  title="' + name + '" class="dataparent"><span class="dataspan"><i title="' + important_concepts_texts[current_language] + '" class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + in_data[i].name + '</span>' + wiki_el + '</div>';
			} else if (origin == 'concept') {
				res.column1.html = '<div class="va_phase_hidden"> ' + filtered_name + ' va_phase=' + in_data[i].va_phase + ' </div><div title="' + name + '" class="dataparent"><span class="dataspan">' + name + '</span>' + wiki_el + '</div>';
			} else if (origin == 'dialect') {
				res.column1.html = '<div title="' + name + '" class="dataparent"><span class="dataspan">' + name + '</span></div>';
			} else {
				res.column1.html = '<div class="dataparent"><span title="' + name + '" class="dataspan">' + name + '</span></div>';
			}

			res.column1.filtered_name = filtered_name;
			data.push(res);
		}



		return data;

	}

	/*begin: for dialect list modal*/
	create_dialect_list_modal(modal, data) {

		let dataManager = this

		jQuery('body').addClass('modal_init');

		jQuery('#dialect_modal').removeClass('fade');

		var bavaria_version = false;
		if (jQuery('body').hasClass('bavaria_version')) bavaria_version = true;

		var id;
		var scrollY;
		var emptyTable;


		id = "#dialect_modal_table";
		scrollY = "76vh";
		emptyTable = this.getTranslation("no_results_data_table");


		var table = modal.find(id).DataTable({

			data: data,
			columns: [{
				data: {
					_: "column1.html",
					filter: "column1.filtered_name"
				}
			}, ],

			deferRender: false, //otherwise .node() won't always work
			scrollY: scrollY,
			scrollX: false,
			scrollCollapse: true,
			info: false,
			ordering: false,
			paging: false,
			searching: !bavaria_version,
			language: {
				zeroRecords: emptyTable
			},
			retrieve: true,



			fnInitComplete: function(settings) {


				if (!bavaria_version) {

					var input = modal.find('input');

					input.attr('autocomplete', "off");

					buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
					jQuery('#dialect_modal_table_filter').after(buttonparent);

					var buttonparent;


					var suggest_button = jQuery('<div class="list_modal_button_in_search suggest_dialect"><i class="fa fa-plus" aria-hidden="true"></i> <span id="suggest_dialect_span">' + dataManager.getTranslation("suggest_dialect_texts") + '</span></div>');
					buttonparent.append(suggest_button);


					suggest_button.on('click', function() {

						jQuery('.input_modal_content').empty();
						var suggest_headline = jQuery('<div class="suggest_headline">' + dataManager.getTranslation("suggest_dialect_texts") + ':</div>');
						var suggest_field = jQuery('<input class="suggest_field"></input>');
						var suggest_button_submit = jQuery('<div id="suggest_dialect" class="suggest_button_submit suggest_btn">' + dataManager.getTranslation("submit_texts") + '</div>');
						var feedback_div = jQuery('<div class="feedback_suggest">' + dataManager.getTranslation("feedback_texts") + '</div>');
						jQuery('.input_modal_content').append(suggest_headline).append(suggest_field).append(suggest_button_submit);

						jQuery('#input_modal').modal();

						suggest_button_submit.on('click', function() {
							var choosen_dialect = suggest_field.val();

							if (choosen_dialect == "") {
								markInputRed(suggest_field);
							} else {

								/*are you sure???*/
								jQuery('#input_modal').modal('hide');
								jQuery('.input_modal_content').empty();



								setTimeout(function() {
									var suggest_headline = jQuery('<div class="suggest_headline dont-break-out">' + dataManager.getTranslation("selected_dialect_texts") + ": <em>" + choosen_dialect + '</em></div>');
									var suggest_button_submit = jQuery('<div id="choose_dialect" class="suggest_button_submit suggest_btn green_button"><i class="fa fa-check" aria-hidden="true"></i> ' + dataManager.getTranslation("submit_dialect_texts") + '</div><div id= "regect_btn" class="suggest_button_submit suggest_btn red_button"><i class="fa fa-times" aria-hidden="true"></i> ' + dataManager.getTranslation("abort_dialect_texts") + '</div>');
									var feedback_div = jQuery('<div class="feedback_suggest">' + dataManager.getTranslation("feedback_texts") + '</div>');
									jQuery('.input_modal_content').append(suggest_headline).append(suggest_button_submit);

									/*not sure*/
									jQuery("#regect_btn").on('click', function() {
										jQuery('.input_modal_content').empty();
										jQuery('#input_modal').modal('hide');
									})
									jQuery('#input_modal').modal();

									/*yes, sure*/
									jQuery("#choose_dialect").one('click', function() {

										/*handle suggest dialect ajax call*/
										jQuery.ajax({
											url: ajax_object.ajax_url,
											type: 'POST',
											data: {
												action: 'suggest_dialect',
												dialect: choosen_dialect
											},
											success: function(response) {
												var new_dialect = JSON.parse(response);
												var new_dialect_name = new_dialect.dialect;
												var new_dialect_id = new_dialect.id;

												setTimeout(function() {



													/*remove choosen marker for previous selected dialect */
													if (current_dialect_index != -1) {
														var row = table.row(current_dialect_index).node();
														jQuery(row).removeClass('green_row');
														jQuery(row).find('.fa-check').remove();
													}


													var selected_dialect = choosen_dialect;
													appManager.data_manager.user_data.selected_dialect = selected_dialect

													jQuery("#user_dialect").text(selected_dialect);
													jQuery('#input_modal').modal('hide');
													jQuery('.input_modal_content').empty();

													var data_to_add = '<div title="' + selected_dialect + '" class="dataparent"><span title="' + selected_dialect + '" class="dataspan">' + selected_dialect + '</span></div>';
													table.row.add({ name: selected_dialect, id: new_dialect_id, column1: { filtered_name: selected_dialect, html: data_to_add } }).draw();
													dialect_array.push({ id_dialect: new_dialect_id, name: new_dialect_name });


													if (info_window_dialect_change) {

														jQuery("#dialect_infowindow").text(selected_dialect);
														var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


														/*TODO ajax call here for dialect changing of an answer*/
														jQuery.ajax({
															url: ajax_object.ajax_url,
															type: 'POST',
															data: {
																action: 'update_dialect_for_submited_answer',
																id_aeusserung: id_submited_answer,
																dialect: selected_dialect,
																id_dialect: new_dialect_id
															},
															success: function(response) {

															}

														});

														info_window_dialect_change = false;



														setTimeout(function() {
															modal.modal('hide');
															jQuery("custom_modal_backdrop").hide();
														}, 220);

													} else {

														selected_dialect = choosen_dialect;

														jQuery("#dialekt_span").text(lang_dialect_abbreviation[current_language] + " : " + selected_dialect);
														jQuery('#input_modal').modal('hide');
														jQuery('.input_modal_content').empty();

														setTimeout(function() { modal.modal('hide'); }, 220);


													}
													/*mark new dialect as selected*/
													current_dialect_index = appManager.data_manager.get_dialect_index(selected_dialect, table); //datatable_dialects.rows().data().length - 1;
													var row = table.row(current_dialect_index).node();
													jQuery(row).addClass('green_row');
													var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
													jQuery(row).find('.dataspan').prepend(icon);


												}, 500);
											}
										});
									});

								}, 500)




							}
						})
					})

					/*end handle suggest button click*/

				} //end if not bavaria version
				else {
					jQuery('#dialect_modal .modal-body').css('padding-top', '38px');
				}

				modal.find('tbody').on('click', 'tr', function() {
					/*prevents error if user clicks on an empty data table*/
					if (table.page.info().recordsDisplay !== 0) {


						var index = table.row(this).index();
						var name = table.row(this).data().name;


						/*mark selected dialect green*/
						if (current_dialect_index != index) {

							var row = table.row(index).node();
							jQuery(row).addClass('green_row');
							var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
							jQuery(row).find('.dataspan').prepend(icon);

						}

						//for unsetting green on pervious selection

						if (current_dialect_index != -1 && current_dialect_index != index) {

							var row = table.row(current_dialect_index).node();
							jQuery(row).removeClass('green_row');
							jQuery(row).find('.fa-check').remove();
						}

						current_dialect_index = index;

						jQuery("#dialekt_span").text(appManager.data_manager.getTranslation("lang_dialect_abbreviation") + " : " + name);
						var selected_dialect = name;
						appManager.data_manager.user_data.selected_dialect = selected_dialect

						//console.log(jQuery("#welcome_modal").data('bs.modal')._isShown);

						if (userLoggedIn) {
							appManager.data_loader.save_user_dialect(current_user);
						}

						if (info_window_dialect_change) {

							jQuery("#dialect_infowindow").text(selected_dialect);
							var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


							/*TODO ajax call here for dialect changing of an answer*/
							jQuery.ajax({
								url: ajax_object.ajax_url,
								type: 'POST',
								data: {
									action: 'upate_dialect_submited_answer',
									id_aeusserung: id_submited_answer,
									dialect: selected_dialect,
									id_dialect: table.row(this).data().id
								},
								success: function(response) {

								}

							});

							info_window_dialect_change = false;
						}

						jQuery("#user_dialect").text(selected_dialect);

						setTimeout(function() {
							modal.modal('hide');
							jQuery("custom_modal_backdrop").hide();
						}, 220); //delay to show select effect
					}

				});
				dialect_modal_initialized = true;

				jQuery('#dialect_modal').modal({});

				jQuery('#dialect_modal').modal('hide');
				jQuery('body').removeClass('modal_init');
				jQuery('#dialect_modal').addClass('fade');

			}
		});




		table.on('draw.dt', function() {

			// console.log("DRAW");

			if (jQuery('#dialect_modal .dataTables_empty').length > 0) {

				jQuery('#locations_modal .dataTables_empty').css('white-space', 'normal');
				jQuery('#locations_modal .dataTables_scrollBody').css('overflow', 'hidden');
				jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '88px');

			} else {
				jQuery('#locations_modal .dataTables_empty').css('white-space', '');
				jQuery('#locations_modal .dataTables_scrollBody').css('overflow', '');
				jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '');

			}

		});


		/*mark dialect as selected in the data table*/
		if (selected_dialect) {
			current_dialect_index = appManager.data_manager.get_dialect_index(selected_dialect, table);

			var row = table.row(current_dialect_index).node();
			jQuery(row).addClass('green_row');
			var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
			jQuery(row).find('.dataspan').prepend(icon);
		}



		return table;

	}

	createConceptsListModal(modal, data, origin) {
		var id;
		var scrollY;
		var emptyTable;

		if (origin == "concept") {
			id = "#concept_modal_table";
			scrollY = "76vh";
			emptyTable = appManager.data_manager.getTranslation("no_results_data_table");
		}

		var table = modal.find(id).DataTable({

			data: data,
			columns: [{
				data: {
					_: "column1.html",
					filter: "column1.html",

				}
			}],

			deferRender: false, //otherwise .node() won't always work
			scrollY: scrollY,
			scrollX: false,
			scrollCollapse: true,
			info: false,
			ordering: false,
			scroller: {
				displayBuffer: 16,
			},
			language: {
				zeroRecords: emptyTable
			},


			fnInitComplete: function(settings) {

				var input = modal.find('input');
				if (origin == 'location') {
					input.attr('autofocus', "");
					input.attr('id', 'focusinput');
				} //id for js call in bind show listeners
				input.attr('autocomplete', "off");

				var buttonparent;

				if (!modals_initialized && origin == "concept") {

					buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
					jQuery('#concept_modal_table_filter').after(buttonparent);

					var random_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-random" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("random_texts") + '</div>');
					buttonparent.append(random_button);

					/*button for choosing random concept*/
					random_button.on('click', function() {

						if (!prevent_randomclick) {
							do_image_modal = false;
							prevent_randomclick = true;
							if (jQuery('#concepts_modal').find('input').val() != "") datatable_concepts.search('').columns().search('').draw();
							var rnd_idx = getRandomUnAnsweredConceptIndex();

							if (rnd_idx > 0) {

								datatable_concepts.row(rnd_idx).scrollTo();
								// deSelectTableEntry(current_concept_index[va_phase]);
								deSelectTableEntry(current_concept_index);
								selectTableEntry(rnd_idx);
								// current_concept_index[va_phase] = rnd_idx;
								current_concept_index = rnd_idx;

								var name = concepts_cur_lang[rnd_idx].name;
								concept_selected = true;
								var id = concepts_cur_lang[rnd_idx].id;

								jQuery('#word_span').text(name);
								jQuery('#word_span').attr("data-id_concept", id);
								jQuery('#word_span').attr("data-id_concept_index", rnd_idx);
								setDynamicContent('list');
								if (!jQuery('#why_register_modal').hasClass('in')) checkImageModal(id, name);

								setTimeout(function() {
									prevent_randomclick = false
								}, 500);

							} else {

								setTimeout(function() {
									prevent_randomclick = false
								}, 500);
								alert("No unanswered concept found for active phases.");
							}

						}
					})

					/*button for suggesting new concepts*/
					var suggest_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-plus" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("suggest_texts") + '</div>');
					buttonparent.append(suggest_button);
					if (!userLoggedIn) suggest_button.addClass('disabled_feature');

					suggest_button.on('click', function() {
						if (!userLoggedIn) {
							prevent_backdrop = true;
							jQuery('#concepts_modal').modal('hide');
							openWhyRegisterModal();
						} else {
							jQuery('.input_modal_content').empty();
							var suggest_headline = jQuery('<div class="suggest_headline">' + appManager.data_manager.getTranslation("suggest_texts") + ':</div>');
							var suggest_field = jQuery('<input class="suggest_field"></input>');
							var suggest_button_submit = jQuery('<div class="suggest_button_submit suggest_btn">' + appManager.data_manager.getTranslation("submit_texts") + '</div>');
							var feedback_div = jQuery('<div class="feedback_suggest">' + appManager.data_manager.getTranslation("feedback_texts") + '</div>');
							jQuery('.input_modal_content').append(suggest_headline).append(suggest_field).append(suggest_button_submit);

							jQuery('#input_modal').modal();

							suggest_button_submit.off().on('click', function() {
								if (suggest_field.val() == "") {
									markInputRed(suggest_field);
								} else {
									sendSuggestEmail(suggest_field.val(), function() {
										suggest_button_submit.fadeOut('fast', function() {
											jQuery('.input_modal_content').append(feedback_div);
											feedback_div.fadeIn('fast');

											setTimeout(function() {
												jQuery('#input_modal').modal('hide');
												jQuery('.input_modal_content').empty();
											}, 1500);

										})
									})
								}
							})
						}
					})

					/*change va_phase concepte*/
					var alm = jQuery('<div class="list_modal_button_va_phase va_phase_1 active noselect" data-va_phase = "1"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_agriculture") + '</div>'); // 'Almwirtschaft'
					var natur = jQuery('<div class="list_modal_button_va_phase va_phase_2 active noselect" data-va_phase = "2"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_nature") + '</div>'); // 'Natur'
					var modern = jQuery('<div class="list_modal_button_va_phase va_phase_3 active noselect" data-va_phase = "3"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_modern") + '</div>'); // 'Modern'

					jQuery("#va_phase_wrapper_concept_list").remove();
					var va_phase_wrapper = jQuery('<div id="va_phase_wrapper_concept_list" class="va_phase_wrapper"></div>');

					va_phase_wrapper.append(alm);
					va_phase_wrapper.append(natur);
					va_phase_wrapper.append(modern);
					//jQuery('#concepts_modal').children().prepend(va_phase_wrapper);

					jQuery('#concepts_modal').children().find('.modal-content').append(va_phase_wrapper);

					jQuery("#va_phase_wrapper_concept_list").find('.list_modal_button_va_phase').on('click', function() {
						var selected_va_phase = jQuery(this).data('va_phase');



						//ALTERNATIVE VA PHASE SWITCH (CHECKBOX STYLE)
						switch (selected_va_phase) {
							case 1:
								current_concept_index = -1;
								if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').hasClass('active')) {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').removeClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-check-square').addClass('fa-square');
								} else {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').addClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-square').addClass('fa-check-square');
									va_phase = 1;
								}
								break;
							case 2:
								current_concept_index = -1;
								if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').hasClass('active')) {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').removeClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-check-square').addClass('fa-square');
								} else {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').addClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-square').addClass('fa-check-square');
									va_phase = 2;
								}
								break;
							case 3:
								current_concept_index = -1;
								if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').hasClass('active')) {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').removeClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-check-square').addClass('fa-square');
								} else {
									jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').addClass('active');
									jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-square').addClass('fa-check-square');
									va_phase = 3;
								}
								break;
						}



						active_va_phases = check_active_concepts(jQuery('#va_phase_wrapper_concept_list').find('.active'));

						/**
						 * filter displayed concepts using hiddenhtml elment in the rows for the va_phase
						 */
						if (active_va_phases.length > 0) {
							var regexFromMyArray = '.*va_phase=(' + active_va_phases.join("|") + ').*'

						} else {
							var regexFromMyArray = '.*va_phase=(0).*'

						}

						table.columns().search(regexFromMyArray, true).draw();


						if (current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
							datatable_concepts.row(current_concept_index).scrollTo();
							selectTableEntry(current_concept_index);
						}

						jQuery(".wikidata_icon").off("click");
						jQuery(".wikidata_icon").on('click', function(e) {
							e.stopPropagation();
							window.open(jQuery(this).attr('href'), '_blank');
						});


					}) //click

				}

				jQuery(".wikidata_icon").off("click");
				jQuery(".wikidata_icon").on('click', function(e) {
					e.stopPropagation();
					window.open(jQuery(this).attr('href'), '_blank');
				});

				modal.find('tbody').on('click', 'tr', function() {

					/*prevents error if user clicks on an empty data table*/
					if (table.page.info().recordsDisplay !== 0) {

						var index = table.row(this).index();


						var row_data = table.row(this).data();
						if (origin == "concept") {


							var name = row_data.concept_name; //concepts_cur_lang[index].name;

							concept_selected = true;
							var id = row_data.concept_id; //concepts_cur_lang[index].id;

							// if (current_concept_index[va_phase] != -1) deSelectTableEntry(current_concept_index[va_phase]);
							if (current_concept_index != -1) deSelectTableEntry(current_concept_index);

							selectTableEntry(index);


							// current_concept_index[va_phase] = index;
							current_concept_index = index;


							jQuery('#image_modal').modal('hide');

							jQuery('#word_span').text(name);
							jQuery('#word_span').attr("data-id_concept", id);
							jQuery('#word_span').attr("data-id_concept_index", index);
							appManager.ui_controller.setDynamicContent('list'); // for offset since hight of left menu could change

							appManager.ui_controller.checkImageModal(id, name);
							jQuery('#custom_modal_backdrop').fadeOut(function() {
								jQuery(this).remove()
							});

							/*END*/
							appManager.map_controller.remove_location_search_listener();
						}


						setTimeout(function() {
							modal.modal('hide');
						}, 220); //delay to show select effect
					}
				});




				if (!modals_initialized) {

					setTimeout(function() {
						modal.modal('hide');
					}, 1); //for closing modal on init

					concepts_modal_initialized = true;

					if (locations_modal_modals_initialized && concepts_modal_initialized) {
						modals_initialized = true;

						if (language_is_set) jQuery('#welcomeback_modal').modal('hide');
					}

				}

			}
		});



		return table;

	}


	/**
	 * [createLocationListModal description]
	 * @param  {HTML} modal  [description]
	 * @param  {Array} data   [description]
	 * @param  {String} origin [description]
	 *
	 */
	createLocationListModal(modal, data, origin) {
		// used only for locations modal list


		var id;
		var scrollY;
		var emptyTable;


		id = "#location_modal_table";
		scrollY = "76vh";
		emptyTable = appManager.data_manager.getTranslation("search_for_location");



		var table = modal.find(id).DataTable({

			data: data,
			columns: [{
				data: {
					_: "column1.html",
					filter: "column1.filtered_name"
				}
			}, ],

			deferRender: false, //otherwise .node() won't always work
			scrollY: scrollY,
			scrollX: false,
			scrollCollapse: true,
			info: false,
			ordering: false,

			scroller: {
				displayBuffer: 2,
			},
			language: {
				zeroRecords: emptyTable
			},
			retrieve: true,
			destroy: true,


			fnInitComplete: function(settings) {





				var input = modal.find('input');
				if (origin == 'location') {
					input.attr('autofocus', "");
					input.attr('id', 'focusinput');
				} //id for js call in bind show listeners
				input.attr('autocomplete', "off");

				var buttonparent;

				if (!modals_initialized && origin == "location") {

					buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
					jQuery('#location_modal_table_filter').after(buttonparent);

					var search_location_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("search_map_location") + '</div>');
					buttonparent.append(search_location_button);


					search_location_button.on('click', function() {
						init_location_search_mode(modal);
					});

				}



				modal.find('tbody').on('click', 'tr', function() {
					/*prevents error if user clicks on an empty data table*/
					if (table.page.info().recordsDisplay !== 0) {

						var index = table.row(this).index()



						if (origin == "concept") {

						} else {
							location_selected = true;
							if (url_concept_id) {
								concept_selected = true;
							}

							var name = locations[index].name;
							var id = locations[index].id;

							if (saved_location_index != index) {

								var row = table.row(index).node();
								jQuery(row).addClass('green_row');
								var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
								jQuery(row).find('.dataspan').prepend(icon);

							}

							//for unsetting green on pervious selection

							if (saved_location_index != -1 && saved_location_index != index) {

								var row = table.row(saved_location_index).node();
								jQuery(row).removeClass('green_row');
								jQuery(row).find('.fa-check').remove();
							}

							saved_location_index = index;
							saved_location_name = name;


							jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });
							jQuery('#location_span').text(name);
							jQuery('#location_span').attr("data-id_location", id);
							appManager.ui_controller.setDynamicContent('list'); // for offset since hight of left menu could change

							/*Show Gemeinde Grenzen*/

							jQuery('#image_modal').modal('hide');
							var g_location = name;
							var g_location_id = id;

							var index = contains.call(existingLocations, g_location_id);

							appManager.data_loader.get_display_polygon(g_location, g_location_id, true);
							appManager.map_controller.remove_location_search_listener();
							/*END*/
						}

						setTimeout(function() { modal.modal('hide'); }, 220); //delay to show select effect
					} else if (origin == "location" /*&& !choosing_location_mode*/ ) { /*when the location dataTable is empty - let user choose a Gemeinde*/
						appManager.data_manager.init_location_search_mode(modal);

					}

				});
				if (!modals_initialized) {



					setTimeout(function() { modal.modal('hide'); }, 1); //for closing modal on init

					locations_modal_modals_initialized = true;


					if (locations_modal_modals_initialized && concepts_modal_initialized) {
						modals_initialized = true;

						if (language_is_set) jQuery('#welcomeback_modal').modal('hide');
					}

				}

			}
		});


		if (origin != "concept") {

			table.on('draw.dt', function() {


				if (jQuery('#locations_modal .dataTables_empty').length > 0) {

					jQuery('#locations_modal .dataTables_empty').css('white-space', 'normal');
					jQuery('#locations_modal .dataTables_scrollBody').css('overflow', 'hidden');
					jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '88px');

				} else {
					jQuery('#locations_modal .dataTables_empty').css('white-space', '');
					jQuery('#locations_modal .dataTables_scrollBody').css('overflow', '');
					jQuery('#locations_modal .dataTables_scrollBody').css('min-height', '');

				}

			});

		}

		return table;

	}


	/**
	 * [initConceptModal description]
	 */
	initConceptModal() {

		jQuery('body').addClass('modal_init');

		jQuery('#concepts_modal').removeClass('fade');
		jQuery('#concepts_modal').modal({});

		va_phase = 1;
		//datatable_concepts = createListModal(jQuery('#concepts_modal'),filtered_data_phase1,"concept"); //  concept_data
		datatable_concepts = appManager.data_manager.createConceptsListModal(jQuery('#concepts_modal'), appManager.data_manager.getData("concept_data").data_value, "concept");
		//bugfix for scrollerplugin (resize not working properly)
		var modal = jQuery(this);
		var oldheight = modal.find('.dataTables_scroll').height();

		modal.find('input').on('input', function() {
			var height = modal.find('.dataTables_scroll').height()
			if (oldheight != height) {
				datatable_concepts.scroller.measure();
				oldheight = height;
			}
		})

		jQuery('#concepts_modal').modal('hide');
		jQuery('body').removeClass('modal_init');
		jQuery('#concepts_modal').addClass('fade');
	}

	/**
	 * [initLocationsModal description]
	 */
	initLocationsModal() {

		jQuery('body').addClass('modal_init');

		jQuery('#locations_modal').removeClass('fade');
		jQuery('#locations_modal').modal({});

		datatable_locations = appManager.data_manager.createLocationListModal(jQuery('#locations_modal'), location_data, "location");

		jQuery('[data-toggle="tooltip"]').tooltip();
		//bugfix for scrollerplugin (resize not working properly)

		var modal = jQuery(this);
		var oldheight = modal.find('.dataTables_scroll').height();
		modal.find('input').on('input', function() {
			var height = modal.find('.dataTables_scroll').height()
			if (oldheight != height) {
				datatable_locations.scroller.measure();
				oldheight = height;
			}
		})

		jQuery('#locations_modal').modal('hide');
		jQuery('body').removeClass('modal_init');
		jQuery('#locations_modal').addClass('fade');

	}


	/**
	 * Creates and returns a indexed array of all concepts in the user's language.
	 * @param  {Array} concepts_cur_lang Array with all concepts in the language of the user.
	 * @return {Object}                   Indexed Array containing concept id and the concept in the current language.
	 */
	createConceptIndexList(concepts_cur_lang, concept_va_phase) {
		var result = {};

		// for (var y = 0; y < concepts_cur_lang.length; y++) {
		//   result[parseInt(concepts_cur_lang[y].id)] = { index: y, name: concepts_cur_lang[y].name, va_phase: concept_va_phase };
		// }

		for (var y = 0; y < concepts_cur_lang.length; y++) {
			result[parseInt(concepts_cur_lang[y].id)] = { index: y, name: concepts_cur_lang[y].name, va_phase: concepts_cur_lang[y].va_phase };
		}

		return result;
	}

	/**
	 * Builds an indexed array containing the number of entries for concepts that the user has entered and the concept's id.
	 * @param  {Object} submitedAnswersIndexed indexed array containing all submited entries by the current user.
	 * @return {Object}                        contains concept id and number of entries for the associated concept.
	 */
	createAnswersToEntryNumbers(submitedAnswersIndexed) {
		var result = {};


		for (var key in submitedAnswersIndexed) {

			var entry = result[parseInt(submitedAnswersIndexed[key].concept_id)];
			if (entry == null) result[parseInt(submitedAnswersIndexed[key].concept_id)] = 1;
			else result[parseInt(submitedAnswersIndexed[key].concept_id)] += 1;

		}

		// for(var i=0;i<submitedAnswers.length;i++){

		//   var entry = result[parseInt(submitedAnswers[i].concept_id)];

		//   if(entry==null) result[parseInt(submitedAnswers[i].concept_id)] = 1;
		//   else result[parseInt(submitedAnswers[i].concept_id)] +=1;

		// }

		return result;

	}

	get_dialect_index(dialect, datatable) {
		var index_dalect;
		var arr = Array.from(datatable.rows().data());
		var index = arr.findIndex(function(element) {
			var dialect_name = element.name;
			if (dialect_name.localeCompare(dialect) == 0) return index_dalect = arr.indexOf(element);
		});
		return index_dalect;
	}

	populate_concept_span() {
		var url = new URL(window.location.href);
		url_concept_id = url.searchParams.get("concept");
		if (url_concept_id) {
			var already_submited = false;
			//console.log(submitedAnswers_indexed);
			for (var key in submitedAnswers_indexed) {
				var obj = submitedAnswers_indexed[key];

				//console.log(obj['concept_id']);
				//console.log(url_concept_id);

				if (obj['concept_id'] == url_concept_id) {
					already_submited = true;
					concept_selected = false;
					url_concept_id = null;
					break;
				}
			}

			if (!already_submited) {
				//console.log("populate span");
				url_choosen_concept = concepts_index_by_id[va_phase][url_concept_id];
				jQuery('#word_span').text(url_choosen_concept.name);
				jQuery('#word_span').attr("data-id_concept", url_concept_id);
				jQuery('#word_span').attr("data-id_concept_index", url_choosen_concept.index);
				setDynamicContent('list');
			} else {
				//console.log("don't populate span");
			}

		}

	}

	createUnansweredIndex() {


		var c_phase1_idx = [];
		var c_phase2_idx = [];
		var c_phase3_idx = [];

		var answers_by_concept_index = {};

		for (var key in submitedAnswers_indexed) {
			var sub = submitedAnswers_indexed[key];
			answers_by_concept_index[sub.concept_id] = sub;
		};


		for (var key in concepts_cur_lang) {
			var concept = concepts_cur_lang[key];
			if (concept.va_phase == 1 && answers_by_concept_index[concept['id']] == null) c_phase1_idx.push(concepts_index_by_id[concept['id']]);
			else if (concept.va_phase == 2 && answers_by_concept_index[concept['id']] == null) c_phase2_idx.push(concepts_index_by_id[concept['id']]);
			else if (concept.va_phase == 3 && answers_by_concept_index[concept['id']] == null) c_phase3_idx.push(concepts_index_by_id[concept['id']]);
		}

		return [c_phase1_idx, c_phase2_idx, c_phase3_idx];

	}


	getRandomUnAnsweredConceptIndex() {


		var active_concepts = [];

		for (var i = 0; i < active_va_phases.length; i++) {
			var active_phase = active_va_phases[i];
			active_concepts = active_concepts.concat(unanswered_concepts[active_phase - 1]);
		}

		var length = active_concepts.length;
		var result;

		if (length > 0) {

			var idx = Math.floor((Math.random() * length));

			var random_concept = active_concepts[idx];
			var result = random_concept['index'];


		} else result = -1;
		return result;

	}

	checkDataBeforeListModal(marker) {
		//console.log(marker);
		if (aeusserungen_by_locationindex[marker.location_id] != null && !check_user_aesserungen_in_location(marker.location_name)) {
			appManager.data_manager.openLocationListModal(marker);

		} else {
			// jQuery('#custom_backdrop i').css('top','-150px');
			jQuery('#custom_backdrop').show().css('background', 'rgba(0, 0, 0, 0.8)');


			appManager.data_loader.get_submited_answers_current_location(marker.location_id, marker);
		}
	}



	/**
	 * Build locations data for the data table.
	 * @param  {Array} in_data [description]
	 * @return {Array}         [description]
	 */
	getLocationListTableData(in_data) {

		var data = [];
		var i = 0;

		for (var key in in_data) {

			var cur_data = in_data[key];
			var user_data = false;
			var aeusserung_id = cur_data.id_aeusserung;

			if (submitedAnswers_indexed[aeusserung_id] != null) {
				user_data = true;
			}

			var concept_name = cur_data.konzept;
			var author = cur_data.author;
			var word = cur_data.word;
			var concept_idx = get_table_index_by_va_phase(cur_data.id_concept);
			var token = cur_data.tokenisiert;

			if (author.indexOf("anonymous") != -1) {
				author = anonymous_texts[current_language];
			}

			data[i] = [];

			if (concept_idx < important_concepts_count) {
				data[i].push('<div ae_id="' + aeusserung_id + '" con_id="' + cur_data.id_concept + '" user_data="' + user_data +
					'" class="dataparent" title="' + concept_name +
					'" token="' + token + '"><span class="dataspan"><i title="' + important_concepts_texts[current_language] +
					'" class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + concept_name + '</span></div>');
			} else {
				data[i].push('<div ae_id="' + aeusserung_id + '" con_id="' + cur_data.id_concept + '" user_data="' + user_data +
					'" class="dataparent" title="' + concept_name + '" token="' + token +
					'"><span class="dataspan">' + concept_name + '</span></div>');
			}

			data[i].push('<span class="c_answer_span dataspan"  title="' + word + '">\"' + word + '\"</span>');
			data[i].push('<span class="authorspan dataspan"  title="' + author + '">(' + author + ')</span>');

			i++;
		}

		return data;
	}


	/**
	 * Open location's data table.
	 * @param  {Object} marker Location's marker.
	 */
	openLocationListModal(marker) {

		if (jQuery('#custom_modal_backdrop').length < 1) {
			showCustomModalBackdrop();
		}

		current_location_list_object = aeusserungen_by_locationindex[marker.location_id];

		// find the right object from the array
		function rightOne(obj) {
			return obj.id == marker.location_id;
		}

		//the correct translation of the location
		var c_location_name = locations[locations.findIndex(rightOne)].name;
		current_location_list_object[Object.keys(current_location_list_object)[0]].ortsname = c_location_name;
		current_location_list_object[Object.keys(current_location_list_object)[0]].usergen = marker.user_marker;

		filtered_location_submited_data_phase1 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 1));
		filtered_location_submited_data_phase2 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 2));
		filtered_location_submited_data_phase3 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 3));


		// FUTURE CHECK BOX FUNCTIONALITY
		filtered_location_submited_data_phases = [];
		filtered_location_submited_data_phases.push(filtered_location_submited_data_phase1);
		filtered_location_submited_data_phases.push(filtered_location_submited_data_phase2);
		filtered_location_submited_data_phases.push(filtered_location_submited_data_phase3);

		current_location_list_table_data = [].concat.apply([], filtered_location_submited_data_phases);

		jQuery('#location_list_table').DataTable().destroy();
		jQuery('#location_list_modal').find('.location_header_parent').remove();
		jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').remove();
		jQuery('#location_list_modal').find('.few_elements').remove();
		jQuery('#location_list_modal').modal();
	}


	/**
	 * Initialize all translation strings as global variables to be easily accessed
	 * @param  {Array} translations Array Data fetched from server
	 */
	init_translations(translations) {
		this.translations["welcomeback_texts"] = translations['CS_WELCOME_BACK']

		this.translations["register_texts"] = translations['CS_REGISTER']

		this.translations["random_texts"] = translations['CS_RANDOM_CONCEPT']

		this.translations["suggest_texts"] = translations['CS_NEW_CONCEPT']

		this.translations["active_user_texts"] = translations['CS_BESTENLISTE_1']

		this.translations["active_location_texts"] = translations['CS_BESTENLISTE_2']

		this.translations["active_concept_texts"] = translations['CS_BESTENLISTE_3']

		this.translations["register_head_texts"] = translations['CS_WHY_REGISTER']

		this.translations["register_body_texts"] = translations['CS_TOOLTIP_REGISTRIERUNG_BODY']

		this.translations["register_yes_texts"] = translations['CS_REGISTER_NOW']

		this.translations["register_no_texts"] = translations['REGISTER_NO_THANKS']

		this.translations["feedback_texts"] = translations['CS_TOOLTIP_NEW_CONCEPT']

		this.translations["permanently_saved"] = translations['CS_PERMANENTLY_SAVED'];

		this.translations["click_on_location"] = translations['CS_CLICK_ON_LOCATION'];

		this.translations["no_results_data_table"] = translations['CS_NO_RECORDS_FOUND'];

		this.translations["search_for_location"] = translations['CS_LOCATION_PER_CLICK'];

		this.translations["search_map_location"] = translations['CS_LOCATION_SEARCH'];

		this.translations["nothing_found"] = translations['CS_no_location_found'];

		this.translations["suggest_dialect_texts"] = translations['suggest_dialect_texts'];

		this.translations["selected_dialect_texts"] = translations['selected_dialect_texts'];

		this.translations["submit_dialect_texts"] = translations['submit_dialect_texts'];

		this.translations["abort_dialect_texts"] = translations['abort_dialect_texts'];

		this.translations["the_word_dialect"] = translations['the_word_dialect'];

		this.translations["dialect_not_selected_texts"] = translations['PLEASE_SELECT_DIALECT']

		this.translations["alpine_agriculture"] = translations['CS_Almwirtschaft'];

		this.translations["alpine_nature"] = translations['CS_Natur'];

		this.translations["alpine_modern"] = translations['CS_Modern'];

		this.translations["too_few_elements"] = translations['CS_HELP_FILL'];

		this.translations["user_input_not_full"] = translations['CS_EINGABEFELDER'];
		this.translations["field_not_full"] = translations['CS_field_not_full'];
		// change_question = ['Ändern in: ','Modifier: ','Modificare: ','Spremeni v: ']; //change_question[current_language]

		this.translations["change_question"] = translations['CS_DUPLIKAT'];

		this.translations["welcome_texts_all"] = [translations['CS_WELCOME'], translations['CS_WELCOME'], translations['CS_WELCOME'], translations['CS_WELCOME']];
		this.translations["welcome_texts"] = translations['CS_WELCOME'];

		this.translations["slogan_texts"] = translations['CS_SLOGAN'];

		this.translations["navigation_languages"] = translations['CS_NAVIGATION_LANGUAGE']

		this.translations["language_texts"] = translations['CS_LANGUAGE'];

		this.translations["languages"] = translations['CS_LANGUAGES_NAMES'];

		this.translations["instruction_texts"] = translations['CS_ANLEITUNG']

		this.translations["instruction_heads"] = translations['CS_INSTRUCTIONS']

		this.translations["go_texts"] = translations['CS_AUFFORDERUNG']

		this.translations["the_word_concept"] = translations['CS_WORD_CONCEPT']

		this.translations["the_word_location"] = translations['CS_LOCATION_TERM']

		this.translations["concept_select_texts"] = translations['CS_TUTORIAL_2']

		this.translations["data_remark"] = translations['CS_COPYWRITE']

		this.translations["remark_link"] = [
			"https://www.verba-alpina.gwi.uni-muenchen.de/?page_id=226&noredirect=de_DE",
			"https://www.verba-alpina.gwi.uni-muenchen.de/fr/?page_id=22&noredirect=fr_FR",
			"https://www.verba-alpina.gwi.uni-muenchen.de/it/?page_id=33&noredirect=it_IT",
			"https://www.verba-alpina.gwi.uni-muenchen.de/si/?page_id=4&noredirect=sl_SI"
		]

		this.translations["input_select_texts"] = translations['CS_TUTORIAL_3'];


		this.translations["location_select_texts"] = translations['CS_TUTORIAL_1'];

		this.translations["location_select_texts_with_br"] = translations['CS_TUTORIAL_5'];

		this.translations["submit_texts"] = translations['CS_TUTORIAL_4'];


		this.translations["anonymous_texts"] = translations['CS_ANONYMOUS']

		this.translations["important_concepts_texts"] = translations['CS_IMPORTANT_CONCEPT']

		this.translations["upload_image_text"] = translations["CS_upload_image"]

		this.translations["tooltips"] = [
			{ name: "#word_span", array: this.translations["concept_select_texts"] },
			{ name: "#location_span", array: this.translations["location_select_texts"] },
			{ name: "#user_input", array: this.translations["input_select_texts"] },
			{ name: "#submitanswer", array: this.translations["submit_texts"] },
			{ name: "#upload_image", array: this.translations["upload_image_text"] },

		];

		this.translations["lang_dialect_abbreviation"] = translations['CS_DIALECT_LANG']


		this.translations["user_name"] = translations['CS_user_name'];
		this.translations["birth_year"] = translations['CS_birth_year'];
		this.translations["register"] = translations['CS_register'];
		this.translations["send_anonymous_data_text"] = translations['CS_send_anonymous_data_text'];
		this.translations["send_anonymous_data_modal_text"] = translations['CS_send_anonymous_data_modal_text'];
		this.translations["details_why_register_send_anonymous_data"] = translations['CS_details_why_register_send_anonymous_data'];


		this.translations["forgot_password_text"] = translations['CS_forgot_password_text'];
		this.translations["enter_username_or_email"] = translations['CS_enter_username_or_email']
		this.translations["password_text"] = translations['CS_password_text']
		this.translations["new_acc_text"] = translations['CS_NEW_ACCOUNT']
		this.translations["new_acc_text_detail"] = translations['CS_CREATE_ACC']
		this.translations["get_new_password"] = translations['CS_get_new_password']
		this.translations["login_btn"] = translations['CS_login_btn'];
		this.translations["reset_btn_text"] = translations['CS_reset_btn_text'];

		this.translations["change_input"] = translations['CS_change_input'];
		this.translations["delete_input"] = translations['CS_delete_input'];

		this.translations["change_dialect"] = translations['CS_change_dialect'];

		this.translations["change_answer"] = translations['CS_change_answer'];

		this.translations["question_marker"] = translations['CS_question_marker'];
		this.translations["crowder"] = translations['CS_crowder'];

		this.translations["upload_own_image_button_text"] = translations["CS_upload_own_images"]

		this.translations["upload_task_text"] = translations["CS_upload_task_text"]

		this.translations["close_modal_text"] = translations["CS_close_modal"]

		this.translations["upload_terms_text"] = translations["CS_image_upload_terms"]

		this.translations["upload_text"] = translations["CS_click_or_drop_text"]

		this.translations["drop_file_text"] = translations["CS_drop_files_here"]

		this.translations["select_image_alert"] = translations["CS_select_image_alert"]
		this.translations["accept_upload_terms_alert"] = translations["CS_accept_upload_terms_alert"]

		this.translations["upload_complete"] = translations["CS_upload_complete"]
		this.translations["upload_failed"] = translations["CS_upload_failed"]
		this.translations["clear_images"] = translations["CS_clear_images"]
	}

	/**
	 * Check if user(only for not logged in users) has submited answers and delete crowder_id cookie if he has no answers.
	 *
	 */
	check_user_aeusserungen() {
		if (isEmpty(submitedAnswers_indexed) && !userLoggedIn) {
			eraseCookie("crowder_id");
			current_user = null;
		}
	}

	/**
	 * Checks if the user has any answers in the current location. This is used for changing the color of the location marker: blue - user has not entered a answer in the location, green - user has entered an answer in that location.
	 * @param  {String} location [description]
	 *
	 */
	check_user_aesserungen_in_location(location) {
		var has_aeusserungen = false;

		for (var key in submitedAnswers_indexed) {
			if (submitedAnswers_indexed.hasOwnProperty(key)) {
				if (location.localeCompare(submitedAnswers_indexed[key].location) == 0) {
					has_aeusserungen = true;
					break;
				}
			}
		}
		return has_aeusserungen;
	}

	check_for_entries(location_id) {
		var array_to_check = aeusserungen_by_locationindex[location_id];
		var entered_aeusserungen = 0;

		for (var key in array_to_check) {
			if (array_to_check.hasOwnProperty(key)) {
				entered_aeusserungen++;
			}
		}


		return entered_aeusserungen;
	}

	check_for_current_user_entries(location_id) {
		var array_to_check = aeusserungen_by_locationindex[location_id];
		var user_entered_aeusserungen = 0;

		for (var key in array_to_check) {
			if (array_to_check.hasOwnProperty(key)) {
				if (current_user.localeCompare(array_to_check[key].author) == 0) {
					user_entered_aeusserungen++;
				}
			}
		}

		return user_entered_aeusserungen;
	}


	filter_array(array_data, va_phase_cur) {

		var arr = [];
		for (var key in array_data) {
			if (array_data.hasOwnProperty(key)) {
				var answer_concept_id = array_data[key].id_concept;

				if (concepts_index_by_id[answer_concept_id].va_phase == va_phase_cur) {
					if (concepts_index_by_id.hasOwnProperty(answer_concept_id)) {
						arr[key] = array_data[key];
					}
				}

			}
		}
		return arr;
	}


}

class DataList {
	constructor(key, data) {
		this.data_name = key
		this.data_value = data
	}

	set(new_data) {
		this.data_value = new_data
	}

	get() {
		return this.data_value
	}
}

class DataTable {
	constructor(dataTable_options) {
		this.dataTable_options;

	}

	createDataTable() {
		data_table = {}

		return data_table

	}
}

class ModalContainer {
	constructor() {

	}
}