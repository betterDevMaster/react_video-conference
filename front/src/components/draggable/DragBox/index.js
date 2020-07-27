import React from 'react';
import './index.css';

export default class DragBox extends React.Component {
    constructor(props) {
        super(props);
        this.resizeXRef = React.createRef();
        this.resizeYRef = React.createRef();
        this.resizeXYRef = React.createRef();
        this.moveRef = React.createRef();
        this.myRef = React.createRef();
        this.state = {
            dragging: !props.draggable,
            dragType: '',
            rel: null, // position relative to the cursor
            scale: props.scale,
            position: {
                x: props.initialRect.left | 0,
                y: props.initialRect.top | 0
            },
            width: props.initialRect.width | 0,
            height: props.initialRect.height | 0,
            tipState: false
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.draggable)
            return {
                offset: props.offset,
                scale: props.scale,
                style: calcStyle(props, state),
            };
        else {
            return {
                offset: props.offset,
                scale: props.scale,
                style: calcStyle(props, state),
                position: {
                    x: props.initialRect.left | 0,
                    y: props.initialRect.top | 0
                }
            };
        }
    }

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
        let dragType = '';
        if (e.button === 0) {
            switch (ele) {
                case this.moveRef.current:
                    dragType = 'move';
                    break;
                case this.resizeXRef.current:
                    dragType = 'resize-x';
                    break;
                case this.resizeYRef.current:
                    dragType = 'resize-y';
                    break;
                case this.resizeXYRef.current:
                    dragType = 'resize-xy';
                    break;
                default:
                    return;
            }
        }
        var pos = {
            left: this.myRef.current.offsetLeft,
            top: this.myRef.current.offsetTop
        };
        this.setState({
            dragging: true,
            dragType,
            rel: {
                x: e.pageX - pos.left,
                y: e.pageY - pos.top,
                w: (e.pageX / this.state.scale) * 2 - this.state.width * this.props.zoom,
                h: (e.pageY / this.state.scale) * 2 - this.state.height * this.props.zoom
            }
        });

        // const posDown = {
        //     x: this.state.position.x * this.props.scale,
        //     y: this.state.position.y * this.props.scale
        // };
        // if (this.props.onMouseDown) this.props.onMouseDown(posDown);

