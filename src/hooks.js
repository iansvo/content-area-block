/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useBlockEditContext } from '@wordpress/block-editor';
import {
	useCallback,
	useContext,
	createContext,
	useMemo,
} from '@wordpress/element';

const RenderedRefsContext = createContext( {} );

/**
 * Returns whether the current user can edit the given entity.
 *
 * @param {string} kind     Entity kind.
 * @param {string} name     Entity name.
 * @param {string} recordId Record's id.
 */
export function useCanEditEntity( kind, name, recordId ) {
	return useSelect(
		( select ) =>
			select( coreStore ).canUser( 'update', {kind, name, id: recordId} ),
		[ kind, name, recordId ]
	);
}

/**
 * Immutably adds an unique identifier to a set scoped for a given block type.
 *
 * @param {Object} renderedBlocks Rendered blocks grouped by block name
 * @param {string} blockName      Name of the block.
 * @param {*}      uniqueId       Any value that acts as a unique identifier for a block instance.
 *
 * @return {Object} The list of rendered blocks grouped by block name.
 */
function addToBlockType( renderedBlocks, blockName, uniqueId ) {
	const result = {
		...renderedBlocks,
		[ blockName ]: renderedBlocks[ blockName ]
			? new Set( renderedBlocks[ blockName ] )
			: new Set(),
	};
	result[ blockName ].add( uniqueId );

	return result;
}

/**
 * A React hook for keeping track of blocks previously rendered up in the block
 * tree. Blocks susceptible to recursion can use this hook in their `Edit`
 * function to prevent said recursion.
 *
 * @see https://github.com/iansvo/gutenberg/blob/a7e2895829c16ecd77a5ba22d84f1dee1cfb0977/packages/block-editor/src/components/use-no-recursive-renders/index.js
 *
 * @param {*}      uniqueId  Any value that acts as a unique identifier for a block instance.
 * @param {string} blockName Optional block name.
 *
 * @return {[boolean, Function]} A tuple of:
 *                               - a boolean describing whether the provided id
 *                                 has already been rendered;
 *                               - a React context provider to be used to wrap
 *                                 other elements.
 */
export function useNoRecursiveRenders( uniqueId, blockName = '' ) {
	const previouslyRenderedBlocks = useContext( RenderedRefsContext );
	const { name } = useBlockEditContext();
	blockName = blockName || name;
	const hasAlreadyRendered = Boolean(
		previouslyRenderedBlocks[ blockName ]?.has( uniqueId )
	);
	const newRenderedBlocks = useMemo(
		() => addToBlockType( previouslyRenderedBlocks, blockName, uniqueId ),
		[ previouslyRenderedBlocks, blockName, uniqueId ]
	);
	const Provider = useCallback(
		( { children } ) => (
			<RenderedRefsContext.Provider value={ newRenderedBlocks }>
				{ children }
			</RenderedRefsContext.Provider>
		),
		[ newRenderedBlocks ]
	);
	return [ hasAlreadyRendered, Provider ];
}
