/* 本地业务展示适配层。仅组织已有事实和文字，不定义MCP/Skill合同。
 * 客户答复、必要依据、缺口及折叠详情分层；内部标识不进入页面。
 */
(function(root){
 'use strict';
 const profiles={
  confirmation:{kind:'status',labels:[['申请与确认','分笔购买'],['购买笔数']],link:'查看确认记录',logic:'确认日与开放期结束日分别看，分笔购买分别准备预约码。',copy:['张总，您12号这笔已在13号确认，不用等到本期开放结束。分几笔买，就分别准备几个预约码，一个码不能重复使用。','对，张总，两笔申请分别用一个预约码。']},
  supplement:{kind:'rule',labels:[['预约码使用','上次申请'],['客户补充']],link:'查看使用规则',logic:'申请已撤销，不代表用过的预约码重新有效。',copy:['李女士，用过的预约码不能因为撤单就再用。您先看看还有没有未用的码，需要新码时再核对本期安排。','好的，李女士，先用未使用的那个码。']},
  human:{kind:'rule',labels:[['协议状态','止盈与定投'],['当前计划']],link:'查看定投安排',logic:'达到目标后卖出与后续定期买入分别处理。',copy:['王先生，止盈不会自动终止定投。您这份协议仍正常，会继续按每周五2,000元的约定安排。','是的，王先生，只要协议仍正常，就会按约定计划继续安排。']},
  multi:{kind:'steps',labels:[['首次参与','购买安排'],['投资范围']],link:'查看购买条件',logic:'先说明购买路径与门槛，再说明产品比较需要统一范围。',copy:['赵女士，这只首次40万元，需对应预约码，从产品详情进入购买页。\n另一只的门槛及同口径资料还没核到，暂时不能只按收益高低比较。','赵女士，完整资料的发送结果还没确认。目前已核到的投资范围是境内债券、权益等合同允许的资产，我先把这一点说明给您。'],missing:['另一只产品的起购门槛及同口径比较资料尚未取得。','完整产品资料的发送结果仍待确认。']},
  'active-open':{kind:'status',labels:[['产品额度','开放安排'],['客户约定']],link:'查看开放安排',logic:'产品有无额度、本人是否分到名额分别核对。',copy:['陈总，目前这只没有可用额度，个人排队、分配结果和下一期安排还没核到。暂时不能说明具体排队结果，有明确安排再确认资金。','好的，陈总，有名额变化时先联系您确认意愿和资金安排，再看当期购买条件。'],missing:['个人排队与额度分配结果尚未核实。',null]},
  'active-product':{kind:'rule',labels:[['合并限额','适用日期'],['合计口径','最终结果']],link:'查看适用条件',logic:'金额限制合并计算，公告未说明的原因不推断。',copy:['刘先生，当前是同一天、同一个基金账户，申购、转入和定投合计不超过550万元，三项一起算。调整原因公告没说明；满足这个限额后，还要核对其他购买条件。','对，刘先生，当天申购、转入和定投三项合计不超过550万元，还要满足当时其他交易条件。'],missing:['公告未说明调整原因；本人其他交易条件尚未核对。','本人其他交易条件尚未核对。']},
  'redemption-arrival':{kind:'status',labels:[['本笔分红金额','银行卡到账'],['待核内容']],link:'查看分红记录',logic:'按现金分红定位同笔记录，发放日和实际到账日分别看。',copy:['周女士，这笔现金分红12,000元，通知是1月26日发放、27日起可查。兴业卡实际入账结果还没核到，未到账原因还在核对。','好的，周女士，我继续核对这笔分红的划款和银行卡入账记录，有具体结果再回复您。'],missing:['兴业银行卡这笔分红是否入账、未到账原因仍待核实。','银行卡入账结果尚未取得，当前问题仍需继续核对。']},
  'fee-deduction':{kind:'calculation',labels:[['计提比例','本期开放','当前名额'],[]],link:'费用怎么算',logic:'先明确适用条款，计算条件来自客户；测算与实扣分别看。',copy:['孙先生，本产品满365天后，年化超过6%的收益部分按10%计提。本期4月20—24日开放，但目前没有名额，下一期日期还未提供。','孙先生，按您给的条件，收益8万元，6%的门槛对应6万元，超出的2万元按10%计提，测算为2,000元。'],missing:['下一期开放日期尚未提供。',null]}
 };
 const technical=/\b(?:MCP|Skill|RPC|JSON|API)\b|SKILL_|delegateNo|fundCode|source_id|接口|字段/;
 function business(value){const text=String(value??'—');return technical.test(text)?'—':text;}
 function pairs(rows,esc){return `<dl class="agent-fact-list business-facts">${rows.filter(row=>row.label&&row.value!=null&&String(row.value).trim()&&row.value!=='—'&&!technical.test(String(row.label))&&!technical.test(String(row.value))).map(row=>`<div class="agent-fact-row"><dt>${esc(row.label)}</dt><dd>${esc(row.value??'—')}</dd></div>`).join('')}</dl>`;}
 const detail=(title,html)=>`<details class="technical business-detail"><summary>${title}</summary>${html}</details>`;
 function profile(c){return profiles[c.id]||{kind:'status',labels:[],link:'查看业务记录',logic:'按本轮问题核对业务范围和结论。',copy:[]};}
 function short(c,index){return profile(c).copy[index];}
 function replyAllowed(c,index){const text=short(c,index)||c.rounds[index]?.advisors.map(m=>m.text).join('\n')||'';return !!text.trim()&&!technical.test(text);}
 function primary(c,s){const p=profile(c),r=c.rounds[s.round],wanted=p.labels[s.round]||[];let rows=(r.facts||[]).filter(f=>wanted.includes(f.label));
  if(c.id==='confirmation'&&s.round===0)rows=rows.map(f=>f.label==='分笔购买'?{...f,value:'每笔使用一个预约码'}:f);
  if(c.id==='supplement'&&s.round===0)rows=rows.map(f=>f.label==='预约码使用'?{...f,value:'已使用的码不能再次使用'}:f);
  if(c.id==='human'&&s.round===0)rows=rows.map(f=>f.label==='止盈与定投'?{...f,value:'止盈不自动终止定投'}:f);
  if(r.calculation){const x=r.calculation,result=root.SourceServiceSimulation.feeCalculation(x);rows=[{label:'本轮测算',value:result.fee.toLocaleString('zh-CN')+'元'},{label:'收费收益部分',value:(result.excess/10000)+'万元'}];}
  return rows.length?rows.slice(0,3):(r.facts||[]).slice(0,2);
 }
 function missing(c,s){return profile(c).missing?.[s.round]||'';}
 function decorate(cases){return cases.map(c=>{const p=profiles[c.id];if(!p)return c;return {...c,rounds:c.rounds.map((r,n)=>({...r,canClose:c.id==='multi'&&n===1?false:r.canClose,advisors:[{...(r.advisors[0]||{}),role:'ADVISOR',text:p.copy[n]||r.advisors.map(a=>a.text).join('\n')}]}))};});}
 function process(c,s,esc,records,calculation){const r=c.rounds[s.round],p=profile(c);
  const block=(title,summary,rows,extra)=>`<section class="agent-event business-step"><span>核对</span><div><b>${esc(business(title))}</b><p>总体说明 · ${esc(business(summary))}</p><p>关键信息</p>${pairs(rows,esc)}${detail('查看详情',extra)}</div></section>`;
  const scope=block('明确客户本轮所问','围绕当前问题组织答复，日期、产品和金额按同一范围核对。',[{label:'客户',value:c.customer},{label:'本轮问题',value:r.customers.map(m=>m.text).join(' ')}],`<p>${esc(p.logic)}</p>`);
  const lookups=(r.calls||[]).map(t=>{const rows=records(t);return block(t.label,'查看与本轮答复有关的业务记录；空缺继续保留。',rows.slice(0,2),pairs(rows,esc));}).join('');
  const math=r.calculation?block('核算本次给定条件','只按客户给出的单批条件测算，实际扣费另看记录。',primary(c,s),calculation(r.calculation)):'';
  const explain=block('整理本轮解释','先回答所问，必要计算或条款留作追问。',[{label:'说明重点',value:p.logic}],`<p>${esc(business(short(c,s.round)||r.advisors[0]?.text||'待继续核对'))}</p>${missing(c,s)?'<p>'+esc(missing(c,s))+'</p>':''}`);
  return `<details class="agent-process process-details" id="process-details"><summary><span class="agent-process-label"><i class="agent-done"></i>核对过程</span><span class="agent-open-label">展开</span><span class="agent-close-label">收起</span></summary>${scope}${lookups}${math}${explain}</details>`;
 }
 function detailsHtml(c,s,esc,records,calculation){const r=c.rounds[s.round],p=profile(c);return `<p>总体说明 · ${esc(p.logic)}</p><p>关键信息</p>${pairs(primary(c,s),esc)}${detail('本轮完整业务依据',pairs(r.facts||[],esc))}${(r.calls||[]).map(t=>detail(business(t.label),pairs(records(t),esc))).join('')}${r.calculation?detail('查看计算条件与代入过程',calculation(r.calculation)):''}${missing(c,s)?'<p class="business-gap">'+esc(missing(c,s))+'</p>':''}`;}
 // 展示元数据只组织既有事实，不新增生产字段、状态或查询结果。
 const checks={
  confirmation:{verdict:['1月12日这笔已于13日确认；分几笔买就分别准备预约码。','两笔申请分别使用一个预约码。'],heard:[['确认时间','分笔需要几个预约码']],contrast:'确认日期与本期开放结束日期分别看。'},
  supplement:{verdict:['上次申请已撤单，但已用预约码不能重新使用。','客户仍有一个未使用的码。'],contrast:'撤单结果与预约码是否可再次使用分别核对。'},
  human:{verdict:['协议仍正常，止盈不会自动终止后续定投。','协议正常时，继续按约定计划安排。'],contrast:'止盈处理已有持仓；终止协议处理后续扣款。计划日期不代表已经扣款。'},
  multi:{verdict:['这只首次40万元，购买路径已明确；另一只的门槛及比较资料还没核到。','投资范围已查到；完整资料是否发出尚未核实。'],heard:[['购买路径','两只产品的起购门槛','收益比较']],contrast:'首次参与金额是产品门槛，不替代本期开放、本人资格及资金条件。'},
  'active-open':{verdict:['产品当前额度为0；个人排队、分配结果及下一期安排未取得。','已明确客户希望有变化时再确认意愿与资金安排。'],contrast:'产品额度、个人分配顺位和提醒是否建立分别看。',next:['继续核对个人分配与下一期安排；当前不作顺位承诺。']},
  'active-product':{verdict:['当前单日合并限额为550万元；调整原因和本人其他条件未核实。','三项合并计算550万元；其他交易条件仍要核对。'],heard:[['限额怎样计算','能否申请','调整原因']],contrast:'合计限额是受理条件之一，不等于本人资格已通过或申请已确认。'},
  'redemption-arrival':{verdict:['本笔现金分红已定位；兴业卡入账和未到账原因仍待核对。','银行卡入账结果尚未取得，继续核对同笔资金记录。'],contrast:'工行到账不证明兴业这笔到账；发放与银行入账分别取证。',next:['继续取得这笔分红的划款与银行卡入账记录。','取得具体资金结果后再回复；当前不结束本问题。']},
  'fee-deduction':{verdict:['费用条款和本期窗口已查到，当前无名额；下一期安排未知。','给定单批条件测算为2,000元，计算条件与公式已对齐。'],heard:[['业绩报酬条款','开放安排','现在能否购买']],contrast:'给定条件的测算不等于本次实际扣费；实扣另看计提记录。'}
 };
 function audit(c,s){const gap=missing(c,s),meta=checks[c.id]||{};return {gap,verdict:meta.verdict?.[s.round]||'',heard:meta.heard?.[s.round]||[],contrast:meta.contrast||'',next:meta.next?.[s.round]||'',status:s.closed?'本轮已结束':gap?'待核对':s.sent[s.round]?'已回复':replyAllowed(c,s.round)?'可回复':'待核对'};}
 function shell(c,s,esc,{title,status,check,reply,process:steps,next='',kind='status'}){
  return `<div class="profit-assistant business-answer sidebar-sections" data-answer-kind="${kind}"><div class="item-heading"><h2>${esc(title||c.title)}</h2><span class="badge blue sidebar-status">${esc(status)}</span></div><section class="sidebar-check" aria-label="① 查清"><div class="sidebar-section-title"><h3>① 查清</h3><span>给顾问核对</span></div>${check}</section><section class="sidebar-reply" aria-label="② 答复"><div class="sidebar-section-title"><h3>② 答复</h3><span>${s.sent[s.round]?'本轮已发送':'给客户这样说'}</span></div>${reply}</section>${next?`<section class="sidebar-next"><b>下一步</b><p>${esc(next)}</p></section>`:''}${steps||''}${s.sent[s.round]&&s.round<c.rounds.length-1?'<button class="button small wide" data-action="source-next">查看客户追问 →</button>':''}</div>`;
 }
 function calculationTable(x,esc){const r=root.SourceServiceSimulation.feeCalculation(x);const amount=n=>n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});return `<div class="sidebar-table"><table><thead><tr><th>核算项目</th><th>金额（元）</th></tr></thead><tbody>${[['期间收益',r.gain],['门槛收益',r.threshold],['超出门槛',r.excess],['测算业绩报酬',r.fee]].map(([label,value])=>`<tr><td>${esc(label)}</td><td>${amount(value)}</td></tr>`).join('')}</tbody></table></div>`;}
 function render(c,s,esc,{records,calculation}){const p=profile(c),r=c.rounds[s.round],a=audit(c,s),original=s.sent[s.round]||r.advisors.map(m=>m.text).join('\n'),text=technical.test(original)?'答复还需要整理成客户能理解的业务说明。':original;
  const body=p.kind==='steps'&&s.round===0?`<div class="reply-block agent-reply-text"><ol class="business-reply-items">${text.split('\n').map(line=>`<li>${esc(line)}</li>`).join('')}</ol></div>`:`<div class="reply-block agent-reply-text">${esc(text)}</div>`;
  const rows=primary(c,s);
  const check=`${a.verdict?`<p class="sidebar-verdict">${esc(a.verdict)}</p>`:''}${a.heard.length?`<div class="sidebar-heard"><b>客户问了${a.heard.length}点</b><ol>${a.heard.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></div>`:''}${rows.length?`<section class="profit-summary"><div class="agent-section-heading"><h3>${r.calculation?'关键数字 · 条件测算':'核对要点'}</h3></div>${pairs(rows,esc)}</section>`:''}${a.gap?`<div class="business-gap"><b>还没查到</b><p>${esc(a.gap)}</p></div>`:''}${a.contrast?`<div class="sidebar-contrast"><b>不能混为一谈</b><p>${esc(a.contrast)}</p></div>`:''}${(r.facts?.length||r.calls?.length||r.calculation)?`<details class="technical sidebar-detail"><summary>${r.calculation?'演算明细':'核对明细'}</summary>${r.calculation?calculationTable(r.calculation,esc):''}<button class="button small wide" data-action="source-business-detail">${p.link}</button></details>`:''}`;
  return shell(c,s,esc,{status:a.status,check,reply:body,process:process(c,s,esc,records,calculation),next:a.next,kind:p.kind});
 }
 root.BusinessAnswerView={profiles,business,decorate,short,primary,missing,render,detailsHtml,replyAllowed,shell,audit};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.BusinessAnswerView;
})(typeof window!=='undefined'?window:globalThis);
