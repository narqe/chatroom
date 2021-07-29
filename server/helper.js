const users = [];

const addUser = ({socketId, name, userId, roomId}) => {
    const exist = users.find(user => user.roomId === roomId && user.userId === userId);
    let user;
    if(!exist){
        user = {socketId, name, userId, roomId};
        users.push(user)
    }
    return {user}
}

const removeUser = (socketId) => {
    const index = users.findIndex(user => user.socketId === socketId);
    
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (socketId) => users.find(user => user.socketId === socketId);

const removeRoom = (rooms, roomId) => {
    const index = rooms.findIndex(room => room._id == roomId);
    if(index !== -1){
        return rooms.splice(index,1)[0]
    }
}

module.exports = { addUser, removeUser, getUser, removeRoom }