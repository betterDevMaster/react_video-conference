import * as React from 'react';
export declare type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export interface PanAndZoomHOCProps {
    x?: number;
    y?: number;
    scale?: number;
    scaleFactor?: number;
    minScale?: number;
    maxScale?: number;
    renderOnChange?: boolean;
    passOnProps?: boolean;
    ignorePanOutside?: boolean;
    disableScrollZoom?: boolean;
    disableZoomToMouse?: boolean;
    zoomEndTimeout?: number;
    shiftBoxZoom?: boolean;
    onPanStart?: (event: MouseEvent | TouchEvent) => void;
    onPanMove?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onPanEnd?: (x: number, y: number, event: MouseEvent | TouchEvent) => void;
    onZoom?: (x: number | undefined, y: number | undefined, scale: number | undefined, event: WheelEvent) => void;
    onZoomEnd?: () => void;
    onPanAndZoom?: (x: number, y: number, scale: number, event: WheelEvent) => void;
    onBoxStart?: (clientX: number, clientY: number, event: MouseEvent | TouchEvent) => void;
    onBoxMove?: (clientX1: number, clientY1: number, clientX2: number, clientY2: number, event: MouseEvent | TouchEvent) => void;
    onBoxEnd?: (clientX1: number, clientY1: number, clientX2: number, clientY2: number, event: MouseEvent | TouchEvent) => void;
}
export default function panAndZoom<P = any>(WrappedComponent: React.ElementType<P>): React.ComponentClass<Overwrite<P, PanAndZoomHOCProps>>;
