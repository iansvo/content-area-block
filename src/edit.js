/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { parse, getBlockTypes } from '@wordpress/blocks';
import {
	useBlockProps,
	useInnerBlocksProps,
	useSettings,
	store as blockEditorStore,
	Warning,
	InspectorControls,
	__experimentalUseBlockPreview as useBlockPreview, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/block-editor';
import { useCallback, useMemo } from '@wordpress/element';
import {
	TextControl,
	FormTokenField,
	PanelBody,
	Notice,
	SelectControl,
} from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';

import {
	useNoRecursiveRenders,
	useCanEditEntity,
	useMetaBlockEditor,
} from './hooks';

const EMPTY_ARRAY = [];

const blockFilterTypes = [
	{
		value: 'allow',
		label: __( 'Allow', 'content-area-block' ),
	},
	{
		value: 'disallow',
		label: __( 'Disallow', 'content-area-block' ),
	},
];

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

function EditableContent( { layout, context = {}, attributes = {} } ) {
	const {
		allowedBlocks = [],
		disallowedBlocks = [],
		blockFilter = 'allow',
	} = attributes;
	const themeSupportsLayout = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings()?.supportsLayout;
	}, [] );
	const defaultLayout = useSettings( [ 'layout' ] )[ 0 ] || {};
	const usedLayout = !! layout && layout.inherit ? defaultLayout : layout;
	const { blocks, onChange, onInput } = useMetaBlockEditor( {
		attributes,
		context,
	} );

	const allowedBlocksList = useMemo( () => {
		const blockTypes = getBlockTypes();

		const list =
			blockFilter === 'allow'
				? allowedBlocks
				: blockTypes.map( ( { name } ) => name );

		return blockFilter === 'disallow'
			? list.filter(
					( blockType ) => ! disallowedBlocks.includes( blockType )
			  )
			: list;
	}, [ blockFilter, allowedBlocks, disallowedBlocks ] );

	const blockProps = useBlockProps();
	const props = useInnerBlocksProps( blockProps, {
		value: blocks,
		onInput,
		onChange,
		__experimentalLayout: themeSupportsLayout ? usedLayout : undefined,
		allowedBlocks:
			allowedBlocksList.length > 0 ? allowedBlocksList : undefined,
		defaultBlock: [ allowedBlocks?.[ 0 ] || 'core/paragraph' ],
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
	const {
		metaKey,
		allowedBlocks = [],
		disallowedBlocks = [],
		blockFilter = 'allow',
	} = attributes;
	const { layout = {} } = attributes;
	const { postId, postType, editingMode } = useSelect( ( select ) => {
		return {
			postId: select( editorStore ).getCurrentPostId(),
			postType: select( editorStore ).getCurrentPostType(),
			editingMode: select( blockEditorStore ).getBlockEditingMode(),
		};
	} );
	const [ hasAlreadyRendered, RecursionProvider ] =
		useNoRecursiveRenders( postId );

	const isValidPostId = 'number' === typeof postId && postId;

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

	const handleDisallowedBlocksChange = useCallback(
		function handleAllowedBlocksChange( value ) {
			setAttributes( { disallowedBlocks: value } );
		},
		[ setAttributes ]
	);

	const blockSuggestions = useMemo( () => {
		const blockTypes = getBlockTypes();
		return blockTypes.map( ( block ) => block.name );
	}, [] );

	if ( isValidPostId && postType && hasAlreadyRendered ) {
		return <RecursionError />;
	}

	const showControls = editingMode === 'default';

	return (
		<RecursionProvider>
			{ isValidPostId && postType ? (
				<Content
					context={ context }
					layout={ layout }
					attributes={ attributes }
					postId={ postId }
					postType={ postType }
				/>
			) : (
				<Placeholder metaKey={ metaKey } />
			) }
			<InspectorControls>
				{ showControls ? (
					<PanelBody
						title={ __(
							'Content Area Settings',
							'content-area-block'
						) }
					>
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							value={ metaKey }
							onChange={ handleMetaKeyChange }
							label={ __( 'Meta Key', 'content-area-block' ) }
						/>
						<SelectControl
							value={ blockFilter }
							onChange={ ( newValue ) =>
								setAttributes( { blockFilter: newValue } )
							}
							label={ __(
								'Block Filter Type',
								'content-area-block'
							) }
							options={ blockFilterTypes }
						/>
						{ blockFilter === 'allow' && (
							<FormTokenField
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								value={ allowedBlocks }
								onChange={ handleAllowedBlocksChange }
								suggestions={ blockSuggestions }
								label={ __(
									'Allowed Blocks',
									'content-area-block'
								) }
							/>
						) }
						{ blockFilter === 'disallow' && (
							<FormTokenField
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								value={ disallowedBlocks }
								onChange={ handleDisallowedBlocksChange }
								suggestions={ blockSuggestions }
								label={ __(
									'Disallowed Blocks',
									'content-area-block'
								) }
							/>
						) }
					</PanelBody>
				) : (
					<PanelBody opened={ true }>
						<Notice isDismissible={ false } status="warning">
							<h2 style={ { marginBlockStart: 0 } }>
								{ __(
									'Content Only Mode',
									'content-area-block'
								) }
							</h2>
							{ __(
								'Edit the template to change settings for this block.',
								'content-area-block'
							) }
						</Notice>
					</PanelBody>
				) }
			</InspectorControls>
		</RecursionProvider>
	);
}
