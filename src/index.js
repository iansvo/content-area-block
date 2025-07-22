import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import './filters';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
