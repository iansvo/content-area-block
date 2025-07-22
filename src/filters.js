import { addFilter } from '@wordpress/hooks';

//
function addCustomPostContentBlockTypes( blockTypes ) {
	return [ ...blockTypes, 'iansvo/content-area' ];
}

addFilter(
	'editor.postContentBlockTypes',
	'iansvo/content-area/post-content-block-types',
	addCustomPostContentBlockTypes
);
