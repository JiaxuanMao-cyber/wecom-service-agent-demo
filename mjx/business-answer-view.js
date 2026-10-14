/* 本地业务展示适配层。仅组织已有事实和文字，不定义MCP/Skill合同。
 * 客户答复、必要依据、缺口及折叠详情分层；内部标识不进入页面。
 */
(function(root){
 'use strict';
 const profiles={
  confirmation:{kind:'status',labels:[['申请与确认','分笔购买'],['购买笔数']],link:'查看确认记录',logic:'确认日与开放期结束日分别看，分笔购买分别准备预约码。',copy:['张总，您12号这笔已在13号确认，不用等到本期开放结束。分几笔买，就分别准备几个预约码，一个码不能重复使用。','对，张总，两笔申请分别用一个预约码。下单前再核对对应产品和开放期。']},
  supplement:{kind:'rule',labels:[['预约码使用','上次申请'],['客户补充']],link:'查看使用规则',logic:'申请已撤销，不代表用过的预约码重新有效。',copy:['李女士，用过的预约码不能因为撤单就再用。您先看看还有没有未用的码，需要新码时再核对本期安排。','好的，李女士，先用未使用的码，下单前确认产品和开放期。']},
  human:{kind:'rule',labels:[['协议状态','止盈与定投'],['当前计划']],link:'查看定投安排',logic:'达到目标后卖出与后续定期买入分别处理。',copy:['王先生，达到目标后卖出，不会自动结束定投。您的定投还在按约定安排；不想继续投入的话，需要单独处理定投协议。','是的，协议正常就会按约定继续安排。是否继续投入，要看您的资金用途和投资计划。']},
  multi:{kind:'steps',labels:[['首次参与','购买安排'],['投资范围']],link:'查看购买条件',logic:'先说明购买路径与门槛，再说明产品比较需要统一范围。',copy:['赵女士，购买：首次40万元，需对应预约码，从产品详情进入购买页，再核对条件。\n比较：两只产品的策略和范围不同，不能只按收益高低选择。','赵女士，这只可投资境内债券、权益等资产。完整资料还要看风险和持有安排；资料发送结果尚未确认，我先把需要看的重点说明清楚。'],missing:[null,'完整产品资料的发送结果仍待确认。']},
  'active-open':{kind:'status',labels:[['产品额度','开放安排'],['客户约定']],link:'查看开放安排',logic:'产品有无额度、本人是否分到名额分别核对。',copy:['陈总，目前这只没有可用额度，个人排队和分配结果也还没核到。资金准备好不代表已经分到名额，有变化时再确认您的资金安排。','好的，陈总，有名额变化时先联系您确认意愿和资金安排，再看当期购买条件。'],missing:['个人排队与额度分配结果尚未核实。',null]},
  'active-product':{kind:'rule',labels:[['合并限额','适用日期'],['合计口径','最终结果']],link:'查看适用条件',logic:'金额限制合并计算，公告未说明的原因不推断。',copy:['刘先生，当前是同一天、同一个基金账户，申购、转入和定投合计不超过550万元，三项一起算。调整原因公告没说明；满足这个限额后，还要核对其他购买条件。','对，当天三项金额要合并看。符合限额可以继续核对申请条件，是否买成还要看确认结果。'],missing:['公告未说明调整原因；本人其他交易条件尚未核对。',null]},
  'redemption-arrival':{kind:'status',labels:[['本笔分红金额','银行卡到账'],['待核内容']],link:'查看分红记录',logic:'按现金分红定位同笔记录，发放日和实际到账日分别看。',copy:['周女士，已核到这笔现金分红12,000元，1月26日发放、27日起可查。但兴业卡实际入账结果还没核到，不能凭工行已到账判断这笔原因。','好的，周女士，我继续核对这笔分红的划款和银行卡入账记录，有具体结果再回复您。'],missing:['兴业银行卡这笔分红是否入账、未到账原因仍待核实。','银行卡入账结果尚未取得，当前问题仍需继续核对。']},
  'fee-deduction':{kind:'calculation',labels:[['计提比例','本期开放','当前名额'],[]],link:'费用怎么算',logic:'先明确适用条款，计算条件来自客户；测算与实扣分别看。',copy:['孙先生，本产品满365天后，年化超过6%的收益部分按10%计提。本期4月20—24日开放，但目前没有名额，下一期日期还未提供。','孙先生，按您给的条件，收益8万元，超过门槛的2万元按10%计提，测算为2,000元。实际扣费还要看计提记录。'],missing:['下一期开放日期尚未提供。','这是给定条件的测算，本次实际扣费仍需计提记录。']}
 };
 const technical=/\b(?:MCP|Skill|RPC|JSON|API)\b|SKILL_|delegateNo|fundCode|source_id|接口|字段/;
 function business(value){const text=String(value??'—');return technical.test(text)?'—':text;}
 function pairs(rows,esc){return `<dl class="agent-fact-list business-facts">${rows.filter(row=>!technical.test(String(row.label))&&!technical.test(String(row.value))).map(row=>`<div class="agent-fact-row"><dt>${esc(row.label)}</dt><dd>${esc(row.value??'—')}</dd></div>`).join('')}</dl>`;}
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
 function render(c,s,esc,{records,calculation}){const p=profile(c),original=s.sent[s.round]||c.rounds[s.round].advisors.map(m=>m.text).join('\n'),text=technical.test(original)?'答复还需要整理成客户能理解的业务说明。':original,gap=missing(c,s)||(!replyAllowed(c,s.round)?'本轮说明尚未整理完成，请先核对业务结论。':''),conditional=!!c.rounds[s.round].calculation;
  const body=p.kind==='steps'&&s.round===0?`<div class="reply-block agent-reply-text"><ol class="business-reply-items">${text.split('\n').map(line=>`<li>${esc(line)}</li>`).join('')}</ol></div>`:`<div class="reply-block agent-reply-text">${esc(text)}</div>`;
  return `<div class="profit-assistant business-answer" data-answer-kind="${p.kind}"><div class="item-heading"><h2>${esc(c.title)}</h2><span class="badge blue">${s.closed?'本轮已结束':s.sent[s.round]?'已回复':gap&&!conditional?'待继续核对':'可回复'}</span></div><section class="agent-answer profit-answer"><div class="agent-section-heading"><h3>${s.sent[s.round]?'已发送答复':'给客户这样说'}</h3></div>${body}</section>${gap?`<p class="business-gap"><b>${conditional?'测算说明':'仍需核对'}</b> ${esc(gap)}</p>`:''}<section class="profit-summary"><div class="agent-section-heading"><h3>本轮解释依据</h3></div>${pairs(primary(c,s),esc)}<div class="profit-links"><button class="button small" data-action="source-business-detail">${p.link}</button></div></section>${process(c,s,esc,records,calculation)}<details class="technical profit-source"><summary>案例来源</summary><p>相关类别${c.question_turns==null?'暂无本地统计':esc(c.question_turns)+'轮 · '+esc(c.conversations)+'份会话'}；不是本条问法的精确次数。</p>${root.LOCAL_CHAT_ANALYSIS?'<button class="plain-button" data-action="source-evidence">查看相关原始问法</button>':''}</details>${s.sent[s.round]&&s.round<c.rounds.length-1?'<button class="button small wide" data-action="source-next">查看客户追问 →</button>':''}</div>`;
 }
 root.BusinessAnswerView={profiles,business,decorate,short,primary,missing,render,detailsHtml,replyAllowed};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.BusinessAnswerView;
})(typeof window!=='undefined'?window:globalThis);
