import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { StellarService } from '../stellar/stellar.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(
    private readonly db: DatabaseService,
    private readonly stellar: StellarService,
  ) {}

  @Post('connect')
  async connectWallet(@Req() req: Request, @Body() payload: { publicKey: string }) {
    const user = (req as any).user;
    if (!payload.publicKey) {
      throw new BadRequestException('Public key is required');
    }

    user.walletAddress = payload.publicKey;
    this.db.users.set(user.username, user);
    this.db.logAudit('WALLET_CONNECTED', `User ${user.username} connected wallet ${payload.publicKey}`);

    return {
      message: 'Wallet connected successfully',
      walletAddress: payload.publicKey,
    };
  }

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const user = (req as any).user;
    if (!user.walletAddress) {
      this.db.logAudit('WALLET_BALANCE_CHECKED', `User ${user.username} checked balance (no wallet connected)`);
      return { xlm: '0', usdc: '0', message: 'No wallet connected' };
    }

    const balance = await this.stellar.getAccountBalance(user.walletAddress);
    this.db.logAudit('WALLET_BALANCE_CHECKED', `User ${user.username} checked balance: ${balance.xlm} XLM, ${balance.usdc} USDC`);
    return balance;
  }

  @Post('generate')
  async generateWallet(@Req() req: Request) {
    const wallet = this.stellar.generateWallet();
    await this.stellar.fundTestnetAccount(wallet.publicKey);

    this.db.logAudit('WALLET_GENERATED', `New Stellar wallet created for testnet`);

    return {
      message: 'Testnet wallet generated and funded',
      publicKey: wallet.publicKey,
      secretKey: wallet.secretKey,
    };
  }

  @Post('trustline')
  async createTrustlineXdr(@Req() req: Request, @Body() payload: { assetCode?: string }) {
    const user = (req as any).user;
    if (!user.walletAddress) {
      throw new BadRequestException('Connect a wallet first');
    }

    const assetCode = payload.assetCode || 'USDC';
    this.db.logAudit('TRUSTLINE_CREATED', `Trustline XDR generated for ${assetCode} by ${user.username}`);
    const xdr = await this.stellar.createTrustline(user.walletAddress, assetCode);
    return { xdr, assetCode };
  }
}
