/* 独立本地Mock。金额单位分、份额单位0.01份；均价11位，HALF_UP。
 * 成本含买入确认费用；赎回确认净额已扣费用。无生产接口变更。 */
(function(root){
 'use strict';
 const scale=100000000000n,product='均衡精选A',startNav=11632n,endNav=11563n;
 function round(n,d){const sign=n<0n?-1n:1n;n=n<0n?-n:n;return sign*((2n*n+d)/(2n*d));}
 const money=n=>(Number(n)/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}),shares=money;
 const rate=(n,d)=>d===0n?'—':(Number(round(n*10000n,d))/100).toFixed(2)+'%';
 const nav=n=>(Number(n)/10000).toFixed(4),signed=n=>(n>0n?'+':'')+money(n),gainText=n=>(n<0n?'亏损':'盈利')+money(n<0n?-n:n)+'元';
 const events=[
  {date:'2026-06-02',apply:'2026-06-01',kind:'买入',quantity:4036636n,amount:5000000n,fee:7489n,net:4992511n,nav:'1.2368',number:'0602-01'},
  {date:'2026-07-08',apply:'2026-07-07',kind:'追加买入',quantity:2535342n,amount:3000000n,fee:4493n,net:2995507n,nav:'1.1815',number:'0708-01'},
  {date:'2026-08-14',apply:'2026-08-13',kind:'卖出',quantity:1200000n,amount:1443068n,fee:7252n,gross:1450320n,nav:'1.2086',number:'0814-01'},
  {date:'2026-09-14',apply:'2026-09-11',kind:'追加买入',quantity:1707133n,amount:2000000n,fee:2996n,net:1997004n,nav:'1.1698',number:'0914-01'},
  {date:'2026-09-18',apply:'2026-09-17',kind:'现金分红',quantity:0n,amount:198215n,fee:0n,perShare:'0.0280',nav:null,number:'0918-01'},
  {date:'2026-09-24',apply:'2026-09-23',kind:'卖出',quantity:800000n,amount:911898n,fee:4582n,gross:916480n,nav:'1.1456',number:'0924-01'}
 ];
 function ledger(records=events){let state={quantity:0n,cost:0n,average:0n,realized:0n,invested:0n};return records.map(e=>{
  const before={...state};let removedCost=0n,profit=0n;
  if(e.kind==='现金分红')state.cost-=e.amount;
  else if(e.kind==='卖出'){if(e.quantity>state.quantity)throw new Error('退出份额超过持仓');removedCost=round(e.quantity*state.average,scale);profit=e.amount-removedCost;state.quantity-=e.quantity;state.cost-=removedCost;state.realized+=profit;}
  else{state.quantity+=e.quantity;state.cost+=e.amount;state.invested+=e.amount;}
  state.average=state.quantity?round(state.cost*scale,state.quantity):0n;return {...e,before,after:{...state},removedCost,profit};
 });}
 function results(){const rows=ledger(),end=rows.at(-1).after,start=rows[2].after;
  const endAsset=round(end.quantity*endNav,10000n),startAsset=round(start.quantity*startNav,10000n),hold=endAsset-end.cost,total=hold+end.realized,startTotal=startAsset-start.cost+start.realized;
  const period=total-startTotal,additions=end.invested-start.invested,denominator=startAsset+additions,sales=events.filter(e=>e.kind==='卖出').reduce((n,e)=>n+e.amount,0n),dividend=events[4].amount,fees=events.reduce((n,e)=>n+e.fee,0n),periodSales=events[5].amount;
  return {rows,end,start,endAsset,startAsset,hold,total,startTotal,period,additions,denominator,sales,dividend,fees,periodSales,holdRate:rate(hold,end.cost),totalRate:rate(total,end.invested),periodRate:rate(period,denominator)};
 }
 function reply(n){const r=results();return n===0?`郑女士，这只基金截至9月28日合计${gainText(r.total)}。您中间赎回过，也分过红，不能只用剩余市值减全部投入。页面上的“持仓收益”只看当前持有部分，总盈亏还要算上之前卖出的部分。`:`郑女士，9月10日至28日这段${gainText(r.period)}，但还没补回之前的亏损，所以从买入至今仍是亏的。`;}

 const isCase=c=>c.id==='holding-volatility';
 function decorate(cases){const r=results();return cases.map(c=>!isCase(c)?c:{...c,title:'投了10万，为什么只剩7万多？',presentationVersion:'profit-compact-v2',rounds:[
  {skill:'SKILL_ACCOUNT_SERVICE',calls:[],facts:[],canClose:true,customers:[{role:'CUSTOMER',text:`我前后买了5万、3万和2万，现在市值只有${money(r.endAsset)}元，收益那儿却只写亏${money(-r.hold)}元。我中间赎回过两次，也分过红，是不是没算全？`,timestamp:'2026-09-29 10:02:00'}],advisors:[{role:'ADVISOR',text:reply(0),timestamp:'2026-09-29 10:06:00'}]},
  {skill:'SKILL_ACCOUNT_SERVICE',calls:[],facts:[],canClose:true,customers:[{role:'CUSTOMER',text:'那9月10日到28日这一段是赚了还是亏了？中间又加了2万元，还赎回过，最近赚钱的话为什么整体还是亏的？',timestamp:'2026-09-29 10:09:00'}],advisors:[{role:'ADVISOR',text:reply(1),timestamp:'2026-09-29 10:12:00'}]}
 ]});}
 const stage=s=>s.profitSteps?.[s.round]||0;
 function advance(s,all=false){if(!s.profitSteps)s.profitSteps={};s.profitSteps[s.round]=all?3:Math.min(3,stage(s)+1);s.prepared=stage(s)===3;}
 const ready=s=>stage(s)===3,tone=n=>n>0n?'profit-positive':n<0n?'profit-negative':'profit-neutral';
 function pairs(rows,esc){return `<dl class="agent-fact-list">${rows.map(([k,v])=>`<div class="agent-fact-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;}
 const detail=(title,html)=>`<details class="technical business-detail"><summary>${title}</summary>${html}</details>`;
 function rawRecord(e,esc){let keys=[['确认日',e.date],['申请日',e.apply],['确认份额',e.kind==='现金分红'?'持仓份额不变':shares(e.quantity)+'份']];
  if(e.kind==='卖出')keys.push(['赎回总额',money(e.gross)+'元'],['赎回费',money(e.fee)+'元'],['确认净额',money(e.amount)+'元（已扣赎回费）']);
  else if(e.kind==='现金分红')keys.push(['权益登记日',e.apply],['每份分红',e.perShare+'元'],['分红确认',money(e.amount)+'元']);
  else keys.push(['确认投入',money(e.amount)+'元（计入成本）'],['申购费',money(e.fee)+'元（已含在投入中）'],['净投资金额',money(e.net)+'元']);
  if(e.nav)keys.push(['计价净值',e.nav+'元 · '+e.apply]);
  return `<div class="source-record"><b>${esc(e.date)} · ${esc(e.kind)} · 记录${esc(e.number)}</b>${pairs(keys,esc)}</div>`;
 }
 function costRecord(e,esc){let explanation;
  if(e.kind==='卖出')explanation=`赎回${shares(e.quantity)}份，分摊当时成本${money(e.removedCost)}元，确认净额${money(e.amount)}元，差额${gainText(e.profit)}；${money(e.fee)}元赎回费已扣，不再扣第二次。`;
  else if(e.kind==='现金分红')explanation=`分红确认${money(e.amount)}元，份额不变，成本从${money(e.before.cost)}元降至${money(e.after.cost)}元。分红已通过成本调整计入，不能再加一次。`;
  else explanation=`投入${money(e.amount)}元，扣除${money(e.fee)}元申购费后形成${shares(e.quantity)}份。该确认投入在本例计入成本，买入后按总成本与总份额重新计算均价。`;
  return `<p>${esc(explanation)}</p>${pairs([['操作前成本',money(e.before.cost)+'元'],['操作后成本',money(e.after.cost)+'元'],['操作后份额',shares(e.after.quantity)+'份'],['成本均价',`${(Number(e.after.average)/Number(scale)).toFixed(11)}元/份`],['历史赎回盈亏',signed(e.after.realized)+'元']],esc)}`;
 }
 function holdDetails(r,esc){return pairs([['净值截止','9月28日 · '+nav(endNav)+'元'],['当前市值',`${shares(r.end.quantity)}份 × ${nav(endNav)}元＝${money(r.endAsset)}元（取分）`],['剩余成本',money(r.end.cost)+'元'],['持仓收益',`${money(r.endAsset)}−${money(r.end.cost)}＝${signed(r.hold)}元`],['历史赎回盈亏',`${signed(r.rows[2].profit)}＋（${signed(r.rows[5].profit)}）＝${signed(r.end.realized)}元`],['累计收益',`${signed(r.hold)}＋（${signed(r.end.realized)}）＝${signed(r.total)}元`],['确认收支核对',`${money(r.endAsset)}＋${money(r.sales)}＋${money(r.dividend)}−${money(r.end.invested)}＝${signed(r.total)}元`]],esc)+`<p>确认净额不证明银行卡已经到账。申购费用已在本例成本中，赎回费用已在确认净额中，不重复扣减。现金分红已经降低成本，不能再加到最终累计收益上。</p>`;}
 function periodDetails(r,esc){return pairs([['所问区间','9月10日—9月28日'],['期初市值',`${shares(r.start.quantity)}份 × ${nav(startNav)}元＝${money(r.startAsset)}元`],['期初累计收益',`${money(r.startAsset)}−${money(r.start.cost)}＋（${signed(r.start.realized)}）＝${signed(r.startTotal)}元`],['期末累计收益',signed(r.total)+'元'],['区间收益',`${signed(r.total)}−（${signed(r.startTotal)}）＝${signed(r.period)}元`],['期间新增投入',money(r.additions)+'元'],['收益率分母',`${money(r.startAsset)}＋${money(r.additions)}＝${money(r.denominator)}元`],['区间收益率',`${money(r.period)}÷${money(r.denominator)}×100%＝${r.periodRate}`],['期间收支核对',`${money(r.endAsset)}＋${money(r.periodSales)}＋${money(r.dividend)}−${money(r.startAsset)}−${money(r.additions)}＝${signed(r.period)}元`]],esc)+`<p>采用本例选定收益曲线口径，无内部转换。赎回已反映在收益和确认收支中，不再从这个分母扣除。它不是年化或所有页面通用的收益率。</p><p>这段跨过分红日，单看两个单位净值没有包含分红，也没有反映客户买卖及费用，不能直接当作本人区间收益率。</p>`;}
 function block(n,title,summary,keys,html,esc,done=true){return `<section class="agent-event business-step" data-profit-step="${n}"><span>${n}</span><div><b>${esc(title)} · ${done?'已核对':'待核对'}</b><p>总体说明 · ${esc(summary)}</p><p>关键信息</p>${pairs(keys,esc)}${detail('查看详情',html)}</div></section>`;}
 function process(c,s,esc){const r=results(),n=stage(s),interval=s.round===1;
  const scope=block(1,'对齐问题与范围',interval?'最近这段与从买入至今分别计算。':'先核对期间赎回和分红，再解释剩余市值。',[['对象',product+' · 同一账户 · 人民币'],['截止','9月28日净值']],'<p>只核对这只普通非货基金。首笔前无持仓，无转托管、内部转换及待确认交易。费用与确认金额分别保留。</p>',esc);
  const raw=block(2,'核对交易记录',n>=1?'从6月首次买入开始核对完整确认历史。':'先取得完整交易与两端持仓记录。',n>=1?[['记录','三次买入、两次赎回、一次分红'],['投入合计',money(r.end.invested)+'元'],['确认费用合计',money(r.fees)+'元']]:[['需核对','日期、金额、份额、费用及净值']],n>=1?r.rows.map(e=>rawRecord(e,esc)).join(''):'<p>完成核对后查看六笔确认记录。</p>',esc,n>=1);
  const cost=block(3,'接续成本与赎回盈亏',n>=2?'每次赎回按当时均价分摊，分红按已选规则降低成本。':'按确认顺序推演，不固定套用第一次买入价格。',n>=2?[['剩余成本',money(r.end.cost)+'元'],['历史赎回盈亏',signed(r.end.realized)+'元']]:[['需核对','成本分摊及费用是否已包含']],n>=2?r.rows.map(e=>`<div class="source-record"><b>${esc(e.date)} · ${esc(e.kind)}</b>${costRecord(e,esc)}</div>`).join(''):'<p>成本核对后可查看每笔操作前后数据。</p>',esc,n>=2);
  const calc=block(4,interval?'计算区间收益':'计算持仓与累计收益',n>=3?(interval?'期末累计减期初累计，再核对分母。':'持仓盈亏加历史赎回盈亏，再与确认收支核对。'):'成本核对后再代入。',n>=3?(interval?[['区间收益',signed(r.period)+'元'],['区间比例',r.periodRate]]:[['持仓收益',signed(r.hold)+'元'],['累计收益',signed(r.total)+'元']]):[['需完成','金额及分母复算']],n>=3?(interval?periodDetails(r,esc):holdDetails(r,esc)):'<p>核对完成后显示代入式。</p>',esc,n>=3);
  const logic=block(5,'组织本轮解释','先说结论，再解释比较口径，计算式按追问展开。',[['重点',interval?'近期盈利不等于整体回本':'剩余市值遗漏了退出和分红部分']],n>=3?`<p>${esc(reply(s.round))}</p><p>没有银行卡回执时，只说确认金额，不说已经到账。</p>`:'<p>核对后提供简短话术。</p>',esc,n>=3);
  return `<details class="agent-process process-details" id="process-details"><summary><span class="agent-process-label"><i class="agent-done"></i>核对过程</span><span class="agent-process-count">${ready(s)?'已核对':'待核对'}</span><span class="agent-open-label">展开</span><span class="agent-close-label">收起</span></summary>${scope}${raw}${cost}${calc}${logic}</details>`;
 }
 function answerHtml(c,s,esc){return `<section class="agent-answer profit-answer"><div class="agent-section-heading"><h3>${s.sent[s.round]?'已发送答复':'给客户这样说'}</h3><span>${ready(s)?'收益账已核对':'先核对，再解释'}</span></div><div class="reply-block agent-reply-text">${esc(s.sent[s.round]||(ready(s)?reply(s.round):'郑女士，我先把这只基金的买入、赎回和分红记录对一下，再把您看到的差额解释清楚。'))}</div>${!ready(s)?'<button class="button primary wide" data-action="source-run">核对并整理答复</button>':''}</section>`;}
 function facts(c,s,esc){const r=results(),interval=s.round===1;if(!ready(s))return `<section class="profit-brief"><p>核对范围 · ${product} · 人民币 · 截至9月28日</p><span>记录、成本及收益将在本次核对中一并检查。</span></section>`;
  const numbers=interval?[['这段收益',r.period],['买入至今',r.total]]:[['累计收益',r.total],['当前持仓',r.hold]];
  return `<section class="profit-summary"><div class="agent-section-heading"><h3>本轮解释依据</h3><span>${interval?'9月10日—28日':'截至9月28日'}</span></div><div class="profit-metrics">${numbers.map(([label,value])=>`<div><span>${esc(label)}</span><strong class="${tone(value)}">${signed(value)}</strong><small>元</small></div>`).join('')}</div><p class="profit-cause">${interval?'近期这段有盈利，抵减了一部分之前的亏损；区间与累计看的是不同时间范围。':'赎回款含本金，分红已计入成本；全部投入不等于现在剩余持仓的成本。'}</p><div class="profit-links"><button class="button small" data-action="source-profit-ledger">查看交易账本</button><button class="button small" data-action="source-profit-explain">解释怎么算</button></div>${detail('顾问核对备注','<p>确认金额不替代银行卡到账；费用只计一次。亏损或近期盈利均不证明未来表现。本页核对同一基金同一账户，不当作全账户收益。</p>')}</section>`;
 }
 function ledgerHtml(c,s,esc){const r=results();return `<p class="ledger-scope">${product} · 同一账户 · 人民币 · 2026年6—9月确认记录</p><p>总体说明 · 三次买入、两次部分赎回、一次现金分红，按确认日接续成本。点击一笔查看原始记录和成本推演。</p><div class="profit-ledger"><table><thead><tr><th>确认日／业务</th><th>确认份额（份）</th><th>确认金额（元）</th><th>剩余成本（元）</th><th>本次盈亏（元）</th></tr></thead><tbody>${r.rows.map((e,i)=>`<tr><td><button class="plain-button" data-action="source-profit-record" data-record="${i}">${esc(e.date.slice(5))} · ${esc(e.kind)} ↗</button></td><td>${e.kind==='现金分红'?'份额不变':shares(e.quantity)}</td><td>${money(e.amount)}<small>${e.kind==='卖出'?'已扣费用':e.kind==='现金分红'?'分红金额':'含申购费'}</small></td><td>${money(e.after.cost)}</td><td class="${e.kind==='卖出'?tone(e.profit):'profit-neutral'}">${e.kind==='卖出'?signed(e.profit):'—'}</td></tr>`).join('')}</tbody></table></div><div class="profit-ledger-summary"><span>累计投入 <b>${money(r.end.invested)}元</b></span><span>赎回净额 <b>${money(r.sales)}元</b></span><span>分红确认 <b>${money(r.dividend)}元</b></span></div>${detail('查看全部确认记录与费用',r.rows.map(e=>rawRecord(e,esc)).join(''))}<p>确认金额用于解释收益账；银行卡实际到账另核资金回执。仅在本案例中采用以上费用与成本处理。</p>`;}
 function explainHtml(c,s,esc){const r=results();return `<p>总体说明 · ${s.round===1?'最近一段收益是两个时点累计收益的变化。':'持仓只看现在剩余的部分，累计还包含过去赎回的盈亏。'}</p><p>关键信息 · ${s.round===1?'区间收益'+signed(r.period)+'元，区间收益率'+r.periodRate:'持仓'+gainText(r.hold)+'，累计'+gainText(r.total)}</p>${detail('展开金额与分母的完整计算',s.round===1?periodDetails(r,esc):holdDetails(r,esc))}<p>给客户的补充解释：${esc(s.round===1?`这段又投入${money(r.additions)}元，分母为期初市值${money(r.startAsset)}元加这笔投入，合计${money(r.denominator)}元，区间收益率${r.periodRate}，不是年化。`:`现在市值${money(r.endAsset)}元，剩余成本${money(r.end.cost)}元，相减是持仓${gainText(r.hold)}；加上此前两次赎回盈亏，累计${gainText(r.total)}。`)}</p>`;}
 function recordHtml(index,esc){const e=results().rows[index];if(!e)return '<p>未找到对应记录。</p>';return `<p>总体说明 · ${esc(e.kind)}影响了${e.kind==='现金分红'?'持仓成本':'份额与持仓成本'}。</p><p>关键信息</p>${pairs([['确认金额',money(e.amount)+'元'],['确认费用',money(e.fee)+'元'],['操作后成本',money(e.after.cost)+'元']],esc)}${detail('原始确认信息',rawRecord(e,esc))}${detail('成本和盈亏怎么算',costRecord(e,esc))}<button class="button small" data-action="source-profit-ledger">返回交易账本</button>`;}
 function sourceHtml(c,esc){return `<p>相关统计范围是“持仓波动类”，不是本账本问题的精确出现次数。</p><p>${c.question_turns==null?'当前无本地统计':esc(c.question_turns)+'轮 · '+esc(c.conversations)+'份会话'}。本页只提取需求方向，交易及账户数据独立构造，不复制原客户信息。</p>`;}
 root.BusinessProfitWalkthrough={isCase,decorate,stage,advance,ready,process,facts,answerHtml,reply,ledger,results,events,ledgerHtml,explainHtml,recordHtml,sourceHtml};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.BusinessProfitWalkthrough;
})(typeof window!=='undefined'?window:globalThis);
