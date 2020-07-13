import {combineReducers} from 'redux'
import buttons from './buttons'
import users from './users'
import chats from './chats'
import screens from './screen'
// import mediadevices from './medias'

const rootReducer = combineReducers({
    buttons,
    users,
    chats,
    screens
})

export default rootReducer