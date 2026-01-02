// firebase-config.js
// استيراد المكتبات من سيرفرات جوجل مباشرة (لا يحتاج تنصيب)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// معلومات مشروعك (Mizan Auth)
const firebaseConfig = {
    apiKey: "AIzaSyCBfjUajnfrFpZaaSfYx8JAyHLs2duFMw0",
    authDomain: "mizan-auth.firebaseapp.com",
    projectId: "mizan-auth",
    storageBucket: "mizan-auth.firebasestorage.app",
    messagingSenderId: "863003198174",
    appId: "1:863003198174:web:b7215ce349318b1b03b84f",
    measurementId: "G-R5L91BGKFC"
};

// تشغيل فايربيس
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// تصدير أدوات المصادقة لنستخدمها في الملفات الأخرى
export { auth };