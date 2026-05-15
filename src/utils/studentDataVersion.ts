import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, getDoc } from "firebase/firestore";

export async function fetchStudentDataVersion() {
  const db = await getFirestoreInstance();
  const metaDoc = await getDoc(doc(db, "APP_META", "STUDENT_SEARCH"));
  if (metaDoc.exists()) {
    const data = metaDoc.data();
    return data.version;
  }
  return null;
}
