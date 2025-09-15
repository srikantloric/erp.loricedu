import { FieldValue, Timestamp } from "firebase/firestore";

export type Permissions = Record<string, boolean>;
type Role = "admin" | "operator"  ;
export interface Users {
    id?: string,
    uid: string,
    email: string,
    profile: string,
    name: string,
    role: Role,
    permissions: Permissions,
    createdAt: Timestamp ,
    updatedAt: Timestamp | FieldValue,
}