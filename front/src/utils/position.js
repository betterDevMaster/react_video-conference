export default class Utils{
    static addPosition(pos, pos1){
        return {x: pos.x+pos1.x, y: pos.y+pos1.y}
    }
    static multiplyPosition(pos, mul){
        return {x: pos.x*mul, y: pos.y*mul}
    }
    static getPositionFromTransform(ele){
        try{
            var posArr = ele.style.transform.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
            return {x: posArr[0], y: posArr[1]}    
        } catch(e){
            console.error(e);
            return {x:0, y:0}
        }
    }
    static getPositionFromTransformWithScale(ele){
        try{
            var posArr = ele.style.transform.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
            return {x: posArr[0], y: posArr[1], scale: posArr[2]}    
        } catch(e){
            console.error(e);
            return {x:0, y:0}
        }
    }
    static getPositionFromStyle(ele){
        try{
            return {x: ele.offsetLeft, y: ele.offsetTop}
        } catch(e){
            console.error(e);
            return {x:0, y:0}
        }
    }
    static getPositionAndSizeFromStyle(ele){
        try{
            var left = ele.style.left.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)[0]
            var top = ele.style.top.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)[0]
            var width = ele.style.width.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)[0]
            var height = ele.style.height.match(/[+-]?\d+(?:\.\d+)?/g).map(Number)[0]
            return {x: left, y: top, width: width, height: height}
        } catch(e){
            console.error(e);
            return {x:0, y:0, width: 0, height: 0}
        }
    }
    static getValueFromAttr(ele, attrName){
        try{
            return {value: ele.getAttribute(attrName).match(/[+-]?\d+(?:\.\d+)?/g).map(Number)[0]}
        } catch(e){
            console.error(e);
            return {value: ''}
        }
    }
    static setPositionOfHtmlElement(ele, pos){
        try{
            ele.style.left = pos.x + 'px';
            ele.style.top = pos.y + 'px';
            return true;
        } catch(e){
            console.error(e);
            return false;
        }
    }
    static isInRect(rect, pos){
        try{
            if(pos.x >= rect.left && pos.x <= rect.right && pos.y >= rect.top && pos.y <= rect.bottom)
                return true;
            return false
        }catch(e){
            console.error(e);
            return false;
        }
    }
    static width(){
        return(window.innerWidth)?
        window.innerWidth:
        document.documentElement.clientWidth||document.body.clientWidth||0;
    }
    static height(){
        return(window.innerHeight)?
        window.innerHeight:
        document.documentElement.clientHeight||document.body.clientHeight||0;
    }
}