// main.js – Deploy to Back4App
// Only includes getAllUsers for the host panel

// ============================================================
// getAllUsers – returns all users (without sensitive data)
// ============================================================
Parse.Cloud.define("getAllUsers", async (request) => {
  const query = new Parse.Query(Parse.User);
  query.select(["username", "email", "ezlink", "createdAt", "updatedAt"]);
  const users = await query.find({ useMasterKey: true });
  return users.map(user => ({
    id: user.id,
    username: user.get("username"),
    email: user.get("email"),
    ezlink: user.get("ezlink"),
    createdAt: user.get("createdAt"),
    updatedAt: user.get("updatedAt")
  }));
});
