const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');
const { SendTestEmail } = require('../middleware/email');
const { sendResetMail } = require('../middleware/resetEmail');


exports.getLogin = (req, res, next) => {
  let msg = req.flash('error');
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMsg: msg
  });
};

exports.getSignup = (req, res, next) => {
  let msg = req.flash('error');
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMsg: msg
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'invalid email or password.')
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'invalid email or password.')
          res.redirect('/login');
        }

        ).catch(err => {
          console.log(err);
          res.redirect('/login')
        }
        )

    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email already exists please login.')
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return SendTestEmail(email);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let msg = req.flash('error');
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMsg: msg
  });
}
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'no email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        sendResetMail(req.body.email, token);

      })
      .catch(
        err => { console.log(err) }
      )
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } })
    .then(user => {
      let msg = req.flash('error');
      if (msg.length > 0) {
        msg = msg[0];
      } else {
        msg = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMsg: msg,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => { console.log(err) });
}

exports.postNewPassword = (req, res, next) => {
  const newPass = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({ resetToken: passwordToken, resetTokenExp: { $gt: Date.now() }, _id: userId })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPass, 12)
        .then(hashedPassword => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExp = undefined;
          return resetUser.save()
        })
        .then(result => {
          res.redirect('/login')
        })
    }).catch(err => console.log(err))  
};