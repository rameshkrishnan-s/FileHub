import { User, Role } from '../models';

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role_id, position } = req.body;

    // Optional: validate role exists
    const role = await Role.findByPk(role_id);
    if (!role) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.create({ name, email, password, role_id, position });
    res.json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