        e.stopPropagation();
        e.preventDefault();
    };
    onMouseUp = (e) => {
        this.setState({ dragging: false });

        // const posUp = {
        //     x: this.state.position.x * this.props.scale,
        //     y: this.state.position.y * this.props.scale
        // };
        // if (this.props.onMouseUp) this.props.onMouseUp(posUp);

        e.stopPropagation();
        e.preventDefault();
    };
    onMouseMove = (e) => {
        switch (this.state.dragType) {
            case 'move':
                {
                    const newPos = {
                        x: (e.pageX - this.state.rel.x) / this.state.scale,
                        y: (e.pageY - this.state.rel.y) / this.state.scale
                    };
                    newPos.x = Math.max(1, Math.min(this.myRef.current.parentNode.parentNode.clientWidth / this.state.scale - 1, newPos.x));
                    newPos.y = Math.max(1, Math.min(this.myRef.current.parentNode.parentNode.clientHeight / this.state.scale - 1, newPos.y));
                    this.setState({
                        position: newPos
                    });

                    if (this.props.onMouseMove) this.props.onMouseMove(this.myRef.current, newPos, this.state.scale);
                }
                break;
            case 'resize-x':
                {
                    const w = Math.max(20, (e.pageX / this.state.scale) * 2 - this.state.rel.w);
                    if (this.props.aspect) {
                        this.setState({
                            width: w,
                            height: (w / this.props.initialRect.width) * this.props.initialRect.height
                        });
                    } else {
                        this.setState({ width: w });
                    }
                }
                break;
            case 'resize-y':
                {
                    const h = Math.max(20, (e.pageY / this.state.scale) * 2 - this.state.rel.h);
                    if (this.props.aspect) {
                        this.setState({
                            height: h,
                            width: (h / this.props.initialRect.height) * this.props.initialRect.width
                        });
                    } else {
                        this.setState({ height: h });
                    }
                }
                break;
            case 'resize-xy':
                {
                    const w = Math.max(20, (e.pageX / this.state.scale) * 2 - this.state.rel.w);
                    const h = Math.max(20, (e.pageY / this.state.scale) * 2 - this.state.rel.h);
                    if (this.props.aspect) {
                        this.setState({
                            width: w,
                            height: (w / this.props.initialRect.width) * this.props.initialRect.height
                        });
                    } else {
                        this.setState({ width: w, height: h });
                    }
                }
                break;
            default:
        }

        // const posMove = {
        //     x: this.state.position.x * this.props.scale,
        //     y: this.state.position.y * this.props.scale
        // };
        // if (this.props.onMouseMove) this.props.onMouseMove(posMove);

        e.stopPropagation();
        e.preventDefault();
    };
    handleClickSmall = (e) => {
        const pos = {
            x: this.state.position.x * this.props.scale,
            y: this.state.position.y * this.props.scale
        };
        if (this.props.onClickSmall) this.props.onClickSmall(pos);
        e.stopPropagation();
        e.preventDefault();
    };

    render() {
        return (
            < div
                onMouseEnter={(e) => { this.setState({ tipState: true }) }}
                onMouseLeave={(e) => { this.setState({ tipState: false }) }}>
                <div ref={this.myRef} className={`drag-box ${this.props.type}`} style={this.state.style} onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown}>
                    {this.props.sizable && <div className="drag-size-x" ref={this.resizeXRef} onMouseDown={this.onMouseDown} />}
                    {this.props.sizable && <div className="drag-size-y" ref={this.resizeYRef} onMouseDown={this.onMouseDown} />}
                    {this.props.sizable && <div className="drag-size-xy" ref={this.resizeXYRef} onMouseDown={this.onMouseDown} />}
                    <div className="drag-move" ref={this.moveRef} onMouseDown={this.onMouseDown} />

                    {this.props.children}
                    <div className='tip' >{this.state.tipState ? (<span className='tip-pan'>{this.props.tip}</span>) : ''}</div>

                </div>

                {
                    this.state.style.small && (
                        <div
                            className="circle-arrow"
                            style={{ ...this.state.style, borderColor: this.props.draggable ? 'yellow' : 'white', transform: `translate(-50%, -50%) rotate(${this.state.style.angle}deg)` }}
                            onMouseDown={this.handleClickSmall}
                        />
                    )
                }
            </div >
        );
    }
}
function calcStyle(props, state) {
    const style = {
        left: state.position.x * props.scale,
        top: state.position.y * props.scale,
        width: state.width * props.zoom,
        height: state.height * props.zoom,
        zIndex: props.zIndex | 0,
        transform: `translate(-50%, -50%) scale(${props.scale})`
    };
    const stage = document.getElementById('stage');
    if (props.type === 'circle' && stage) {
        const smallCircleSize = 70;
        const offset = calcOffest(
            {
                left: -props.offset.x,
                top: -props.offset.y,
                right: -props.offset.x + stage.clientWidth,
                bottom: -props.offset.y + stage.clientHeight
            },
            { x: style.left, y: style.top },
            smallCircleSize
        );

        if (offset) {
            style.small = true;
            style.angle =
                -45 +
                (180 / Math.PI) *
                Math.atan2(-props.offset.y + stage.clientHeight / 2 - style.top, -props.offset.x + stage.clientWidth / 2 - style.left);
            style.width = smallCircleSize;
            style.height = smallCircleSize;
            style.left = offset.x;
            style.top = offset.y;
            style.transform = `translate(-50%, -50%)`;
        }
    }
    return style;
}
function calcOffest(parentRect, pos, smallCircleSize) {
    var offset = { x: pos.x, y: pos.y };
    if (pos.x > parentRect.left && pos.x < parentRect.right && pos.y > parentRect.top && pos.y < parentRect.bottom) return null;
    if (pos.x <= parentRect.left) offset.x = parentRect.left + smallCircleSize / 2 + 20;
    if (pos.x >= parentRect.right) offset.x = parentRect.right - smallCircleSize / 2 - 20;
    if (pos.y <= parentRect.top) offset.y = parentRect.top + smallCircleSize / 2 + 20;
    if (pos.y >= parentRect.bottom) offset.y = parentRect.bottom - smallCircleSize / 2 - 20;
    return offset;
}
