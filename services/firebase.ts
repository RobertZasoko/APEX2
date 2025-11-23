import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment // Import increment
} from "firebase/firestore";
import { UserProfile, CallRecord } from "../types";

// Your web app's Firebase configuration from the prompt
const firebaseConfig = {
  apiKey: "AIzaSyD_gs5GLawg_fe2z3N-oslfbeBIzVxooGs",
  authDomain: "apex-ai-ed601.firebaseapp.com",
  projectId: "apex-ai-ed601",
  storageBucket: "apex-ai-ed601.firebasestorage.app",
  messagingSenderId: "882893994175",
  appId: "1:882893994175:web:5cb0d98b818042a488ee0a",
  measurementId: "G-03B1PK1LNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const getUserProfile = async (userId: string): Promise<Omit<UserProfile, 'callHistory'> | null> => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: userId,
            name: data.name,
            email: data.email,
            savedScenarios: data.savedScenarios || [],
            subscriptionStatus: data.subscriptionStatus,
            freeCredits: data.freeCredits || 0, // Get freeCredits
            createdAt: data.createdAt?.toDate(),
        } as Omit<UserProfile, 'callHistory'>;
    } else {
        return null;
    }
};

export const saveSimulation = async (userId: string, simulationData: { scenario: any; transcript: any; feedback: any; callRecordingUrl: string | null; }): Promise<string> => {
    const simulationsColRef = collection(db, "users", userId, "simulations");
    const docRef = await addDoc(simulationsColRef, {
        ...simulationData,
        transcript: JSON.stringify(simulationData.transcript),
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const deleteSimulation = async (userId: string, simulationId: string): Promise<void> => {
    const simulationDocRef = doc(db, "users", userId, "simulations", simulationId);
    await deleteDoc(simulationDocRef);
};


export const deleteMultipleSimulations = async (userId: string, simulationIds: string[]): Promise<void> => {
    if (simulationIds.length === 0) return;

    const batch = writeBatch(db);
    
    simulationIds.forEach(id => {
        const simulationDocRef = doc(db, "users", userId, "simulations", id);
        batch.delete(simulationDocRef);
    });

    await batch.commit();
};


export const getSimulations = async (userId: string): Promise<CallRecord[]> => {
    const simulationsColRef = collection(db, "users", userId, "simulations");
    const q = query(simulationsColRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;
        return {
            id: doc.id,
            date: createdAt ? createdAt.toDate().toLocaleString() : new Date().toLocaleString(),
            scenario: data.scenario,
            transcript: JSON.parse(data.transcript),
            feedback: data.feedback,
            callRecordingUrl: data.callRecordingUrl,
        } as CallRecord;
    });
};

export const updateUserProfile = async (userId: string, data: Partial<Omit<UserProfile, 'id' | 'email' | 'callHistory'>>): Promise<void> => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // If user profile doesn't exist, set initial values
        await setDoc(userRef, {
            name: data.name || "",
            email: data.email || "", // This should ideally come from auth.currentUser.email
            savedScenarios: [],
            subscriptionStatus: "free", // Default to free
            freeCredits: 5, // Default free credits for new users
            createdAt: serverTimestamp(),
            ...data, // Merge any provided data
        });
    } else {
        // If user profile exists, update it
        await updateDoc(userRef, data);
    }
};

export const decrementUserCredits = async (userId: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        freeCredits: increment(-1)
    });
};

export {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
