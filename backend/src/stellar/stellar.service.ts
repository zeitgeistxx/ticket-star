import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
  Networks,
  BASE_FEE,
  Memo,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly server: Horizon.Server;
  private readonly networkPassphrase: string;
  private readonly usdcIssuer: string;
  private readonly usdcAsset: Asset;
  private readonly treasuryKeypair: Keypair;
  public readonly sorobanContractId: string;

  constructor(private readonly configService: ConfigService) {
    const horizonUrl =
      this.configService.get<string>('STELLAR_HORIZON_URL') ||
      'https://horizon-testnet.stellar.org';
    this.networkPassphrase =
      this.configService.get<string>('STELLAR_NETWORK_PASSPHRASE') ||
      Networks.TESTNET;
    this.usdcIssuer =
      this.configService.get<string>('STELLAR_USDC_ISSUER') ||
      'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    this.sorobanContractId =
      this.configService.get<string>('SOROBAN_CONTRACT_ID') ||
      'CC555TESTNETCONTRACTID';

    this.server = new Horizon.Server(horizonUrl);
    this.usdcAsset = new Asset('USDC', this.usdcIssuer);

    const secretKey = this.configService.get<string>('STELLAR_TREASURY_SECRET_KEY');
    if (secretKey) {
      try {
        this.treasuryKeypair = Keypair.fromSecret(secretKey);
        this.logger.log(`Loaded treasury wallet from env: ${this.treasuryKeypair.publicKey()}`);
      } catch {
        this.logger.warn('Invalid STELLAR_TREASURY_SECRET_KEY in env, generating new keypair');
        this.treasuryKeypair = Keypair.random();
        this.fundTestnetAccount(this.treasuryKeypair.publicKey());
      }
    } else {
      this.logger.log('No STELLAR_TREASURY_SECRET_KEY found in env, auto-generating testnet keypair');
      this.treasuryKeypair = Keypair.random();
      this.fundTestnetAccount(this.treasuryKeypair.publicKey());
    }
  }

  get treasuryPublicKey(): string {
    return this.treasuryKeypair.publicKey();
  }

  get assetUSDC(): Asset {
    return this.usdcAsset;
  }

  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`,
      );
      if (response.ok) {
        this.logger.log(`Funded testnet account: ${publicKey}`);
        return true;
      }
      this.logger.warn(`Friendbot may have already funded ${publicKey}`);
      return false;
    } catch (err) {
      this.logger.error(`Failed to fund testnet account: ${err}`);
      return false;
    }
  }

  async getAccountBalance(address: string): Promise<{ xlm: string; usdc: string }> {
    try {
      const account = await this.server.loadAccount(address);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      const usdcBalance = account.balances.find(
        b => b.asset_type === 'credit_alphanum4' && b.asset_code === 'USDC',
      );
      return {
        xlm: xlmBalance ? xlmBalance.balance : '0',
        usdc: usdcBalance ? usdcBalance.balance : '0',
      };
    } catch {
      return { xlm: '0', usdc: '0' };
    }
  }

  async verifyPayment(
    txHash: string,
    expectedAmount: number,
    expectedAsset: 'XLM' | 'USDC' = 'XLM',
  ): Promise<boolean> {
    try {
      const tx = await this.server.transactions().transaction(txHash).call();
      if (!tx) return false;

      // Verify the transaction includes a payment to our treasury
      const operations = await tx.operations();
      const paymentOp = operations.records.find(
        op =>
          (op.type === 'payment' || op.type === 'create_account') &&
          (('to' in op && (op as any).to === this.treasuryPublicKey) ||
           ('account' in op && (op as any).account === this.treasuryPublicKey)),
      );

      if (!paymentOp) return false;

      if (expectedAsset === 'XLM') {
        const amount = parseFloat((paymentOp as any).amount || '0');
        return amount >= expectedAmount;
      }
      return true;
    } catch {
      return false;
    }
  }

  async createTrustline(address: string, assetCode: string = 'USDC'): Promise<string> {
    try {
      const account = await this.server.loadAccount(address);
      const asset = new Asset(assetCode, this.usdcIssuer);

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.changeTrust({ asset }))
        .setTimeout(30)
        .build();

      return tx.toXDR();
    } catch (err: any) {
      this.logger.error(`Failed to create trustline XDR: ${err}`);
      throw err;
    }
  }

  generateWallet(): { publicKey: string; secretKey: string } {
    const kp = Keypair.random();
    return {
      publicKey: kp.publicKey(),
      secretKey: kp.secret(),
    };
  }
}
