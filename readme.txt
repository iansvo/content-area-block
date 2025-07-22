=== Content Area Block ===
Contributors:      iansvo
Tags:              block, blocks, fse, site-editor, content, template, meta-field
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html
Requires at least: 6.7
Requires PHP:      7.4

Adds a customizable block content area to site editor templates that stores block data in meta fields.

== Description ==

The Content Area Block allows you to add customizable block content areas to your site editor templates. Unlike regular blocks, this one stores the block content in a meta field, making it perfect for creating reusable content sections that can be managed independently from the main post content.

**Key Features:**
* Store block content in custom meta fields
* Configurable meta key for each block instance
* Restrict allowed block types per instance
* Full Site Editor integration
* Recursion prevention for nested blocks

**Use Cases:**
* Create custom content areas in templates
* Build reusable content sections
* Manage sidebar content independently
* Add flexible content zones to themes

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/content-area-block` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Add the Content Area block to your template in the Site Editor.
4. Configure the meta key in the block settings.
5. Add your content blocks within the Content Area block.

== Frequently Asked Questions ==

= How do I configure the meta key? =

After adding the Content Area block to your template, use the block inspector panel on the right to set the "Meta Key" field. This determines where the block content will be stored.

= Can I restrict which blocks can be used inside the Content Area? =

Yes! Use the "Allowed Blocks" setting in the block inspector to specify which block types can be added to this Content Area.

= Will this work with my theme? =

Yes, this plugin works with any theme that supports the Site Editor (Full Site Editing themes).

== Screenshots ==

1. Adding a Content Area block to a template
2. Configuring the meta key in block settings
3. Adding content blocks within the Content Area

== Changelog ==

= 0.1.0 =
* Initial release
* Core functionality for meta field storage
* Block restriction settings
* Site Editor integration
* Recursion prevention
