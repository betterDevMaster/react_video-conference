"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PropTypes = require("prop-types");
var React = require("react");
var ReactDOM = require("react-dom");
function panAndZoom(WrappedComponent) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(PanAndZoomHOC, _super);
            function PanAndZoomHOC() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.dx = 0;
                _this.dy = 0;
                _this.ds = 0;
                _this.element = null;
                _this.zoomTimeout = null;
                _this.handleWheel = function (event) {
                    if (_this.props.disableScrollZoom || !_this.hasPosition(event)) {
                        return;
                    }
                    var x = _this.props.x;
                    var y = _this.props.y;
                    var scale = _this.props.scale;
                    var scaleFactor = _this.props.scaleFactor;
                    var minScale = _this.props.minScale;
                    var maxScale = _this.props.maxScale;
                    if (x !== undefined && y !== undefined && scale !== undefined && scaleFactor !== undefined && minScale !== undefined && maxScale !== undefined) {
                        var deltaY = event.deltaY;
                        var newScale = deltaY < 0 ? Math.min((scale + _this.ds) * scaleFactor, maxScale) : Math.max((scale + _this.ds) / scaleFactor, minScale);
                        var factor = newScale / (scale + _this.ds);
                        if (factor !== 1) {
                            var target = ReactDOM.findDOMNode(_this);
                            if (target !== null && target instanceof HTMLElement) {
                                var _a = target.getBoundingClientRect(), top_1 = _a.top, left = _a.left, width = _a.width, height = _a.height;
                                var _b = _this.normalizeTouchPosition(event, target), clientX = _b.clientX, clientY = _b.clientY;
                                var dx = _this.props.disableZoomToMouse ? 0 : (clientX / width - 0.5) / (scale + _this.ds);
                                var dy = _this.props.disableZoomToMouse ? 0 : (clientY / height - 0.5) / (scale + _this.ds);
                                var sdx = dx * (1 - 1 / factor);
                                var sdy = dy * (1 - 1 / factor);
                                _this.dx += sdx;
                                _this.dy += sdy;
                                _this.ds = newScale - scale;
                                if (_this.props.onPanAndZoom) {
                                    _this.props.onPanAndZoom(x + _this.dx, y + _this.dy, scale + _this.ds, event);
                                }
                                if (_this.props.renderOnChange) {
                                    _this.forceUpdate();
                                }
                            }
                        }
                    }
                    if (_this.props.onZoom) {
                        _this.props.onZoom(x, y, scale, event);
                    }
                    if (_this.zoomTimeout !== null) {
                        window.clearTimeout(_this.zoomTimeout);
                        _this.zoomTimeout = null;
                    }
                    if (_this.props.onZoomEnd) {
                        _this.zoomTimeout = window.setTimeout(_this.props.onZoomEnd, _this.props.zoomEndTimeout === undefined ? 500 : _this.props.zoomEndTimeout);
                    }
                    event.preventDefault();
                };
                _this.panning = false;
                _this.boxZoom = false;
                _this.panLastX = 0;
                _this.panLastY = 0;
                _this.boxX1 = 0;
                _this.boxY1 = 0;
                _this.handleMouseDown = function (event) {
                    if (!_this.panning && !_this.boxZoom && _this.hasPosition(event)) {
                        var target = ReactDOM.findDOMNode(_this);
                        if (target !== null && target instanceof HTMLElement) {
                            var _a = _this.normalizeTouchPosition(event, target), clientX = _a.clientX, clientY = _a.clientY;
                            if (event.shiftKey && _this.props.shiftBoxZoom) {
                                _this.boxX1 = clientX;
                                _this.boxY1 = clientY;
                                _this.boxZoom = true;
                                if (_this.props.onBoxStart) {
                                    _this.props.onBoxStart(_this.boxX1, _this.boxY1, event);
                                }
                            }
                            else {
                                _this.panLastX = clientX;
                                _this.panLastY = clientY;
                                _this.panning = true;
                                if (_this.props.onPanStart) {
                                    _this.props.onPanStart(event);
                                }
                            }
                            document.addEventListener('mousemove', _this.handleMouseMove, { passive: false });
                            document.addEventListener('mouseup', _this.handleMouseUp, { passive: false });
                            document.addEventListener('touchmove', _this.handleMouseMove, { passive: false });
                            document.addEventListener('touchend', _this.handleMouseUp, { passive: false });
                        }
                    }
                };
                _this.handleMouseMove = function (event) {
                    if ((_this.panning || _this.boxZoom) && _this.hasPosition(event)) {
                        var target = ReactDOM.findDOMNode(_this);
                        if (target !== null && target instanceof HTMLElement) {
                            var _a = _this.normalizeTouchPosition(event, target), clientX = _a.clientX, clientY = _a.clientY;
                            if (_this.panning) {
                                var x = _this.props.x;
                                var y = _this.props.y;
                                var scale = _this.props.scale;
                                var _b = target.getBoundingClientRect(), width = _b.width, height = _b.height;
                                if (x !== undefined && y !== undefined && scale !== undefined) {
                                    if (!_this.props.ignorePanOutside || 0 <= clientX && clientX <= width && 0 <= clientY && clientY <= height) {
                                        var dx = clientX - _this.panLastX;
                                        var dy = clientY - _this.panLastY;
                                        _this.panLastX = clientX;
                                        _this.panLastY = clientY;
                                        var sdx = dx / (width * (scale + _this.ds));
                                        var sdy = dy / (height * (scale + _this.ds));
                                        _this.dx -= sdx;
                                        _this.dy -= sdy;
                                        if (_this.props.onPanMove) {
                                            _this.props.onPanMove(x + _this.dx, y + _this.dy, event);
                                        }
                                        if (_this.props.renderOnChange) {
                                            _this.forceUpdate();
                                        }
                                    }
                                }
                            }
                            else {
                                if (_this.props.onBoxMove) {
                                    _this.props.onBoxMove(_this.boxX1, _this.boxY1, clientX, clientY, event);
                                }
                            }
                        }
                    }
                };
                _this.handleMouseUp = function (event) {
                    if (_this.panning || _this.boxZoom) {
                        var target = ReactDOM.findDOMNode(_this);
                        if (target !== null && target instanceof HTMLElement) {
                            var clientX = null;
                            var clientY = null;
                            if (_this.hasPosition(event)) {
                                var position = _this.normalizeTouchPosition(event, target);
                                clientX = position.clientX;
                                clientY = position.clientY;
                            }
                            if (_this.panning) {
                                var x = _this.props.x;
                                var y = _this.props.y;
                                var scale = _this.props.scale;
                                if (x !== undefined && y !== undefined && scale !== undefined) {
                                    var _a = target.getBoundingClientRect(), width = _a.width, height = _a.height;
                                    if (clientX !== null && clientY !== null && (!_this.props.ignorePanOutside || 0 <= clientX && clientX <= width && 0 <= clientY && clientY <= height)) {
                                        var dx = clientX - _this.panLastX;
                                        var dy = clientY - _this.panLastY;
                                        _this.panLastX = clientX;
                                        _this.panLastY = clientY;
                                        var sdx = dx / (width * (scale + _this.ds));
                                        var sdy = dy / (height * (scale + _this.ds));
                                        _this.dx -= sdx;
                                        _this.dy -= sdy;
                                    }
                                    _this.panning = false;
                                    if (_this.props.onPanEnd) {
                                        _this.props.onPanEnd(x + _this.dx, y + _this.dy, event);
                                    }
                                    if (_this.props.renderOnChange) {
                                        _this.forceUpdate();
                                    }
                                }
                            }
                            else {
                                _this.boxZoom = false;
                                if (_this.props.onBoxEnd) {
                                    if (clientX !== null && clientY !== null) {
                                        _this.props.onBoxEnd(_this.boxX1, _this.boxY1, clientX, clientY, event);
                                    }
                                    else {
                                        _this.props.onBoxEnd(_this.boxX1, _this.boxY1, _this.panLastX, _this.panLastY, event);
                                    }
                                }
                            }
                        }
                        document.removeEventListener('mousemove', _this.handleMouseMove);
                        document.removeEventListener('mouseup', _this.handleMouseUp);
                        document.removeEventListener('touchmove', _this.handleMouseMove);
                        document.removeEventListener('touchend', _this.handleMouseUp);
                    }
                };
                return _this;
            }
            PanAndZoomHOC.prototype.componentWillReceiveProps = function (nextProps) {
                if (this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
                    this.dx = 0;
                    this.dy = 0;
                }
                if (this.props.scale !== nextProps.scale) {
                    this.ds = 0;
                }
            };
            PanAndZoomHOC.prototype.componentDidMount = function () {
                this.registerEventHandlers();
            };
            PanAndZoomHOC.prototype.componentWillUnmount = function () {
                this.unregisterEventHandlers();
                if (this.zoomTimeout !== null) {
                    window.clearTimeout(this.zoomTimeout);
                    this.zoomTimeout = null;
                }
            };
            PanAndZoomHOC.prototype.hasPosition = function (event) {
                return !('targetTouches' in event) || event.targetTouches.length >= 1;
            };
            PanAndZoomHOC.prototype.normalizeTouchPosition = function (event, parent) {
                var position = {
                    clientX: ('targetTouches' in event) ? event.targetTouches[0].pageX : event.clientX,
                    clientY: ('targetTouches' in event) ? event.targetTouches[0].pageY : event.clientY
                };
                while (parent && parent.offsetParent && parent.offsetParent instanceof HTMLElement) {
                    position.clientX -= parent.offsetLeft - parent.scrollLeft;
                    position.clientY -= parent.offsetTop - parent.scrollTop;
                    parent = parent.offsetParent;
                }
                return position;
            };
            PanAndZoomHOC.prototype.unregisterEventHandlers = function () {
                if (this.panning || this.boxZoom) {
                    document.removeEventListener('mousemove', this.handleMouseMove);
                    document.removeEventListener('mouseup', this.handleMouseUp);
                    document.removeEventListener('touchmove', this.handleMouseMove);
                    document.removeEventListener('touchend', this.handleMouseUp);
                }
                var component = ReactDOM.findDOMNode(this);
                if (component instanceof HTMLElement) {
                    component.removeEventListener('mousedown', this.handleMouseDown);
                    component.removeEventListener('touchstart', this.handleMouseDown);
                    component.removeEventListener('wheel', this.handleWheel);
                }
            };
            PanAndZoomHOC.prototype.registerEventHandlers = function () {
                var component = ReactDOM.findDOMNode(this);
                if (component instanceof HTMLElement) {
                    component.addEventListener('mousedown', this.handleMouseDown, { passive: false });
                    component.addEventListener('touchstart', this.handleMouseDown, { passive: false });
                    component.addEventListener('wheel', this.handleWheel, { passive: false });
                }
                if (this.panning || this.boxZoom) {
                    document.addEventListener('mousemove', this.handleMouseMove, { passive: false });
                    document.addEventListener('mouseup', this.handleMouseUp, { passive: false });
                    document.addEventListener('touchmove', this.handleMouseMove, { passive: false });
                    document.addEventListener('touchend', this.handleMouseUp, { passive: false });
                }
            };
            PanAndZoomHOC.prototype.reregisterEventHandlers = function () {
                this.unregisterEventHandlers();
                this.registerEventHandlers();
            };
            PanAndZoomHOC.prototype.render = function () {
                var _a = this.props, scaleFactor = _a.scaleFactor, tempX = _a.x, tempY = _a.y, tempScale = _a.scale, minScale = _a.minScale, maxScale = _a.maxScale, onPanStart = _a.onPanStart, onPanMove = _a.onPanMove, onPanEnd = _a.onPanEnd, onZoom = _a.onZoom, onPanAndZoom = _a.onPanAndZoom, renderOnChange = _a.renderOnChange, passOnProps = _a.passOnProps, ignorePanOutside = _a.ignorePanOutside, disableScrollZoom = _a.disableScrollZoom, disableZoomToMouse = _a.disableZoomToMouse, zoomEndTimeout = _a.zoomEndTimeout, onZoomEnd = _a.onZoomEnd, shiftBoxZoom = _a.shiftBoxZoom, onBoxStart = _a.onBoxStart, onBoxMove = _a.onBoxMove, onBoxEnd = _a.onBoxEnd, other = __rest(_a, ["scaleFactor", "x", "y", "scale", "minScale", "maxScale", "onPanStart", "onPanMove", "onPanEnd", "onZoom", "onPanAndZoom", "renderOnChange", "passOnProps", "ignorePanOutside", "disableScrollZoom", "disableZoomToMouse", "zoomEndTimeout", "onZoomEnd", "shiftBoxZoom", "onBoxStart", "onBoxMove", "onBoxEnd"]);
                var x = this.props.x;
                var y = this.props.y;
                var scale = this.props.scale;
                if (x !== undefined && y !== undefined && scale !== undefined) {
                    var passedProps = passOnProps ? { x: x + this.dx, y: y + this.dy, scale: scale + this.ds } : {};
                    return React.createElement(WrappedComponent, Object.assign({}, passedProps, other));
                }
                else {
                    return null;
                }
            };
            return PanAndZoomHOC;
        }(React.PureComponent)),
        _a.propTypes = {
            x: PropTypes.number,
            y: PropTypes.number,
            scale: PropTypes.number,
            scaleFactor: PropTypes.number,
            minScale: PropTypes.number,
            maxScale: PropTypes.number,
            renderOnChange: PropTypes.bool,
            passOnProps: PropTypes.bool,
            ignorePanOutside: PropTypes.bool,
            disableScrollZoom: PropTypes.bool,
            disableZoomToMouse: PropTypes.bool,
            zoomEndTimeout: PropTypes.number,
            onPanStart: PropTypes.func,
            onPanMove: PropTypes.func,
            onPanEnd: PropTypes.func,
            onZoom: PropTypes.func,
            onZoomEnd: PropTypes.func,
            onPanAndZoom: PropTypes.func
        },
        _a.defaultProps = {
            x: 0.5,
            y: 0.5,
            scale: 1,
            scaleFactor: Math.sqrt(2),
            minScale: Number.EPSILON,
            maxScale: Number.POSITIVE_INFINITY,
            renderOnChange: false,
            passOnProps: false
        },
        _a;
}
exports.default = panAndZoom;
;
//# sourceMappingURL=panAndZoomHoc.js.map