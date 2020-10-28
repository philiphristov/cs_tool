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

    /**
     * States and Variables
     */
    this.modals_initialized = false
    this.dialect_modal_initialized = false
    this.concepts_modal_initialized = false
    this.current_language = 0
    this.selected_dialect
    this.va_phase
    this.active_va_phases
    this.submitedAnswers_indexed = new Object()
    this.current_concept_index = -1
    this.saved_location_index
    this.current_dialect_index
    this.url_concept_id
    this.session_answer_count
    this.unanswered_concepts = new Object()

    this.top_concepts
    this.top_users
    this.top_locations
  }

  test() {
    console.log("working")
  }

  addData(key_data, new_data) {
    this.data_list[key_data] = new DataList(key_data, new_data)
  }

  getData(key_data) {
    var data_to_return
    if (this.data_list[key_data]) {
      data_to_return = this.data_list[key_data]
    } else {
      data_to_return = false
    }
    return data_to_return
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

  getTranslation(key, single_element = true, array_elements = false, index = 0) {
    try {
      if (single_element) {
        return this.translations[key][appManager.data_manager.current_language]
      } else if (array_elements) {
        return this.translations[key]
      } else {
        return this.translations[key][index]
      }

    } catch (e) {
      console.log(e)
      console.log(key)
    }

  }

  /**
   * Saves user data in global variables.
   * @param  {Object} obj [description]
   *
   */
  declare_user_data(obj) {
    var userLoggedIn = obj.userLoggedIn;
    if (userLoggedIn) {
      var language_is_set = obj.language_is_set;
      var anonymousCrowder = false;
      var current_user = obj.current_user;
      var crowder_lang = obj.crowder_lang;
      var user_email = obj.user_email;
      appManager.data_manager.selected_dialect = obj.crowder_dialect;
      var current_user_age = obj.crowder_age;
    } else {
      var language_is_set = obj.language_is_set;
      var anonymousCrowder = true;
      var current_user = obj.current_user;
      var crowder_lang = obj.crowder_lang; //null;
      appManager.data_manager.selected_dialect = obj.crowder_dialect;
    }
    console.log("CUrrent lang " + crowder_lang)
    //console.log(obj);

    if (crowder_lang) {
      crowder_lang = 0
    }

    appManager.data_manager.user_data = obj
    appManager.data_manager.current_language = crowder_lang
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
      var filtered_name = appManager.data_manager.replaceSpecialChars(name);

      if (filtered_name != name) {
        filtered_name += " " + name;
      } else {
        filtered_name = name;
      }

      if (origin == 'concept' && i < appManager.data_manager.getData("important_concepts_count").data_value) {
        res.column1.html = '<div class="va_phase_hidden">' + filtered_name + ' va_phase=' + in_data[i].va_phase + ' </div><div  title="' + name + '" class="dataparent"><span class="dataspan"><i title="' + appManager.data_manager.getTranslation("important_concepts_texts") + '" class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + in_data[i].name + '</span>' + wiki_el + '</div>';
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

    jQuery('body').addClass('modal_init');

    jQuery('#dialect_modal').removeClass('fade');

    var bavaria_version = false;
    if (jQuery('body').hasClass('bavaria_version')) bavaria_version = true;

    var id;
    var scrollY;
    var emptyTable;


    id = "#dialect_modal_table";
    scrollY = "76vh";
    emptyTable = appManager.data_manager.getTranslation("no_results_data_table");


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

          var suggest_button = jQuery('<div class="list_modal_button_in_search suggest_dialect"><i class="fa fa-plus" aria-hidden="true"></i> <span id="suggest_dialect_span">' + appManager.data_manager.getTranslation("suggest_dialect_texts") + '</span></div>');
          buttonparent.append(suggest_button);


          suggest_button.on('click', function() {

            jQuery('.input_modal_content').empty();
            var suggest_headline = jQuery('<div class="suggest_headline">' + appManager.data_manager.getTranslation("suggest_dialect_texts") + ':</div>');
            var suggest_field = jQuery('<input class="suggest_field"></input>');
            var suggest_button_submit = jQuery('<div id="suggest_dialect" class="suggest_button_submit suggest_btn">' + appManager.data_manager.getTranslation("submit_texts") + '</div>');
            var feedback_div = jQuery('<div class="feedback_suggest">' + appManager.data_manager.getTranslation("feedback_texts") + '</div>');
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
                  var suggest_headline = jQuery('<div class="suggest_headline dont-break-out">' + appManager.data_manager.getTranslation("selected_dialect_texts") + ": <em>" + choosen_dialect + '</em></div>');
                  var suggest_button_submit = jQuery('<div id="choose_dialect" class="suggest_button_submit suggest_btn green_button"><i class="fa fa-check" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("submit_dialect_texts") + '</div><div id= "regect_btn" class="suggest_button_submit suggest_btn red_button"><i class="fa fa-times" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("abort_dialect_texts") + '</div>');
                  var feedback_div = jQuery('<div class="feedback_suggest">' + appManager.data_manager.getTranslation("feedback_texts") + '</div>');
                  jQuery('.input_modal_content').append(suggest_headline).append(suggest_button_submit);

                  /*not sure*/
                  jQuery("#regect_btn").on('click', function() {
                    jQuery('.input_modal_content').empty();
                    jQuery('#input_modal').modal('hide');
                  })
                  jQuery('#input_modal').modal();

                  /*yes, sure*/
                  jQuery("#choose_dialect").one('click', function() {

                    if (url_dialect_cluster) {
                      dialect_cluster = url_dialect_cluster
                    } else {
                      dialect_cluster = "ak"
                    }

                    /*handle suggest dialect ajax call*/
                    jQuery.ajax({
                      url: ajax_object.ajax_url,
                      type: 'POST',
                      data: {
                        action: 'suggest_dialect',
                        dialect: choosen_dialect,
                        dialect_cluster: dialect_cluster
                      },
                      success: function(response) {
                        var new_dialect = JSON.parse(response);
                        var new_dialect_name = new_dialect.dialect;
                        var new_dialect_id = new_dialect.id;


                        var new_dialect_added = new_dialect.new_dialect;

                        setTimeout(function() {

                          /**
                           * adding new dialect to datatable
                           */
                          if (new_dialect_added) {
                            console.log("NEW DIALECT")


                            /*remove choosen marker for previous selected dialect */
                            if (appManager.data_manager.current_dialect_index != -1) {
                              var row = table.row(appManager.data_manager.current_dialect_index).node();
                              jQuery(row).removeClass('green_row');
                              jQuery(row).find('.fa-check').remove();
                            }


                            appManager.data_manager.selected_dialect = choosen_dialect;

                            jQuery("#user_dialect").text(appManager.data_manager.selected_dialect);
                            jQuery('#input_modal').modal('hide');
                            jQuery('.input_modal_content').empty();

                            var data_to_add = '<div title="' + appManager.data_manager.selected_dialect + '" class="dataparent"><span title="' + appManager.data_manager.selected_dialect + '" class="dataspan">' + appManager.data_manager.selected_dialect + '</span></div>';
                            table.row.add({ name: appManager.data_manager.selected_dialect, id: new_dialect_id, column1: { filtered_name: appManager.data_manager.selected_dialect, html: data_to_add } }).draw();
                            dialect_array.push({ id_dialect: new_dialect_id, name: new_dialect_name });


                            if (appManager.map_controller.info_window_dialect_change) {

                              jQuery("#dialect_infowindow").text(appManager.data_manager.selected_dialect);
                              var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


                              /*TODO ajax call here for dialect changing of an answer*/
                              jQuery.ajax({
                                url: ajax_object.ajax_url,
                                type: 'POST',
                                data: {
                                  action: 'update_dialect_for_submited_answer',
                                  id_aeusserung: id_submited_answer,
                                  dialect: appManager.data_manager.selected_dialect,
                                  id_dialect: new_dialect_id
                                },
                                success: function(response) {

                                }

                              });

                              appManager.map_controller.info_window_dialect_change = false;



                              setTimeout(function() {
                                modal.modal('hide');
                                jQuery("custom_modal_backdrop").hide();
                              }, 220);

                            } else {

                              appManager.data_manager.selected_dialect = choosen_dialect;

                              jQuery("#dialekt_span").text(appManager.data_manager.getTranslation("lang_dialect_abbreviation") + " : " + appManager.data_manager.selected_dialect);
                              jQuery('#input_modal').modal('hide');
                              jQuery('.input_modal_content').empty();

                              setTimeout(function() { modal.modal('hide'); }, 220);


                            }

                            /*mark new dialect as selected*/
                            appManager.data_manager.current_dialect_index = appManager.data_manager.get_dialect_index(appManager.data_manager.selected_dialect, table); //datatable_dialects.rows().data().length - 1;
                            var row = table.row(appManager.data_manager.current_dialect_index).node();
                            jQuery(row).addClass('green_row');
                            var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
                            jQuery(row).find('.dataspan').prepend(icon);

                            /**
                             * select existing dialect in datatable
                             */
                          } else {
                            console.log("Existing DIALECT")

                            appManager.data_manager.selected_dialect = choosen_dialect;


                            /*remove choosen marker for previous selected dialect */
                            if (appManager.data_manager.current_dialect_index != -1) {
                              var row = table.row(appManager.data_manager.current_dialect_index).node();
                              jQuery(row).removeClass('green_row');
                              jQuery(row).find('.fa-check').remove();
                            }

                            /*mark new dialect as selected*/
                            appManager.data_manager.current_dialect_index = appManager.data_manager.get_dialect_index(appManager.data_manager.selected_dialect, table); //datatable_dialects.rows().data().length - 1;
                            var row = table.row(appManager.data_manager.current_dialect_index).node();
                            jQuery(row).addClass('green_row');
                            var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
                            jQuery(row).find('.dataspan').prepend(icon);

                            jQuery("#dialekt_span").text(appManager.data_manager.getTranslation("lang_dialect_abbreviation") + " : " + appManager.data_manager.selected_dialect);
                            jQuery('#input_modal').modal('hide');
                            jQuery('.input_modal_content').empty();

                            jQuery("#user_dialect").text(appManager.data_manager.selected_dialect.toLowerCase());

                            setTimeout(function() {
                              jQuery('#input_modal').modal('hide');
                              jQuery('.input_modal_content').empty();
                              modal.modal('hide');
                              jQuery("custom_modal_backdrop").hide();
                            }, 220);

                          }

                          if (appManager.data_manager.user_data.userLoggedIn) {
                            appManager.data_loader.save_user_dialect(appManager.data_manager.user_data.current_user);
                          }

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
            if (appManager.data_manager.current_dialect_index != index) {

              var row = table.row(index).node();
              jQuery(row).addClass('green_row');
              var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
              jQuery(row).find('.dataspan').prepend(icon);

            }

            //for unsetting green on pervious selection

            if (appManager.data_manager.current_dialect_index != -1 && appManager.data_manager.current_dialect_index != index) {

              var row = table.row(appManager.data_manager.current_dialect_index).node();
              jQuery(row).removeClass('green_row');
              jQuery(row).find('.fa-check').remove();
            }

            appManager.data_manager.current_dialect_index = index;

            jQuery("#dialekt_span").text(appManager.data_manager.getTranslation("lang_dialect_abbreviation") + " : " + name);
            appManager.data_manager.selected_dialect = name;
            //console.log(jQuery("#welcome_modal").data('bs.modal')._isShown);

            if (appManager.data_manager.user_data.userLoggedIn) {
              appManager.data_loader.save_user_dialect(appManager.data_manager.user_data.current_user);
            }

            if (appManager.map_controller.info_window_dialect_change) {

              jQuery("#dialect_infowindow").text(appManager.data_manager.selected_dialect);
              var id_submited_answer = jQuery("#dialect_infowindow").data("submited-answer");


              /*TODO ajax call here for dialect changing of an answer*/
              jQuery.ajax({
                url: ajax_object.ajax_url,
                type: 'POST',
                data: {
                  action: 'upate_dialect_submited_answer',
                  id_aeusserung: id_submited_answer,
                  dialect: appManager.data_manager.selected_dialect,
                  id_dialect: table.row(this).data().id
                },
                success: function(response) {

                }

              });

              appManager.map_controller.info_window_dialect_change = false;
            }

            jQuery("#user_dialect").text(appManager.data_manager.selected_dialect);

            setTimeout(function() {
              modal.modal('hide');
              jQuery("custom_modal_backdrop").hide();
            }, 220); //delay to show select effect
          }

        });
        // appManager.data_manager.dialect_modal_initialized = true;

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
    if (appManager.data_manager.selected_dialect) {
      appManager.data_manager.current_dialect_index = appManager.data_manager.get_dialect_index(appManager.data_manager.selected_dialect, table);

      var row = table.row(appManager.data_manager.current_dialect_index).node();
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

        if (!appManager.data_manager.modals_initialized && origin == "concept") {

          buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
          jQuery('#concept_modal_table_filter').after(buttonparent);

          var random_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-random" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("random_texts") + '</div>');
          buttonparent.append(random_button);

          /*button for choosing random concept*/
          random_button.on('click', function() {

            if (!prevent_randomclick) {
              do_image_modal = false;
              prevent_randomclick = true;
              if (jQuery('#concepts_modal').find('input').val() != "") appManager.data_manager.getDataTable("datatable_concepts").search('').columns().search('').draw();
              var rnd_idx = getRandomUnAnsweredConceptIndex();

              if (rnd_idx > 0) {

                appManager.data_manager.getDataTable("datatable_concepts").row(rnd_idx).scrollTo();
                // deSelectTableEntry(appManager.data_manager.current_concept_index[va_phase]);
                appManager.ui_controller.deSelectTableEntry(appManager.data_manager.current_concept_index);
                appManager.ui_controller.selectTableEntry(rnd_idx);
                // appManager.data_manager.current_concept_index[va_phase] = rnd_idx;
                appManager.data_manager.current_concept_index = rnd_idx;

                var name = concepts_cur_lang[rnd_idx].name;
                appManager.ui_controller.concept_selected = true;
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
          if (!appManager.data_manager.user_data.userLoggedIn) suggest_button.addClass('disabled_feature');

          suggest_button.on('click', function() {
            if (!appManager.data_manager.user_data.userLoggedIn) {
              appManager.ui_controller.prevent_backdrop = true;
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
                  appManager.ui_controller.markInputRed(suggest_field);
                } else {
                  appManager.data_loader.sendSuggestEmail(suggest_field.val(), function() {
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
                appManager.data_manager.current_concept_index = -1;
                if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').hasClass('active')) {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').removeClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-check-square').addClass('fa-square');
                } else {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_1').addClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_1").find('i').removeClass('fa-square').addClass('fa-check-square');
                  appManager.data_manager.va_phase = 1;
                }
                break;
              case 2:
                appManager.data_manager.current_concept_index = -1;
                if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').hasClass('active')) {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').removeClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-check-square').addClass('fa-square');
                } else {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_2').addClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_2").find('i').removeClass('fa-square').addClass('fa-check-square');
                  appManager.data_manager.va_phase = 2;
                }
                break;
              case 3:
                appManager.data_manager.current_concept_index = -1;
                if (jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').hasClass('active')) {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').removeClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-check-square').addClass('fa-square');
                } else {
                  jQuery("#va_phase_wrapper_concept_list").find('.va_phase_3').addClass('active');
                  jQuery(".list_modal_button_va_phase.va_phase_3").find('i').removeClass('fa-square').addClass('fa-check-square');
                  appManager.data_manager.va_phase = 3;
                }
                break;
            }



            appManager.data_manager.active_va_phases = appManager.ui_controller.check_active_concepts(jQuery('#va_phase_wrapper_concept_list').find('.active'));

            /**
             * filter displayed concepts using hiddenhtml elment in the rows for the va_phase
             */
            if (appManager.data_manager.active_va_phases.length > 0) {
              var regexFromMyArray = '.*va_phase=(' + appManager.data_manager.active_va_phases.join("|") + ').*'

            } else {
              var regexFromMyArray = '.*va_phase=(0).*'

            }

            table.columns().search(regexFromMyArray, true).draw();


            if (appManager.data_manager.current_concept_index != -1 && jQuery('#va_phase_wrapper_concept_list').find('.va_phase_' + va_phase).hasClass("active")) {
              appManager.data_manager.getDataTable("datatable_concepts").row(appManager.data_manager.current_concept_index).scrollTo();
              appManager.ui_controller.selectTableEntry(appManager.data_manager.current_concept_index);
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

              appManager.ui_controller.concept_selected = true;
              var id = row_data.concept_id; //concepts_cur_lang[index].id;

              // if (appManager.data_manager.current_concept_index[va_phase] != -1) deSelectTableEntry(appManager.data_manager.current_concept_index[va_phase]);
              if (appManager.data_manager.current_concept_index != -1) appManager.ui_controller.deSelectTableEntry(appManager.data_manager.current_concept_index);

              appManager.ui_controller.selectTableEntry(index);


              // appManager.data_manager.current_concept_index[va_phase] = index;
              appManager.data_manager.current_concept_index = index;


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




        if (!appManager.data_manager.modals_initialized) {

          setTimeout(function() {
            modal.modal('hide');
          }, 1); //for closing modal on init

          appManager.data_manager.concepts_modal_initialized = true;

          if (appManager.data_manager.locations_modal_modals_initialized && appManager.data_manager.concepts_modal_initialized) {
            appManager.data_manager.modals_initialized = true;

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

        if (!appManager.data_manager.modals_initialized && origin == "location") {

          buttonparent = jQuery('<div class="list_modal_button_parent"></div>');
          jQuery('#location_modal_table_filter').after(buttonparent);

          var search_location_button = jQuery('<div class="list_modal_button_in_search"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + appManager.data_manager.getTranslation("search_map_location") + '</div>');
          buttonparent.append(search_location_button);


          search_location_button.on('click', function() {
            appManager.ui_controller.init_location_search_mode(modal);
          });

        }



        modal.find('tbody').on('click', 'tr', function() {
          /*prevents error if user clicks on an empty data table*/
          if (table.page.info().recordsDisplay !== 0) {

            var index = table.row(this).index()



            if (origin == "concept") {

            } else {
              appManager.ui_controller.location_selected = true;
              if (appManager.data_manager.url_concept_id) {
                appManager.ui_controller.concept_selected = true;
              }

              var name = appManager.data_manager.getData("locations").data_value[index].name;
              var id = appManager.data_manager.getData("locations").data_value[index].id;

              if (appManager.data_manager.saved_location_index != index) {

                var row = table.row(index).node();
                jQuery(row).addClass('green_row');
                var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');
                jQuery(row).find('.dataspan').prepend(icon);

              }

              //for unsetting green on pervious selection

              if (appManager.data_manager.saved_location_index != -1 && appManager.data_manager.saved_location_index != index) {

                var row = table.row(appManager.data_manager.saved_location_index).node();
                jQuery(row).removeClass('green_row');
                jQuery(row).find('.fa-check').remove();
              }

              appManager.data_manager.saved_location_index = index;
              // saved_location_name = name;


              jQuery('#custom_modal_backdrop').fadeOut(function() { jQuery(this).remove() });
              jQuery('#location_span').text(name);
              jQuery('#location_span').attr("data-id_location", id);
              appManager.ui_controller.setDynamicContent('list'); // for offset since hight of left menu could change

              /*Show Gemeinde Grenzen*/

              jQuery('#image_modal').modal('hide');
              var g_location = name;
              var g_location_id = id;

              var index = appManager.data_manager.contains(appManager.data_manager.getData("existingLocations").data_value, g_location_id);

              appManager.data_loader.get_display_polygon(g_location, g_location_id, true);
              appManager.map_controller.remove_location_search_listener();
              /*END*/
            }

            setTimeout(function() { modal.modal('hide'); }, 220); //delay to show select effect
          } else if (origin == "location" /*&& !choosing_location_mode*/ ) { /*when the location dataTable is empty - let user choose a Gemeinde*/
            appManager.ui_controller.init_location_search_mode(modal);

          }

        });
        if (!appManager.data_manager.modals_initialized) {



          setTimeout(function() { modal.modal('hide'); }, 1); //for closing modal on init

          appManager.data_manager.locations_modal_modals_initialized = true;


          if (appManager.data_manager.locations_modal_modals_initialized && appManager.data_manager.concepts_modal_initialized) {
            appManager.data_manager.modals_initialized = true;

            if (appManager.data_manager.user_data.language_is_set) jQuery('#welcomeback_modal').modal('hide');
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

    var va_phase = 1;
    //datatable_concepts = createListModal(jQuery('#concepts_modal'),filtered_data_phase1,"concept"); //  concept_data
    var datatable_concepts = appManager.data_manager.createConceptsListModal(jQuery('#concepts_modal'), appManager.data_manager.getData("concept_data").data_value, "concept");
    appManager.data_manager.addDataTable("datatable_concepts", datatable_concepts)

    //bugfix for scrollerplugin (resize not working properly)
    var modal = jQuery(this);
    var oldheight = modal.find('.dataTables_scroll').height();

    modal.find('input').on('input', function() {
      var height = modal.find('.dataTables_scroll').height()
      if (oldheight != height) {
        appManager.data_manager.getDataTable("datatable_concepts").scroller.measure();
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

    var datatable_locations = appManager.data_manager.createLocationListModal(jQuery('#locations_modal'), appManager.data_manager.getData("location_data").data_value, "location");
    appManager.data_manager.addDataTable("datatable_locations", datatable_locations)

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




  checkEnteredConcepts() {
    for (var i = 0; i < submitedAnswers.length; i++) {
      appManager.data_manager.checkTableEntry(submitedAnswers[i].concept_id);
    }

  }

  /**
   * [checkEnteredConcepts_indexed description]
   *
   */
  checkEnteredConcepts_indexed() {
    for (var key in appManager.data_manager.submitedAnswers_indexed) {
      if (appManager.data_manager.submitedAnswers_indexed.hasOwnProperty(key)) {
        appManager.data_manager.checkTableEntry(appManager.data_manager.submitedAnswers_indexed[key].concept_id);
      }
    }
  }


  createUnansweredIndex() {


    var c_phase1_idx = [];
    var c_phase2_idx = [];
    var c_phase3_idx = [];

    var answers_by_concept_index = {};

    for (var key in appManager.data_manager.submitedAnswers_indexed) {
      var sub = appManager.data_manager.submitedAnswers_indexed[key];
      answers_by_concept_index[sub.concept_id] = sub;
    };

    var concepts_cur_lang = appManager.data_manager.getData("concepts_cur_lang")
    for (var key in concepts_cur_lang) {
      var concept = concepts_cur_lang[key];
      if (concept.va_phase == 1 && answers_by_concept_index[concept['id']] == null) c_phase1_idx.push(appManager.data_manager.getData("concepts_index_by_id").data_value[concept['id']]);
      else if (concept.va_phase == 2 && answers_by_concept_index[concept['id']] == null) c_phase2_idx.push(appManager.data_manager.getData("concepts_index_by_id").data_value[concept['id']]);
      else if (concept.va_phase == 3 && answers_by_concept_index[concept['id']] == null) c_phase3_idx.push(appManager.data_manager.getData("concepts_index_by_id").data_value[concept['id']]);
    }

    return [c_phase1_idx, c_phase2_idx, c_phase3_idx];

  }


  getRandomUnAnsweredConceptIndex() {


    var active_concepts = [];

    for (var i = 0; i < appManager.data_manager.active_va_phases.length; i++) {
      var active_phase = appManager.data_manager.active_va_phases[i];
      active_concepts = active_concepts.concat(this.unanswered_concepts[active_phase - 1]);
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
    if (appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[marker.location_id] != null && !appManager.data_manager.check_user_aesserungen_in_location(marker.location_name)) {
      appManager.data_manager.openLocationListModal(marker);

    } else {
      // jQuery('#custom_backdrop i').css('top','-150px');
      jQuery('#custom_backdrop').show().css('background', 'rgba(0, 0, 0, 0.8)');


      appManager.data_loader.get_submited_answers_current_location(marker.location_id, marker);
    }
  }

  createLocationListTable(table_data) {


    this.va_phase = 1;
    var searching = false;
    if (table_data.length > 10) searching = true;

    var emptyTable = appManager.data_manager.getTranslation("no_results_data_table");

    var table = jQuery('#location_list_modal').find('#location_list_table').DataTable({

      data: table_data,
      deferRender: false,
      scrollY: "75vh",
      scrollX: false,
      scrollCollapse: true,
      info: false,
      ordering: false,
      searching: searching,
      responsive: true,
      columns: [{
          "width": "45%"
        },
        {
          "width": "30%"
        },
        {
          "width": "25%"
        }
      ],
      scroller: {
        displayBuffer: 15,
      },
      language: {
        zeroRecords: emptyTable
      },
      fnInitComplete: function(settings) {
        var current_location_list_object = appManager.data_manager.getData("current_location_list_object").data_value
        var name = current_location_list_object[Object.keys(current_location_list_object)[0]].ortsname;
        var num = table_data.length; //Object.keys(current_location_list_object).length;
        var usergen = current_location_list_object[Object.keys(current_location_list_object)[0]].usergen;
        var tokenisiert = current_location_list_object[Object.keys(current_location_list_object)[0]].tokenisiert;

        var head = jQuery('<div class="location_header_parent"><div class="location_header_num">' + num + '</div><span class ="location_header">' + name + '</span></div>');

        var few_elements = jQuery('<div>').text(appManager.data_manager.getTranslation("too_few_elements")).addClass('few_elements');

        if (usergen) {
          head.find('.location_header_num').addClass('user_generated_m');
        }


        if (searching) {
          jQuery('#location_list_modal').find('#location_list_table_filter').prepend(head);
          head.css('display', 'inline-block');
          jQuery('#location_list_modal').find('#location_list_table_filter').find('input').css('min-width', 'initial');
          jQuery('#location_list_modal').find('#location_list_table_filter').find('label').css('width', 'initial').css('float', 'right').css('margin-top', '-8px');
        } else {
          jQuery('#location_list_modal').find('.custom_header').after(head);
        }

        appManager.ui_controller.check_free_space_few_elements(num, few_elements);
        appManager.ui_controller.add_few_elements_click_listener(current_location_list_object[Object.keys(current_location_list_object)[0]]);

        var animating = false;

        jQuery('#location_list_modal').find('tbody').off().on('click', 'tr', function() {

          if (!animating) {
            animating = true;

            if (jQuery(this).find('.dataparent').attr('user_data') == "true") {

              /*display element depending if the Aeusserung is tokenisiert*/
              var token = jQuery(this).find('.dataparent').attr('token');
              if (token == "0") {
                var element_to_animate = ".location_list_controls";
              } else {
                var element_to_animate = ".tokenisiert";
              }

              if (jQuery(this).find(element_to_animate).css('right') == "-170px") {
                jQuery(this).find(element_to_animate).show().animate({
                  right: ["0", "swing"]
                }, 450, function() {
                  jQuery(this).css('right', '0px');
                  animating = false;
                });
              } else {
                jQuery(this).find(element_to_animate).animate({
                  right: ["-170", "swing"]
                }, 450, function() {
                  jQuery(this).hide().css('right', '-170px');
                  animating = false;
                });
              }

              var clicked_index = table.row(this).index();


              table.rows().eq(0).each(function(index) {
                var row = table.row(index);
                var jrow = jQuery(row.node());
                if (clicked_index != index && (jrow.find(element_to_animate).css('right') == "0px")) {

                  jrow.find(element_to_animate).animate({
                    right: ["-170", "swing"]
                  }, 450, function() {
                    jrow.find(element_to_animate).hide().css('right', '-170px');
                  });
                }
              });
            } else {
              var id = parseInt(jQuery(this).find('.dataparent').attr('con_id'));
              var name = jQuery(this).find('.dataparent').attr('title');
              appManager.ui_controller.setQ(name, id);
              jQuery('#location_list_modal').modal('hide');
            }
          }
        })

        /*add Buttons Alm/Nature Submited Answers*/
        /*location_aeusserungen*/
        var buttonparent = jQuery('.location_header_parent');
        var alm = jQuery('<div class="list_modal_button_va_phase va_phase_1 active noselect"  data-va_phase = "1"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_agriculture") + '</div>'); //width:50%; 'Almwirtschaft'
        var natur = jQuery('<div class="list_modal_button_va_phase va_phase_2 active noselect"   data-va_phase = "2"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_nature") + '</div>'); //width:50%; 'Natur'
        var modern = jQuery('<div class="list_modal_button_va_phase va_phase_3 active noselect"   data-va_phase = "3"><i class="far fa-check-square"></i>' + appManager.data_manager.getTranslation("alpine_modern") + '</div>'); //width:50%; 'Modern'

        jQuery("#va_phase_wrapper_location_list").remove();
        var va_phase_wrapper = jQuery('<div id="va_phase_wrapper_location_list" class="va_phase_wrapper"></div>');

        va_phase_wrapper.append(alm);
        va_phase_wrapper.append(natur);
        va_phase_wrapper.append(modern);

        jQuery('#location_list_modal').children().find('.modal-content').append(va_phase_wrapper);

        //jQuery('.va_phase_1').css('opacity', 1.0);

        jQuery("#va_phase_wrapper_location_list").find('.list_modal_button_va_phase').on('click', function() {

          var selected_va_phase = jQuery(this).data('va_phase');

          //CHECKBOX-like functionality
          switch (selected_va_phase) {
            case 1:
              if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').hasClass('active')) {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').removeClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_1").find('i').removeClass('fa-check-square').addClass('fa-square');

              } else {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_1').addClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_1").find('i').removeClass('fa-square').addClass('fa-check-square');

              }

              break;
            case 2:
              if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').hasClass('active')) {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').removeClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_2").find('i').removeClass('fa-check-square').addClass('fa-square');

              } else {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_2').addClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_2").find('i').removeClass('fa-square').addClass('fa-check-square');

              }
              break;
            case 3:
              if (jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').hasClass('active')) {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').removeClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_3").find('i').removeClass('fa-check-square').addClass('fa-square');

              } else {
                jQuery("#va_phase_wrapper_location_list").find('.va_phase_3').addClass('active');
                jQuery("#va_phase_wrapper_location_list").find(".va_phase_3").find('i').removeClass('fa-square').addClass('fa-check-square');

              }
              break;
          }

          table.clear().draw();

          var active_location_data = appManager.ui_controller.check_active_concepts(jQuery('#va_phase_wrapper_location_list').find('.active'));
          var list_elements = [];

          if (active_location_data.length > 0) {
            for (var i = 0; i < active_location_data.length; i++) {
              table.rows.add(appManager.data_manager.getData("filtered_location_submited_data_phases").data_value[active_location_data[i] - 1]);
              appManager.data_manager.getData("filtered_location_submited_data_phases").data_value[active_location_data[i] - 1].map(function(el) {
                list_elements.push(el);
              })
            }
          } else {
            // list_elements = [].concat.apply([], filtered_location_submited_data_phases);
            // table.rows.add(list_elements);
            list_elements = [];
            table.rows.add(list_elements);
          }

          table.columns.adjust().draw(); // Redraw the DataTable

          jQuery('.location_header_num').text(list_elements.length);
          appManager.ui_controller.check_free_space_few_elements(list_elements.length, few_elements);
          appManager.ui_controller.add_few_elements_click_listener(current_location_list_object[Object.keys(current_location_list_object)[0]]);

        });

      },
      createdRow: function(row, data, index) {

        if (jQuery(row).find('.dataparent').attr('user_data') == "false") {
          jQuery(row).addClass('other_user_row');
        } else {
          jQuery(row).addClass('this_user_row');
          jQuery(row).append(jQuery('<div class="location_list_controls"><div class="change_button_in_list rowbutton"><i class="fa fa-pencil" aria-hidden="true"></i> ' +
            appManager.data_manager.getTranslation("change_input") + '</div><div class="delete_button_in_list rowbutton"><i class="fa fa-trash-o" aria-hidden="true"></i> ' +
            appManager.data_manager.getTranslation("delete_input") + '</div></div>'));
          /*tokeniriest*/
          jQuery(row).append(jQuery('<div class="tokenisiert"><i class="fa fa-check-square-o" aria-hidden="true"></i>  ' + appManager.data_manager.getTranslation("permanently_saved") + '</div>'));

          jQuery(row).find('.change_button_in_list').on('click', function() {
            var aeusserung_id = jQuery(row).find('.dataparent').attr('ae_id');
            var cur_obj = appManager.data_manager.getData("current_location_list_object").data_value[aeusserung_id];
            var row_to_update = jQuery(row);

            appManager.ui_controller.editInputA(aeusserung_id, cur_obj.id_concept, cur_obj.id_geo, cur_obj.konzept, row_to_update);
          })

          jQuery(row).find('.delete_button_in_list').on('click', function() {
            table.row(jQuery(this).parents('tr')).remove().draw();
            table.scroller.measure();

            var aeusserung_id = jQuery(row).find('.dataparent').attr('ae_id');
            var cur_obj = appManager.data_manager.getData("current_location_list_object").data_value[aeusserung_id];

            deleteInput(aeusserung_id, cur_obj.ortsname, cur_obj.id_concept, cur_obj.id_geo);

            var remaining_num = Object.keys(appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[cur_obj.id_geo]).length
            jQuery('#location_list_modal').find('.location_header_num').text(remaining_num);

            if (check_for_current_user_entries(cur_obj.id_geo) <= 0) {
              jQuery('#location_list_modal').find('.location_header_num').removeClass('user_generated_m');
            }

            if (remaining_num == 0) {
              jQuery('#location_list_modal').modal('hide')
            }
          })

        }
      }
    })

    return table;

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

      if (appManager.data_manager.submitedAnswers_indexed[aeusserung_id] != null) {
        user_data = true;
      }

      var concept_name = cur_data.konzept;
      var author = cur_data.author;
      var word = cur_data.word;
      var concept_idx = appManager.data_loader.get_table_index_by_va_phase(cur_data.id_concept);
      var token = cur_data.tokenisiert;

      if (author.indexOf("anonymous") != -1) {
        author = appManager.data_manager.getTranslation("anonymous_texts");
      }

      data[i] = [];

      if (concept_idx < appManager.data_manager.getData("important_concepts_count").data_value) {
        data[i].push('<div ae_id="' + aeusserung_id + '" con_id="' + cur_data.id_concept + '" user_data="' + user_data +
          '" class="dataparent" title="' + concept_name +
          '" token="' + token + '"><span class="dataspan"><i title="' + appManager.data_manager.getTranslation("important_concepts_texts") +
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
      appManager.ui_controller.showCustomModalBackdrop();
    }

    var current_location_list_object = appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[marker.location_id];

    appManager.data_manager.addData("current_location_list_object", current_location_list_object)
    // find the right object from the array
    function rightOne(obj) {
      return obj.id == marker.location_id;
    }

    //the correct translation of the location
    var c_location_name = appManager.data_manager.getData("locations").data_value[appManager.data_manager.getData("locations").data_value.findIndex(rightOne)].name;
    current_location_list_object[Object.keys(current_location_list_object)[0]].ortsname = c_location_name;
    current_location_list_object[Object.keys(current_location_list_object)[0]].usergen = marker.user_marker;

    var filtered_location_submited_data_phase1 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 1));
    var filtered_location_submited_data_phase2 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 2));
    var filtered_location_submited_data_phase3 = appManager.data_manager.getLocationListTableData(appManager.data_manager.filter_array(current_location_list_object, 3));


    // FUTURE CHECK BOX FUNCTIONALITY
    var filtered_location_submited_data_phases = [];
    filtered_location_submited_data_phases.push(filtered_location_submited_data_phase1);
    filtered_location_submited_data_phases.push(filtered_location_submited_data_phase2);
    filtered_location_submited_data_phases.push(filtered_location_submited_data_phase3);

    appManager.data_manager.addData("filtered_location_submited_data_phases", filtered_location_submited_data_phases)

    var current_location_list_table_data = [].concat.apply([], filtered_location_submited_data_phases);
    appManager.data_manager.addData("current_location_list_table_data", current_location_list_table_data)
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

    this.translations["leftmenu_contents"] = [
      "#left_menu_content_ger",
      "#left_menu_content_fr",
      "#left_menu_content_ita",
      "#left_menu_content_slo"
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
   * [reMeasureDatatables description]
   *
   */
  reMeasureDatatables() {

    if (this.getDataTable("current_location_list_table") != null) {
      this.getDataTable("current_location_list_table").scroller.measure();
    }

    if (this.getDataTable("datatable_locations") != null) {
      this.getDataTable("datatable_locations").scroller.measure();
    }

    if (this.getDataTable("datatable_concepts") != null) {
      this.getDataTable("datatable_concepts").scroller.measure();
    }

    if (this.getDataTable("current_top_list_table") != null) {
      this.getDataTable("current_top_list_table").scroller.measure();
    }
  }
  /**
   * Check if user(only for not logged in users) has submited answers and delete crowder_id cookie if he has no answers.
   *
   */
  check_user_aeusserungen() {
    if (appManager.data_manager.isEmpty(appManager.data_manager.submitedAnswers_indexed) && !appManager.data_manager.user_data.userLoggedIn) {
      appManager.data_loader.eraseCookie("crowder_id");
      appManager.data_manager.user_data.current_user = null;
    }
  }

  /**
   * Checks if the user has any answers in the current location. This is used for changing the color of the location marker: blue - user has not entered a answer in the location, green - user has entered an answer in that location.
   * @param  {String} location [description]
   *
   */
  check_user_aesserungen_in_location(location) {
    var has_aeusserungen = false;

    for (var key in appManager.data_manager.submitedAnswers_indexed) {
      if (appManager.data_manager.submitedAnswers_indexed.hasOwnProperty(key)) {
        if (location.localeCompare(appManager.data_manager.submitedAnswers_indexed[key].location) == 0) {
          has_aeusserungen = true;
          break;
        }
      }
    }
    return has_aeusserungen;
  }

  check_for_entries(location_id) {
    var array_to_check = appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id];
    var entered_aeusserungen = 0;

    for (var key in array_to_check) {
      if (array_to_check.hasOwnProperty(key)) {
        entered_aeusserungen++;
      }
    }


    return entered_aeusserungen;
  }

  check_for_current_user_entries(location_id) {
    var array_to_check = appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[location_id];
    var user_entered_aeusserungen = 0;

    for (var key in array_to_check) {
      if (array_to_check.hasOwnProperty(key)) {
        if (appManager.data_manager.user_data.current_user.localeCompare(array_to_check[key].author) == 0) {
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

        if (appManager.data_manager.getData("concepts_index_by_id").data_value[answer_concept_id].va_phase == va_phase_cur) {
          if (appManager.data_manager.getData("concepts_index_by_id").data_value.hasOwnProperty(answer_concept_id)) {
            arr[key] = array_data[key];
          }
        }

      }
    }
    return arr;
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


  /**
   * Replace special characters(from different languages) to siplify the search.
   * Used to simplify searching for concept or location that have spacial characters in different languages.
   * @param  {String} _in [description]
   * @return {String}     [description]
   */
  replaceSpecialChars(_in) {


    var res = _in.replace(/[äÄáÁàÀâÂãÃåÅæÆ]/g, 'a')
      .replace(/[çÇčČ]/g, 'c')
      .replace(/[éÉèÈêÊëË]/g, 'e')
      .replace(/[íÍìÌîÎïÏîĩĨĬĭ]/g, 'i')
      .replace(/[ñÑ]/g, 'n')
      .replace(/[öÖóÓòÒôÔœŒ]/g, 'o')
      .replace(/[ßšŠ]/g, 's')
      .replace(/[úÚùÙûÛ]/g, 'u')
      .replace(/[ýÝŷŶŸÿ]/g, 'n')
      .replace(/[áÁàÀâÂãÃåÅæÆ]/g, 'a')
      .replace(/[çÇ]/g, 'c')
      .replace(/[éÉèÈêÊëË]/g, 'e')
      .replace(/[íÍìÌîÎïÏîĩĨĬĭ]/g, 'i')
      .replace(/[ñÑ]/g, 'n')
      .replace(/[óÓòÒôÔœŒ]/g, 'o')
      .replace(/[ß]/g, 's')
      .replace(/[üÜúÚùÙûÛ]/g, 'u')
      .replace(/[ýÝŷŶŸÿ]/g, 'n')
      .replace(/[Žž]/g, 'z');

    return res;

  }

  /**
   * Check if an object is empty.
   * @param  {Object}  obj [description]
   * @return {Boolean}     [description]
   */
  isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }

    return true;
  }



  /**
   * Checks if the user's answer is a dublicate(he has already entered the same answer for the same concept in that location).
   * @param  {Array}  answer [description]
   * @return {Boolean}        [description]
   */
  isDuplicate_indexed(answer) {
    //var answer = {concept: concept, user_input : input_word , location: location};
    var exists = false;

    for (var key in this.submitedAnswers_indexed) {
      if (this.submitedAnswers_indexed.hasOwnProperty(key)) {
        var cnt = this.submitedAnswers_indexed[key].concept;
        var input = this.submitedAnswers_indexed[key].user_input;
        var lct = this.submitedAnswers_indexed[key].location;
        var lct_id = this.submitedAnswers_indexed[key].location_id;

        if (input.localeCompare(answer.user_input) == 0 && lct.localeCompare(answer.location) == 0 && cnt.localeCompare(answer.concept) == 0) {
          exists = true;
          break;
        }
      }
    }

    return exists;

  }


  /**
   * check if string contains a substring
   * @param  {String} needle [description]
   *
   */
  contains(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1,
          index = -1;

        for (i = 0; i < this.length; i++) {
          var item = this[i];

          if ((findNaN && item !== item) || item === needle) {
            index = i;
            break;
          }
        }

        return index;
      };
    }

    return indexOf.call(this, needle) > -1;
  };

  /**
   * Adjust the Concept Datatables depending on Submited Answers to concepts 
   * @param  {Int} _concept_id Concept ID
   *
   */
  checkTableEntry(_concept_id) {

    var table_index_t = appManager.data_loader.get_table_index_by_va_phase(_concept_id);



    var row = appManager.data_manager.getDataTable("datatable_concepts").row(table_index_t).node();
    jQuery(row).addClass('green_row');

    var icon = jQuery('<i class="fa fa-check" aria-hidden="true"></i>');

    if (jQuery(row).find('.fa-check').length == 0) {
      jQuery(row).find('.dataspan').prepend(icon);
    }


    jQuery(row).find('.fa-exclamation-triangle').remove();

    if (jQuery(row).find('.num_of_answers').length == 0) {
      jQuery(row).find('.dataparent').append(jQuery('<div class="num_of_answers">1</div>'));
      if (jQuery(row).find(".wiki_info").length == 1) jQuery(row).find('.num_of_answers').addClass("answers_with_wiki");
    } else {
      jQuery(row).find('.num_of_answers').text(appManager.data_manager.getData("num_of_answers_by_id").data_value[parseInt(_concept_id)]);
      if (jQuery(row).find(".wiki_info").length == 1) jQuery(row).find('.num_of_answers').addClass("answers_with_wiki");
    }

  }


  /**
   * Delete user's answer from submitedAnswers_indexed and aeusserungen_by_locationindex.
   * @param  {Int} id_auesserung Submited answer Id
   * @param  {Int} id_location   Location Id
   *
   */
  deleteFromAnswers_indexed(id_auesserung, id_location) {
    delete this.submitedAnswers_indexed[id_auesserung];
    delete appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[id_location][id_auesserung];
  }



  /**
   * Update user's answer in submitedAnswers_indexed and aeusserungen_by_locationindex.
   * @param  {Int} id_auesserung Submited answer Id
   * @param  {String} input         User's Input
   * @param  {Int} id_location   Location Id
   *
   */
  updateAnswers_indexed(id_auesserung, input, id_location) {
    this.submitedAnswers_indexed[id_auesserung].user_input = input;
    appManager.data_manager.getData("aeusserungen_by_locationindex").data_value[id_location][id_auesserung].word = input;
  }


  /**
   * [deleteFromConceptTable description]
   * @param  {Int} _concept_id [description]
   *
   */
  deleteFromConceptTable(_concept_id) {

    var table_index_t = appManager.data_loader.get_table_index_by_va_phase(_concept_id); //concepts_index_by_id[va_phase][parseInt(_concept_id)].index;
    //var name  = concepts_index_by_id[va_phase][parseInt(_concept_id)].name;
    var row = datatable_concepts.row(table_index_t).node();

    jQuery(row).removeClass('green_row');
    jQuery(row).find('.num_of_answers').remove();
    jQuery(row).find('.dataspan').find('.fa-check').remove();

    if (table_index_t < important_concepts_count) {

      var icon = jQuery('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
      jQuery(row).find('.dataspan').prepend(icon);
    }
    this.unanswered_concepts[table_index_t] = concepts_cur_lang[table_index_t]; //add concept back to unanswered list;

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