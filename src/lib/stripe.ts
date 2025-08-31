// lib/stripe.ts
// Mocked Stripe replacement for development/demo builds

export const stripe = {
  checkout: {
    sessions: {
      create: async ({
        userEmail,
        userId,
      }: {
        userEmail: string
        userId: string
      }) => {
        // Fake session object similar to Stripe's
        return {
          id: "cs_test_mocked_session_123",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
          customer_email: userEmail,
          metadata: { userId },
        }
      },
    },
  },
}

export const createCheckoutSession = async ({
  userEmail,
  userId,
}: {
  userEmail: string
  userId: string
}) => {
  const session = await stripe.checkout.sessions.create({ userEmail, userId })
  return session
}
