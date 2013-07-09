/*!
 * VisualEditor DataModel MWTemplateSpecModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * MediaWiki template specification.
 *
 * See https://raw.github.com/wikimedia/mediawiki-extensions-TemplateData/master/spec.templatedata.json
 * for the latest version of the TemplateData specification.
 *
 * @class
 *
 * @constructor
 * @param {ve.dm.MWTemplateModel} template Template
 */
ve.dm.MWTemplateSpecModel = function VeDmMWTemplateSpecModel( template ) {
	// Properties
	this.template = template;
	this.description = null;
	this.params = {};
	this.sets = [];

	// Initialization
	this.fill();
};

/* Static Methods */

/**
 * Get the correct value from a message property.
 *
 * @method
 * @static
 * @param {string|Object|null} val Messsage or object with messages keyed by language
 * @param {Mixed} [fallback=null] Value to use if message is not available
 * @param {string} [lang] Language to prefer, user interface language will be used by default
 * @returns {string} Message text or fallback if not available
 */
ve.dm.MWTemplateSpecModel.getMessage = function ( val, fallback, lang ) {
	if ( lang === undefined ) {
		lang = ve.init.platform.getUserLanguage();
	}
	if ( fallback === undefined ) {
		fallback = null;
	}
	if ( ve.isPlainObject( val ) ) {
		return val[lang] || fallback;
	}
	return typeof val === 'string' ? val : fallback;
};

/* Methods */

/**
 * Extend with template spec data.
 *
 * Template spec data is available from the TemplateData extension's API. Extension is passive so
 * any filled in values are not overwritten unless new values are available. This prevents changes
 * in the API or fill methods from causing issues.
 *
 * @method
 * @param {Object} data Template spec data
 * @param {string} [data.description] Template description
 * @param {Object} [data.params] Template param specs keyed by param name
 * @param {string[][]} [data.sets] Lists of param sets
 */
ve.dm.MWTemplateSpecModel.prototype.extend = function ( data ) {
	var key, paramObj, i, len;

	if ( data.description !== null ) {
		this.description = data.description;
	}
	if ( ve.isPlainObject( data.params ) ) {
		for ( key in data.params ) {
			paramObj = data.params[key];
			this.params[key] = ve.extendObject(
				true,
				this.getDefaultParameterSpec( key ),
				paramObj
			);
			// Add aliased references
			if ( paramObj.aliases.length ) {
				for ( i = 0, len = paramObj.aliases.length; i < len; i++ ) {
					this.params[ paramObj.aliases[i] ] = paramObj;
				}
			}
		}
	}
	this.sets = data.sets;
};

/**
 * Fill from template.
 *
 * Filling is passive, so existing information is never overwitten. The spec should be re-filled
 * after a parameter is added to ensure it's still complete, and this is safe because existing data
 * is never overwritten.
 *
 * @method
 */
ve.dm.MWTemplateSpecModel.prototype.fill = function () {
	var key;

	for ( key in this.template.getParameters() ) {
		if ( !this.params[key] ) {
			this.params[key] = this.getDefaultParameterSpec( key );
		}
	}
};

/**
 * Get the default spec for a parameter.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {Object} Parameter spec
 */
ve.dm.MWTemplateSpecModel.prototype.getDefaultParameterSpec = function ( name ) {
	return {
		'label': { 'en': name },
		'description': null,
		'default': '',
		'type': 'string',
		'aliases': [],
		'origin': name,
		'required': false,
		'deprecated': false
	};
};

/**
 * Get template label.
 *
 * @method
 * @returns {string} Template label
 */
ve.dm.MWTemplateSpecModel.prototype.getLabel = function () {
	var titleObj,
		title = this.template.getTitle(),
		target = this.template.getTarget();

	if ( title ) {
		try {
			// Normalize and remove namespace prefix if in the Template: namespace
			titleObj = new mw.Title( title );
			if ( titleObj.getNamespaceId() === 10 ) {
				// Template namespace, remove namespace prefix
				title = titleObj.getNameText();
			} else {
				// Other namespace, already has a prefix
				title = titleObj.getPrefixedText();
			}
		} catch ( e ) { }
	}

	return title || target.wt;
};

/**
 * Get template description.
 *
 * @method
 * @returns {string|null} Template description or null if not available
 */
ve.dm.MWTemplateSpecModel.prototype.getDescription = function () {
	return this.constructor.getMessage( this.description, null );
};

/**
 * Get a parameter label.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string} Parameter label
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterLabel = function ( name ) {
	return this.constructor.getMessage( this.params[name].label, name );
};

/**
 * Get a parameter description.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string|null} Parameter description
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterDescription = function ( name ) {
	return this.constructor.getMessage( this.params[name].description );
};

/**
 * Get a parameter value.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string} Default parameter value
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterDefaultValue = function ( name ) {
	return this.params[name]['default'];
};

/**
 * Get a parameter type.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string} Parameter type
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterType = function ( name ) {
	return this.params[name].type;
};

/**
 * Get parameter aliases.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string[]} Alternate parameter names
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterAliases = function ( name ) {
	return this.params[name].aliases;
};

/**
 * Get the parameter origin, which is the parameter this is an alias of.
 *
 * If a parameter is not an alias of another, its origin and name will be the same.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string} Origin parameter name
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterOrigin = function ( name ) {
	return this.params[name].origin;
};

/**
 * Check if parameter is required.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {boolean} Parameter is required
 */
ve.dm.MWTemplateSpecModel.prototype.isParameterRequired = function ( name ) {
	return !!this.params[name].required;
};

/**
 * Check if parameter is deprecated.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {boolean} Parameter is deprecated
 */
ve.dm.MWTemplateSpecModel.prototype.isParameterDeprecated = function ( name ) {
	return this.params[name].deprecated !== false;
};

/**
 * Get parameter deprecation description.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {string} Explaining of why parameter is deprecated, empty if parameter is not deprecated
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterDeprecationDescription = function ( name ) {
	return this.params[name].deprecated || '';
};

/**
 * Get all parameter specifications.
 *
 * @method
 * @returns {string[]} Parameter names
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterNames = function () {
	return ve.getObjectKeys( this.params );
};

/**
 * Get parameter sets.
 *
 * @method
 * @returns {Object[]} Lists of parameter set descriptors
 */
ve.dm.MWTemplateSpecModel.prototype.getParameterSets = function () {
	return this.sets;
};