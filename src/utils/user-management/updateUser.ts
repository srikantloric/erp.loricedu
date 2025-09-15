import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, updateDoc } from "firebase/firestore";
import { Users } from "types/Users";

/**
 * Updates a user in Firestore
 * @param userId - Firestore document ID of the user
 * @param updatedData - Partial user data to update
 */
export const updateUser = async (userId: string, updatedData: Partial<Users>) => {
    try {
        const db = await getFirestoreInstance();
        const userDocRef = doc(db, "ADMIN_USERS", userId);

        await updateDoc(userDocRef, updatedData);
        console.log(`User ${userId} updated successfully`);
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
};
