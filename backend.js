// backend.js – Parse initialization and core data helpers
Parse.initialize("qknjxJVl86XMkFayCADjD7S61rW8VajE0QVg9XDm", "uAZAVjQWw3VHdnqPGKdV3JEh8uivvEN8leNJi3bp");
Parse.serverURL = "https://parseapi.back4app.com/";

// Class: LostItem
const LostItem = Parse.Object.extend("LostItem");

// Save a new found item
async function createFoundItem(data) {
  const item = new LostItem();
  item.set("type", data.type); // "electronic", "money", "other"
  item.set("color", data.color);
  item.set("model", data.model);
  item.set("appearance", data.appearance);
  item.set("timeFound", data.timeFound);
  item.set("locationFound", data.locationFound);
  item.set("verificationQuestion", data.verificationQuestion);
  item.set("verificationAnswer", data.verificationAnswer);
  item.set("isResolved", false);
  if (data.photoFile) {
    const parseFile = new Parse.File(data.photoName, data.photoFile);
    item.set("photo", parseFile);
  }
  return item.save();
}

// Query lost items with optional search filter
async function searchLostItems(searchTerm = "") {
  const query = new Parse.Query(LostItem);
  query.equalTo("isResolved", false);
  query.descending("createdAt");
  if (searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    // Build a compound query: matches color, model, appearance, or type
    const colorQuery = new Parse.Query(LostItem);
    colorQuery.matches("color", new RegExp(term, "i"));
    const modelQuery = new Parse.Query(LostItem);
    modelQuery.matches("model", new RegExp(term, "i"));
    const appearanceQuery = new Parse.Query(LostItem);
    appearanceQuery.matches("appearance", new RegExp(term, "i"));
    const typeQuery = new Parse.Query(LostItem);
    typeQuery.matches("type", new RegExp(term, "i"));
    return Parse.Query.or(colorQuery, modelQuery, appearanceQuery, typeQuery)
      .equalTo("isResolved", false)
      .descending("createdAt")
      .find();
  }
  return query.find();
}

// Verify an item using its secret answer
async function verifyItem(itemId, userAnswer) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  if (!item) throw new Error("Item not found.");
  const correct = item.get("verificationAnswer").trim().toLowerCase();
  const userAns = userAnswer.trim().toLowerCase();
  if (correct === userAns) {
    item.set("isResolved", true);
    await item.save();
    return true;
  }
  return false;
}

// Get verification question for an item
async function getVerificationQuestion(itemId) {
  const query = new Parse.Query(LostItem);
  const item = await query.get(itemId);
  return item ? item.get("verificationQuestion") || "No question set" : null;
}
