/**
 * UIController
 */

class UIController {
	constructor() {
		this.image_uploader = new ImageUpload()
		this.url
		this.prevent_backdrop = false;
	}

	/**
	 * Initializes UI elements according to the browser. Sets the map in the center of the browser.
	 *
	 */
	initTool() {


		this.url = new URL(window.location.href);
		var url_concept_id = this.url.searchParams.get("concept");
		// url_dialect_cluster = url.searchParams.get("dcluster");
		// url_dialect = url.searchParams.get("dialect");


		if (url_concept_id) jQuery('body').addClass('bavaria_version');

		appManager.map_controller.calculateCenter();

		var offsetHeight = jQuery('#left_menu').outerHeight();

		if (!appManager.data_manager.dialect_modal_initialized) {
			appManager.data_loader.get_dialects();
		}


		this.addModalListeners();

		if (appManager.data_manager.user_data.language_is_set && appManager.data_manager.user_data.crowder_dialect) {
			console.log("Lang and Dialect Selected");

			appManager.data_manager.current_language = parseInt(crowder_lang);


			this.setRandomTitelImage(function() {
				jQuery('#welcomeback_modal').addClass("fade");

				if (url_concept_id) {

					jQuery('#welcomeback_modal').find('#modal_welcome').html("Willkommen!");
				} else {
					jQuery('#welcomeback_modal').find('#modal_welcome').html(appManager.data_manager.getTranslation("welcomeback_texts"));
				}

				setTimeout(function() {
					jQuery('#welcomeback_modal').modal({
						keyboard: false
					})
				}, 250);

			}, ".welcome_modal");


		} else if (appManager.data_manager.user_data.language_is_set && !appManager.data_manager.user_data.crowder_dialect) {
			console.log("Lang selected, Dialect Not");

			current_language = parseInt(crowder_lang);


			this.initWelcomeModal();

			var clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
			var clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
			jQuery("#modal_welcome").replaceWith(clone_1);
			jQuery("#slogan_id").replaceWith(clone_2);

			jQuery("#language_select").remove();

			jQuery('.outerselect-container').removeAttr('style');

			jQuery(".switch_page_icon").css({

				'height': '44px',
				'width': '148px',
				'border': '1px solid white',
				'display': 'inline-block',
				'border-radius': '5px',
				'margin-left': -'5px'
			});


			this.setRandomTitelImage(function() {

				jQuery('#welcome_modal').modal({
					backdrop: 'static',
					keyboard: false
				})

			}, ".welcome_modal");

			setTimeout(function() {
				var index_carousel = jQuery('.findicators');

				if (jQuery('*[data-slide-to="0"]').hasClass('active')) {
					jQuery('#first_slider').carousel('next');
				}

			}, 1500);

		} else {
			console.log("Lang And Dialect NOT Selected");
			current_language = -1;
			this.initWelcomeModal();

			this.setRandomTitelImage(function() {

				jQuery('#welcome_modal').modal({
					backdrop: 'static',
					keyboard: false
				})

			}, ".welcome_modal");
		}


	}

