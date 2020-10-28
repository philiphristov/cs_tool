/**
 * UIController
 */

class UIController {
	constructor() {
		this.image_uploader = new ImageUpload()
		this.url

		this.offsetHeight = 0;
		this.old_doc_width = 0;

		/**
		 * States and Variables
		 */
		this.stage = 1
		this.prevent_backdrop = false
		this.do_image_modal = false
		this.tutorial_running = false
		this.location_selected = false
		this.concept_selected = false
		this.word_entered = false
		this.process_restarted = false
		this.break_cycle = false
		this.uploading = false

		this.choosing_location_mode = false
		this.location_listener_added = false
		this.inside_location_listener_added = false

		this.current_top_list_table
	}

	/**
	 * Initializes UI elements according to the browser. Sets the map in the center of the browser.
	 *
	 */
	initTool() {


		this.url = new URL(window.location.href);
		appManager.data_manager.url_concept_id = this.url.searchParams.get("concept");
		var current_language = 0;
		// url_dialect_cluster = url.searchParams.get("dcluster");
		// url_dialect = url.searchParams.get("dialect");


		if (appManager.data_manager.url_concept_id) jQuery('body').addClass('bavaria_version');

		appManager.map_controller.calculateCenter();

		var offsetHeight = jQuery('#left_menu').outerHeight();

		if (!appManager.data_manager.dialect_modal_initialized) {
			appManager.data_loader.get_dialects();
		}


		this.addModalListeners();

		if (appManager.data_manager.user_data.language_is_set && appManager.data_manager.user_data.crowder_dialect) {
			console.log("Lang and Dialect Selected");


			this.setRandomTitelImage(function() {
				jQuery('#welcomeback_modal').addClass("fade");

				if (appManager.data_manager.url_concept_id) {
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

			jQuery('#welcomeback_modal').hide()


		} else if (appManager.data_manager.user_data.language_is_set && !appManager.data_manager.user_data.crowder_dialect) {
			console.log("Lang selected, Dialect Not");

			current_language = parseInt(crowder_lang);
			appManager.data_manager.current_language = current_language

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
			appManager.data_manager.current_language = current_language
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

			var selectbox = jQuery('#language_select', this).selectBoxIt({
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
				// jQuery("#language_selectSelectBoxItText").text(appManager.data_manager.getTranslation("language_texts", i));
				// jQuery("#language_selectSelectBoxItText").attr('data-val', appManager.data_manager.getTranslation("language_texts", i));

				jQuery("#language_selectSelectBoxItText").text(appManager.data_manager.getTranslation("language_texts", false, false, i));
				jQuery("#language_selectSelectBoxItText").attr('data-val', appManager.data_manager.getTranslation("language_texts", false, false, i));

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

				jQuery('#testdiv').hide();

				var select_index = 0;
				select_index = appManager.data_manager.getTranslation("languages", false, true).indexOf(idx);


				current_language = select_index;
				appManager.data_manager.current_language = current_language
				var clone_1;
				var clone_2;
				var clone_3;

				if (!appManager.ui_controller.break_cycle) {

					current_lang = jQuery("#modal_welcome").attr('lang_id');
					if (current_lang == 4) current_lang = 0;

					clone_1 = jQuery("#modal_welcome").clone().attr('id', 'modal_welcome_c');
					clone_2 = jQuery("#slogan_id").clone().attr('id', 'slogan_id_c');
					clone_3 = jQuery("#navigation_languages").clone().attr('id', 'navigation_languages_c');

					jQuery("#modal_welcome").replaceWith(clone_1);
					jQuery("#slogan_id").replaceWith(clone_2);
					jQuery("#navigation_languages").replaceWith(clone_3);

					appManager.ui_controller.break_cycle = true;

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

			if (jQuery(".active", e.target).index() == 1 && appManager.data_manager.selected_dialect) {
				jQuery('#welcome_modal').modal('hide');

			} else {
				if (appManager.data_manager.current_language != -1) {
					jQuery('#first_slider').carousel('next');
				} else {
					appManager.ui_controller.openLanguageModal();
				}
			}

		});

		jQuery('#welcome_modal').hammer().bind("swiperight", function() {
			if (appManager.data_manager.current_language != -1) {
				jQuery('#first_slider').carousel('prev');
			} else {
				appManager.ui_controller.openLanguageModal();
			}

		});


		jQuery('.switch_page_icon').on('click', function() {
			if (appManager.data_manager.current_language != -1) {
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
			if (appManager.data_manager.selected_dialect !== "") {
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

			if (appManager.data_manager.selected_dialect !== "") {
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

		var offsetHeight = jQuery('#left_menu').outerHeight(); //update height for leftmenu

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

			var tooltips = appManager.data_manager.getTranslation("tooltips", false, true)
			for (var i = 0; i < tooltips.length; i++) {
				jQuery(tooltips[i].name).popover('dispose');
			}

			appManager.ui_controller.addToolTips(appManager.data_manager.getTranslation("tooltips", false, true));

			if (jQuery('.login_popover').parent().parent().hasClass('in')) {

				jQuery('#icon_login').popover('dispose');
				appManager.ui_controller.addLoginToolTip();
				appManager.ui_controller.showLoginPopUp();

			}


			if (jQuery('.list_modal').hasClass('in')) {

				appManager.ui_controller.displayTooltips(false);
				if (appManager.data_manager.modals_initialized) {
					appManager.data_manager.reMeasureDatatables();
				}
			}


			if (doc_width < 485) {

				var offsetstring = "0 0";

				if (appManager.data_manager.current_language == 0) {

					if (doc_width < 338 && doc_width > 329) { offsetstring = "0 -10"; }
					if (doc_width < 323) offsetstring = "0 20";
					if (doc_width < 307) { offsetstring = "0 -25"; }

				}

				if (appManager.data_manager.current_language == 1) {
					if (doc_width < 451) offsetstring = "0 -20";
				}

				if (appManager.data_manager.current_language == 2) {
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

				if (appManager.ui_controller.stage == 1) {

					jQuery('#location_span').popover('show');

					jQuery('.pop_location_span').parent().on('click', function() {
						appManager.ui_controller.handleLocationSpanClick();
					}).addClass('c_hover');

				}


			} else {

				jQuery('#location_span').popover('dispose');
				appManager.ui_controller.addToolTip('#location_span', appManager.data_manager.getTranslation("location_select_texts_with_br", false, true));

			}

			if (appManager.ui_controller.stage == 4) {
				jQuery('#submitanswer').popover('show');

				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!appManager.ui_controller.submit_button_clicked) {
						appManager.data_loader.saveWord();
						appManager.ui_controller.submit_button_clicked = true;
						setTimeout(function() { appManager.ui_controller.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + appManager.ui_controller.submit_button_clicked);*/ }, 1000);
					}

				}).addClass('c_hover');

			}


			if (source != "list") appManager.ui_controller.showPopUp();

		}

		if (appManager.ui_controller.old_doc_width > 575 && doc_width < 575) {

			appManager.data_manager.reMeasureDatatables();
		} else if (appManager.ui_controller.old_doc_width < 575 && doc_width > 575) {
			appManager.data_manager.reMeasureDatatables();
		}

		if (doc_width < 452) {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "10px");
			jQuery('#register_modal .modal-body').css('padding-right', "2px");
		} else {
			jQuery('#register_modal .custom-modal-footer button').css('font-size', "14px");
			jQuery('#register_modal .modal-body').css('padding-right', "10px");
		}


		appManager.ui_controller.old_doc_width = doc_width;

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

		title_array = title_array[appManager.data_manager.current_language]

		jQuery(element).popover({
			trigger: "manual",
			placement: "top",
			container: "body",
			content: '<div class="' + class_string + ' custom_popover_content">' + title_array + '</div>',
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

		if (appManager.ui_controller.tutorial_running && appManager.ui_controller.location_selected && !appManager.ui_controller.concept_selected) {
			jQuery('#location_span').popover('hide');
			jQuery('#word_span').popover('show');
			appManager.ui_controller.stage = 2;

			jQuery('.pop_word_span').parent().on('click', function() {
				appManager.ui_controller.handleWordSpanClick();
			}).addClass('c_hover');

		} else if (appManager.ui_controller.tutorial_running && !appManager.ui_controller.location_selected && !appManager.ui_controller.concept_selected) {
			appManager.ui_controller.stage = 1;
			jQuery('#location_span').popover('show');

			jQuery('.pop_location_span').parent().on('click', function() {
				appManager.ui_controller.handleLocationSpanClick();
			}).addClass('c_hover');

		} else if (appManager.ui_controller.tutorial_running && !appManager.ui_controller.location_selected && appManager.ui_controller.concept_selected) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('show');
			appManager.ui_controller.stage = 1;

			jQuery('.pop_location_span').parent().on('click', function() {
				appManager.ui_controller.handleLocationSpanClick();
			}).addClass('c_hover');
		}

		// else if (appManager.ui_controller.tutorial_running && appManager.ui_controller.location_selected && appManager.ui_controller.concept_selected) {

		//       jQuery('#location_span').popover('hide');
		//       options = {
		//         trigger: "manual",
		//         placement: "top",
		//         container: "body",
		//         html: true,
		//         content: '<div class="pop_word_span custom_popover_content">' + appManager.data_manager.getTranslation("upload_image_text") + '</div>'
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
		else if (appManager.ui_controller.tutorial_running && appManager.ui_controller.location_selected & appManager.ui_controller.concept_selected && !appManager.ui_controller.word_entered) {
			jQuery('#word_span').popover('hide');
			jQuery('#location_span').popover('hide');
			jQuery('#user_input').popover('show');
			jQuery('#user_input').val("");
			appManager.ui_controller.stage = 3;
			jQuery('.pop_user_input').parent().parent().css('top', "5px");

			jQuery('.pop_user_input').parent().on('click', function() {
				jQuery('#user_input').focus();
				if (appManager.ui_controller.process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					appManager.ui_controller.process_restarted = false;
				}
			}).addClass('c_hover');

		}

		if (appManager.ui_controller.word_entered && appManager.ui_controller.stage < 4 && appManager.ui_controller.location_selected && appManager.ui_controller.concept_selected) {

			if (appManager.ui_controller.stage != 4) {
				jQuery('#user_input').popover('hide');
				jQuery('#submitanswer').popover('show');
				jQuery('.pop_submitanswer').parent().on('click', function() {

					if (!appManager.ui_controller.submit_button_clicked) {
						appManager.data_loader.saveWord();
						appManager.ui_controller.submit_button_clicked = true;
						setTimeout(function() {
							appManager.ui_controller.submit_button_clicked = false; /*console.log('submit button: After saveword() ' + appManager.ui_controller.submit_button_clicked);*/
						}, 1000);
					}

				}).addClass('c_hover');

			}
			appManager.ui_controller.stage = 4;
		}

		if (appManager.ui_controller.stage == 6) {

			jQuery('#word_span').popover('hide');
			appManager.ui_controller.tutorial_running = false;
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
			if (jQuery(e.target).attr('id') == 'upload_image_modal' && appManager.ui_controller.uploading == false) jQuery('#upload_image_modal').modal('hide');
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
			if (!appManager.ui_controller.uploading) jQuery('#upload_image_modal').modal('hide');
		})


		jQuery("#icon_login").on('click', function() {
			display_all_register_login_elements();
			appManager.ui_controller.setRandomTitelImage(function() {
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

				if (appManager.data_manager.getData("datatable_dialects").data_value && (appManager.data_manager.current_dialect_index != -1)) {
					appManager.data_manager.getData("datatable_dialects").data_value.row(appManager.data_manager.current_dialect_index).scrollTo();
				}

			}
		})


		jQuery('#locations_modal').on('shown.bs.modal', function(e) {
			if (appManager.data_manager.modals_initialized) {
				appManager.data_manager.getDataTable("datatable_locations").scroller.measure();
				setTimeout(function() {
					appManager.data_manager.getDataTable("datatable_locations").scroller.measure();

				}, 10);

				appManager.ui_controller.displayTooltips(false);
				if (appManager.ui_controller.process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					appManager.ui_controller.process_restarted = false;
				}
				setTimeout(function() {
					document.getElementById("focusinput").focus();
				}, 0);

				if (appManager.data_manager.saved_location_index != -1) {
					appManager.data_manager.getDataTable("datatable_locations").row(appManager.data_manager.saved_location_index).scrollTo();
				}

			}

		})


		jQuery('#concepts_modal').on('shown.bs.modal', function(e) {

			if (appManager.data_manager.modals_initialized) {
				appManager.data_manager.getDataTable("datatable_concepts").scroller.measure();
				setTimeout(function() {
					appManager.data_manager.getDataTable("datatable_concepts").scroller.measure();
				}, 10);
				appManager.ui_controller.displayTooltips(false);
				if (appManager.ui_controller.process_restarted) {
					appManager.map_controller.closeAllInfoWindows();
					appManager.ui_controller.process_restarted = false;
				}
				appManager.ui_controller.do_image_modal = false;


				if (appManager.data_manager.current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
					appManager.data_manager.getDataTable("datatable_concepts").row(appManager.data_manager.current_concept_index).scrollTo();
					appManager.ui_controller.selectTableEntry(appManager.data_manager.current_concept_index);
				}
			}

			jQuery(".wikidata_icon").off("click");
			jQuery(".wikidata_icon").on('click', function(e) {
				e.stopPropagation();
				window.open(jQuery(this).attr('href'), '_blank');
			});

		})

		jQuery('#concepts_modal').on('show.bs.modal', function(e) {

			switch (appManager.data_manager.current_language) {
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
			if (appManager.ui_controller.tutorial_running) appManager.ui_controller.showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
		})


		jQuery('#concepts_modal').on('hidden.bs.modal', function() {

			if (appManager.ui_controller.do_image_modal) jQuery('#image_modal').modal({});

			if (!appManager.ui_controller.prevent_backdrop) {
				setTimeout(function() { appManager.ui_controller.displayTooltips(true); }, 200);
				if (appManager.ui_controller.tutorial_running) appManager.ui_controller.showPopUp();
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
				appManager.ui_controller.showCustomModalBackdrop();
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
			var current_location_list_table = appManager.data_manager.createLocationListTable(appManager.data_manager.getData("current_location_list_table_data").data_value);
			appManager.data_manager.addDataTable("current_location_list_table", current_location_list_table)

			switch (appManager.data_manager.current_language) {
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

			appManager.ui_controller.do_image_modal = false;
		})

		jQuery('#location_list_modal').on('shown.bs.modal', function(e) {
			appManager.ui_controller.displayTooltips(false);
			appManager.data_manager.getDataTable("current_location_list_table").scroller.measure();
			appManager.data_manager.getDataTable("current_location_list_table").columns.adjust();


		})


		jQuery('#location_list_modal').on('hidden.bs.modal', function() {

			setTimeout(function() { appManager.ui_controller.displayTooltips(true); }, 200);
			if (appManager.ui_controller.tutorial_running) appManager.ui_controller.showPopUp();
			jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() })
			if (appManager.ui_controller.do_image_modal) jQuery('#image_modal').modal({});
		})


		jQuery('#toplistmodal').on('show.bs.modal', function(e) {
			appManager.ui_controller.current_top_list_table = appManager.ui_controller.createTopListTable(appManager.data_manager.getData("current_highscoredata").data_value);
		})

		jQuery('#toplistmodal').on('shown.bs.modal', function(e) {
			appManager.ui_controller.prevent_backdrop = false;
			appManager.ui_controller.current_top_list_table.columns.adjust();
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
				appManager.ui_controller.showCustomModalBackdrop();
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
		var img_url = url.plugins_Url + '/assets/images/' + jpg;

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

		jQuery("#user_dialect").text(appManager.data_manager.selected_dialect);

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

		if (appManager.ui_controller.allow_select) {


			if (!jQuery('#concepts_modal').hasClass('fade')) {
				jQuery('#concepts_modal').css('opacity', "1");
				jQuery('#concepts_modal').addClass('fade');
			}

			jQuery('#concepts_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) appManager.ui_controller.showCustomModalBackdrop();

		}

	}

	setQ(con, id) {

		appManager.map_controller.closeAllInfoWindows();


		jQuery('#word_span').text(con);
		jQuery('#word_span').attr("data-id_concept", id);


		var index = appManager.data_manager.getData("concepts_index_by_id").data_value[parseInt(id)].index;

		//if(appManager.data_manager.current_concept_index[va_phase]!=-1)deSelectTableEntry(appManager.data_manager.current_concept_index[va_phase]);
		// not sure what this is

		appManager.ui_controller.selectTableEntry(index);

		// appManager.data_manager.current_concept_index[va_phase] = index; LAST VERSION, but ERROR
		appManager.data_manager.current_concept_index = index;
		appManager.ui_controller.concept_selected = true;

		appManager.ui_controller.checkImageModal(id, con);

	}

	/**
	 * [handleLocationSpanClick description]
	 *
	 */
	handleLocationSpanClick() {

		if (appManager.ui_controller.allow_select) {

			if (!jQuery('#locations_modal').hasClass('fade')) {
				jQuery('#locations_modal').css('opacity', "1");
				jQuery('#locations_modal').addClass('fade');
			}

			jQuery('#locations_modal').modal({
				keyboard: false
			});

			if (jQuery('#custom_modal_backdrop').length < 1) appManager.ui_controller.showCustomModalBackdrop();
		}

	}

	/**
	 * [menu_is_up description]
	 *
	 */
	menu_is_up() {
		this.startTutorial();
		jQuery('#showhighscore').on('click', function() {
			appManager.ui_controller.buildHighScoreSelect();
		})
		jQuery('#shareicon').on('click', function() {
			appManager.ui_controller.openShareModal();
		})
	}

	/**
	 * Initializes the Popover Tutorials.
	 *
	 */
	startTutorial() {

		appManager.ui_controller.tutorial_running = true;
		appManager.ui_controller.stage = 1;
		jQuery('#location_span').popover('show');


		jQuery('.pop_location_span').parent().on('click', function() {
			appManager.ui_controller.handleLocationSpanClick();
		}).addClass('c_hover');



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
		if (!appManager.ui_controller.break_cycle) {

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



	addLoginToolTip() {

		jQuery('#icon_login').popover({
			trigger: "manual",
			placement: "left",
			container: "body",
			content: '<div class="login_popover custom_popover_content">' + appManager.data_manager.getTranslation("register_texts") + '</div>',
			html: true,
			animation: true,
			offset: "0 0"
		});

		jQuery('#icon_login').popover('hide');

	}


	showLoginPopUp() {


		jQuery('#icon_login').popover('show');
		jQuery('.login_popover').parent().on('click', function() {
			appManager.ui_controller.setRandomTitelImage(function() {
				display_all_register_login_elements();
				jQuery('#register_modal').modal();
			}, '#register_modal');
		}).addClass('c_hover');


	}

	display_all_register_login_elements() {
		jQuery('#login_slide').addClass('active');
		jQuery('#register_slide').removeClass('active');
		jQuery('.custom-modal-footer').show();

		jQuery('.login_slider').show();
		jQuery('.forgot_pass_slider').show();
		jQuery('.reset_slider').show();
		jQuery('.new_acc_slider').show();
	}


	/**
	 * Marks a row in the concept datatable according to a table index
	 * @param  {Int} table_index index of the selected entry in the data table
	 *
	 */
	selectTableEntry(table_index) {

		var row = appManager.data_manager.getDataTable("datatable_concepts").row(table_index).node();

		jQuery(row).addClass('concept-list-select-tr');
		jQuery(row).find('.dataparent').addClass('list_selected_concept');

		if (table_index >= appManager.data_manager.getData("important_concepts_count").data_value) {
			var icon = jQuery('<i class="fa fa-arrow-right list-select-arrow" aria-hidden="true"></i>');
			if (jQuery(row).find('.fa-arrow-right').length == 0) {
				jQuery(row).find('.dataspan').prepend(icon);
			}
		}

	}

	/**
	 * Ummarks a row in the concept datatable according to a table index
	 * @param  {Int} table_index index of the selected entry in the data table to be unmarked
	 *
	 */
	deSelectTableEntry(table_index) {

		var row = appManager.data_manager.getDataTable("datatable_concepts").row(table_index).node();

		jQuery(row).removeClass('concept-list-select-tr');
		jQuery(row).find('.list_selected_concept').removeClass('list_selected_concept');

		if (table_index >= appManager.data_manager.getData("important_concepts_count").data_value) {
			jQuery(row).find('.list-select-arrow').remove();
		}

	}
	populate_concept_span() {
		var url = new URL(window.location.href);
		appManager.data_manager.url_concept_id = url.searchParams.get("concept");
		if (appManager.data_manager.url_concept_id) {
			var already_submited = false;
			for (var key in appManager.data_manager.submitedAnswers_indexed) {
				var obj = appManager.data_manager.submitedAnswers_indexed[key];

				if (obj['concept_id'] == appManager.data_manager.url_concept_id) {
					already_submited = true;
					appManager.ui_controller.concept_selected = false;
					appManager.data_manager.url_concept_id = null;
					break;
				}
			}

			if (!already_submited) {
				url_choosen_concept = appManager.data_manager.getData("concepts_index_by_id").data_value[va_phase][appManager.data_manager.url_concept_id];
				jQuery('#word_span').text(url_choosen_concept.name);
				jQuery('#word_span').attr("data-id_concept", appManager.data_manager.url_concept_id);
				jQuery('#word_span').attr("data-id_concept_index", url_choosen_concept.index);
				setDynamicContent('list');
			} else {}

		}

	}

	/**
	 * Sets a timer, after which a login/register pop up will show up.
	 *
	 */
	startLoginTimer() {

		if (!jQuery('.login_popover').parent().parent().hasClass('in') && !jQuery('#register_modal').hasClass('in')) {

			setTimeout(function() {
				if (!jQuery('.modal').hasClass('in')) { showLoginPopUp(); } else {
					jQuery('.modal').one('hidden.bs.modal', function() {
						showLoginPopUp();
					})
				}

			}, 3000);
		}

		// setTimeout(function() {
		//  if(!jQuery('#register_modal').hasClass('in')){
		//    hideAllOpenModals();
		//    setTimeout(function() {
		//     openWhyRegisterModal();
		//    }, 1000);
		//  }
		// }, 2000);

	}


	buildHighScoreSelect() {

		appManager.ui_controller.setRandomTitelImage(function() {
			appManager.ui_controller.showCustomModalBackdrop();


			appManager.data_loader.getHighScoresFromDB(function() {


				jQuery('#best_user').one('click', function() {
					appManager.ui_controller.openHighScoreModal(appManager.data_manager.top_users);
					jQuery('.highscoreheadlinespan').text(appManager.data_manager.getTranslation("active_user_texts"));
					appManager.ui_controller.prevent_backdrop = true;
				}).text(appManager.data_manager.getTranslation("active_user_texts"))
				jQuery('#best_location').one('click', function() {
					appManager.ui_controller.openHighScoreModal(appManager.data_manager.top_locations);
					jQuery('.highscoreheadlinespan').text(appManager.data_manager.getTranslation("active_location_texts"));
					appManager.ui_controller.prevent_backdrop = true;
				}).text(appManager.data_manager.getTranslation("active_location_texts"))
				jQuery('#best_concept').one('click', function() {
					appManager.ui_controller.openHighScoreModal(appManager.data_manager.top_concepts);
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

		if (appManager.ui_controller.current_top_list_table != null) appManager.ui_controller.current_top_list_table.destroy();

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

		var current_highscoredata = table_data;
		appManager.data_manager.addData("current_highscoredata", current_highscoredata)
		jQuery('#highscore_select_modal').modal('hide');
		jQuery('#toplistmodal').modal();


		jQuery('#toplistmodal .obj_data').on('click', function() {
			jQuery('#toplistmodal').modal('hide');
			var g_location_id = jQuery(this).attr('id');
			var g_location = jQuery(this).text();
			appManager.map_controller.showPolygon(g_location, g_location_id, true);
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

			data: appManager.data_manager.getData("current_highscoredata").data_value,
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
		myimages = appManager.data_manager.getData("images").data_value[id];

		if (myimages.length > 0) {
			appManager.ui_controller.do_image_modal = true;
		}

		if (appManager.ui_controller.do_image_modal) {
			var c = appManager.ui_controller.buildCarousel(myimages, name);
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


	check_free_space_few_elements(num_elements, few_elements) {

		if (num_elements < 8) {
			jQuery('#location_list_modal').find('.few_elements').show();
			if (num_elements == 0) num_elements = 1;

			jQuery('#location_list_modal').find('.modal-content').css('min-height', '400px');
			jQuery('#location_list_modal').find('.modal-content').append(few_elements);
			var margin_top = 80 / num_elements;
			few_elements.css('padding', margin_top + 'px'); // margin-top
		} else {
			jQuery('#location_list_modal').find('.few_elements').hide();
		}
	}


	add_few_elements_click_listener(location_object) {
		jQuery('#location_list_modal').find('.few_elements').unbind();
		jQuery('#location_list_modal').find('.few_elements').on('click', function() {
			var current_location_id = location_object.id_geo;
			var current_location_name = location_object.ortsname;



			if (appManager.map_controller.map.getZoom() < 9) {
				var zoom_to_location = true;
			} else {
				var zoom_to_location = false;
			}

			appManager.map_controller.showPolygon(current_location_name, current_location_id, zoom_to_location);

			jQuery('#location_span').text(current_location_name);
			jQuery('#location_span').attr("data-id_location", current_location_id);
			appManager.ui_controller.location_selected = true;

			jQuery('#location_list_modal').modal('hide');
		})
	}


	check_active_concepts(dom_elements) {
		var active_phases = [];

		dom_elements.each(function() {
			active_phases.push(jQuery(this).data('va_phase'));
			//console.log(jQuery(this).data('va_phase') - 1);
		})

		return active_phases
	}

	/**
	 * Build Image Slider
	 * @param  {Array} _images  [description]
	 * @param  {Array} _caption [description]
	 * @return {String}          Div-element, containg images and their captions.
	 */
	buildCarousel(_images, _caption) {

		jQuery('#image_modal').find('#image_slider').remove();

		var result = jQuery('<div id="image_slider" class="carousel slide" data-ride="carousel">');

		if (_images.length > 1) {

			var ol = jQuery('<ol class="carousel-indicators findicators"></ol>');

			for (var i = 0; i < _images.length; i++) {

				var li = jQuery('<li data-target="#image_slider" data-slide-to="' + i + '"></li>')
				if (i == 0) li.addClass('active');
				ol.append(li);
			}

			result.append(ol);

		}

		var inner = jQuery('<div class="carousel-inner" role="listbox">');

		for (var i = 0; i < _images.length; i++) {

			var item = jQuery('<div class="carousel-item">');
			if (i == 0) item.addClass('active');
			var body = jQuery('<div class ="i_fake_body"></div>');
			var image_overlay = jQuery('<div class ="i_overlay"></div>');
			var caption = jQuery('<div class="carousel-caption first-info">' + _caption + '</div>');

			if (_images[i].image_scource.indexOf("wikipedia/commons") >= 0) {
				var source = jQuery('<div>' + "Wikipedia Commons" + '</div>'); //
				source.css({
					'background-color': 'rgba(255, 255, 255, 0.5)',
					'font-size': 10,
					'float': 'right'

				});
				item.append(source);
			}

			body.append(image_overlay);

			item.append(caption);
			item.append(body);
			item.append(source);
			inner.append(item);

			body.css({
				'background': 'url(' + _images[i].image_name + ')',
				'background-repeat': 'no-repeat',
				'background-size': "cover"
			});

		}

		result.append(inner);
		if (_images.length > 1) result.append(jQuery('<a class="left carousel-control" href="#image_slider" role="button" data-slide="prev"><span class="icon-prev" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="right carousel-control" href="#image_slider" role="button" data-slide="next"><span class="icon-next" aria-hidden="true"></span><span class="sr-only">Next</span></a>'));

		return result;
	}

	init_location_search_mode(modal) {
		appManager.ui_controller.choosing_location_mode = true;

		if (!appManager.ui_controller.location_listener_added) appManager.map_controller.add_location_search_listener();
		appManager.ui_controller.location_listener_added = true;

		jQuery('#image_modal').modal('hide');
		if (appManager.ui_controller.location_selected) {
			jQuery('#location_span').text(appManager.data_manager.getTranslation("the_word_location"));
			jQuery('#user_input').val('');
			appManager.ui_controller.setDynamicContent('list');
			//stage = 1;
			appManager.ui_controller.location_selected = false;
			appManager.ui_controller.word_entered = false;
			jQuery('.pop_submitanswer').popover('hide');
			jQuery('#submitanswer').popover('hide');

			// console.log("selected");
		}



		setTimeout(function() {
			modal.modal('hide');
			appManager.map_controller.chooseGemiendeOutsideOfAlpineConvention();
		}, 100);
		//console.log("print state");
		// printState();

	}

	/**
	 * When user changes his entry the data is then been processed and updated to the server.
	 * @param  {Int} id_auesserung [description]
	 * @param  {Int} id_concept    [description]
	 * @param  {Int} location_id   [description]
	 * @param  {String} concept       [description]
	 * @param  {Int} row_to_update [description]
	 * @return {String}               [description]
	 */
	editInputA(id_auesserung, id_concept, location_id, concept, row_to_update) {

		jQuery('.input_modal_content').html(
			appManager.ui_controller.returnChangeInput()

		);

		jQuery('#input_modal').modal({
			backdrop: 'static',
			keyboard: false
		});

		jQuery('#input_modal').one('shown.bs.modal', function(e) {
			jQuery(this).find('button').on('click', function() {

				appManager.ui_controller.updateInput(concept, id_auesserung, id_concept, location_id, row_to_update);

			});
		})

	}


	/**
	 * created html element, which will be used in editInput()
	 * @see editInput() in content_interaction.js
	 * @return {String} HTML
	 */
	returnChangeInput() {
		var output = [
			"<div id='inputWrapper'>",
			/*"Sie haben gesagt:  In " + ort + " sagt man zu " + concept + " " +  auesserung ,*/
			/* "" + translateInfoWindowText(ort, concept,auesserung, current_user) + "", */
			"" + "<div style='display:inline-block;margin-right:10px;margin-bottom:5px;'>" + appManager.data_manager.getTranslation("change_question") + "</div>",
			"<div style='display:inline-block;width:100%'><input style='width:100%; margin-right:10px;display:inline-block;' id='userAuesserungInput' type='text'/></div>",
			"<div style='display:block;margin-top:10px;'><button style='display:inline-block;margin-right:10px;padding:5px;' class='btn btn-primary' id='updateAuesserung' type='button'>" + appManager.data_manager.getTranslation("change_input") + "</button>",
			"</div>", /*"<button style='display:inline-block;padding:5px;' class='btn btn-primary ' data-concept_id=\"" + id_concept + "\" data-todelete=\"" + id_auesserung + "\"  data-ort= \"" + ort + "\" type='button' id='deleteAuesserung' type='button' onclick='deleteInput()'>" + delete_input[current_language] + "</button>*/

			"</div>"
		].join("");


		// onclick='updateInput()'

		return output;
	}


	/**
	 * Updated user's answer(Used by editInputA()).
	 * @see editInputA() in generateMap.js
	 * @param  {String} concept       Concept name
	 * @param  {Integer} id_auesserung Id of the submited answer
	 * @param  {Integer} concept_id    Concept Id
	 * @param  {Integer} id_location   Location Id
	 * @param  {Integer} row_to_update The row number from the data table that will be updated
	 *
	 */
	updateInput(concept, id_auesserung, concept_id, id_location, row_to_update) {

		var new_auesserung = jQuery('#userAuesserungInput').val();

		var stop = false;

		for (var key in appManager.data_manager.submitedAnswers_indexed) {
			var oldanswer = appManager.data_manager.submitedAnswers_indexed[key].user_input;
			if (oldanswer == new_auesserung) stop = true;

		}


		if (new_auesserung.localeCompare("") != 0 && !stop) {

			if (row_to_update) {
				row_to_update.find('td:nth-child(2)').first().text("\"" + new_auesserung + "\"");
			}

			appManager.data_manager.updateAnswers_indexed(id_auesserung, new_auesserung, id_location);

			jQuery.ajax({
				url: ajax_object.ajax_url,
				type: 'POST',
				data: {
					action: 'updateAuesserung',
					id_auesserung: id_auesserung,
					new_auesserung: new_auesserung
				},
				success: function(response) {

					if (appManager.map_controller.info_window_answer_change) {
						jQuery("#i_span_1").text('"' + new_auesserung + '"');
					}
					appManager.map_controller.info_window_answer_change = false;
				}
			});

			jQuery('#input_modal').modal('hide');

		} else {
			appManager.ui_controller.markInputRed(jQuery('#userAuesserungInput'));
		}
	}

	/**
	 * Sends an Ajax call to delete answer from the server.
	 * @param  {Integer} id_auesserung Submited answer Id
	 * @param  {String} ort           Location name
	 * @param  {Integer} concept_id    Concept Id
	 * @param  {Integer} location_id   Location Id
	 *
	 */
	deleteInput(id_auesserung, ort, concept_id, location_id) {

		appManager.data_manager.deleteFromAnswers_indexed(id_auesserung, location_id);
		appManager.map_controller.change_marker(location_markers[location_id], -1, "green");

		num_of_answers_by_id[concept_id]--;
		if (num_of_answers_by_id[concept_id] == 0) {
			appManager.data_manager.deleteFromConceptTable(concept_id);
		} else {
			appManager.data_manager.checkTableEntry(concept_id);
		}

		jQuery.ajax({
			url: ajax_object.ajax_url,
			type: 'POST',
			data: {
				action: 'deleteAuesserung',
				id_auesserung: id_auesserung,
				ort: ort,
				gemeinde_id: location_id,
				current_user: current_user
			},
			success: function(response) {
				/*If informant was deleted from db and has no other submited answers, delete cookie and current_user*/
				var user_deleted = JSON.parse(response);
				if (user_deleted && isEmpty(appManager.data_manager.submitedAnswers_indexed) && !userLoggedIn) {
					appManager.data_loader.eraseCookie("crowder_id");
					current_user = null;
				}
			}
		});

		if (old_feature != null && ort.localeCompare(old_feature['location']) == 0) {
			appManager.map_controller.change_feature_style(old_feature, check_user_aesserungen_in_location(ort));
		}
	}

	/**
	 * Marks the input field red if user tries to submit the same answer or an empty field, when changing his answer.
	 * @param  {String} input [description]
	 *
	 */
	markInputRed(input) {
		/*input field turns red for 1 sec*/
		input.css('border-color', 'red'); //.addClass( "myClass yourClass" );
		input.css('background-color', 'rgb(224, 143, 143)');
		setTimeout(function() {
			input.css('border-color', 'white');
			input.css('background-color', 'white');
		}, 1000);
		/*   jQuery('#editInput_modal').modal({
		                 keyboard: true
		    });
		  jQuery('.editInput_modal_content').html("<div>" + field_not_full[current_language] + "</div>");*/

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
		jQuery(".button_select_files").text(appManager.data_manager.getTranslation("drop_file_text"))
	}

	unhighlight(e) {
		dropArea.classList.remove('highlight')
		jQuery(".button_select_files").text(appManager.data_manager.getTranslation("upload_text"))

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
		appManager.ui_controller.uploading = true;
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
				appManager.ui_controller.uploading = false;
				setTimeout(function() {
					thanks_div.fadeOut(
						function() {
							jQuery('#upload_image_modal').modal('hide');
							jQuery(this).remove();
						});
				}, 1000);
			},
			error: function(data) {

				appManager.ui_controller.uploading = false;
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