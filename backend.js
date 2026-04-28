// backend.js – Parse initialization and core data helpers
Parse.initialize("qknjxJVl86XMkFayCADjD7S61rW8VajE0QVg9XDm", "uAZAVjQWw3VHdnqPGKdV3JEh8uivvEN8leNJi3bp");
Parse.serverURL = "https://parseapi.back4app.com/";

const LostItem = Parse.Object.extend("LostItem");

async function createFoundItem(data) {
  const item = new LostItem();
  item.set("type", data.type);
  item.set("color", data.color);
  item.set("model", data.model);
  item.set("appearance", data.appearance);
  item.set("description", data.description || "");
  item.set("timeFound", data.timeFound);
  item.set("locationFound", data.locationFound);
  item.set("verificationQuestion", data.verificationQuestion);
  item.set("verificationAnswer", data.verificationAnswer);
  item.set("isResolved", false);
  item.set("verificationAttempts", 0);
  item.set("nextAttemptAllowedAt", new Date());
  item.set("verificationBlocked", false);
  item.set("contactInfo", data.contactInfo || "");   // NEW: owner contact

  if (data.photoFile) {
    const parseFile = new Parse.File(data.photoName, data.photoFile);
    item.set("photo", parseFile);
  }
  return item.save();
}

async function searchLostItems(searchTerm = "") {
  const query = new Parse.Query(LostItem);
  query.equalTo("isResolved", false);
  query.equalTo("verificationBlocked", false);
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

async function verifyItem(itemId, userAnswer) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  if (!item) return { success: false, message: "Item not found." };

  if (item.get("isResolved")) {
    return { success: false, message: "Already claimed.", blocked: false };
  }
  if (item.get("verificationBlocked")) {
    return { success: false, message: "Verification permanently blocked.", blocked: true };
  }

  const attempts = item.get("verificationAttempts") || 0;
  const nextAllowed = item.get("nextAttemptAllowedAt");

  if (nextAllowed && new Date() < new Date(nextAllowed)) {
    const diffMs = new Date(nextAllowed) - new Date();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return {
      success: false,
      message: `Cooldown: try again in ${hours}h ${minutes}m.`,
      cooldownEnd: nextAllowed
    };
  }

  const correct = (item.get("verificationAnswer") || "").trim().toLowerCase();
  if (correct === userAnswer.trim().toLowerCase()) {
    item.set("verificationAttempts", 0);
    item.set("nextAttemptAllowedAt", new Date());
    item.set("verificationBlocked", false);
    item.set("isResolved", true);
    await item.save();
    return { success: true, message: "✅ Correct! Item claimed." };
  }

  const newAttempts = attempts + 1;
  item.set("verificationAttempts", newAttempts);

  if (newAttempts >= 9) {
    item.set("verificationBlocked", true);
    item.set("nextAttemptAllowedAt", null);
    await item.save();
    return { success: false, message: "Too many attempts. Permanently blocked.", blocked: true };
  } else if (newAttempts >= 6) {
    const cooldown = new Date(Date.now() + 5 * 3600 * 1000);
    item.set("nextAttemptAllowedAt", cooldown);
    await item.save();
    return { success: false, message: "Wrong answer. Locked for 5 hours.", cooldownEnd: cooldown };
  } else if (newAttempts >= 3) {
    const cooldown = new Date(Date.now() + 3 * 3600 * 1000);
    item.set("nextAttemptAllowedAt", cooldown);
    await item.save();
    return { success: false, message: "Wrong answer. Locked for 3 hours.", cooldownEnd: cooldown };
  } else {
    item.set("nextAttemptAllowedAt", new Date());
    await item.save();
    return { success: false, message: `Wrong answer. ${3 - newAttempts} attempts before cooldown.` };
  }
}

async function getVerificationQuestion(itemId) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  return item ? item.get("verificationQuestion") || "No question set" : null;
}
