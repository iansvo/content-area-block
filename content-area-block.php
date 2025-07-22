<?php
/**
 * Plugin Name:       Content Area Block
 * Description:       Add an outlet for blocks in a template that stores block data in a meta field.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Ian Svoboda
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       content-area-block
 *
 * @package ContentAreaBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_content_block_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'create_block_content_block_block_init' );

add_action( 'init', function() {
	
	$register_default_meta = apply_filters( 'content_area_block_register_default_meta', true );
	
	if ( ! $register_default_meta ) {
		return;
	}
	
	register_post_meta(
		'', // Empty string = all post types.
		'extra_content_area',
		array(
			'type'         => 'string',
			'single'       => true,
			'label'        => __( 'Extra Content Area', 'content-area-block' ),
			'show_in_rest' => array(
				'schema' => array(
					'type'    => 'string',
					'context' => array( 'edit' ),
				),
			),
			'auth_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
		)
	);
} );

