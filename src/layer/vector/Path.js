/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Layer.extend({

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		// dashArray: null,
		// lineCap: null,
		// lineJoin: null,
		weight: 5,
		opacity: 0.5,

		// fill: false,
		// fillColor: null, same as color by default
		fillOpacity: 0.2,

		// className: ''

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function () {
		if (!this._container) {
			this._initElements();

			if (this.options.clickable) {
				this._initEvents();
			}
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}
	},

	onRemove: function () {
		L.DomUtil.remove(this._container);

		// TODO move to Path.VML
		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}
	},

	getEvents: function () {
		return {
			viewreset: this.projectLatlngs,
			moveend: this._updatePath
		};
	},

	/*
	projectLatlngs: function () {
		// do all projection stuff here
	},
	*/

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});