	/**
	 * Initializes the Modal at the start of the CS-Tool, when the user has not yet choosen a language, has not yet registred.
	 *
	 */
	initWelcomeModal() {

		jQuery('#welcome_modal').on('show.bs.modal', function(e) {

			appManager.ui_controller.showCustomModalBackdrop();

			selectbox = jQuery('#language_select', this).selectBoxIt({
				theme: "bootstrap",
				defaultText: "Sprache ...",
				showFirstOption: false
			});
			jQuery(".infotext_container").mCustomScrollbar({
				scrollButtons: {
					enable: true
				}
			});

			appManager.ui_controller.cycleText(jQuery("#modal_welcome"), appManager.data_manager.getTranslation("welcome_texts", false, true), 0, function(i) {

				i -= 1;
				jQuery("#language_selectSelectBoxItText").text(appManager.data_manager.getTranslation("language_texts", i));
				jQuery("#language_selectSelectBoxItText").attr('data-val', appManager.data_manager.getTranslation("language_texts", i));

				// jQuery("#navigation_languages").text(navigation_languages[i]);
			});

			appManager.ui_controller.cycleText(jQuery("#slogan_id"), appManager.data_manager.getTranslation("slogan_texts", false, true), 0);

			appManager.ui_controller.cycleText(jQuery("#navigation_languages"), appManager.data_manager.getTranslation("navigation_languages", false, true), 0);


			selectbox.on('open', function() {
				if (jQuery('#welcome_modal').find('.modal-content').height() < 340)
					jQuery('.findicators').hide();
			});

			selectbox.on('close', function() {
				jQuery('.findicators').show();
			});

			selectbox.on('change', function() {

				// var select_index =  jQuery('#language_selectSelectBoxItOptions').find(".active").attr('data-id');
				var current_lang;
				var idx = jQuery(this).val();

				console.log("current language index")
				console.log(idx)

				jQuery('#testdiv').hide();

				var select_index = 0;
				select_index = appManager.data_manager.getTranslation("languages", false, true).indexOf(idx);


				current_language = select_index;

				var clone_1;
				var clone_2;
				var clone_3;

				if (!break_cycle) {

					current_lang = jQuery("#modal_welcome").attr('lang_id');
					if (current_lang == 4) current_lang = 0;

					clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
					clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
					clone_3 = jQuery("#navigation_languages").clone().attr('id', 'navigation_languages_c');

					jQuery("#modal_welcome").replaceWith(clone_1);
					jQuery("#slogan_id").replaceWith(clone_2);
					jQuery("#navigation_languages").replaceWith(clone_3);



					break_cycle = true;

				} else {

					clone_1 = jQuery('#modal_welcome_c');
					clone_2 = jQuery('#slogan_id_c');
					clone_3 = jQuery('#navigation_languages_c');
					current_lang = clone_1.attr('lang_id');

				}


				if (select_index != current_lang) {
					clone_1.animate({
						opacity: 0
					}, 801);
					clone_3.animate({
						opacity: 0
					}, 801);
					clone_2.animate({
						opacity: 0
					}, 801, function() {

						clone_1.text(appManager.data_manager.getTranslation("welcome_texts", select_index)) // [select_index]);
						clone_2.text(appManager.data_manager.getTranslation("slogan_texts", select_index)) //[select_index]);
						clone_3.text(appManager.data_manager.getTranslation("navigation_languages", select_index)) //[select_index]);

						clone_1.animate({
							opacity: 1
						}, 501);
						clone_2.animate({
							opacity: 1
						}, 501);
						clone_3.animate({
							opacity: 1
						}, 501);

					});

				} else {
					clone_1.css('opacity', '1');
					clone_2.css('opacity', '1');
					clone_3.css('opacity', '1');
					clone_1.text(appManager.data_manager.getTranslation("welcome_texts"));
					clone_2.text(appManager.data_manager.getTranslation("slogan_texts"));
					clone_3.text(appManager.data_manager.getTranslation("navigation_languages"));
				}

				clone_1.attr('lang_id', select_index);
				clone_2.attr('lang_id', select_index);
				clone_3.attr('lang_id', select_index);

			});

		});

		jQuery('#welcome_modal').hammer().bind("swipeleft", function(e) {

			if (jQuery(".active", e.target).index() == 1 && selected_dialect) {
				jQuery('#welcome_modal').modal('hide');

			} else {
				if (current_language != -1) {
					jQuery('#first_slider').carousel('next');
				} else {
					appManager.ui_controller.openLanguageModal();
				}
			}

		});

		jQuery('#welcome_modal').hammer().bind("swiperight", function() {
			if (current_language != -1) {
				jQuery('#first_slider').carousel('prev');
			} else {
				appManager.ui_controller.openLanguageModal();
			}

		});


		jQuery('.switch_page_icon').on('click', function() {
			if (current_language != -1) {
				jQuery('#first_slider').carousel('next');
			} else {
				appManager.ui_controller.openLanguageModal();
			}
		})

		jQuery('.c-back-button').on('click', function() {
			jQuery('#first_slider').carousel('prev');
		})

		jQuery('#first_slider').on('slide.bs.carousel', function(e) {


			if (jQuery(".active", e.target).index() == 0) {

				jQuery('.c-back-button').fadeIn('slow');
				jQuery('.infotext_head').text(appManager.data_manager.getTranslation("instruction_heads"));
				jQuery(".text-left-span").text(appManager.data_manager.getTranslation("instruction_texts"));
				jQuery("#dialekt_span").text(appManager.data_manager.getTranslation("lang_dialect_abbreviation"));
				jQuery("#go_span").text(appManager.data_manager.getTranslation("go_texts"));
				jQuery("#suggest_dialect_span").text(appManager.data_manager.getTranslation("suggest_dialect_texts"))

				jQuery("#data_remark").text(appManager.data_manager.getTranslation("data_remark"));

				jQuery('#remark_link').attr('href', appManager.data_manager.getTranslation("remark_link"));

			} else {
				jQuery('.c-back-button').fadeOut('fast');
			}
		})


		jQuery('#start_tool').on('click', function() {
			if (selected_dialect !== "") {
				jQuery('#welcome_modal').modal('hide');

			} else {
				jQuery('#dialect_not_selected_modal').modal('show');
			}
		})

		jQuery('#dialect_btn').on('click', function() {
			appManager.ui_controller.openDialectModal();
		})

		jQuery('#welcome_modal').on('hidden.bs.modal', function() {

			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });

			if (selected_dialect !== "") {
				appManager.startMainTool();
				//showCustomBackdrop();
			} else {
				jQuery('#dialect_not_selected_modal').modal('show');
			}
		})


	}


	/**
	 * Ajusts HTML-Elemets size according to the browser.
	 *
	 */
	setDynamicContent(source) {


		var doc_width = jQuery(document).width();
		var doc_height = jQuery(document).height();

		offsetHeight = jQuery('#left_menu').outerHeight(); //update height for leftmenu

		if (doc_width <= 330) {

			jQuery('#left_menu').css('padding-left', "9px").css('padding-right', "0px");
			jQuery('.row_2').css('text-align', 'center');

		} else {
			jQuery('#left_menu').css('padding-left', "20px").css('padding-right', "20px");
			jQuery('.row_2').css('text-align', 'right');


		}


		if (doc_width < 576) {
			jQuery('.row_1').css('font-size', "17px");
			jQuery('.row_2').css('font-size', "17px").css('margin-left', "0px");

		}

		if (doc_width > 1400) {
			jQuery('.row_1').css('font-size', "48px");
			jQuery('.row_2').css('font-size', "48px");


		} else if (doc_width < 1200 && doc_width > 576) {
			jQuery('.row_1').css('font-size', "3vw");
			jQuery('.row_2').css('font-size', "3vw");

		}


		if (jQuery('#image_modal').hasClass('in')) {

			jQuery('#image_modal').find('.i_fake_body').height('65vh');

			var modal_margin = 30;
			if (doc_width < 576) modal_margin = 10;


			var modal_height = jQuery('#image_modal').find('.i_fake_body').height() + 23 + modal_margin; //23 = footer, 30 = margin top
			var offsetHeight_l = document.getElementById('left_menu').offsetHeight + 20; //20 = before;

			var margin = 15;

			if ((modal_height + offsetHeight_l) > doc_height) {

				var dif = doc_height - (modal_height + offsetHeight_l);
				var current_height = jQuery('#image_modal').find('.i_fake_body').height();
				var new_height = current_height + dif - margin;
				jQuery('#image_modal').find('.i_fake_body').height(new_height);

			}

		}

		if (source != 'image') {



			for (var i = 0; i < appManager.data_manager.getTranslation("tooltips").length; i++) {
				jQuery(appManager.data_manager.getTranslation("tooltips", i).name).popover('dispose');
			}

			appManager.ui_controller.addToolTips(appManager.data_manager.getTranslation("tooltips", false, true));

			if (jQuery('.login_popover').parent().parent().hasClass('in')) {

				jQuery('#icon_login').popover('dispose');
				appManager.ui_controller.addLoginToolTip();
				appManager.ui_controller.showLoginPopUp();

			}


			if (jQuery('.list_modal').hasClass('in')) {

				appManager.ui_controller.displayTooltips(false);
				if (modals_initialized) {
					reMeasureDatatables();
				}
			}


			if (doc_width < 485) {

				var offsetstring = "0 0";

				if (current_language == 0) {

					if (doc_width < 338 && doc_width > 329) { offsetstring = "0 -10"; }
					if (doc_width < 323) offsetstring = "0 20";
					if (doc_width < 307) { offsetstring = "0 -25"; }

				}

				if (current_language == 1) {
					if (doc_width < 451) offsetstring = "0 -20";
				}

				if (current_language == 2) {
					if (doc_width < 315) offsetstring = "0 10";
					if (doc_width < 302) offsetstring = "0 -20";
				}



				jQuery('#location_span').popover('dispose');

				jQuery('#location_span').popover({
					trigger: "manual",
					placement: "top",
					container: "body",
					html: true,
					content: '<div class="pop_location_span custom_popover_content">' + appManager.data_manager.getTranslation("location_select_texts_with_br") + '</div>',
					offset: offsetstring,
					animation: true

				});

				if (stage == 1) {

					jQuery('#location_span').popover('show');

					jQuery('.pop_location_span').parent().on('click', function() {
						appManager.ui_controller.handleLocationSpanClick();
					}).addClass('c_hover');

				}


			} else {

				jQuery('#location_span').popover('dispose');
				appManager.ui_controller.addToolTip('#location_span', appManager.data_manager.getTranslation("location_select_texts", false, true));

			}

			if (stage == 4) {
				jQuery('#submitanswer').popover('show');

				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!submit_button_clicked) {
						appManager.data_loader.saveWord();
						submit_button_clicked = true;
						setTimeout(function() { submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/ }, 1000);
					}

				}).addClass('c_hover');

			}


			if (source != "list") appManager.ui_controller.showPopUp();

		}

		if (old_doc_width > 575 && doc_width < 575) {

			reMeasureDatatables();
		} else if (old_doc_width < 575 && doc_width > 575) {
			reMeasureDatatables();
		}

		if (doc_width < 452) {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "10px");
			jQuery('#register_modal .modal-body').css('padding-right', "2px");
		} else {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "14px");
			jQuery('#register_modal .modal-body').css('padding-right', "10px");
		}


		old_doc_width = doc_width;

	}


	/**
	 * TOOLTIPS FUNCTIONS
	 */

	addToolTips(elements) {
		for (var i = 0; i < elements.length; i++) {
			appManager.ui_controller.addToolTip(elements[i].name, elements[i].array);
		}
	}

	addToolTip(element, title_array) {
		var class_string = element.replace("#", "");
		class_string = "pop_" + class_string;

		var offsetstring = "0 0";
		if (class_string == "pop_submitanswer") offsetstring = "5 9";

		jQuery(element).popover({
			trigger: "manual",
			placement: "top",
			container: "body",
			content: '<div class="' + class_string + ' custom_popover_content">' + title_array[current_language] + '</div>',
			html: true,
			animation: true,
			offset: offsetstring


		});

	}


	displayTooltips(show) {

		if (show) jQuery('.popover').css('opacity', '1');
		else jQuery('.popover').css('opacity', '0');
	}

	showPopUp() {

		if (tutorial_running && location_selected && !concept_selected) {
			jQuery('#location_span').popover('hide');
			jQuery('#word_span').popover('show');
			stage = 2;

			jQuery('.pop_word_span').parent().on('click', function() {
				handleWordSpanClick();
			}).addClass('c_hover');

		} else if (tutorial_running && !location_selected && !concept_selected) {
			stage = 1;
			jQuery('#location_span').popover('show');

			jQuery('.pop_location_span').parent().on('click', function() {
				handleLocationSpanClick();
			}).addClass('c_hover');

		} else if (tutorial_running && !location_selected && concept_selected) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('show');
			stage = 1;

			jQuery('.pop_location_span').parent().on('click', function() {
				handleLocationSpanClick();
			}).addClass('c_hover');
		}

		// else if (tutorial_running && location_selected && concept_selected) {

		//       jQuery('#location_span').popover('hide');
		//       options = {
		//         trigger: "manual",
		//         placement: "top",
		//         container: "body",
		//         html: true,
		//         content: '<div class="pop_word_span custom_popover_content">' + upload_image_text[current_language] + '</div>'
		//       }

		//       jQuery('#word_span').popover('dispose');
		//       jQuery('#word_span').popover(options);
		//       jQuery('#word_span').popover("show");
		//       jQuery('.pop_word_span').parent().on('click', function() {
		//         console.log("CLICKED POPOVER")
		//         open_upload_image_modal()
		//       }).addClass('c_hover');
		//       console.log("UPLOAD MODAL OPEN")

		// } 
		else if (tutorial_running && location_selected & concept_selected && !word_entered) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('hide');
			jQuery('#user_input').popover('show');
			jQuery('#user_input').val("");
			stage = 3;
			jQuery('.pop_user_input').parent().parent().css('top', "5px");

			jQuery('.pop_user_input').parent().on('click', function() {
				jQuery('#user_input').focus();
				if (process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					process_restarted = false;
				}
			}).addClass('c_hover');

		}

		if (word_entered && stage < 4 && location_selected && concept_selected) {

			if (stage != 4) {
				jQuery('#user_input').popover('hide');
				jQuery('#submitanswer').popover('show');
				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!submit_button_clicked) {
						saveWord();
						submit_button_clicked = true;
						setTimeout(function() {
							submit_button_clicked = false; /*console.log('submit button: After saveword() ' + submit_button_clicked);*/
						}, 1000);
					}

				}).addClass('c_hover');

			}
			stage = 4;
		}

		if (stage == 6) {

			jQuery('#word_span').popover('hide');
			tutorial_running = false;
		}


	}


	/**
	 * MODALS FUNCTIONS
	 */

	/**
	 * Adds event listeners to all modals.
	 */
	addModalListeners() {

		//allow modals without backdrop to be closed when clicked in area beside modal
		jQuery('body').on('click', function(e) {
			if (jQuery(e.target).attr('id') == 'upload_image_modal' && uploading == false) jQuery('#upload_image_modal').modal('hide');
			if (jQuery(e.target).attr('id') == 'image_modal') jQuery('#image_modal').modal('hide');
		})

		jQuery('#locations_modal .customclose').on('click', function() {
			jQuery('#locations_modal').modal('hide');
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})

		jQuery('#concepts_modal .customclose').on('click', function() {
			jQuery('#concepts_modal').modal('hide');
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})

		jQuery('#image_modal .customclose').on('click', function() {
			jQuery('#image_modal').modal('hide');
		})

		jQuery('#message_modal .customclose').on('click', function() {
			jQuery('#message_modal').modal('hide');
		})

		jQuery('#language_modal .customclose').on('click', function() {
			jQuery('#language_modal').modal('hide');
		})

		jQuery('#register_modal .customclose').on('click', function() {
			jQuery('#register_modal').modal('hide');
			console.log("custom close");
		})

		jQuery('#location_list_modal .customclose').on('click', function() {
			jQuery('#location_list_modal').modal('hide');
		})

		jQuery('#input_modal .customclose').on('click', function() {
			jQuery('#input_modal').modal('hide');
		})

		jQuery('#editInput_modal .customclose').on('click', function() {
			jQuery('#editInput_modal').modal('hide');
		})

		jQuery('#image_modal').hammer().bind("swipeleft", function(e) {
			jQuery('#image_slider').carousel('next');
		});

		jQuery('#image_modal').hammer().bind("swiperight", function(e) {
			jQuery('#image_slider').carousel('prev');
		});

		jQuery('#highscore_select_modal .customclose').on('click', function() {
			jQuery('#highscore_select_modal').modal('hide');
		})

		jQuery('#share_modal .customclose').on('click', function() {
			jQuery('#share_modal').modal('hide');
		})

		jQuery('#toplistmodal .customclose').on('click', function() {
			jQuery('#toplistmodal').modal('hide');
		})

		jQuery('#why_register_modal .customclose').on('click', function() {
			appManager.ui_controller.prevent_backdrop = false;
			jQuery('#why_register_modal').modal('hide');
		})

		jQuery('#dialect_modal .customclose').on('click', function() {
			jQuery('#dialect_modal').modal('hide');
		})

		jQuery('#no_anoymous_user_data .customclose').on('click', function() {
			jQuery('#no_anoymous_user_data').modal('hide');
		})

		jQuery('#upload_image_modal .customclose').on('click', function() {
			if (!uploading) jQuery('#upload_image_modal').modal('hide');
		})


		jQuery("#icon_login").on('click', function() {
			display_all_register_login_elements();
			setRandomTitelImage(function() {
				jQuery('#register_modal').modal();
			}, '#register_modal')
		})

		/* jQuery('#open_login_modal').on('click',function(){
		     jQuery('register_modal').modal();
		 })  */

		this.bindShowListeners_Modal();


	}

	/**
	 * [bindShowListeners_Modal description]
	 *
	 */
	bindShowListeners_Modal() {


		jQuery('#dialect_not_selected_modal').on('show.bs.modal', function() {
			jQuery(this).find('.dialect_not_selected_modal_content').text(appManager.data_manager.getTranslation("dialect_not_selected_texts"));
		})


		jQuery('#dialect_modal').on('show.bs.modal', function() {
			if (!jQuery('body').hasClass('modal_init')) {
				jQuery('#custom_modal_backdrop').css('z-index', '1051');
			}
		})

		jQuery('#dialect_modal').on('shown.bs.modal', function() {

			if (appManager.data_manager.dialect_modal_initialized) {

				if (appManager.data_manager.getData("datatable_dialects").data_value && (current_dialect_index != -1)) {
					appManager.data_manager.getData("datatable_dialects").data_value.row(current_dialect_index).scrollTo();
				}

			}
		})


		jQuery('#locations_modal').on('shown.bs.modal', function(e) {
			if (modals_initialized) {
				datatable_locations.scroller.measure();
				setTimeout(function() {
					datatable_locations.scroller.measure();

				}, 10);

				appManager.ui_controller.displayTooltips(false);
				if (process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					process_restarted = false;
				}
				setTimeout(function() {
					document.getElementById("focusinput").focus();
				}, 0);

				if (saved_location_index != -1) {
					datatable_locations.row(saved_location_index).scrollTo();
				}

			}

		})


		jQuery('#concepts_modal').on('shown.bs.modal', function(e) {

			if (modals_initialized) {
				datatable_concepts.scroller.measure();
				setTimeout(function() {
					datatable_concepts.scroller.measure();
				}, 10);
				appManager.ui_controller.displayTooltips(false);
				if (process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					process_restarted = false;
				}
				do_image_modal = false;


				if (current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
					datatable_concepts.row(current_concept_index).scrollTo();
					selectTableEntry(current_concept_index);
				}
			}

			jQuery(".wikidata_icon").off("click");
			jQuery(".wikidata_icon").on('click', function(e) {
				e.stopPropagation();
				window.open(jQuery(this).attr('href'), '_blank');
			});

		})

		jQuery('#concepts_modal').on('show.bs.modal', function(e) {

			switch (current_language) {
				case 0:
					jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('german_va');
					break;
				case 1:
					jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('french_va');
					break;
				case 2:
					jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('italian_va');
					break;
				case 3:
					jQuery('#concepts_modal').find('#va_phase_wrapper_concept_list').addClass('slovenian_va');
					break;
			}

		})

		jQuery('#image_modal').on('shown.bs.modal', function(e) {

			setTimeout(function() {

				jQuery('#image_modal').find('#image_slider').carousel({
					interval: 3500
				})

				appManager.ui_controller.setDynamicContent('image');
			}, 10);
		})

		jQuery('#locations_modal').on('hidden.bs.modal', function() {

			setTimeout(function() { appManager.ui_controller.displayTooltips(true); }, 200);
			if (tutorial_running) appManager.ui_controller.showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})


		jQuery('#concepts_modal').on('hidden.bs.modal', function() {

			if (do_image_modal) jQuery('#image_modal').modal({});

			if (!appManager.ui_controller.prevent_backdrop) {
				setTimeout(function() { appManager.ui_controller.displayTooltips(true); }, 200);
				if (tutorial_running) appManager.ui_controller.showPopUp();
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}

		})


		jQuery('#message_modal').on('shown.bs.modal', function(e) {
			jQuery('#userAuesserungInput').focus();
			appManager.ui_controller.displayTooltips(false);
		})

		jQuery('#message_modal').on('hidden.bs.modal', function(e) {
			jQuery('#userAuesserungInput').focus();
			appManager.ui_controller.displayTooltips(true);
		})



		jQuery('#register_modal').on('shown.bs.modal', function(e) {

			appManager.ui_controller.prevent_backdrop = false;
			jQuery(this).find('.custom-modal-footer button').on('click', function() {

				jQuery('#register_modal').find('.custom-modal-footer button').removeClass('active_tab');
				jQuery(this).addClass('active_tab');

			})

			//add_anonymous_data_popover();
			register_login_modal_events();

		})

		jQuery('#register_modal').on('show.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop) {
				appManager.ui_controller.displayTooltips(false);
				showCustomModalBackdrop();
			}
		})


		jQuery('#register_modal').on('hidden.bs.modal', function(e) {
			jQuery('.send_anonymous_btn').popover('dispose');
			appManager.ui_controller.displayTooltips(true);
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			jQuery('#anonymous_data_slide').removeClass('active');
		})

		jQuery('#input_modal').on('shown.bs.modal', function(e) {
			if (!jQuery('#location_list_modal').hasClass('in')) appManager.ui_controller.displayTooltips(false);
		})

		jQuery('#input_modal').on('show.bs.modal', function(e) {
			jQuery('#custom_modal_backdrop').css('z-index', '10000');
		})


		jQuery('#input_modal').on('hidden.bs.modal', function(e) {
			if (!jQuery('#location_list_modal').hasClass('in')) { appManager.ui_controller.displayTooltips(true); }
			jQuery('#custom_modal_backdrop').css('z-index', '1049');
		})

		jQuery('#welcomeback_modal').on('shown.bs.modal', function(e) {



			setTimeout(function() {
				// jQuery('#custom_backdrop i').css('top','-150px');
				appManager.startMainTool();
			}, 200);


		})

		jQuery('#welcome_modal').on('shown.bs.modal', function(e) {
			jQuery('#custom_backdrop').fadeOut('slow', function() { jQuery(this).remove(); });

		})


		jQuery('#location_list_modal').on('show.bs.modal', function(e) {
			current_location_list_table = appManager.data_manager.createLocationListTable(current_location_list_table_data);


			switch (current_language) {
				case 0:
					jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('german_va');
					break;
				case 1:
					jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('french_va');
					break;
				case 2:
					jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('italian_va');
					break;
				case 3:
					jQuery('#location_list_modal').find('#va_phase_wrapper_location_list').addClass('slovenian_va');
					break;
			}

			do_image_modal = false;
		})

		jQuery('#location_list_modal').on('shown.bs.modal', function(e) {
			appManager.ui_controller.displayTooltips(false);
			current_location_list_table.scroller.measure();
			current_location_list_table.columns.adjust();


		})


		jQuery('#location_list_modal').on('hidden.bs.modal', function() {

			setTimeout(function() { appManager.ui_controller.displayTooltips(true); }, 200);
			if (tutorial_running) showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			if (do_image_modal) jQuery('#image_modal').modal({});
		})


		jQuery('#toplistmodal').on('show.bs.modal', function(e) {
			current_top_list_table = appManager.ui_controller.createTopListTable(current_highscoredata);
		})

		jQuery('#toplistmodal').on('shown.bs.modal', function(e) {
			appManager.ui_controller.prevent_backdrop = false;
			current_top_list_table.columns.adjust();
		})

		jQuery('#toplistmodal').on('hidden.bs.modal', function(e) {
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			appManager.ui_controller.displayTooltips(true);
		})

		jQuery('#highscore_select_modal').on('hidden.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				appManager.ui_controller.displayTooltips(true);
			}
		})

		jQuery('#share_modal').on('hidden.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop) {
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
				appManager.ui_controller.displayTooltips(true);
			}
		})

		jQuery('#highscore_select_modal').on('show.bs.modal', function(e) {
			appManager.ui_controller.displayTooltips(false);
		})

		jQuery('#share_modal').on('show.bs.modal', function(e) {
			appManager.ui_controller.displayTooltips(false);
		})


		jQuery('#why_register_modal').on('show.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop) {
				showCustomModalBackdrop();
				appManager.ui_controller.displayTooltips(false);
			}
		})


		jQuery('#why_register_modal').on('hidden.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop) {
				appManager.ui_controller.displayTooltips(true);
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}
		})

		jQuery('#dialect_modal').on('hidden.bs.modal', function(e) {
			if (!appManager.ui_controller.prevent_backdrop && !jQuery("#welcome_modal").hasClass('in')) {
				appManager.ui_controller.displayTooltips(true);
				jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			}
			jQuery('#custom_modal_backdrop').css('z-index', "");
		})

		jQuery('#why_register_modal').on('shown.bs.modal', function(e) {
			if (appManager.ui_controller.prevent_backdrop) appManager.ui_controller.prevent_backdrop = false;
		})



	}


	/**
	 * Sets a random image as background for the different modals.
	 * @param {Function} callback [description]
	 * @param {Int}   modal_id [description]
	 */
	setRandomTitelImage(callback, modal_id) {

		var number = Math.floor(Math.random() * 7) + 1;
		var jpg = "titel_" + number.toString() + ".jpg";
		var img_url = appManager.ui_controller.url.plugins_Url + '/assets/images/' + jpg;

		jQuery('<img/>').attr('src', img_url).load(function() {
			jQuery(this).remove();

			jQuery(modal_id).find('.modal-body').css('background', 'url(' + img_url + ')');
			jQuery(modal_id).find('.modal-body').css('background-repeat', 'no-repeat');
			jQuery(modal_id).find('.modal-body').css('background-size', 'cover');

			if (typeof callback == "function") {
				callback();
			}

		});

	}

	add_translation_register_modal() {
		var white_space = " ";

		jQuery('.label_username').text(appManager.data_manager.getTranslation("user_name"));
		jQuery('.label_password').text(appManager.data_manager.getTranslation("password_text"));

		jQuery('#lwa_user_remember').val(appManager.data_manager.getTranslation("enter_username_or_email"));

		jQuery('.slides_reg_register').text(appManager.data_manager.getTranslation("new_acc_text_detail"));
		jQuery('.slides_reg_login').text(appManager.data_manager.getTranslation("new_acc_text_detail"));
		jQuery('.slides_reg_forgot').text(appManager.data_manager.getTranslation("forgot_password_text"));


		jQuery('#user_login').val(appManager.data_manager.getTranslation("user_name"));
		jQuery('#user_email').val('E-Mail');
		jQuery('#user_age').val(appManager.data_manager.getTranslation("birth_year"));
		jQuery('#lwa_user_remember').val(appManager.data_manager.getTranslation("enter_username_or_email"));

		try {

			jQuery('#login_btn').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("login_btn");
			jQuery('.login_slider').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("login_btn");
			jQuery('.register_btn').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("register");
			jQuery('.send_anonymous_btn').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("send_anonymous_data_text");
			jQuery('.forgot_pass_slider').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("forgot_password_text");
			jQuery('.get_new_password').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("get_new_password");
			jQuery('.new_acc_slider').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("new_acc_text");
			jQuery('.reset_slider').contents().last()[0].textContent = white_space + appManager.data_manager.getTranslation("reset_btn_text");

		} catch (e) {
			console.log(e)
		}
		jQuery('#user_login').on('focus', function() { if (jQuery(this).val() == appManager.data_manager.getTranslation("user_name")) { jQuery(this).val(''); } })
		jQuery('#user_login').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(appManager.data_manager.getTranslation("user_name")); } })

		jQuery('#user_email').on('focus', function() { if (jQuery(this).val() == 'E-Mail') { jQuery(this).val(''); } })
		jQuery('#user_email').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val('E-Mail'); } })

		jQuery('#user_age').on('focus', function() { if (jQuery(this).val() == appManager.data_manager.getTranslation("birth_year")) { jQuery(this).val(''); } })
		jQuery('#user_age').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(appManager.data_manager.getTranslation("birth_year")); } })

		jQuery('#lwa_user_remember').on('focus', function() { if (jQuery(this).val() == appManager.data_manager.getTranslation("enter_username_or_email")) { jQuery(this).val(''); } })
		jQuery('#lwa_user_remember').on('blur', function() { if (jQuery(this).val() == '') { jQuery(this).val(appManager.data_manager.getTranslation("enter_username_or_email")); } })

		var additional_info = jQuery('.slides_reg_register').after('<div id="additional_info">');
		jQuery('#additional_info').text(appManager.data_manager.getTranslation("details_why_register_send_anonymous_data"));
	}


	display_dialect() {

		jQuery("#user_dialect").text(selected_dialect);

		var parent_div = jQuery(".arrow");
		parent_div.before(jQuery("user_dialect_container"));
		//jQuery("#user_dialect_container").css("padding-bottom", "10px");

		jQuery("#user_dialect_container").on('click', function() {



			if (appManager.data_manager.dialect_modal_initialized) {
				if (!jQuery("#welcome_modal").hasClass("in")) {
					appManager.ui_controller.showCustomModalBackdrop();
				}

				appManager.ui_controller.openDialectModal();
			} else {
				appManager.data_loader.get_dialects(function() { appManager.ui_controller.openDialectModal(); });

			}
		})


	}

	/**
	 * [handleWordSpanClick description]
	 *
	 */
	handleWordSpanClick() {

		if (allow_select) {


			if (!jQuery('#concepts_modal').hasClass('fade')) {
				jQuery('#concepts_modal').css('opacity', "1");
				jQuery('#concepts_modal').addClass('fade');
			}

			jQuery('#concepts_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) showCustomModalBackdrop();

		}

	}

	setQ(con, id) {

		appManager.map_controller.closeAllInfoWindows();


		jQuery('#word_span').text(con);
		jQuery('#word_span').attr("data-id_concept", id);


		var index = appManager.data_manager.getData("concepts_index_by_id").data_value[parseInt(id)].index;

		//if(current_concept_index[va_phase]!=-1)deSelectTableEntry(current_concept_index[va_phase]);
		// not sure what this is

		selectTableEntry(index);

		// current_concept_index[va_phase] = index; LAST VERSION, but ERROR
		current_concept_index = index;
		concept_selected = true;

		appManager.ui_controller.checkImageModal(id, con);

	}

	/**
	 * [handleLocationSpanClick description]
	 *
	 */
	handleLocationSpanClick() {

		if (allow_select) {

			if (!jQuery('#locations_modal').hasClass('fade')) {
				jQuery('#locations_modal').css('opacity', "1");
				jQuery('#locations_modal').addClass('fade');
			}

			jQuery('#locations_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) showCustomModalBackdrop();
		}

	}

	/**
	 * [menu_is_up description]
	 *
	 */
	menu_is_up() {
		startTutorial();
		jQuery('#showhighscore').on('click', function() {
			appManager.ui_controller.buildHighScoreSelect();
		})
		jQuery('#shareicon').on('click', function() {
			appManager.ui_controller.openShareModal();
		})
	}

	/**
	 * Change the language displayed. Used for Welcome Modal.
	 * @param  {String}   element  [description]
	 * @param  {Array}   textlist [description]
	 * @param  {Int}   i        [description]
	 * @param  {Function} callback [description]
	 *
	 */
	cycleText(element, textlist, i, callback) {
		// console.log("cycleText")
		// console.log(textlist)
		if (!break_cycle) {

			i++;
			setTimeout(function() {
				element.attr('lang_id', i);
				element.animate({ opacity: 0 }, 800, function() {
					element.text(textlist[i]);
					element.animate({ opacity: 1 }, 500, function() {
						requestAnimationFrame(function() { appManager.ui_controller.cycleText(element, textlist, i, callback) });
					});

				});


				if (i == textlist.length) i = 0;

			}, 1300);

			if (typeof callback == "function")
				callback(i);

		}

	}

	buildHighScoreSelect() {

		setRandomTitelImage(function() {
			showCustomModalBackdrop();


			appManager.data_loader.getHighScoresFromDB(function() {


				jQuery('#best_user').one('click', function() {
					appManager.ui_controller.openHighScoreModal(top_users);
					jQuery('.highscoreheadlinespan').text(appManager.data_manager.getTranslation("active_user_texts"));
					appManager.ui_controller.prevent_backdrop = true;
				}).text(appManager.data_manager.getTranslation("active_user_texts"))
				jQuery('#best_location').one('click', function() {
					appManager.ui_controller.openHighScoreModal(top_locations);
					jQuery('.highscoreheadlinespan').text(appManager.data_manager.getTranslation("active_location_texts"));
					appManager.ui_controller.prevent_backdrop = true;
				}).text(appManager.data_manager.getTranslation("active_location_texts"))
				jQuery('#best_concept').one('click', function() {
					appManager.ui_controller.openHighScoreModal(top_concepts);
					jQuery('.highscoreheadlinespan').text(appManager.data_manager.getTranslation("active_concept_texts"));
					appManager.ui_controller.prevent_backdrop = true;
				}).text(appManager.data_manager.getTranslation("active_concept_texts"))

				var icon = jQuery('<i class="fa fa-pagelines leaf_icon_l" aria-hidden="true"></i>');
				var icon_r = jQuery('<i class="fa fa-pagelines leaf_icon_r" aria-hidden="true"></i>');
				jQuery('.select_score_list').prepend(icon);
				jQuery('.select_score_list').append(icon_r);

				jQuery('#highscore_select_modal').modal({});
			}) //DB CALLBACK

		}, "#highscore_select_modal"); //IMAGE CALLBACK
	}

	openHighScoreModal(array) {

		if (current_top_list_table != null) current_top_list_table.destroy();

		var table_data = [];

		var i = 0;
		for (var key in array) {
			i++;
			var arr = array[key];

			if (arr[3]) {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', '<div class="concept_data" id="' + arr[3] + '">' + arr[0] + '</div>', arr[1]])
			} else if (arr[2]) {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', '<div class="obj_data" id="' + arr[2] + '">' + arr[0] + '</div>', arr[1]])
			} else {
				table_data.push(['<div class="highscorenumber">' + i + '.</div>', arr[0], arr[1]])
			}

		}

		current_highscoredata = table_data;
		jQuery('#highscore_select_modal').modal('hide');
		jQuery('#toplistmodal').modal();


		jQuery('#toplistmodal .obj_data').on('click', function() {
			jQuery('#toplistmodal').modal('hide');
			var g_location_id = jQuery(this).attr('id');
			var g_location = jQuery(this).text();
			appManager.map_controller.showPolygon(g_location, g_location_id, true);
			//console.log("CLICKED!!!");
		})

		jQuery('#toplistmodal .concept_data').on('click', function() {

			var id = parseInt(jQuery(this).attr('id'));
			var name = jQuery(this).text();
			appManager.ui_controller.setQ(name, id);
			jQuery('#toplistmodal').modal('hide');
			appManager.ui_controller.setDynamicContent();
		})

	}

	openShareModal() {
		appManager.ui_controller.setRandomTitelImage(function() {
			appManager.ui_controller.showCustomModalBackdrop();
			var cur_location_href = document.location.href;
			jQuery('#share_modal').modal({});

			jQuery('#share_link').text(cur_location_href);

			jQuery('#share_facebook').attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + cur_location_href);
			jQuery('#share_twitter').attr("href", "https://twitter.com/home?status=" + cur_location_href);
			jQuery('#share_googleplus').attr("href", "https://plus.google.com/share?url=" + cur_location_href);
			jQuery('#share_mail').attr("href", "mailto:" + 'verbaalpina@itg.uni-muenchen.de');

		}, "#share_modal");
	}

	createTopListTable() {


		var table = jQuery('#toplistmodal').find('#top_list_table').DataTable({

			data: current_highscoredata,
			deferRender: false, //otherwise .node() won't always work
			scrollY: "75vh",
			scrollX: false,
			scrollCollapse: true,
			info: false,
			ordering: false,
			searching: false,
			responsive: true,

			columns: [
				{ "width": "20%" },
				{ "width": "60%" },
				{ "width": "20%" },
			],

			scroller: {
				displayBuffer: 15,
			},

			fnInitComplete: function(settings) {}

		})

		return table;
	}



	checkImageModal(id, name) {
		var myimages = [];
		myimages = images[id];

		if (myimages.length > 0) {
			do_image_modal = true;
		}

		if (do_image_modal) {
			var c = buildCarousel(myimages, name);
			jQuery('#image_modal').find('.modal-body').append(c);

			if (jQuery("#suggest_image_upload").length) {

			} else {
				var upload_button = jQuery("<div id='suggest_image_upload'></div>").text(appManager.data_manager.getTranslation("upload_own_image_button_text"));

				jQuery('#image_modal').find('.customfooter').append(upload_button);
				jQuery('#image_modal').find('.customfooter').css("height", "30px");

				upload_button.on("click", function() {
					appManager.ui_controller.image_uploader.open_upload_image_modal()
				})
			}


		} else {
			appManager.ui_controller.image_uploader.open_upload_image_modal()
		}

	}

	/**
	 * Opens Language Modal for the user to choose prefered language.
	 *
	 */
	openLanguageModal() {

		// jQuery('.message_modal_content').text("Bitte wählen Sie eine Sprache aus!");
		jQuery('#language_modal').modal({
			keyboard: true
		});

	}

	openDialectModal() {
		jQuery('#dialect_modal').modal({
			keyboard: true
		});

		//if(jQuery('#custom_modal_backdrop').length<1)showCustomModalBackdrop();
		//jQuery('#custom_modal_backdrop').fadeOut();
	}
	/**
	 * [showCustomBackdrop description]
	 *
	 */
	showCustomBackdrop() {

		var custom_backdrop = jQuery('<div id="custom_backdrop"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw""></i></div>');
		jQuery('body').append(custom_backdrop);
		jQuery('#custom_backdrop').fadeIn();

	}

	/**
	 * [showCustomModalBackdrop description]
	 *
	 */
	showCustomModalBackdrop() {

		jQuery('#custom_modal_backdrop').remove();
		var custom_backdrop = jQuery('<div id="custom_modal_backdrop"></div>');
		jQuery('body').append(custom_backdrop);
		jQuery('#custom_modal_backdrop').fadeIn('fast');

	}


}

