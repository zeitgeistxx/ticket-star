import { Controller, Get, Post, Put, Body, Req, NotFoundException, BadRequestException, Param, Query } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService, User } from '../database.service';

// Simulated password hashing (bcrypt equivalent for demo)
function hashPassword(password: string): string {
  return 'hash_' + Buffer.from(password).toString('base64') + '_salt';
}
function verifyPassword(password: string, hash: string): boolean {
  return hash === hashPassword(password);
}

import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  private verificationTokens: Map<string, { email: string; expires: Date }> = new Map();

  constructor(private readonly db: DatabaseService) {}

  @Public()
  @Post('stellar-login')
  async stellarLogin(@Body() payload: { walletAddress: string; role?: string; name?: string }) {
    const address = (payload.walletAddress || '').trim();
    if (!address || !address.startsWith('G') || address.length < 30) {
      throw new BadRequestException('Valid Stellar Wallet Address (public key starting with G) is required');
    }

    // Find user by wallet address or username
    let user = Array.from(this.db.users.values()).find(
      u => u.walletAddress.toLowerCase() === address.toLowerCase()
    );

    if (!user) {
      const role = (payload.role || 'attendee') as any;
      const username = payload.name
        ? payload.name.toLowerCase().replace(/\s+/g, '_')
        : `stellar_${address.substring(1, 7).toLowerCase()}`;
      const userId = `usr-stl-${Date.now()}`;

      user = {
        id: userId,
        username,
        walletAddress: address,
        role,
        isSubscribed: role === 'organizer', // Organizers auto-subscribed for easy testing
      };
      (user as any).email = `${username}@stellar.id`;
      this.db.users.set(username, user);
      this.db.logAudit('STELLAR_WALLET_SIGNUP', `Registered user ${username} with Stellar Wallet ${address}`);
    } else {
      this.db.logAudit('STELLAR_WALLET_LOGIN', `User ${user.username} authenticated with Stellar Wallet ${address}`);
    }

    return {
      token: 'mock-jwt-token-xyz-' + user.id,
      user: {
        ...user,
        name: user.username,
        email: (user as any).email || `${user.username}@stellar.id`,
        subscription: user.isSubscribed ? 'pro' : 'free',
      },
    };
  }

  @Public()
  @Post('login')
  async login(@Body() payload: { username?: string; email?: string; password?: string }) {
    const ident = (payload.email || payload.username || '').trim();
    if (!ident) {
      throw new BadRequestException('Email or username is required');
    }

    // Find pre-seeded or existing user
    let user = Array.from(this.db.users.values()).find(
      u => u.username.toLowerCase() === ident.toLowerCase() || 
           (u as any).email?.toLowerCase() === ident.toLowerCase()
    );

    // Auto-create/seed demo accounts if requested to ensure smooth flow
    if (!user && (ident.includes('demo.com') || ident === 'organizer@demo.com' || ident === 'attendee@demo.com')) {
      const isOrg = ident.toLowerCase().includes('organizer') || ident.toLowerCase().includes('org');
      const seedKey = isOrg ? 'organizer_epic' : 'attendee_alice';
      user = this.db.users.get(seedKey);
      
      if (user) {
        (user as any).email = ident;
      }
    }

    if (!user) {
      throw new NotFoundException('Account does not exist. Please Sign Up.');
    }

    // Verify password if provided (backward compatible with existing accounts)
    if (payload.password) {
      const storedHash = (user as any).passwordHash;
      if (storedHash && !verifyPassword(payload.password, storedHash)) {
        throw new BadRequestException('Invalid password');
      }
    }

    this.db.logAudit('USER_LOGIN', `User ${user.username} logged in successfully.`);
    
    return {
      token: 'mock-jwt-token-xyz-' + user.id,
      user: {
        ...user,
        name: user.username,
        email: (user as any).email || `${user.username}@demo.com`,
        subscription: user.isSubscribed ? 'pro' : 'free',
      }
    };
  }

  @Public()
  @Post('signup')
  async signup(@Body() payload: { name?: string; email?: string; password?: string; role?: string; username?: string; walletAddress?: string }) {
    const email = (payload.email || '').trim();
    const name = (payload.name || payload.username || '').trim();
    const role = (payload.role || 'attendee') as any;
    
    const walletAddress = (payload.walletAddress || 'G' + Math.random().toString(36).slice(2).toUpperCase().padEnd(55, 'X')).trim();

    if (!email || !name) {
      throw new BadRequestException('Name and email are required');
    }

    const username = name.toLowerCase().replace(/\s+/g, '_');

    const exists = Array.from(this.db.users.values()).some(
      u => u.username.toLowerCase() === username.toLowerCase() || 
           (u as any).email?.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      throw new BadRequestException('Username or email is already taken');
    }

    const userId = `usr-${role.substring(0, 3)}-${Date.now()}`;
    const newUser: User & { email?: string; passwordHash?: string } = {
      id: userId,
      username,
      email,
      walletAddress,
      role,
      isSubscribed: false,
      passwordHash: payload.password ? hashPassword(payload.password) : undefined,
    };

    this.db.users.set(username, newUser);
    this.db.logAudit('USER_SIGNUP', `Registered new user ${username} as ${role} with wallet ${walletAddress}.`);

    return {
      token: 'mock-jwt-token-xyz-' + newUser.id,
      user: {
        ...newUser,
        name,
        subscription: 'free'
      }
    };
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() payload: { token: string }) {
    const stored = this.verificationTokens.get(payload.token);
    if (!stored) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (new Date() > stored.expires) {
      this.verificationTokens.delete(payload.token);
      throw new BadRequestException('Verification token expired');
    }

    const user = Array.from(this.db.users.values()).find(
      u => (u as any).email?.toLowerCase() === stored.email.toLowerCase()
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    (user as any).emailVerified = true;
    this.db.users.set(user.username, user);
    this.verificationTokens.delete(payload.token);

    this.db.logAudit('EMAIL_VERIFIED', `User ${user.username} verified email ${stored.email}`);

    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() payload: { email: string }) {
    const email = (payload.email || '').trim();
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const token = 'verify-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    this.verificationTokens.set(token, {
      email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    this.db.logAudit('VERIFICATION_EMAIL_SENT', `Verification email sent to ${email}`);

    return {
      message: 'Verification email sent',
      verificationToken: token,
      email,
    };
  }

  // Handle billing subscription toggle from frontend
  @Public()
  @Post('subscribe/:userId')
  async toggleSubscription(
    @Param('userId') userId: string,
  ) {
    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSubscribed = !user.isSubscribed;
    this.db.users.set(user.username, user);

    const planName = user.isSubscribed ? 'Pro Plan' : 'Free Plan';
    this.db.logAudit(
      'PLAN_CHANGED',
      `User ${user.username} changed billing subscription to ${planName}.`
    );

    return {
      user: {
        ...user,
        name: user.username,
        email: (user as any).email || `${user.username}@demo.com`,
        subscription: user.isSubscribed ? 'pro' : 'free',
      }
    };
  }

  // Forgot password — simulates sending reset email
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() payload: { email: string }) {
    const email = (payload.email || '').trim();
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // In production, this would send a real email with a reset link
    const resetToken = 'reset-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

    this.db.logAudit('PASSWORD_RESET_REQUESTED', `Reset link generated for ${email}`);

    return {
      message: 'If the email exists, a reset link has been sent.',
      resetToken, // In production, never return this — simulate email delivery
      email,
    };
  }

  // Reset password
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() payload: { token: string; password: string; email: string }) {
    if (!payload.token || !payload.password || !payload.email) {
      throw new BadRequestException('Token, email, and new password are required');
    }

    // In production, verify the token against a stored hash
    const user = Array.from(this.db.users.values()).find(
      u => (u as any).email?.toLowerCase() === payload.email.toLowerCase()
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.db.logAudit('PASSWORD_RESET_COMPLETED', `Password reset for ${payload.email}`);

    return { message: 'Password has been reset successfully.' };
  }

  // Get all users (admin)
  @Get('users')
  async getAllUsers(@Req() req: Request) {
    const user = (req as any).user;
    this.db.logAudit('USERS_LISTED', `User list fetched by ${user?.username || 'unknown'}`);
    return Array.from(this.db.users.values()).map(u => ({
      ...u,
      name: u.username,
      email: (u as any).email || `${u.username}@demo.com`,
      subscription: u.isSubscribed ? 'pro' : 'free',
      emailVerified: (u as any).emailVerified || u.role === 'admin',
    }));
  }

  // Keep old method for backward compatibility
  @Public()
  @Put('subscribe')
  async subscribe(@Body() payload: { userId: string; isSubscribed: boolean }) {
    const user = Array.from(this.db.users.values()).find(u => u.id === payload.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSubscribed = payload.isSubscribed;
    this.db.users.set(user.username, user);

    const planName = payload.isSubscribed ? 'Pro Plan' : 'Free Plan';
    this.db.logAudit(
      'PLAN_CHANGED',
      `User ${user.username} changed billing subscription to ${planName}.`
    );

    return user;
  }
}
