/*!
 * VisualEditor ContentEditable MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki entity node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.MWEntityNode} model Model to observe.
 */
ve.ce.MWEntityNode = function VeCeMWEntityNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, 'MWentity', model, $( '<span>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-MWEntityNode' );
	// Need CE=false to prevent selection issues
	this.$.attr( 'contenteditable', false );

	// Properties
	this.currentSource = null;

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWEntityNode, ve.ce.LeafNode );

/* Methods */

/**
 * Handle model update events.
 *
 * If the source changed since last update the image's src attribute will be updated accordingly.
 *
 * @method
 */
ve.ce.MWEntityNode.prototype.onUpdate = function () {
	this.$.text( this.model.getAttribute( 'character' ) );
};

/* Registration */

ve.ce.nodeFactory.register( 'MWentity', ve.ce.MWEntityNode );