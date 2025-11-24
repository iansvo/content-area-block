=== Content Area Block ===
Contributors:      iansvo
Tags:              block, fse, site-editor, content, template
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html
Repository URI:    https://github.com/iansvo/content-area-block

Adds a block content area to a site editor template and stores the blocks in a specified meta field. By default, the plugin will add a new meta field called `extra_content_area` for all post types which you can use to store the block markup. 

If you want to disable this meta key's registration, add the following to your theme or plugin:

`
<?php
add_filter( 'content_area_block_register_default_meta', '__return_false' );
`

== Description ==

This block allows you to add an additional block content area to a site-editor template and store the block output inside a meta field.

Note: Using this plugin requires you to enable template previews (which will let you visually see the new content area you're adding). This can be enabled on any given post or page, but you can optionally set it on by default using a filter.

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

= 1.0.0 =
* Fixed issues with undo, paste, and default block display.

= 0.1.0 =
* Release
