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
// When inside the main loop, we want to use queried object
// so that `the_preview` for the current post can apply.
// We force this behavior by omitting the third argument (post ID) from the `get_the_content`.
$content = $meta_key ? get_post_meta( $block_post_id, $meta_key, true ) ?? $content : '';

/** This filter is documented in wp-includes/post-template.php */
$content = apply_filters( 'the_content', str_replace( ']]>', ']]&gt;', $content ) );
unset( $seen_ids[ $block_post_id ] );

if ( empty( $content ) ) {
	return '';
}

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
