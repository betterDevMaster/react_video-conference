export function offsetPoint(pos1, pos2){return {x: pos1.x-pos2.x, y:pos1.y-pos2.y}}
export function addPoint (pos1, pos2){return {x: pos1.x+pos2.x, y:pos1.y+pos2.y}}
export function multiplyPoint (pos1, x){return {x: pos1.x*x, y:pos1.y*x}}
export function getZoom(ele){ return ele.style.zoom===''?1:parseFloat(ele.style.zoom)}
export function setCurrentDragElement(ele, firstPos={x:0,y:0}){
    window.currentDragElement = ele
    if(ele){
        ele.dragInfo = {
            currPos: {x: ele.offsetLeft, y: ele.offsetTop},
            firstPos:{x: firstPos.x, y: firstPos.y},
        }
    }
}
export function getCurrentDragElement(){
    return window.currentDragElement;
}

export function calcCurrentPos(ele, mousePos){
    // console.log('calcCurrentPos --------------', getZoom(ele))
    return addPoint(
        ele.dragInfo.currPos, 
        multiplyPoint(
            offsetPoint(mousePos, ele.dragInfo.firstPos), 
            1 / getZoom(ele)
        )
    );
}