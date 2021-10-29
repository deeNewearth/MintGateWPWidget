<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://newearthart.tech
 * @since      1.0.0
 *
 * @package    Mintgate_Verifier
 * @subpackage Mintgate_Verifier/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Mintgate_Verifier
 * @subpackage Mintgate_Verifier/includes
 * @author     new earth art @ tech <info@newearthart.tech>
 */
class Mintgate_Verifier_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'mintgate-verifier',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
