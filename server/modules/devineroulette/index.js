module.exports.register = (server, options, next) => {

  console.log(`hello roulette`);

  const io = require(`socket.io`)(server.listener);
  const Status = require(`./const/Status`);

  const search = require(`./lib/search`);
  const linkStranger = require(`./lib/linkStranger`);
  const cleanPaired = require(`./lib/cleanPaired`);

  let users = [];

  io.on(`connection`, socket => {
    const {id: socketId} = socket;

    const me = {
      status: Status.SEARCHING,
      socketId
    };

    console.log(me.socketId);
    socket.emit(`connected`, me.socketId);

    users.push(me);

    socket.on(`search`, () => {
      const stranger = search(users, me);

      if (stranger) {
        me.status = Status.PAIRED;
        me.paired = stranger.socketId;
        users = linkStranger(users, me);

        const data = [me.socketId, stranger.socketId];

        socket.emit(`found`, data);
      }

    });

    socket.on(`yo`, data => {
      io.to(data[1]).emit(`yo`, data);
    });

    socket.on(`disconnect`, () => {
      users = users.filter(c => c.socketId !== socketId);
      users = cleanPaired(users, me);
    });
  });

  next();
};

module.exports.register.attributes = {
  name: `devineroulette`,
  version: `0.1.0`
};
