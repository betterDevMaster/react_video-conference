import './index.css';

class Dialog{
    static show(id) {
        const ele = window.$('#'+id);
        ele.plainModal('open')
    }
}
export default Dialog;