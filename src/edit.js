/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import {
	parse,
	__unstableSerializeAndClean, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	createBlock,
} from '@wordpress/blocks';
import {
	useBlockProps,
	useInnerBlocksProps,
	useSettings,
	store as blockEditorStore,
	Warning,
	InspectorControls,
	__experimentalUseBlockPreview as useBlockPreview,
} from '@wordpress/block-editor';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useMemo,
} from '@wordpress/element';
import { TextControl, FormTokenField, PanelBody } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';

import { useNoRecursiveRenders, useCanEditEntity } from './hooks';

function useMetaBlockEditor( { attributes, context } ) {
	const { postType, postId } = context;
	const { allowedBlocks, metaKey } = attributes;
	const loadBlocks = useRef( true );
	const BLOCKS_KEY = `${ metaKey }_blocks`;
	const editedRecord = useSelect(
		( select ) => {
			const { getEditedEntityRecord } = select( 'core' );

			return getEditedEntityRecord( 'postType', postType, postId );
		},
		[ postType, postId ]
	);
	const { meta } = editedRecord;
	const content = useMemo( () => meta?.[ metaKey ] || '', [ meta, metaKey ] );
	const [ localBlocks, setLocalBlocks ] = useState(
		() => editedRecord?.[ BLOCKS_KEY ]
	);

	const blocks = useMemo( () => {
		// If we have local blocks from a recent edit, use those
		if ( localBlocks ) {
			return localBlocks;
		}
		// Otherwise use stored blocks
		if ( editedRecord?.[ BLOCKS_KEY ] ) {
			return editedRecord[ BLOCKS_KEY ];
		}
		if ( content ) {
			return (
				parse( content ) || [
					createBlock( allowedBlocks?.[ 0 ] || 'core/paragraph' ),
				]
			);
		}
		return [];
	}, [ localBlocks, editedRecord, BLOCKS_KEY, content, allowedBlocks ] );

	const { editEntityRecord } = useDispatch( 'core' );

	// Clear local blocks when content is successfully saved
	useEffect( () => {
		if ( editedRecord?.[ BLOCKS_KEY ] && localBlocks ) {
			setLocalBlocks( null );
		}
	}, [ editedRecord, BLOCKS_KEY, localBlocks ] );

	const onChange = useCallback(
		( newBlocks ) => {
			const serializedContent = __unstableSerializeAndClean( newBlocks );

			if ( content === serializedContent ) {
				return;
			}

			// Set local blocks immediately for UI responsiveness
			setLocalBlocks( newBlocks );

			const edits = {
				[ BLOCKS_KEY ]: newBlocks,
				meta: {
					...meta,
					[ metaKey ]: serializedContent,
				},
			};

			editEntityRecord( 'postType', postType, postId, edits );
		},
		[
			BLOCKS_KEY,
			content,
			editEntityRecord,
			meta,
			metaKey,
			postId,
			postType,
		]
	);

	const onInput = useCallback(
		( newBlocks ) => {
			// Set local blocks immediately for UI responsiveness
			setLocalBlocks( newBlocks );

			const serializedContent = __unstableSerializeAndClean( newBlocks );

			const edits = {
				[ BLOCKS_KEY ]: newBlocks,
				meta: {
					...meta,
					[ metaKey ]: serializedContent,
				},
			};

			editEntityRecord( 'postType', postType, postId, edits );
		},
		[ BLOCKS_KEY, editEntityRecord, meta, metaKey, postId, postType ]
	);

	return { blocks, onChange, onInput };
}

function ReadOnlyContent( {
	parentLayout,
	layoutClassNames,
	userCanEdit,
	postType,
	postId,
	tagName: TagName = 'div',
} ) {
	const [ , , content ] = useEntityProp(
		'postType',
		postType,
		'content',
		postId
	);
	const blockProps = useBlockProps( { className: layoutClassNames } );
	const blocks = useMemo( () => {
		return content?.raw ? parse( content.raw ) : [];
	}, [ content?.raw ] );
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: blockProps,
		layout: parentLayout,
	} );

	if ( userCanEdit ) {
		/*
		 * Rendering the block preview using the raw content blocks allows for
		 * block support styles to be generated and applied by the editor.
		 *
		 * The preview using the raw blocks can only be presented to users with
		 * edit permissions for the post to prevent potential exposure of private
		 * block content.
		 */
		return <div { ...blockPreviewProps }></div>;
	}

	return content?.protected ? (
		<TagName { ...blockProps }>
			<Warning>
				{ __(
					'This content is password protected.',
					'content-area-block'
				) }
			</Warning>
		</TagName>
	) : (
		<TagName
			{ ...blockProps }
			dangerouslySetInnerHTML={ { __html: content?.rendered } }
		></TagName>
	);
}

