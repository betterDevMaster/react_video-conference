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
    static getPositionFromStyle(ele){
        try{
            return {x: ele.offsetLeft, y: ele.offsetTop}
        } catch(e){
            console.error(e);
            return {x:0, y:0}
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