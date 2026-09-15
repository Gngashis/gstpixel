export type ProfitInput = { revenue: string; cost: string };
export type ProfitErrors = Partial<Record<keyof ProfitInput, string>>;
export type ProfitResult = {
  revenue: bigint;
  cost: bigint;
  profit: bigint;
  marginBasisPoints: bigint | null;
  markupBasisPoints: bigint | null;
};
export type ProfitCalculation =
  | { ok: true; result: ProfitResult }
  | { ok: false; errors: ProfitErrors };

export type BreakEvenInput = {
  fixedCosts: string;
  unitPrice: string;
  variableCost: string;
};
export type BreakEvenErrors = Partial<Record<keyof BreakEvenInput, string>>;
export type BreakEvenResult = {
  fixedCosts: bigint;
  unitPrice: bigint;
  variableCost: bigint;
  contributionPerUnit: bigint;
  breakEvenUnits: bigint | null;
  breakEvenRevenue: bigint | null;
  costsAtBreakEven: bigint | null;
};
export type BreakEvenCalculation =
  | { ok: true; result: BreakEvenResult }
  | { ok: false; errors: BreakEvenErrors };

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_PAISE = 9_999_999_999_999n;
const moneyError = 'Enter a non-negative amount with up to two decimal places.';

function parseMoney(value: string): bigint | null {
  const normalized = value.trim();
  if (!MONEY_PATTERN.test(normalized) || normalized.length > 15) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const paise = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return paise <= MAX_PAISE ? paise : null;
}

function roundedRatio(numerator: bigint, denominator: bigint): bigint {
  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = numerator < 0n ? -numerator : numerator;
  return sign * ((magnitude + denominator / 2n) / denominator);
}

function validateMoney<T extends Record<string, string>>(
  input: T,
): { values: { [K in keyof T]: bigint }; errors: Partial<Record<keyof T, string>> } {
  const values = {} as { [K in keyof T]: bigint };
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key of Object.keys(input) as (keyof T)[]) {
    const parsed = parseMoney(input[key]);
    if (parsed === null) errors[key] = moneyError;
    else values[key] = parsed;
  }
  return { values, errors };
}

export function calculateProfit(input: ProfitInput): ProfitCalculation {
  const { values, errors } = validateMoney(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const profit = values.revenue - values.cost;
  return {
    ok: true,
    result: {
      ...values,
      profit,
      marginBasisPoints:
        values.revenue === 0n ? null : roundedRatio(profit * 10_000n, values.revenue),
      markupBasisPoints:
        values.cost === 0n ? null : roundedRatio(profit * 10_000n, values.cost),
    },
  };
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenCalculation {
  const { values, errors } = validateMoney(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const contributionPerUnit = values.unitPrice - values.variableCost;
  const breakEvenUnits =
    contributionPerUnit > 0n
      ? (values.fixedCosts + contributionPerUnit - 1n) / contributionPerUnit
      : null;

  return {
    ok: true,
    result: {
      ...values,
      contributionPerUnit,
      breakEvenUnits,
      breakEvenRevenue:
        breakEvenUnits === null ? null : breakEvenUnits * values.unitPrice,
      costsAtBreakEven:
        breakEvenUnits === null
          ? null
          : values.fixedCosts + breakEvenUnits * values.variableCost,
    },
  };
}

export function formatBusinessMoney(paise: bigint): string {
  const sign = paise < 0n ? '-' : '';
  const magnitude = paise < 0n ? -paise : paise;
  const rupees = magnitude / 100n;
  const fraction = (magnitude % 100n).toString().padStart(2, '0');
  return `${sign}₹${new Intl.NumberFormat('en-IN').format(rupees)}.${fraction}`;
}

export function formatBusinessPercentage(basisPoints: bigint | null): string {
  if (basisPoints === null) return 'Not available';
  const sign = basisPoints < 0n ? '-' : '';
  const magnitude = basisPoints < 0n ? -basisPoints : basisPoints;
  const whole = magnitude / 100n;
  const fraction = (magnitude % 100n).toString().padStart(2, '0');
  return `${sign}${new Intl.NumberFormat('en-IN').format(whole)}.${fraction}%`;
}
