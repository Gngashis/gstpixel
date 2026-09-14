export type GstMode='exclusive'|'inclusive';
export type SupplyType='split'|'igst';
export type GstInput={amount:string;rate:string;mode:GstMode;supply:SupplyType};
export type GstResult={base:bigint;tax:bigint;total:bigint;cgst:bigint;sgst:bigint;rateHundredths:bigint;mode:GstMode;supply:SupplyType};
export type GstErrors=Partial<Record<'amount'|'rate'|'mode'|'supply',string>>;
export type GstCalculation={ok:true;result:GstResult}|{ok:false;errors:GstErrors};
function fixed(value:string):bigint{const [whole,fraction='']=value.trim().split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'))}
function rounded(numerator:bigint,denominator:bigint):bigint{return (numerator+denominator/2n)/denominator}
/** Integer paise and hundredths of a percent avoid floating-point money errors. */
export function calculateGst(input:GstInput):GstCalculation{
 const errors:GstErrors={};const pattern=/^\d+(\.\d{1,2})?$/;
 if(!pattern.test(input.amount.trim())||input.amount.trim().length>15)errors.amount='Enter a non-negative amount with up to two decimal places.';
 if(!pattern.test(input.rate.trim())||input.rate.trim().length>8)errors.rate='Enter a GST percentage from 0 to 100, with up to two decimal places.';
 if(input.mode!=='exclusive'&&input.mode!=='inclusive')errors.mode='Choose whether GST is included or excluded.';
 if(input.supply!=='split'&&input.supply!=='igst')errors.supply='Choose a tax representation.';
 let amount=0n,rate=0n;
 if(!errors.amount){amount=fixed(input.amount);if(amount>9999999999999n)errors.amount='Enter an amount no greater than ₹99,99,99,99,999.99.'}
 if(!errors.rate){rate=fixed(input.rate);if(rate>10000n)errors.rate='Enter a GST percentage from 0 to 100.'}
 if(Object.keys(errors).length)return {ok:false,errors};
 const base=input.mode==='exclusive'?amount:rounded(amount*10000n,10000n+rate);
 const tax=input.mode==='exclusive'?rounded(base*rate,10000n):amount-base;
 const total=input.mode==='exclusive'?base+tax:amount;
 const cgst=rounded(tax,2n);const sgst=tax-cgst;
 return {ok:true,result:{base,tax,total,cgst,sgst,rateHundredths:rate,mode:input.mode,supply:input.supply}};
}
export function formatMoney(paise:bigint):string{return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(paise)/100)}
export function formatRate(rateHundredths:bigint,split=false):string{return new Intl.NumberFormat('en-IN',{maximumFractionDigits:3}).format(Number(rateHundredths)/(split?200:100))+'%'}
