const screens = (state = {bgMoving:false, videos: [], images: []}, action) => {
    switch(action.type){
        case "backgound_moving":
            return {
                ...state,
                bgMoving: action.value
            }
        case "youtube_add":
            const new_videos = [...state.videos, action.value];
            return {
                ...state,
                videos: new_videos
            }
        case "youtube_remove":
            const remove_videos = state.videos.filter(x => x.name!==action.name);
            return {
                ...state,
                videos: remove_videos
            }
        case "youtube_remove_by_id":
            return { ...state, videos: state.videos.filter((video)=>{
                return video.id !== action.peerId;
            })}
        case "youtube_position":
            const moved_videos = state.videos.map((video) => {
                if (video.name !== action.value.name)
                    return video;
                return {...video, ...action.value}
            });
            return {
                ...state,
                videos: moved_videos
            }
        case "youtube_play":
            const play_videos = state.videos.map((video) => {
                if (video.name !== action.value.name)
                    return video;
                return {...video, ...action.value}
            });
            return {
                ...state,
                videos: play_videos
            }
        case "image_add":
            const new_images = [...state.images, action.value];
            return {
                ...state,
                images: new_images
            }
        case "image_remove_by_id":
            return { ...state, images: state.images.filter((img)=>{
                return img.id !== action.peerId;
            })}
        case "image_remove":
            const remove_images = state.images.filter(x => x.name!==action.name);
            return {
                ...state,
                images: remove_images
            }
        case "image_position":
            const moved_images = state.images.map((image) => {
                console.log(image, action, {...image, ...action.value})
                if (image.name !== action.value.name)
                    return image;
                return {...image, ...action.value}
            });
            return {
                ...state,
                images: moved_images
            }
        default:
            return state;
    }
}

export default screens;