import {startProxyServer} from "./proxy/proxy";
import {startHono} from "./hono/hono";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCjXdBxLab3xKzm1fhju_voWkB-6d94Ryk",
    authDomain: "codeclick-faf24.firebaseapp.com",
    projectId: "codeclick-faf24",
    storageBucket: "codeclick-faf24.appspot.com",
    messagingSenderId: "997435511640",
    appId: "1:997435511640:web:6b64aaf9ae303371b1cb2d",
    measurementId: "G-GY16WV6CPT"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

console.log("functions", functions);


const testFunction = httpsCallable(functions, 'helloWorld');


testFunction({ text: 'Hello from the web!' })
    .then((result) => {
        // Handle the result
        console.log(result.data);
    })
    .catch((error) => {
        // Handle the error
        console.error(error);
    });

// const addMessage = httpsCallable(functions, 'addMessage');



startHono();
startProxyServer(3000, 3004);