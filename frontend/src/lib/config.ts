export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  stellarNetwork: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
  stellarHorizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  stellarTreasuryPubkey: process.env.NEXT_PUBLIC_STELLAR_TREASURY_PUBKEY || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  sorobanContractId: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CC555TESTNETCONTRACTID2026',
};