class UIElement {
	constructor() {

	}
}

class EventManager {
	constructor() {
		this.element_id = ""
		this.element_class = ""
		this.element = ""
		this.element_events = Object()
	}
}

class ImageUpload {
	constructor() {
		this.fd
		this.allowed_image_types = ["image/png", "image/jpeg", "image/tiff"];
	}

	/**
	 * Image Upload Controller, Funtionalities enabling the frontend import of images
	 *
	 * @module Image Uploader
	 */


	open_upload_image_modal() {
		jQuery("#image_modal").modal('hide')
		jQuery('#upload_image_modal').modal('show')


	}



	/**
	 * Initialize Form for Image Upload
	 * Adding event Listeners for drag, drop, ect Events to prevent default 
	 *
	 */
	init_image_upload_form() {
		appManager.ui_controller.image_uploader.fd = new FormData(jQuery('#image_upload_form')[0]);

		let dropArea = document.getElementById('drop-area')
		let gallery = document.getElementById('gallery')

		let events = ['dragenter', 'dragover', 'dragleave', 'drop']
		let events_enter_over = ['dragenter', 'dragover']
		let events_leave_drop = ['dragleave', 'drop']

		/**
		 * Event handling for image drag and drop
		 */
		events.map(eventName => {
			dropArea.addEventListener(eventName, appManager.ui_controller.image_uploader.preventDefaults, false)
		})

		events_enter_over.map(eventName => {
			dropArea.addEventListener(eventName, appManager.ui_controller.image_uploader.highlight, false)
			gallery.addEventListener(eventName, appManager.ui_controller.image_uploader.highlight, false)
		})

		events_leave_drop.map(eventName => {
			dropArea.addEventListener(eventName, appManager.ui_controller.image_uploader.unhighlight, false)
			gallery.addEventListener(eventName, appManager.ui_controller.image_uploader.unhighlight, false)
		})


		dropArea.addEventListener('drop', appManager.ui_controller.image_uploader.handleDrop, false)

		jQuery("#fileElem").change(function() {
			console.log("Image selected")
		});

		jQuery("#upload_images").on("click", function() {
			var selected_concept_id = jQuery("#word_span").attr("data-id_concept")

			/**
			 * check if user accepts terms and has selected images for upload
			 */
			if (jQuery("#accept_req_image_upload").is(":checked") && appManager.ui_controller.image_uploader.fd.getAll('image_data[]').length > 0) {
				upload_images(selected_concept_id);
				jQuery('#drop-area-overlay').css('display', 'flex');

			} else if (appManager.ui_controller.image_uploader.fd.getAll('image_data[]').length == 0) {

				jQuery('.message_modal_content').text(appManager.data_manager.getTranslation("select_image_alert"));
				jQuery('#message_modal').modal({
					keyboard: true,
					backdrop: "dynamic"
				});
			} else if (jQuery("#accept_req_image_upload").is(":not(:checked)")) {

				jQuery('.message_modal_content').text(appManager.data_manager.getTranslation("accept_upload_terms_alert"));
				jQuery('#message_modal').modal({
					keyboard: true,
					backdrop: "dynamic"
				});
			}

		})

		jQuery("#upload_image_modal").on('hidden.bs.modal', function() {
			// reset all input		
			var file_input = jQuery("#fileElem");
			appManager.ui_controller.image_uploader.reset_input(file_input)
		})

		jQuery("#upload_image_modal").on('show.bs.modal', function() {
			// update title for image upload modal
			var selected_concept_id = jQuery("#word_span").attr("data-id_concept")
			var concept_name = "<b>" + appManager.data_manager.getData("concepts_index_by_id").data_value[selected_concept_id].name + "</b>"
			var task_text = appManager.data_manager.getTranslation("upload_task_text").split("{Konzept}")
			task_text = task_text[0] + " " + concept_name + " " + task_text[1]
			jQuery(this).find(".modal-title").html(task_text) // "Zum " + "<b>" + concepts_index_by_id[selected_concept_id].name + "</b>" + " fehlen uns noch Bilder. Hier können Sie Ihre eigene Bilde hochladen und zum Projekt beitragen." 
		})


		jQuery(".button_select_files").text(appManager.data_manager.getTranslation("upload_text"))

		var accept_terms = appManager.data_manager.getTranslation("upload_terms_text").replace('CC BY SA 4.0', '<a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY SA 4.0</a>');
		jQuery("#accept_terms_label").html(accept_terms);

		jQuery("#upload_images").text(appManager.data_manager.getTranslation("upload_image_text"))
		jQuery("#close_modal").text(appManager.data_manager.getTranslation("close_modal_text"))
	}