function EditableContent( {
	layout,
	context = {},
	metaKey = '',
	allowedBlocks = [],
} ) {
	const themeSupportsLayout = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings()?.supportsLayout;
	}, [] );
	const defaultLayout = useSettings( [ 'layout' ] )[ 0 ] || {};
	const usedLayout = !! layout && layout.inherit ? defaultLayout : layout;
	const { blocks, onChange, onInput } = useMetaBlockEditor( {
		attributes: { metaKey, allowedBlocks },
		context,
	} );

	const blockProps = useBlockProps();
	const props = useInnerBlocksProps( blockProps, {
		value: blocks,
		onInput,
		onChange,
		__experimentalLayout: themeSupportsLayout ? usedLayout : undefined,
		allowedBlocks: allowedBlocks.length > 0 ? allowedBlocks : undefined,
	} );

	return <div { ...props } />;
}

function Content( props ) {
	const { context: { queryId, postType, postId } = {} } = props;
	const isDescendentOfQueryLoop = Number.isFinite( queryId );
	const userCanEdit = useCanEditEntity( 'postType', postType, postId );
	const isEditable = userCanEdit && ! isDescendentOfQueryLoop;

	return isEditable ? (
		<EditableContent { ...props } />
	) : (
		<ReadOnlyContent
			userCanEdit={ userCanEdit }
			postType={ postType }
			postId={ postId }
		/>
	);
}

function Placeholder( { metaKey = '' } ) {
	const blockProps = useBlockProps();
	return (
		<div { ...blockProps }>
			<p>
				{ metaKey
					? sprintf(
							// Translators: %s is the metaKey attribute value.
							__(
								'Post Content from meta_key: %s',
								'content-area-block'
							),
							metaKey
					  )
					: __(
							'Set a meta key to pull blocks from.',
							'content-area-block'
					  ) }
			</p>
		</div>
	);
}

function RecursionError() {
	const blockProps = useBlockProps();
	return (
		<div { ...blockProps }>
			<Warning>
				{ __(
					'Block cannot be rendered inside itself.',
					'content-area-block'
				) }
			</Warning>
		</div>
	);
}

export default function ContentAreaEdit( {
	context,
	attributes,
	setAttributes,
} ) {
	const { metaKey, allowedBlocks = null } = attributes;
	const { layout = {} } = attributes;
	const { postId, postType } = useSelect( ( select ) => {
		return {
			postId: select( editorStore ).getCurrentPostId(),
			postType: select( editorStore ).getCurrentPostType(),
		};
	} );
	const [ hasAlreadyRendered, RecursionProvider ] =
		useNoRecursiveRenders( postId );

	const isValidPostId = 'number' === typeof postId && postId;

	if ( isValidPostId && postType && hasAlreadyRendered ) {
		return <RecursionError />;
	}

	const handleMetaKeyChange = useCallback(
		function handleMetaKeyChange( value ) {
			setAttributes( { metaKey: value } );
		},
		[ setAttributes ]
	);

	const handleAllowedBlocksChange = useCallback(
		function handleAllowedBlocksChange( value ) {
			setAttributes( { allowedBlocks: value } );
		},
		[ setAttributes ]
	);

	return (
		<RecursionProvider>
			{ isValidPostId && postType ? (
				<Content
					context={ context }
					layout={ layout }
					metaKey={ metaKey }
					allowedBlocks={ allowedBlocks }
					postId={ postId }
					postType={ postType }
				/>
			) : (
				<Placeholder metaKey={ metaKey } />
			) }
			<InspectorControls>
				<PanelBody
					title={ __( 'Content Settings', 'content-area-block' ) }
				>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						value={ metaKey }
						onChange={ handleMetaKeyChange }
						label={ __( 'Meta Key', 'content-area-block' ) }
					/>
					<FormTokenField
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						value={ allowedBlocks || [] }
						onChange={ handleAllowedBlocksChange }
						label={ __( 'Allowed Blocks', 'content-area-block' ) }
					/>
				</PanelBody>
			</InspectorControls>
		</RecursionProvider>
	);
}
