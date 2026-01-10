import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    // Better Auth provides a built-in method to get the session from a request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a JWT token for API access using the same secret
    const secret = new TextEncoder().encode(
      process.env.BETTER_AUTH_SECRET || 'fallback_secret_for_dev'
    );

    const token = await new SignJWT({
      sub: session.user.id,
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // Token valid for 1 hour
      .sign(secret);

    return Response.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  } catch (error) {
    console.error('Error generating API token:', error);
    return Response.json({ error: 'Failed to generate API token' }, { status: 500 });
  }
}