// Example usage of SOM currency formatting
import { formatMoney, formatMoneyWithSom, formatMoneyWithCurrency } from './formatMoney';

// Example values for Uzbekistan
const examples = [
  { amount: 300000, description: 'Course fee' },
  { amount: 1500.50, description: 'Monthly payment' },
  { amount: 1000000, description: 'Total revenue' },
  { amount: 0, description: 'No payment' },
  { amount: 25000, description: 'Student payment' }
];

console.log('SOM Currency Formatting Examples:');
console.log('================================');

examples.forEach(example => {
  console.log(`${example.description}:`);
  console.log(`  Basic: ${formatMoney(example.amount)}`);
  console.log(`  With SOM: ${formatMoneyWithSom(example.amount)}`);
  console.log(`  With custom currency: ${formatMoneyWithCurrency(example.amount, 'UZS')}`);
  console.log('');
});

// Expected output:
// Course fee:
//   Basic: 300 000
//   With SOM: 300 000 SOM
//   With custom currency: 300 000 UZS
//
// Monthly payment:
//   Basic: 1 500.5
//   With SOM: 1 500.5 SOM
//   With custom currency: 1 500.5 UZS
