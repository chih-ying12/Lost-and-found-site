// backend.js – Parse initialization and core data helpers
Parse.initialize("qknjxJVl86XMkFayCADjD7S61rW8VajE0QVg9XDm", "uAZAVjQWw3VHdnqPGKdV3JEh8uivvEN8leNJi3bp");
Parse.serverURL = "https://parseapi.back4app.com/";

const LostItem = Parse.Object.extend("LostItem");

// Create found item with new fields
async function createFoundItem(data) {
  const item = new LostItem();
  item.set("type", data.type);
  item.set("color", data.color);
  item.set("model", data.model);
  item.set("appearance", data.appearance);
  item.set("description", data.description || "");            // new
  item.set("timeFound", data.timeFound);
  item.set("locationFound", data.locationFound);
  item.set("verificationQuestion", data.verificationQuestion);
  item.set("verificationAnswer", data.verificationAnswer);
  item.set("isResolved", false);
  item.set("verificationAttempts", 0);                       // new
  item.set("nextAttemptAllowedAt", new Date());              // now (instant allow)
  item.set("verificationBlocked", false);                    // new

  if (data.photoFile) {
    const parseFile = new Parse.File(data.photoName, data.photoFile);
    item.set("photo", parseFile);
  }
  return item.save();
}

// Search lost items (unchanged, just uses existing fields)
async function searchLostItems(searchTerm = "") {
  const query = new Parse.Query(LostItem);
  query.equalTo("isResolved", false);
  query.equalTo("verificationBlocked", false);               // hide permanently blocked items
  query.descending("createdAt");
  if (searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    const colorQuery = new Parse.Query(LostItem);
    colorQuery.matches("color", new RegExp(term, "i"));
    const modelQuery = new Parse.Query(LostItem);
    modelQuery.matches("model", new RegExp(term, "i"));
    const appearanceQuery = new Parse.Query(LostItem);
    appearanceQuery.matches("appearance", new RegExp(term, "i"));
    const typeQuery = new Parse.Query(LostItem);
    typeQuery.matches("type", new RegExp(term, "i"));
    const descQuery = new Parse.Query(LostItem);
    descQuery.matches("description", new RegExp(term, "i"));
    return Parse.Query.or(colorQuery, modelQuery, appearanceQuery, typeQuery, descQuery)
      .equalTo("isResolved", false)
      .equalTo("verificationBlocked", false)
      .descending("createdAt")
      .find();
  }
  return query.find();
}

// Verification with cooldowns and block
// Returns { success, message, blocked, cooldownEnd }
async function verifyItem(itemId, userAnswer) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  if (!item) throw new Error("Item not found.");

  // Check if already resolved or permanently blocked
  if (item.get("isResolved")) {
    return { success: false, message: "This item has already been claimed.", blocked: false };
  }
  if (item.get("verificationBlocked")) {
    return { success: false, message: "Verification permanently disabled for this item.", blocked: true };
  }

  const attempts = item.get("verificationAttempts") || 0;
  const nextAllowed = item.get("nextAttemptAllowedAt");

  // If cooldown is active
  if (nextAllowed && new Date() < new Date(nextAllowed)) {
    const diffMs = new Date(nextAllowed) - new Date();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return {
      success: false,
      message: `Too many wrong attempts. Please try again in ${hours}h ${minutes}m.`,
      blocked: false,
      cooldownEnd: nextAllowed
    };
  }

  const correctAnswer = (item.get("verificationAnswer") || "").trim().toLowerCase();
  const userAns = userAnswer.trim().toLowerCase();

  if (correctAnswer === userAns) {
    // Correct answer – reset attempts and mark resolved
    item.set("verificationAttempts", 0);
    item.set("nextAttemptAllowedAt", new Date());
    item.set("verificationBlocked", false);
    item.set("isResolved", true);
    await item.save();
    return { success: true, message: "✅ Correct! Item claimed." };
  }

  // Wrong answer – increment attempts and apply cooldown/block
  const newAttempts = attempts + 1;
  item.set("verificationAttempts", newAttempts);

  if (newAttempts >= 9) {
    // Permanently block after 9 wrong tries
    item.set("verificationBlocked", true);
    item.set("nextAttemptAllowedAt", null);
    await item.save();
    return { success: false, message: "Too many failed attempts. Verification permanently blocked.", blocked: true };
  } else if (newAttempts >= 6) {
    // 5-hour cooldown
    const cooldown = new Date(Date.now() + 5 * 3600 * 1000);
    item.set("nextAttemptAllowedAt", cooldown);
    await item.save();
    return { success: false, message: `Wrong answer. Please try again after 5 hours.`, blocked: false, cooldownEnd: cooldown };
  } else if (newAttempts >= 3) {
    // 3-hour cooldown
    const cooldown = new Date(Date.now() + 3 * 3600 * 1000);
    item.set("nextAttemptAllowedAt", cooldown);
    await item.save();
    return { success: false, message: `Wrong answer. Please try again after 3 hours.`, blocked: false, cooldownEnd: cooldown };
  } else {
    // No cooldown yet, just save attempts
    item.set("nextAttemptAllowedAt", new Date());  // still allowed immediately
    await item.save();
    return { success: false, message: `Wrong answer. ${3 - newAttempts} attempt(s) remaining before cooldown.` };
  }
}

// Get verification question (unchanged)
async function getVerificationQuestion(itemId) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  return item ? item.get("verificationQuestion") || "No question set" : null;
}
