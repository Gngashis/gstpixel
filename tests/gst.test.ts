import test from 'node:test';import assert from 'node:assert/strict';import {calculateGst,formatMoney,formatRate,type GstInput,type GstResult} from '../src/domain/gst';
import {services} from '../src/content/services';
function result(input:Partial<GstInput>):GstResult{const r=calculateGst({amount:'1000',rate:'18',mode:'exclusive',supply:'split',...input});assert.equal(r.ok,true);if(!r.ok)throw Error('Expected valid calculation');return r.result}
test('Exclusive: 1000 + 18% = 1180; split tax 90 + 90',()=>{const r=result({});assert.deepEqual([r.base,r.tax,r.total,r.cgst,r.sgst],[100000n,18000n,118000n,9000n,9000n])});
test('Inclusive: 1180 at 18% resolves to 1000 base',()=>{const r=result({amount:'1180',mode:'inclusive'});assert.deepEqual([r.base,r.tax,r.total],[100000n,18000n,118000n])});
test('IGST retains the complete tax amount',()=>{const r=result({supply:'igst'});assert.equal(r.supply,'igst');assert.equal(r.tax,18000n)});
test('Zero amount gives zero in all fields',()=>{const r=result({amount:'0'});assert.deepEqual([r.base,r.tax,r.total,r.cgst,r.sgst],[0n,0n,0n,0n,0n])});
test('Zero rate preserves amount in both modes',()=>{for(const mode of ['exclusive','inclusive'] as const){const r=result({amount:'1234.56',rate:'0',mode});assert.equal(r.tax,0n);assert.equal(r.total,123456n);assert.equal(r.base,123456n)}});
test('Custom fractional rate is supported',()=>{const r=result({amount:'199.99',rate:'7.5'});assert.equal(r.tax,1500n);assert.equal(r.total,21499n)});
test('Half-paise rounds upward and split parts reconcile',()=>{const r=result({amount:'0.05',rate:'10'});assert.deepEqual([r.tax,r.cgst,r.sgst,r.total],[1n,1n,0n,6n])});
test('Inclusive rounding keeps entered total exact',()=>{const r=result({amount:'100',rate:'18',mode:'inclusive'});assert.deepEqual([r.base,r.tax,r.total],[8475n,1525n,10000n]);assert.equal(r.cgst+r.sgst,r.tax)});
test('100 percent rate handles both modes',()=>{assert.equal(result({rate:'100'}).total,200000n);assert.equal(result({rate:'100',mode:'inclusive'}).base,50000n)});
test('Largest supported amount stays exact',()=>{const r=result({amount:'99999999999.99',rate:'100'});assert.equal(r.total,19999999999998n)});
test('Whitespace is normalized',()=>assert.equal(result({amount:' 1000.00 ',rate:' 18 '}).total,118000n));
for(const amount of ['', '-1', 'NaN', 'Infinity', '1e5', '10.001', '1,000', '100000000000', 'abc']){test(`Reject amount ${JSON.stringify(amount)}`,()=>{const r=calculateGst({amount,rate:'18',mode:'exclusive',supply:'split'});assert.equal(r.ok,false);if(!r.ok)assert.ok(r.errors.amount)})}
for(const rate of ['', '-18', '101', '18.001', 'Infinity', 'abc']){test(`Reject rate ${JSON.stringify(rate)}`,()=>{const r=calculateGst({amount:'1000',rate,mode:'exclusive',supply:'split'});assert.equal(r.ok,false);if(!r.ok)assert.ok(r.errors.rate)})}
test('Runtime mode and supply values are validated',()=>{const r=calculateGst({amount:'1000',rate:'18',mode:'other',supply:'other'} as unknown as GstInput);assert.equal(r.ok,false);if(!r.ok){assert.ok(r.errors.mode);assert.ok(r.errors.supply)}});
test('Reconciliation invariants across 400 varied calculations',()=>{for(let i=1;i<=200;i++){for(const mode of ['exclusive','inclusive'] as const){const r=result({amount:(i*13.17).toFixed(2),rate:(i%101).toString(),mode});assert.equal(r.base+r.tax,r.total);assert.equal(r.cgst+r.sgst,r.tax);assert.ok(r.cgst-r.sgst<=1n);assert.ok(r.tax>=0n)}}});
test('Indian currency formatting',()=>{assert.equal(formatMoney(118000n),'₹1,180.00');assert.equal(formatMoney(123456789n),'₹12,34,567.89')});
