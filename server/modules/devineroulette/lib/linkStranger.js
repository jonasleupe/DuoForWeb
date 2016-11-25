const Status = require(`../const/Status`);

module.exports = (users, me) => {
  return users.map(u => {
    if (u.socketId === me.paired) {
      u.status = Status.PAIRED;
      u.paired = me.socketId;
    }

    return u;
  });
};
