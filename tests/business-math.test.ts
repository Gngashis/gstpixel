import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBreakEven,
  calculateProfit,
  formatBusinessMoney,
  formatBusinessPercentage,
  type BreakEvenInput,
  type BreakEvenResult,
  type ProfitInput,
  type ProfitResult,
} from '../src/domain/business-math';

function profit(input: Partial<ProfitInput> = {}): ProfitResult {
  const calculation = calculateProfit({ revenue: '100000', cost: '65000', ...input });
  assert.equal(calculation.ok, true);
  if (!calculation.ok) throw Error('Expected a valid profit calculation');
  return calculation.result;
}

function breakEven(input: Partial<BreakEvenInput> = {}): BreakEvenResult {
  const calculation = calculateBreakEven({
    fixedCosts: '100000',
    unitPrice: '1000',
    variableCost: '600',
    ...input,
  });
  assert.equal(calculation.ok, true);
  if (!calculation.ok) throw Error('Expected a valid break-even calculation');
  return calculation.result;
}

test('profit, margin and markup use their correct denominators', () => {
  const result = profit();
  assert.equal(result.profit, 3_500_000n);
  assert.equal(result.marginBasisPoints, 3_500n);
  assert.equal(result.markupBasisPoints, 5_385n);
});

test('losses produce negative profit, margin and markup', () => {
  const result = profit({ revenue: '800', cost: '1000' });
  assert.equal(result.profit, -20_000n);
  assert.equal(result.marginBasisPoints, -2_500n);
  assert.equal(result.markupBasisPoints, -2_000n);
});

test('zero denominators return unavailable percentages', () => {
  assert.equal(profit({ revenue: '0', cost: '100' }).marginBasisPoints, null);
  assert.equal(profit({ revenue: '100', cost: '0' }).markupBasisPoints, null);
  const bothZero = profit({ revenue: '0', cost: '0' });
  assert.equal(bothZero.profit, 0n);
  assert.equal(bothZero.marginBasisPoints, null);
  assert.equal(bothZero.markupBasisPoints, null);
});

test('percentage ratios round to two decimal places', () => {
  const result = profit({ revenue: '3', cost: '2' });
  assert.equal(result.marginBasisPoints, 3_333n);
  assert.equal(result.markupBasisPoints, 5_000n);
});

test('break-even units are rounded up to a whole unit', () => {
  const result = breakEven({ fixedCosts: '1000', unitPrice: '40', variableCost: '15' });
  assert.equal(result.contributionPerUnit, 2_500n);
  assert.equal(result.breakEvenUnits, 40n);
  assert.equal(result.breakEvenRevenue, 160_000n);
  assert.equal(result.costsAtBreakEven, 160_000n);

  const rounded = breakEven({ fixedCosts: '1000.01', unitPrice: '40', variableCost: '15' });
  assert.equal(rounded.breakEvenUnits, 41n);
});

test('zero fixed costs need zero units when contribution is positive', () => {
  const result = breakEven({ fixedCosts: '0', unitPrice: '10', variableCost: '5' });
  assert.equal(result.breakEvenUnits, 0n);
  assert.equal(result.breakEvenRevenue, 0n);
  assert.equal(result.costsAtBreakEven, 0n);
});

test('zero or negative contribution has no finite break-even result', () => {
  for (const values of [
    { unitPrice: '10', variableCost: '10' },
    { unitPrice: '9.99', variableCost: '10' },
  ]) {
    const result = breakEven(values);
    assert.equal(result.breakEvenUnits, null);
    assert.equal(result.breakEvenRevenue, null);
    assert.equal(result.costsAtBreakEven, null);
  }
});

for (const invalid of ['', '-1', 'NaN', 'Infinity', '1e5', '10.001', '1,000', '100000000000']) {
  test(`profit rejects invalid money ${JSON.stringify(invalid)}`, () => {
    const calculation = calculateProfit({ revenue: invalid, cost: '100' });
    assert.equal(calculation.ok, false);
    if (!calculation.ok) assert.ok(calculation.errors.revenue);
  });

  test(`break-even rejects invalid money ${JSON.stringify(invalid)}`, () => {
    const calculation = calculateBreakEven({
      fixedCosts: '100',
      unitPrice: invalid,
      variableCost: '25',
    });
    assert.equal(calculation.ok, false);
    if (!calculation.ok) assert.ok(calculation.errors.unitPrice);
  });
}

test('money and percentage formatting is readable and exact', () => {
  assert.equal(formatBusinessMoney(-123_456n), '-₹1,234.56');
  assert.equal(
    formatBusinessMoney(99_999_999_999_990_000_000_000_000n),
    '₹9,99,99,99,99,99,99,00,00,00,00,000.00',
  );
  assert.equal(formatBusinessPercentage(5_385n), '53.85%');
  assert.equal(formatBusinessPercentage(-2_500n), '-25.00%');
  assert.equal(formatBusinessPercentage(null), 'Not available');
});
