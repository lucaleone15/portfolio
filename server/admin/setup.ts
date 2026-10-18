import crypto from 'node:crypto';
import readline from 'node:readline';
import qrcode from 'qrcode-terminal';
import { base32Encode, hashPassword } from './auth';

/**
 * npm run admin:setup — prints the .env lines for the admin sign-in: the password's hash and a
 * new secret for the authenticator app. Writes nothing to disk.
 */

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Don't echo what is typed
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.startsWith(question)) write.call(rl, s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

const password = await ask('Mot de passe de l’admin : ');
if (password.length < 12) {
  console.error('Choisis au moins 12 caractères.');
  process.exit(1);
}
if ((await ask('Encore une fois : ')) !== password) {
  console.error('Les deux mots de passe ne correspondent pas.');
  process.exit(1);
}

const secret = base32Encode(crypto.randomBytes(20));
const hash = await hashPassword(password);

const uri = `otpauth://totp/luca-leone.ch:Luca?secret=${secret}&issuer=luca-leone.ch`;

console.log(`
À copier dans le .env du serveur (et en local si tu veux l'admin en dev) :

ADMIN_PASSWORD_HASH="${hash}"
ADMIN_TOTP_SECRET="${secret}"

Dans ton app d'authentification (Google Authenticator, 1Password…), scanne ce QR code :
`);
qrcode.generate(uri, { small: true }, (qr: string) => console.log(qr));
console.log(`Ou ajoute un compte avec « Saisir une clé » et cette clé : ${secret}
`);
