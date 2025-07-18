import mongoose from "mongoose";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../../../libs/mongoConnects";
import { User } from "../../models/voter";
import Election from "../../models/Election";
import bcrypt from "bcryptjs";

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL);
  }
};

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        nationalId: {
          label: "National ID",
          type: "text",
          placeholder: "Your National ID",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { nationalId, password } = credentials;

          if (!nationalId || !password) {
            throw new Error("National ID and password are required.");
          }

          await connectToDatabase();

          const user = await User.findOne({ nationalId });
          if (!user) {
            throw new Error("User not found.");
          }

          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) {
            throw new Error("Invalid credentials.");
          }

          const currentTime = new Date();
          const activeElection = await Election.findOne({
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime },
          }).lean();

          return {
            id: user._id.toString(),
            fullName: user.fullName,
            nationalId: user.nationalId,
            district: user.district,
            municipality: user.municipality,
            admin: user.admin,
            activeElection: activeElection || null,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authorization failed.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.nationalId = user.nationalId;
        token.district = user.district;
        token.municipality = user.municipality;
        token.admin = user.admin;
        token.activeElection = user.activeElection;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        fullName: token.fullName,
        nationalId: token.nationalId,
        district: token.district,
        municipality: token.municipality,
        admin: token.admin,
      };
      session.activeElection = token.activeElection;
      return session;
    },
  },
  secret: process.env.SECRET || "your-default-secret",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};
