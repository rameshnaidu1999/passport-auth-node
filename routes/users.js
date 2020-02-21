const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


// Load User model
const User = require('../models/User');

//Login 
router.get('/login', (req, res) => {
    res.render('login');
});

//Register
router.get('/register', (req, res) => {
    res.render('register');
});

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Checked required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg: 'Please fill all fields'});
    }

    //Check Password match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //Password length
    if (password.length < 6) {
        errors.push({ msg: 'Passwords should be atleast 6 characters' })
    }
    //
    if (errors.length > 0) {
       res.render('register', {
           errors,
           name,
           email,
           password,
           password2
       });
    } else {
        // Validation passed
        User.findOne({
            email: email })
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({ msg: 'Email is already registered..'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else {
                    const newUser = new User ({
                        name,
                        email,
                        password
                    })
                    
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash )=> {
                            if (err) {
                                throw err
                            }

                            //Set Password to hash
                            newUser.password = hash;
                            //Save User
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registed and can login now' )
                                 res.redirect('/users/login');
                            })
                            .catch( err=> console.log(err))
                        })
                    })
                }
            })
    }
});

module.exports = router;