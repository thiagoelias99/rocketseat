import "server-only"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
// import { getStorage } from "firebase-admin/storage"

const decodedPrivateKey = Buffer.from(
  process.env.FIREBASE_PRIVATE_KEY_BASE64!, "base64"
).toString("utf-8")

export const firebaseCertificate = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: decodedPrivateKey,
})

// Initialize Firebase Admin SDK
// This code is only run on the server side
if (!getApps().length) {
  console.log("Initializing Firebase Admin SDK")
  initializeApp({
    credential: firebaseCertificate,
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  })
  console.log("Firebase Admin SDK initialized")
}

export const db = getFirestore()
// export const storage = getStorage().bucket()