	preventDefaults(e) {
		e.preventDefault()
		e.stopPropagation()
	}

	highlight(e) {
		dropArea.classList.add('highlight')
		jQuery(".button_select_files").text(drop_file_text[current_language])
	}

	unhighlight(e) {
		dropArea.classList.remove('highlight')
		jQuery(".button_select_files").text(upload_text[current_language])

	}

	handleDrop(e) {
		var dt = e.dataTransfer
		var files = dt.files

		jQuery("#loading_images").css("display", "block")
		appManager.ui_controller.image_uploader.handleFiles(files)
	}

	/**
	 * @param  {Files} files Input Images
	 */
	handleFiles(files) {
		form_input = jQuery("#fileElem")

		files = [...files]
		// only add valid files that are images
		files = files.filter(check_image)

		files.forEach(function(file) {
			appManager.ui_controller.image_uploader.fd.append('image_data[]', file);
		})

		files.forEach(previewFile)

		if (jQuery("#erase_upload_images").length == 0) {
			var del_button = jQuery("<button id='erase_upload_images'  class='btn-sm btn-outline-danger'></button").text(appManager.data_manager.getTranslation("clear_images"));

			del_button.on("click", function() {
				appManager.ui_controller.image_uploader.reset_input(jQuery("#fileElem"))
			})

			del_button.insertAfter(jQuery("#gallery"))

		}
		jQuery("#loading_images").css("display", "none")

	}


