// main.js – Deploy to Back4App
Parse.Cloud.define("getAllUsers", async (request) => {
  const query = new Parse.Query(Parse.User);
  query.select(["username", "ezlink", "createdAt", "updatedAt"]);
  const users = await query.find({ useMasterKey: true });
  return users.map(user => ({
    id: user.id,
    username: user.get("username"),
    ezlink: user.get("ezlink"),
    createdAt: user.get("createdAt"),
    updatedAt: user.get("updatedAt")
  }));
});
