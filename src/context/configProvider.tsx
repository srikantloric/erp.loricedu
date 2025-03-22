import { createContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "./firebaseContext";


// Define the structure of your config
interface AppConfig {
    apiUrl: string;
    featureFlag: boolean;
    theme: string;
}

// Create a context with default values
export const ConfigContext = createContext<AppConfig | null>(null);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const { db } = useFirebase(); // Assuming you have a Firebase context

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, "CONFIG", "APP_CONFIG"); // Adjust the path as needed
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setConfig(docSnap.data() as AppConfig);
                    console.log("Config loaded:", docSnap.data());
                } else {
                    console.error("No config document found!");
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };

        fetchConfig();
    }, []);

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
