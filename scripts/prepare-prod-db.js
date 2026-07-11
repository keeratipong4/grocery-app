const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log('Successfully swapped Prisma provider to postgresql for production.');
  } else {
    console.log('Prisma provider is already postgresql or not sqlite. No action needed.');
  }
} catch (err) {
  console.error('Error modifying schema.prisma:', err);
  process.exit(1);
}
