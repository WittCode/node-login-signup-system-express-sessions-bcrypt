import bcrypt from 'bcrypt';

export default class AuthService {
  static SALT_ROUNDS = 12;
  static USERS = [];

  async login(username, password) {
    const user = AuthService.USERS.find(u => u.username === username);
    if (!user) {
      return undefined;
    }
    const verified = await bcrypt.compare(password, user.password);
    if (!verified) {
      return undefined;
    }
    return user;
  }

  async signup(username, password) {
    if (AuthService.USERS.find(u => u.username === username)) {
      return undefined;
    }
    const salt = await bcrypt.genSalt(AuthService.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {username, password: hashedPassword};
    AuthService.USERS.push(user);
    return user;
  }
}