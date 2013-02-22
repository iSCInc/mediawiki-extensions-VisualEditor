/*!
 * VisualEditor UserInterface FormatDropdownTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface format dropdown tool.
 *
 * @class
 * @extends ve.ui.DropdownTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.FormatDropdownTool = function VeUiFormatDropdownTool( toolbar ) {
	// Parent constructor
	ve.ui.DropdownTool.call( this, toolbar, ve.ui.FormatDropdownTool.static.options );
};

/* Inheritance */

ve.inheritClass( ve.ui.FormatDropdownTool, ve.ui.DropdownTool );

/* Static Properties */

ve.ui.FormatDropdownTool.static.name = 'format';

ve.ui.FormatDropdownTool.static.titleMessage = 'visualeditor-formatdropdown-title';

/**
 * Options given to ve.ui.DropdownTool.
 *
 * @static
 * @property
 * @type {Object[]}
 */
ve.ui.FormatDropdownTool.static.options = [
	{
		'name': 'paragraph',
		'label': ve.msg( 'visualeditor-formatdropdown-format-paragraph' ),
		'type' : 'paragraph'
	},
	{
		'name': 'heading-1',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading1' ),
		'type' : 'heading',
		'attributes': { 'level': 1 }
	},
	{
		'name': 'heading-2',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading2' ),
		'type' : 'heading',
		'attributes': { 'level': 2 }
	},
	{
		'name': 'heading-3',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading3' ),
		'type' : 'heading',
		'attributes': { 'level': 3 }
	},
	{
		'name': 'heading-4',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading4' ),
		'type' : 'heading',
		'attributes': { 'level': 4 }
	},
	{
		'name': 'heading-5',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading5' ),
		'type' : 'heading',
		'attributes': { 'level': 5 }
	},
	{
		'name': 'heading-6',
		'label': ve.msg( 'visualeditor-formatdropdown-format-heading6' ),
		'type' : 'heading',
		'attributes': { 'level': 6 }
	},
	{
		'name': 'preformatted',
		'label': ve.msg( 'visualeditor-formatdropdown-format-preformatted' ),
		'type' : 'preformatted'
	}
];

/* Methods */

/**
 * Handle dropdown option being selected.
 *
 * @method
 * @param {Object} item Menu item
 */
ve.ui.FormatDropdownTool.prototype.onSelect = function ( item ) {
	this.toolbar.getSurface().execute( 'format', 'convert', item.type, item.attributes );
};

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.FormatDropdownTool.prototype.onUpdateState = function ( nodes ) {
	var i, nodesLength, node, j, itemsLength, item,
		items = this.menuView.getItems(),
		matches = [];
	for ( i = 0, nodesLength = nodes.length; i < nodesLength; i++ ) {
		node = nodes[i];
		if ( !node.canHaveChildren() ) {
			node = node.getParent();
		}
		if ( node ) {
			for ( j = 0, itemsLength = items.length; j < itemsLength; j++ ) {
				item = items[j];
				if ( item.type === node.getType() ) {
					if ( item.attributes && !node.hasAttributes( item.attributes ) ) {
						continue;
					}
					matches.push( item );
				}
			}
		}
	}
	this.setLabel( matches.length === 1 ? matches[0].label : '' );
};

/* Registration */

ve.ui.toolFactory.register( 'format', ve.ui.FormatDropdownTool );