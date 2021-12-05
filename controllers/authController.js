const login = async (req, res) => { res.send('Login Route'); }
const register = async (req, res) => { res.send('Register Route'); }
const logout = async (req, res) => { res.send('Logout Route'); }

module.exports = {
  login,
  register,
  logout
};