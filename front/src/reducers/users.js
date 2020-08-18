const users = (state = [], action) => {
    switch (action.type) {
        case "user_add":
            // console.log('reducer user_add : ', state, action)
            if (state.find((user) => user.id === action.value.id)) {
                console.log('Duplicate user error!', action.value)
                return state;
            }
            return [
                ...state,
                { ...action.value, media: { mic: 'on', camera: 'on' } }
            ]
        case "user_remove":
            return state.filter((user) => user.id !== action.value.id);
        case "user_media":
            return state.map((user) => {
                if (user.id !== action.value.id)
                    return user;
                if (action.value.type === 'mic')
                    return { ...user, media: { ...user.media, mic: action.value.status } }
                if (action.value.type === 'camera')
                    return { ...user, media: { ...user.media, camera: action.value.status } }
                return { ...user, media: { ...user.media, screenshare: action.value.status } }
            });
        case "user_position":
            return state.map((user) => {
                if (user.id !== action.value.id)
                    return user;
                return { ...user, ...action.value }
            });
        
        default:
            return state
    }
}
export default users;