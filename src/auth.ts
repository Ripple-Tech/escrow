import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig  from "@/auth.config"
import { db } from "@/db"
import { getUserById } from "@/data/user"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"
import { UserRole } from "@prisma/client"
import { getAccountByUserId } from "@/data/account"
import { SquareScissorsIcon } from "lucide-react"

export const {
    handlers: { GET, POST },
    auth, signIn, signOut,
  } = NextAuth({
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
    events: {
     async linkAccount({ user }) {
       await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date()}
       })
     } },
      callbacks: {
        async signIn({ user, account }) {
          if (account?.provider !== "credentials") return true;
          const existingUser = await getUserById(user.id || "");
          //prevent sign in without email verification
          if (!existingUser?.emailVerified) return false;
  
          if (existingUser.isTwoFactorEnabled) {
            const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            
            if (!twoFactorConfirmation) return false;
            //Delete two factor confirmation for next sign in
            await db.twoFactorConfirmation.delete({
              where: { id: twoFactorConfirmation.id}
            });
          }     
  
          return true;
        },
        async session({ token, session }) {
          if (token.sub && session.user) {
            session.user.id = token.sub;
          }
          if (token.role && session.user) {
            session.user.role = token.role as UserRole;
          }
          if ( session.user ) {
            session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
            //session.user.isChatEnabled = token.isChatEnabled as boolean;
          }
          if (session.user) {
            session.user.name = token.name;
            session.user.surname = token.surname as string;
            session.user.username = token.username as string
            session.user.email = token.email as string
            session.user.balance = token.balance as string
            session.user.phonenumber = token.phonenumber as string
            session.user.ledgerbalance = token.ledgerbalance as string
            session.user.imgUrl = token.imgUrl as string
            session.user.isOAuth = token.isOAuth as boolean;
             const createdAt = new Date(token.createdAt as string);
             const updatedAt = new Date(token.updatedAt as string);
             const emailVerified = new Date(token.emailVerified as string);
              if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      throw new Error('Invalid date format in token');
    }
         session.user.createdAt = createdAt;
         session.user.updatedAt = updatedAt;
         session.user.emailVerified = emailVerified as any;
          }
          
          return session;
        },
        async jwt({ token }) {
         
          if (!token.sub) return token;
          
          const existingUser = await getUserById(token.sub);
          if (!existingUser) return token;
  
          const existingAccount = await getAccountByUserId(
            existingUser.id
          )
  
          token.isOAuth = !!existingAccount;
          token.name = existingUser.name;
          token.surname = existingUser.surname;
          token.username = existingUser.username;
          token.email = existingUser.email;
          token.balance = existingUser.balance;
          token.role = existingUser.role;
          token.imgUrl = existingUser.image;
          token.phonenumber = existingUser.phonenumber;
          token.ledgerbalance = existingUser.ledgerbalance;
          token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
           token.createdAt = existingUser.createdAt.toISOString();
          token.updatedAt = existingUser.updatedAt.toISOString();
          token.emailVerified = existingUser.emailVerified?.toISOString() || null;
          //token.isChatEnabled = existingUser.isChatEnabled;
          return token;
        }
      },
      adapter: PrismaAdapter(db),
      session: { strategy: "jwt"},
      
    ...authConfig,
  })

  