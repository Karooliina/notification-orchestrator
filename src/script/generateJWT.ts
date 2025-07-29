import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateJWT() {
  const args = process.argv.slice(2);
  const userId = args[0];
  const env = args[1];

  if (!userId) {
    console.error('Error: Please provide a userId as a command line argument');
    console.log('Usage: npx ts-node src/scripts/generateJWT.ts <userId> <env>');
    process.exit(1);
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

  console.log('Token: ', token);

  const filePath = `./token-${env}.txt`;

  fs.writeFile(filePath, token, (err) => {
    if (err) {
      console.error('Error writing token to file: ', err);
    }
  });

  console.log(`Token written to file: ${filePath}`);

  return;
}

generateJWT();
