<?php
/**
 * Frontend rendering for the block.
 *
 * @var array    $attributes         Block attributes.
 * @var string   $content            Block content.
 * @var WP_Block $block              Block instance.
 *
 * @package ContentAreaBlock
 */

namespace IanSvo\ContentAreaBlock;

static $seen_ids = array();

$block_post_id = $block->context['postId'] ?? get_the_ID();

if ( ! $block_post_id ) {
	return '';
}
if ( isset( $seen_ids[ $block_post_id ] ) ) {
	// WP_DEBUG_DISPLAY must only be honored when WP_DEBUG. This precedent
	// is set in `wp_debug_mode()`.
	$is_debug = defined( 'WP_DEBUG' ) && WP_DEBUG &&
		defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY;

	return $is_debug ?
		// translators: Visible only in the front end, this warning takes the place of a faulty block.
		__( '[block rendering halted]', 'content-area-block' ) :
		'';
}

$seen_ids[ $block_post_id ] = true;

// Check is needed for backward compatibility with third-party plugins
// that might rely on the `in_the_loop` check; calling `the_post` sets it to true.
if ( ! in_the_loop() && have_posts() ) {
	the_post();
}

$meta_key = $attributes['metaKey'] ?? '';
$content  = $meta_key ? get_post_meta( $block_post_id, $meta_key, true ) ?? $content : '';

/**
 * Filter the block's frontend output.
 *
 * @param string $parsed_content The parsed block content for output.
 * @param array  $attributes     The block attributes.
 * @param string $content        The original unparsed block content.
 * @param object $block          The current parsed block object.
 *
 * @return The block content for output on the frontend.
 */
$output = apply_filters( 
	'iansvo/content_area_block_content', 
	do_blocks( str_replace( ']]>', ']]&gt;', $content ) ), 
	$block_post_id, 
	$attributes, 
	$content, 
	$block 
);
unset( $seen_ids[ $block_post_id ] );

if ( empty( $output ) ) {
	return '';
}

echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
