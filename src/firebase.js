// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtA0qrfucChBnvPDfYIGMV0p5gzYVwaEk",
    authDomain: "dope-4427f.firebaseapp.com",
    projectId: "dope-4427f",
    storageBucket: "dope-4427f.appspot.com",
    messagingSenderId: "1017579947610",
    appId: "1:1017579947610:web:f632867c4d38ec25a3fa63"
};
// const firebaseConfig = {
//     apiKey: process.env.apiKey,
//     authDomain: process.env.authDomain,
//     projectId: process.env.projectId,
//     storageBucket: process.env.storageBucket,
//     messagingSenderId: process.env.messagingSenderId,
//     appId: process.env.appId
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);