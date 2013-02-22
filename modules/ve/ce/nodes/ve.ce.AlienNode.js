/*!
 * VisualEditor ContentEditable AlienNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable alien node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.AlienNode} model Model to observe.
 */
ve.ce.AlienNode = function VeCeAlienNode( type, model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, type, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienNode' );
	this.$.attr( 'contenteditable', false );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	this.addListenerMethod( this, 'live', 'onLive' );
	this.$.on( 'mouseenter', ve.bind( this.onMouseEnter, this ) );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienNode, ve.ce.LeafNode );

/* Methods */

/**
 * Handle mouse enter events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.AlienNode.prototype.onMouseEnter = function () {
	var $phantoms = $( [] ),
		$phantomTemplate = ve.ce.Surface.static.$phantomTemplate,
		surface = this.root.getSurface();

	this.$.find( '.ve-ce-node-shield' ).each( function () {
		var $shield = $( this ),
			offset = $shield.offset();
		$phantoms = $phantoms.add(
			$phantomTemplate.clone().css( {
				'top': offset.top,
				'left': offset.left,
				'height': $shield.height(),
				'width': $shield.width(),
				'background-position': -offset.left + 'px ' + -offset.top + 'px'
			} )
		);
	} );
	surface.replacePhantoms( $phantoms );
	surface.$.on( 'mousemove.phantoms', ve.bind( this.onSurfaceMouseMove, this ) );
};

/**
 * Handle live events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onLive = function () {
	if( this.live === true ) {
		var $shieldTemplate = this.constructor.static.$shieldTemplate;
		this.$.add( this.$.find( '*' ) ).each( function () {
			var $this = $( this );
			if ( this.nodeType === Node.ELEMENT_NODE ) {
				if (
					( $this.css( 'float' ) === 'none' || $this.css( 'float' ) === '' ) &&
					!$this.hasClass( 've-ce-alienNode' )
				) {
					return;
				}
				$this.append( $shieldTemplate.clone() );
			}
		} );
	}
};

/**
 * Handle update events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onUpdate = function () {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/**
 * Handle surface mouse move events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.AlienNode.prototype.onSurfaceMouseMove = function ( e ) {
	var surface, $target = $( e.target );
	if (
		!$target.hasClass( 've-ce-surface-phantom' ) &&
		$target.closest( '.ve-ce-alienNode' ).length === 0
	) {
		surface = this.root.getSurface();
		surface.replacePhantoms( null );
		surface.$.unbind( 'mousemove.phantoms' );
	}
};

/* Registration */

ve.ce.nodeFactory.register( 'alien', ve.ce.AlienNode );