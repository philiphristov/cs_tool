<?php

/*
Plugin Name: Plugin-Crowdsourcing - VerbaAlpina
Description: Crowdsourcing Plugin - svn
Version: 0.1
Author: ITG
Author URI: http://itg.uni-muenchen.de
*/
/*Needed for old version*/
/*
include('old/va_crowdsourcing-lib.php');
include ('old/va_render_admin_menu.php');
include ('old/handle_ajax.php');
include ('old/va_add_crowder_registration.php');

register_activation_hook( __FILE__, 'add_roles_on_plugin_activation' );
function add_roles_on_plugin_activation(){
	add_role( 'crowder_role', 'Crowder', array( 'read' => true, 'level_0' => true ) );
}

register_activation_hook( __FILE__, 'add_crowdCapabilities' );
function add_crowdCapabilities(){
	$roleCrowder = get_role('crowder_role');
	$roleAdmin = get_role('administrator');
	
	$roleCrowder->add_cap('can-contribute-crowdsourcing');
	$roleAdmin->add_cap('can-contribute-crowdsourcing');
}
*/



/*Files for newversion below*/
	include('va_gui.php');
	include('va_crowdsourcing-lib.php');
	include('handle_ajax.php');
