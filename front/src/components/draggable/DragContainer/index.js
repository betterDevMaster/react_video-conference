import React from 'react';
import './index.css';

export default class DragContainer extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }
    state = {
        pos: { x: 0, y: 0 },
        dragging: false,
        rel: null, // position relative to the cursor
        zoom: 1
    };
    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    // etc.
    componentDidUpdate(props, state) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        } else if (!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    }
    // calculate relative position to the mouse and set dragging=true
    onMouseDown = (e) => {
        // only left mouse button
        const ele = document.elementFromPoint(e.clientX, e.clientY);
        if (e.button !== 0 && ele !== this.myRef.current) return;
        var pos = {
            left: e.target.offsetLeft,
            top: e.target.offsetTop
        };
        this.setState({
            dragging: true,
            rel: {
                x: e.pageX - pos.left,
                y: e.pageY - pos.top
            }
        });
        e.stopPropagation();
        e.preventDefault();
    };
    onMouseUp = (e) => {
        this.setState({ dragging: false });
        e.stopPropagation();
        e.preventDefault();
    };
    onMouseMove = (e) => {
        if (!this.state.dragging) return;
        const newPos = {
            x: e.pageX - this.state.rel.x,
            y: e.pageY - this.state.rel.y
        };
        if (this.props.onMove) {
            this.props.onMove(this.myRef.current, DragContainer.positionToParent(this.props, this.props.zoom, newPos));
        }
        e.stopPropagation();
        e.preventDefault();
    };
    onWheel = (ev) => {
        const stage = document.getElementById('stage');
        var cursor_x = ev.clientX - stage.offsetLeft,
            cursor_y = ev.clientY - stage.offsetTop;
        // console.log(cursor_x, cursor_y);
        var newZoom = Math.min(
            this.props.maxZoom ? this.props.maxZoom : 3,
            Math.max(this.props.minZoom ? this.props.minZoom : 0.5, this.state.zoom + (ev.deltaY < 0 ? 0.1 : -0.1))
        );
        newZoom = DragContainer.zoomToParent(this.props, newZoom);
        const newPos = {
            x: this.myRef.current.offsetLeft,
            y: this.myRef.current.offsetTop
        };
        newPos.x = newPos.x - ((cursor_x - newPos.x) * (newZoom - this.state.zoom)) / this.state.zoom;
        newPos.y = newPos.y - ((cursor_y - newPos.y) * (newZoom - this.state.zoom)) / this.state.zoom;

        if (this.props.onZoom) {
            this.props.onZoom(this.myRef.current, newZoom, DragContainer.positionToParent(this.props, newZoom, newPos));
        }
    };
    static zoomToParent = (props, zoom) => {
        if (props.fitParent) {
            const stage = document.getElementById('stage');
            if (stage) return Math.max(Math.max(zoom, stage.clientWidth / props.width), stage.clientHeight / props.height);
        }
        return zoom;
    };
    static positionToParent = (props, zoom, pos) => {
        const newPos = { ...pos };
        if (props.fitParent) {
            const stage = document.getElementById('stage');
            if (stage) {
                newPos.x = Math.min(0, Math.max(-props.width * zoom + stage.clientWidth, pos.x));
                newPos.y = Math.min(0, Math.max(-props.height * zoom + stage.clientHeight, pos.y));
            }
        }
        return newPos;
    };
    static getDerivedStateFromProps(props, state) {
        return {
            pos: DragContainer.positionToParent(props, props.zoom, props.position),
            zoom: DragContainer.zoomToParent(props, props.zoom)
        };
    }
    render() {
        return (
            <div
                className="drag-container"
                onWheel={this.onWheel}
                ref={this.myRef}
                onMouseDown={this.onMouseDown}
                style={{
                    border: `${this.props.debug ? 3 : 0}px solid red`,
                    position: 'relative',
                    left: this.state.pos.x + 'px',
                    top: this.state.pos.y + 'px',
                    background: `url(${this.props.background})`,
                    backgroundSize: 'cover',
                    width: this.props.width * this.state.zoom,
                    height: this.props.height * this.state.zoom
                    // transform: `scale(${this.state.zoom})`,
                }}
            >
                {this.props.children}
            </div>
        );
    }
}