	check_image(file) {
		return allowed_image_types.includes(file.type);
	}

	/**
	 * Display a preview of images selected for upload.
	 * @param  {File} file Image to be dispayed
	 */
	previewFile(file) {
		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onloadend = function() {
			img = document.createElement('img')
			img.src = reader.result
			document.getElementById('gallery').appendChild(img)
		}
	}

	/**
	 * Send Ajax call with image data form - to upload image to server.
	 * @param  {Int} selected_concept_id [description]
	 */
	upload_images(selected_concept_id) {

		appManager.ui_controller.image_uploader.fd.set('action', "upload_image");
		appManager.ui_controller.image_uploader.fd.set('selected_concept_id', selected_concept_id);
		uploading = true;
		jQuery.ajax({
			type: 'POST',
			url: ajax_object.ajax_url,
			data: appManager.ui_controller.image_uploader.fd,
			processData: false,
			contentType: false,
			success: function(data) {

				appManager.ui_controller.image_uploader.reset_input(jQuery("#fileElem"))

				jQuery("#gallery").empty()
				var thanks_div = jQuery('<div class="successful_upload"></div>').text(appManager.data_manager.getTranslation("upload_complete"))
				jQuery("#gallery").append(thanks_div);
				jQuery('#drop-area-overlay').fadeOut('slow');
				uploading = false;
				setTimeout(function() {
					thanks_div.fadeOut(
						function() {
							jQuery('#upload_image_modal').modal('hide');
							jQuery(this).remove();
						});
				}, 1000);
			},
			error: function(data) {

				uploading = false;
				appManager.ui_controller.image_uploader.reset_input(jQuery("#fileElem"))

				jQuery("#gallery").empty()
				var thanks_div = jQuery('<div class="fail_upload"></div>').text(appManager.data_manager.getTranslation("upload_failed"))
				jQuery("#gallery").append(thanks_div)
			}
		});

	}

	/**
	 * Reset the form, clear any existing values.
	 * @param  {Node} element HTML Element
	 */
	reset_input(element) {
		appManager.ui_controller.image_uploader.fd.delete("image_data[]");

		element.wrap('<form>').closest('form').get(0).reset();
		element.unwrap();

		element.replaceWith(element.val('').clone(true));
		appManager.ui_controller.image_uploader.fd = new FormData(jQuery('#image_upload_form')[0]);
		jQuery("#gallery").empty()

		if (jQuery("#erase_upload_images").length != 0) {
			jQuery("#erase_upload_images").remove()
		}
	}
}




class Modal {
	constructor(modal_id) {
		this.modal_id = modal_id
	}
}