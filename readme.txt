=== Content Area Block ===
Contributors:      iansvo
Tags:              block, fse, site-editor, content, template
Tested up to:      7.0
Stable tag:        1.0.2
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html
Repository URI:    https://github.com/iansvo/content-area-block

Adds a block content area to a site editor template and stores the blocks in a specified meta field. By default, the plugin will add a new meta field called `extra_content_area` for all post types which you can use to store the block markup. 

== Description ==

This block allows you to add an additional block content area to a site-editor template and store the block output inside a meta field. By default, WordPress posts or pages may only store blocks in one place: post_content. These blocks are output on the page using the core/post-content block. This block allows you to have multiple "outlets" where you can add blocks so you can have post-specific blocks appear in more than one location in the template. 

The block is a fork of the core/post-content block that uses a customized version of the useEntityBlockEditor hook which supports meta keys. The blocks for your content area are then stored inside that meta key (instead of post_content). This allows you to keep the blocks separate and you can use as many of these on a single template as you want (but in most cases 2 is probably enough). It's all up to you!

== Requirements ==

1. Using this plugin requires you to enable template previews (which will let you visually see the new content area you're adding). This can be enabled on any given post or page, but you can optionally set it on by default using a filter.
2. Your theme must be a block theme (i.e. it uses the site editor). This won't work for a hybrid or classic theme (which has no concept of live template preview in the block editor). 

== Hooks ==

If you want to disable this meta key's registration, add the following to your theme or plugin:

`
<?php
add_filter( 'content_area_block_register_default_meta', '__return_false' );
`

For advanced users, there is also a filter for the entire block's output. See the below snippet from render.php:

`
<?php
/**
 * Filter the block's frontend output.
 *
 * @param string $parsed_content The parsed block content for output.
 * @param int    $block_post_id  The current post ID the block is displaying in.
 * @param array  $attributes     The block attributes.
 * @param string $content        The original unparsed block content.
 * @param object $block          The current parsed block object.
 *
 * @return The block content for output on the frontend.
 */
$output = apply_filters( 
	'content_area_block_content', 
	do_blocks( str_replace( ']]>', ']]&gt;', $content ) ), 
	$block_post_id, 
	$attributes, 
	$content, 
	$block 
);
`

== Contributing ==
The plugin source code may be found here: https://github.com/iansvo/content-area-block. 

To build the plugin from source, you must have NodeJS (v24+) installed. 

Setup Steps:

1. Navigate to the project folder in your terminal.
2. Run `npm i` to install dependencies.
3. Run `npm run build` to performn the initial build.

If you're using wp-env to run the plugin...
1. Run `npm run wp-env start` to start the docker container.
2. Run `npm run start` to watch for file changes.

== Changelog ==

= 1.0.2 =
* Fixed: in the WordPress 7.0 page editor, blocks inside the Content Area could not be selected or edited (they only appeared in the List View). The meta-backed inner blocks are now kept stable across re-renders, so their client IDs no longer regenerate on every interaction.
* Added content-only editing support (`contentRole`) and verified compatibility with WordPress 6.9 and 7.0.

= 1.0.1 =
* Additional minor bug fixes, improve filtering.

= 1.0.0 =
* Fixed issues with undo, paste, and default block display.

= 0.1.0 =
* Release
