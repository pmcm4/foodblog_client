import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'; // Make sure to import the 'storage' module here


const firebaseConfig = {
    apiKey: "AIzaSyCfnuCvw4gCzUryaff6K0iHI6KAdoMFOHw",
    authDomain: "foodblog-login.firebaseapp.com",
    projectId: "foodblog-login",
    storageBucket: "foodblog-login.appspot.com",
    messagingSenderId: "995982326503",
    appId: "1:995982326503:web:abf8310c50c2cd74be4042",
    measurementId: "G-2WQW3ZYH0K"
  };

  firebase.initializeApp(firebaseConfig);

  const storage = firebase.storage();
  
  // Pass 'file' as an argument to the upload function
  export const upload = async (file: any) => {
    try {
      const fileRef = storage.ref().child(`upload/${file.name}`);
      await fileRef.put(file);
      const downloadURL = await fileRef.getDownloadURL();
      return downloadURL;
    } catch (err) {
      console.log(err);
    }
  };


export default firebase;