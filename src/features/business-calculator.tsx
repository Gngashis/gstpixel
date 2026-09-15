'use client';

import { useRef, useState, type FormEvent } from 'react';
import {
  calculateBreakEven,
  calculateProfit,
  formatBusinessMoney,
  formatBusinessPercentage,
  type BreakEvenErrors,
  type BreakEvenInput,
  type BreakEvenResult,
  type ProfitErrors,
  type ProfitInput,
  type ProfitResult,
} from '@/domain/business-math';
import { Arrow, Icon } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from './business-calculator.module.css';

type MoneyFieldProps = {
  id: string;
  label: string;
  value: string;
  hint: string;
  error?: string;
  onChange: (value: string) => void;
};

function MoneyField({ id, label, value, hint, error, onChange }: MoneyFieldProps) {
  return (
    <div className={s.field}>
      <label htmlFor={id}>{label}</label>
      <div className={s.inputWrap}>
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          name={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-${error ? 'error' : 'hint'}`}
        />
      </div>
      {error ? (
        <p className={s.error} id={`${id}-error`}>
          {error}
        </p>
      ) : (
        <p className={s.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}

const profitInitial: ProfitInput = { revenue: '100000', cost: '65000' };
const initialProfitCalculation = calculateProfit(profitInitial);

export function ProfitCalculator() {
  const [input, setInput] = useState<ProfitInput>(profitInitial);
  const [result, setResult] = useState<ProfitResult | null>(
    initialProfitCalculation.ok ? initialProfitCalculation.result : null,
  );
  const [errors, setErrors] = useState<ProfitErrors>({});
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(
    'Example calculation. Change the values to calculate your own result.',
  );
  const form = useRef<HTMLFormElement>(null);

  function update(key: keyof ProfitInput, value: string) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setDirty(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const calculation = calculateProfit(input);
    if (!calculation.ok) {
      setErrors(calculation.errors);
      setNotice('Please correct the highlighted fields.');
      const key = Object.keys(calculation.errors)[0];
      form.current?.querySelector<HTMLInputElement>(`[name="${key}"]`)?.focus();
      return;
    }
    setResult(calculation.result);
    setErrors({});
    setDirty(false);
    setNotice(`Calculation complete. Profit is ${formatBusinessMoney(calculation.result.profit)}.`);
  }

  function reset() {
    setInput({ revenue: '', cost: '' });
    setResult(null);
    setErrors({});
    setDirty(false);
    setNotice('Calculator reset. Enter revenue and total costs.');
    form.current?.querySelector<HTMLInputElement>('[name="revenue"]')?.focus();
  }

  return (
    <div className={s.shell}>
      <form ref={form} onSubmit={submit} noValidate className={s.form}>
        <div className={s.panelTitle}>
          <span className="eyebrow">Your calculation</span>
          <span>01</span>
        </div>
        <MoneyField
          id="revenue"
          label="Revenue"
          value={input.revenue}
          hint="Total sales or revenue for the period"
          error={errors.revenue}
          onChange={(value) => update('revenue', value)}
        />
        <MoneyField
          id="cost"
          label="Total costs"
          value={input.cost}
          hint="Include the costs you want this comparison to cover"
          error={errors.cost}
          onChange={(value) => update('cost', value)}
        />
        <div className={s.formActions}>
          <button type="submit" className={`${ui.button} ${ui.primary}`}>
            Calculate result <Arrow />
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
      </form>
      <section className={s.results} aria-labelledby="profit-result-heading">
        <div className={s.panelTitle}>
          <span className="eyebrow">The clear picture</span>
          <Icon name="growth" />
        </div>
        <h2 id="profit-result-heading">Profit snapshot</h2>
        <p className={s.resultIntro}>
          {dirty
            ? 'Inputs changed. Calculate to update the result.'
            : result
              ? 'A direct comparison of revenue and cost.'
              : 'Your results will appear here.'}
        </p>
        <div role="status" aria-live="polite" className="sr-only">
          {notice}
        </div>
        {result ? (
          <div className={dirty ? s.stale : undefined}>
            <div className={`${s.total} ${result.profit < 0n ? s.loss : ''}`}>
              <span>
                {result.profit < 0n ? 'Loss' : 'Profit'} <small>REVENUE − COSTS</small>
              </span>
              <strong data-testid="profit-result">{formatBusinessMoney(result.profit)}</strong>
              <span className={s.totalMeta}>
                Based only on the two amounts entered
              </span>
            </div>
            <dl className={s.breakdown}>
              <div>
                <dt>Revenue</dt>
                <dd>{formatBusinessMoney(result.revenue)}</dd>
              </div>
              <div>
                <dt>Total costs</dt>
                <dd>{formatBusinessMoney(result.cost)}</dd>
              </div>
              <div>
                <dt>Profit margin</dt>
                <dd data-testid="margin-result">
                  {formatBusinessPercentage(result.marginBasisPoints)}
                </dd>
              </div>
              <div>
                <dt>Markup on cost</dt>
                <dd data-testid="markup-result">
                  {formatBusinessPercentage(result.markupBasisPoints)}
                </dd>
              </div>
            </dl>
            {(result.marginBasisPoints === null || result.markupBasisPoints === null) && (
              <p className={s.contextNote}>
                A percentage is unavailable when its comparison amount is zero.
              </p>
            )}
          </div>
        ) : (
          <div className={s.empty}>
            <Icon name="growth" />
            <p>Enter revenue and costs, then select Calculate result.</p>
          </div>
        )}
        <div className={s.assumption}>
          <Icon name="shield" />
          <p>
            This is a simple arithmetic estimate, not financial advice. Results depend on which
            revenue and costs you include.
          </p>
        </div>
      </section>
    </div>
  );
}

const breakEvenInitial: BreakEvenInput = {
  fixedCosts: '100000',
  unitPrice: '1000',
  variableCost: '600',
};
const initialBreakEvenCalculation = calculateBreakEven(breakEvenInitial);

export function BreakEvenCalculator() {
  const [input, setInput] = useState<BreakEvenInput>(breakEvenInitial);
  const [result, setResult] = useState<BreakEvenResult | null>(
    initialBreakEvenCalculation.ok ? initialBreakEvenCalculation.result : null,
  );
  const [errors, setErrors] = useState<BreakEvenErrors>({});
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(
    'Example calculation. Change the values to calculate your own break-even point.',
  );
  const form = useRef<HTMLFormElement>(null);

  function update(key: keyof BreakEvenInput, value: string) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setDirty(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const calculation = calculateBreakEven(input);
    if (!calculation.ok) {
      setErrors(calculation.errors);
      setNotice('Please correct the highlighted fields.');
      const key = Object.keys(calculation.errors)[0];
      form.current?.querySelector<HTMLInputElement>(`[name="${key}"]`)?.focus();
      return;
    }
    setResult(calculation.result);
    setErrors({});
    setDirty(false);
    setNotice(
      calculation.result.breakEvenUnits === null
        ? 'There is no finite break-even result because contribution per unit is not positive.'
        : `Break-even estimate: ${calculation.result.breakEvenUnits.toString()} units.`,
    );
  }

  function reset() {
    setInput({ fixedCosts: '', unitPrice: '', variableCost: '' });
    setResult(null);
    setErrors({});
    setDirty(false);
    setNotice('Calculator reset. Enter fixed costs, unit price and variable cost.');
    form.current?.querySelector<HTMLInputElement>('[name="fixedCosts"]')?.focus();
  }

  return (
    <div className={s.shell}>
      <form ref={form} onSubmit={submit} noValidate className={s.form}>
        <div className={s.panelTitle}>
          <span className="eyebrow">Your calculation</span>
          <span>01</span>
        </div>
        <MoneyField
          id="fixedCosts"
          label="Fixed costs"
          value={input.fixedCosts}
          hint="Costs that do not change with each unit sold"
          error={errors.fixedCosts}
          onChange={(value) => update('fixedCosts', value)}
        />
        <MoneyField
          id="unitPrice"
          label="Selling price per unit"
          value={input.unitPrice}
          hint="The amount received for one unit"
          error={errors.unitPrice}
          onChange={(value) => update('unitPrice', value)}
        />
        <MoneyField
          id="variableCost"
          label="Variable cost per unit"
          value={input.variableCost}
          hint="The cost that changes with each unit sold"
          error={errors.variableCost}
          onChange={(value) => update('variableCost', value)}
        />
        <div className={s.formActions}>
          <button type="submit" className={`${ui.button} ${ui.primary}`}>
            Calculate break-even <Arrow />
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
      </form>
      <section className={s.results} aria-labelledby="break-even-result-heading">
        <div className={s.panelTitle}>
          <span className="eyebrow">The clear picture</span>
          <Icon name="calculator" />
        </div>
        <h2 id="break-even-result-heading">Break-even snapshot</h2>
        <p className={s.resultIntro}>
          {dirty
            ? 'Inputs changed. Calculate to update the result.'
            : result
              ? 'An estimate based on the costs and price entered.'
              : 'Your results will appear here.'}
        </p>
        <div role="status" aria-live="polite" className="sr-only">
          {notice}
        </div>
        {result ? (
          <div className={dirty ? s.stale : undefined}>
            {result.breakEvenUnits === null ? (
              <div className={`${s.total} ${s.noResult}`}>
                <span>Break-even units</span>
                <strong data-testid="break-even-result">No finite result</strong>
                <span className={s.totalMeta}>
                  The selling price must be higher than the variable cost per unit.
                </span>
              </div>
            ) : (
              <div className={s.total}>
                <span>
                  Break-even point <small>ROUNDED UP TO A WHOLE UNIT</small>
                </span>
                <strong data-testid="break-even-result">
                  {new Intl.NumberFormat('en-IN').format(result.breakEvenUnits)} units
                </strong>
                <span className={s.totalMeta}>
                  Estimated sales volume needed to cover the entered costs
                </span>
              </div>
            )}
            <dl className={s.breakdown}>
              <div>
                <dt>Contribution per unit</dt>
                <dd data-testid="contribution-result">
                  {formatBusinessMoney(result.contributionPerUnit)}
                </dd>
              </div>
              <div>
                <dt>Fixed costs</dt>
                <dd>{formatBusinessMoney(result.fixedCosts)}</dd>
              </div>
              {result.breakEvenRevenue !== null && (
                <div>
                  <dt>Revenue at rounded unit count</dt>
                  <dd>{formatBusinessMoney(result.breakEvenRevenue)}</dd>
                </div>
              )}
              {result.costsAtBreakEven !== null && (
                <div>
                  <dt>Costs at rounded unit count</dt>
                  <dd>{formatBusinessMoney(result.costsAtBreakEven)}</dd>
                </div>
              )}
            </dl>
            <p className={s.contextNote}>
              Break-even units = fixed costs ÷ (selling price − variable cost per unit), rounded up.
            </p>
          </div>
        ) : (
          <div className={s.empty}>
            <Icon name="calculator" />
            <p>Enter the three amounts, then select Calculate break-even.</p>
          </div>
        )}
        <div className={s.assumption}>
          <Icon name="shield" />
          <p>
            This is a simple arithmetic estimate, not financial advice. It assumes the entered
            price and costs stay constant and every unit is sold.
          </p>
        </div>
      </section>
    </div>
  );
}
