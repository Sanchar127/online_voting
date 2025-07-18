import { User } from '../../models/voter';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const body = await req.json();
  const { token, password } = body;

  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGO_URL);
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return new Response('Invalid or expired token', { status: 400 });
  }

  user.password = bcrypt.hashSync(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return new Response('Password updated successfully', { status: 200 });
}
