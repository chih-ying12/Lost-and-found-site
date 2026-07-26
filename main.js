// main.js – Deploy to Back4App
Parse.Cloud.define("getAllUsers", async (request) => {
  const query = new Parse.Query(Parse.User);
  query.select(["username", "can", "nationality", "createdAt", "updatedAt"]);
  try {
    const users = await query.find({ useMasterKey: true });
    console.log(`✅ Found ${users.length} users`);
    return users.map(user => ({
      id: user.id,
      username: user.get("username"),
      can: user.get("can"),
      nationality: user.get("nationality"),
      createdAt: user.get("createdAt"),
      updatedAt: user.get("updatedAt")
    }));
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    throw new Error('Unable to fetch users');
  }
});
