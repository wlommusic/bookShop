exports.getLogin = (req, res, next) => {
    let isLoggedIn = req.get('Cookie').trim().split('=')[1];
    res.render('auth/login', {        
        path: '/login',
        pageTitle: 'Login',
        isAuth: isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', 'loggedIn=true')
    res.redirect('/');
    console.log('logged in')

};