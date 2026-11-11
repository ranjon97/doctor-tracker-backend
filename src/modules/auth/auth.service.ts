import bcrypt from 'bcryptjs';
import { User } from '../../models/user.model.js';
import { signSessionToken } from '../../middlewares/auth.js';
import { ApiError } from '../../utils/api-error.js';
import type { LoginInput } from './auth.validation.js';

// Compared against when the email does not exist, so both paths take the same time.
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', 12);

export async function login({ email, password }: LoginInput) {
  const user = await User.findOne({ email }).select('+password name email role').lean();
  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const id = String(user._id);
  return {
    token: signSessionToken(id, user.role),
    user: { id, name: user.name, email: user.email, role: user.role },
  };
}
