<?php

/**
 * caught my eye Google Analytics for HTML5 Video Tracking
 *
 * @link              https://github.com/marklchaves/cme-ga4html5vid
 * @since             0.1.0
 * @package           Cme_ga4html5vid
 *
 * @wordpress-plugin
 * Plugin Name:       cme Google Analytics for HTML5 Video Tracking
 * Plugin URI:        https://github.com/marklchaves/ashtabula
 * Description:       Google Analytics for HTML5 Video Tracking
 * Version:           0.3.0
 * Author:            caught my eye
 * Author URI:        https://www.caughtmyeye.cc
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       cme-ga4html5vid
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

define( 'CME_GA4HTML5VID_PLUGIN_NAME', 'cme-ga4html5vid' );
define( 'CME_GA4HTML5VID_PLUGIN_VERSION', '0.3.0' );
define('USER_ID_CUSTOM_DIMENSION_INDEX', '0'); // Default to invalid CD index.

/**
 * Helper function.
 */
function cme_ga4html5vid_get_user_id() {
    $current_user = wp_get_current_user();
    if ( ! ( $current_user instanceof WP_User ) ) {
      return;
    }
    $user_ID = $current_user->ID;
    return $user_ID;
}

/**
 * Enqueue Scripts
 */

function enqueue_cme_ga4html5vid_javascript()
{	
	// Add the cme-ga4html5vid JS library to footer section.
    wp_register_script( CME_GA4HTML5VID_PLUGIN_NAME, plugin_dir_url( __FILE__ ) . 'public/js/' . CME_GA4HTML5VID_PLUGIN_NAME . '.js', '', CME_GA4HTML5VID_PLUGIN_VERSION, true ); 

    wp_enqueue_script( CME_GA4HTML5VID_PLUGIN_NAME );

    // Support user ID tracking
    $custom_dimension_index = USER_ID_CUSTOM_DIMENSION_INDEX;
    $custom_dimension_index = 
        apply_filters( 'cme_user_id_custom_dimension_index', 
                       $custom_dimension_index );
    $user_ID = cme_ga4html5vid_get_user_id();
    if (!$user_ID) return;
    $script  =  <<<EOT
let cmeGa4Html5VidUserId = $user_ID;
let cmeGa4Html5VidUserIdCdIndex = $custom_dimension_index;
EOT;

    wp_add_inline_script(CME_GA4HTML5VID_PLUGIN_NAME, $script, 'before');

    // Note: using php_vars with wp_localize_script() didn't work here.
}
add_action( 'wp_enqueue_scripts', 'enqueue_cme_ga4html5vid_javascript' );
