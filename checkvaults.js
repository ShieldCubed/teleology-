const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
Promise.all([
  conn.getAccountInfo(new PublicKey('GGFFRpB3qBVgnKJMKvdFqtqUUKY3iSDJFw2mBvLttjRM')),
  conn.getAccountInfo(new PublicKey('2KasabzrS9M6v9bSaqmf7znH5KKfs5uT5XacTzbvu23b')),
]).then(([g8vault, oldvault]) => {
  console.log('Game8 vault exists:', !!g8vault, 'lamports:', g8vault?.lamports);
  console.log('Old vault exists:', !!oldvault, 'lamports:', oldvault?.lamports);
}).catch(console.error);
