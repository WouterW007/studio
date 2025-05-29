/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions/v2/https"); // Use require for runtime
// Import specific types for TypeScript
import type { CallableRequest } from "firebase-functions/v2/https";

const logger = require("firebase-functions/logger");    // Use require
const admin = require("firebase-admin");               // Use require

admin.initializeApp();
const db = admin.firestore();

// Define an interface for the expected request data
interface ApproveGroupRequestData {
  groupId: string;
}

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Use the imported CallableRequest type directly
exports.approveGroup = functions.onCall(async (request: CallableRequest<ApproveGroupRequestData>) => { // Use exports
  logger.info("approveGroup function called",
    {data: request.data, auth: request.auth});

  // 1. Check if the user is authenticated
  if (!request.auth) {
    logger.warn("approveGroup called by unauthenticated user");
    throw new functions.HttpsError( // This uses the 'functions' constant (runtime value)
      "unauthenticated",
      "Only authenticated users can approve groups."
    );
  }

  const userId = request.auth.uid;

  // 2. Check if the authenticated user is an admin
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data()?.isAdmin !== true) {
      logger.warn(`User ${userId} is not an admin and attempted to ` +
                  "approve group.");
      throw new functions.HttpsError( // Runtime value
        "permission-denied",
        "Only administrators can approve groups."
      );
    }
  } catch (error) {
    logger.error(`Error checking admin status for user ${userId}:`, error);
    throw new functions.HttpsError( // Runtime value
      "internal",
      "Could not verify admin status.",
      error
    );
  }

  // 3. Get the pending group ID from the request data
  const pendingGroupId = request.data.groupId;

  if (!pendingGroupId || typeof pendingGroupId !== "string") {
    logger.warn("approveGroup called with invalid or missing groupId",
      {data: request.data});
    throw new functions.HttpsError( // Runtime value
      "invalid-argument",
      "The function must be called with a valid groupId."
    );
  }

  const pendingGroupRef = db.collection("pendingGroups").doc(pendingGroupId);
  // Use the same ID for the new group document
  const groupRef = db.collection("groups").doc(pendingGroupId);

  try {
    // 4. Get the pending group data
    const pendingGroupDoc = await pendingGroupRef.get();

    // CORRECTED LINE
    if (!pendingGroupDoc.exists) {
      logger.warn(`Pending group with ID ${pendingGroupId} not found.`);
      throw new functions.HttpsError("not-found", // Runtime value
        "The pending group does not exist.");
    }

    const groupData = pendingGroupDoc.data();

    if (!groupData) {
      logger.error(`Pending group ${pendingGroupId} has no data.`);
      throw new functions.HttpsError("internal", // Runtime value
        "Pending group data is empty.");
    }

    // 5. Use a batch to perform atomic write and delete operations
    const batch = db.batch();

    // Add the group to the 'groups' collection with status 'active'
    batch.set(groupRef, {...groupData, status: "active"});

    // Delete the group from the 'pendingGroups' collection
    batch.delete(pendingGroupRef);

    // Commit the batch
    await batch.commit();

    logger.info(`Group ${pendingGroupId} approved successfully.`);

    // 6. Return success response
    return {status: "success", message: "Group approved successfully."};
  } catch (error) {
    logger.error(`Error approving group ${pendingGroupId}:`, error);
    // Re-throw the error as an HttpsError if it's not already one
    if (error instanceof functions.HttpsError) { // Runtime value check
      throw error;
    } else {
      throw new functions.HttpsError( // Runtime value
        "internal",
        "An error occurred while approving the group.",
        error
      );
    }
  }
});

// The following import was removed as it was redundant and incorrect:
// import * as https from "firebase-functions/v2/https";