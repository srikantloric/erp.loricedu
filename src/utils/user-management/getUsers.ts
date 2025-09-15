import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, getDocs } from "firebase/firestore";
import { Users } from "types/Users";

export const getUsers = async (): Promise<Users[]> => {
    // Initialize Firebase for the school
    const db = await getFirestoreInstance();
    const adminUserColRef = collection(db, "ADMIN_USERS");

    try {
        const adminUsersSnap = await getDocs(adminUserColRef);

        if (!adminUsersSnap.empty) {
            const adminUsers = adminUsersSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            return adminUsers as Users[];
        } else {
            throw new Error("No admin user found!");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Error while fetching admin users!");
    }
};
