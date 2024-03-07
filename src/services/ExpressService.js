import express from 'express';
import session from 'express-session';
import path from 'path';
import AuthService from './AuthService.js';

/**
 * ExpressService
 */
export default class ExpressService extends AuthService {
  app;
  static SECRET = 'asdfasdfa;sdfalsdkfja;lsdkfjasdjlfhgaskdjfhg';
  static PORT = process.env.PORT;
  static NODE_ENV = process.env.NODE_ENV;

  constructor() {
    super();
    this.app = express();
  }

  initialize() {
    this.app.use(express.static(path.resolve('public')));
    this.app.set('view engine', 'pug');
    this.app.set('views', path.resolve('views'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(session({
      name: 'MySessionID',
      cookie: {
        httpOnly: true,
        // secure: true // Only works on HTTPS and not localhost
      },
      secret: ExpressService.SECRET,
      // Force the session to be saved back to the session store even if it was never modified during the request
      resave: false,
      saveUninitialized: true
    }));
  }

  addLoggingMiddleware() {
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, req.body);
      return next();
    });

    this.app.use((req, res, next) => {
      console.log('Registered users: ', AuthService.USERS);
      return next();
    });
  }

  addAuthorizationMiddleware() {
    this.app.use((req, res, next) => {
      if (req.session.username) {
        console.log('SessionID: ' + req.session.id);
        console.log('Session: ', req.session);
        return next();
      } else {
        return res.redirect('/login');
      }
    });
  }

  addLoginRoutes() {
    this.app.get('/login', (req, res) => {
      if (req.session.username) {
        return res.redirect('/profile');
      }
      return res.render('login');
    });

    this.app.post('/login', async (req, res) => {
      const {username, password} = req.body;
      const user = await this.login(username, password);
      if (!user) {
        return res.render('login', {error: 'Invalid username or password'});
      }
      req.session.username = username;
      return res.redirect('/profile');
    });
  }

  addSignUpRoutes() {
    this.app.get('/signup', (req, res) => {
      if (req.session.username) {
        return res.redirect('/profile');
      }
      return res.render('signup');
    });

    this.app.post('/signup', async (req, res) => {
      const {username, password} = req.body;
      const user = await this.signup(username, password);
      if (!user) {
        return res.render('signup', {error: 'User already exists'});
      }
      req.session.username = username;
      return res.redirect('/profile');
    });
  }

  addProtectedRoutes() {
    this.app.get('/profile', (req, res) => {
      res.render('profile', {username: req.session.username});
    });

    this.app.get('/logout', (req, res) => {
      req.session.destroy();
      return res.redirect('/login');
    });
  }

  listen() {
    this.initialize();
    this.addLoggingMiddleware();
    this.addLoginRoutes();
    this.addSignUpRoutes();
    this.addAuthorizationMiddleware();
    this.addProtectedRoutes();
    this.app.listen(ExpressService.PORT, () => {
      console.log(`Server running on port ${ExpressService.PORT}`);
    });
  }
}