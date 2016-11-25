const Status = require(`../const/Status`);

module.exports = (users, me) => {
  return users.map(u => {

    if (u.paired === me.socketId) {
      u.status = Status.SEARCHING;
      u.paired = ``;
    }

    return u;
  });
};
