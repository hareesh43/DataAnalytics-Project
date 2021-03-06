
//add admin 
const adminform = document.querySelector('.admin-actions');
adminform.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    addAdminRole({ email: adminEmail }).then(result => {
        console.log(result);

    });


});

clickCounter = function () {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.clickcount) {
            localStorage.clickcount = Number(localStorage.clickcount) + 1;
        } else {
            localStorage.clickcount = 1;
        }
        // document.getElementById("login").innerHTML = "You have clicked login the button " + localStorage.clickcount + " time(s).";

        console.log("You have clicked login the button " + localStorage.clickcount + " time(s).")
    }
}




//sign up state change
auth.onAuthStateChanged(user => {
    if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            user.admin = idTokenResult.claims.admin;
            //set up UI When log in and log out
            setUpUI(user);

        });
        clickCounter();



        //database firestone

        db.collection('guides').onSnapshot(snapshot => {
            setUpGuides(snapshot.docs);

        }, err => {
            console.log(err.message);
        });

    }
    else {
        setUpUI(user);
        console.log('user logout:', user);
        setUpGuides([]);

    }

});
//upload new  document 

const createForm = document.querySelector('#create-form');
var downloadURLForIndexjs;


createForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const file = document.querySelector('#file_upload').files[0];

    // const file = e.target.files[0];
    const uploadTask = storageRef.child(createForm['title'].value + '/' + file.name).put(file);

    // console.log('file uploaded');


    uploadTask.on('state_changed', function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function (error) {

        switch (error.code) {
            case 'storage/unauthorized':
                //console.log("User doesn't have permission to access the object");

                // User doesn't have permission to access the object
                break;

            case 'storage/canceled':
                //console.log("User canceled the upload");

                // User canceled the upload
                break;



            case 'storage/unknown':
                // console.log(" Unknown error occurred, inspect error.serverResponse");
                // Unknown error occurred, inspect error.serverResponse
                break;
        }
        // Handle unsuccessful uploads
    }, function () {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // console.log('File available at', downloadURL);
            downloadURLForIndexjs = downloadURL;



        });
    });
    //upload the download link to database

    db.collection('guides').add(
        {
            title: createForm['title'].value,
            content: createForm['content'].value,
            download: downloadURLForIndexjs

        }).then(() => {
            // console.log('uploded to the database');

            const modals = document.querySelector('#modal-create');

            M.Modal.getInstance(modals).close();
            createForm.reset();

        }).catch((err) => {
            console.log(err.message);

        })


});



//sign up


const signup = document.querySelector('#signup-form');

signup.addEventListener('submit', (e) => {
    e.preventDefault();

    //user info

    var email = signup['signup-email'].value;
    var pass = signup['signup-password'].value;

    //sign up user
    auth.createUserWithEmailAndPassword(email, pass).then(cred => {
        return db.collection('users').doc(cred.user.uid).set(
            {
                bio: signup['bio'].value

            });


        // console.log(cred.user);
    }).then(() => {
        const modals = document.querySelector('#modal-signup');



        M.Modal.getInstance(modals).close();
        signup.reset();
        signup.querySelector('.error').innerHTML = '';

        // console.log("seccessfully signup");
    }).catch((err) => {
        signup.querySelector('.error').innerHTML = err.message;

    });

});


//logout 


const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();

});


//login 

const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then((cred) => {
        // console.log(cred.user);


        const modals = document.querySelector('#modal-login');

        M.Modal.getInstance(modals).close();
        loginForm.reset();
        loginForm.querySelector('.error').innerHTML = '';
        // console.log("seccessfully login");



    }).catch((err) => {
        loginForm.querySelector('.error').innerHTML = err.message;

    });
    ;

});

