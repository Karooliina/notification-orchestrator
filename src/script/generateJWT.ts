import jwt from 'jsonwebtoken';
import fs from 'fs';

function generateJWT() {
  const args = process.argv.slice(2);
  const userId = args[0];

  if (!userId) {
    console.error('Error: Please provide a userId as a command line argument');
    console.log('Usage: npx ts-node src/scripts/generateJWT.ts <userId>');
    process.exit(1);
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

  console.log('Your token is: ', token);

  fs.writeFile('token.txt', token, (err) => {
    if (err) {
      console.error('Error writing token to file: ', err);
    }
  });

  console.log('Token written to file');

  return;
}

generateJWT();
