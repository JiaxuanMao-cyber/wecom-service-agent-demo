/* 匿名问答展示控制器。处理记录为展示层Mock，不调用账户或公司RPC。 */
(function (root) {
  'use strict';
  const storageKey = 'wecom-source-conversations-v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) {}
  let shared, esc;
  const gaps = {
    confirmation: ['同笔申请与确认记录', '适用确认周期及交易日'], cancellation: ['目标交易与当前可撤性', '撤销及资金退回结果'],
    autoinvest: ['当期协议与实际扣款', '扣款时可用资金、具体原因和补扣记录'], entry: ['准确产品代码与购买渠道', '本人参与条件'],
    reservation: ['对应产品本期开放安排', '本人预约及实际名额'], product: ['产品身份与资料有效日期', '风险和持有安排'],
    arrival: ['同笔申请、预计日期与实际资金回执', '银行卡或钱袋子实际入账'], fee: ['适用产品合同、计提区间与本次实际扣费', '参与份额、起点净值、期末净值及计费天数'],
    holding: ['本人收益范围、成本与资金进出', '产品净值区间及持仓变化']
  };
  const formulas = {
    fee: ['专户业绩报酬主题知识：仅适用于采用该计费方法的对应产品，不是管理费、赎回费或所有产品的通用公式', '期间收益＝参与份额×（期末累计净值−起点累计净值）', '门槛收益＝参与份额×起点单位净值×实际天数÷年基准×年化门槛', '必要因子：同批参与份额、有效计费起点、起点单位净值、起止累计净值、实际天数、最低计费天数、年基准、门槛及费率分档；逐批舍入后汇总。未取得本产品规则和本人记录时不能计算本次实扣费用'],
    holding: ['持仓收益与累计收益分别取值；持仓成本不等于累计申购金额', '收益比较先统一币种、产品、时间区间及资金进出；账户汇总不能替代单只基金收益'],
    arrival: ['申请日→预计确认日→预计入账日；预计日期不证明实际入账', '确认金额、预计到账和资金回执分别取证']
  };
  function cases() { const rows=root.SourceServiceSimulation ? root.SourceServiceSimulation.cases(root.LOCAL_SERVICE_CASES?.cases || []) : root.LOCAL_SERVICE_CASES.cases; const adapted=root.BusinessProfitWalkthrough ? root.BusinessProfitWalkthrough.decorate(rows) : rows; return root.BusinessAnswerView ? root.BusinessAnswerView.decorate(adapted) : adapted; }
  function available() { return !!(root.SourceServiceSimulation || root.LOCAL_SERVICE_CASES?.cases?.length); }
  function definition() { const rows=cases(); return rows.find(c => c.id === shared.selectedCase) || rows[0]; }
  function current(c) {
    const identity = c.source_id + ':' + (root.LOCAL_SERVICE_CASES?.fingerprint || 'anonymous') + ':' + (root.SourceServiceSimulation?.version || 'source') + (c.presentationVersion ? ':'+c.presentationVersion : '');
    if (!progress[c.id] || progress[c.id].source !== identity || !Number.isInteger(progress[c.id].round) || progress[c.id].round < 0 || progress[c.id].round >= c.rounds.length) progress[c.id] = { source: identity, round: 0, sent: [], compose: '', closed: false };
    return progress[c.id];
  }
  function safeText(m, c) {
    const greeting = m.role === 'ADVISOR' ? c.customer : '顾问';
    return m.text.replace(/^\[称呼\](?=你好|您好|好[，,！!\s])/, greeting).replaceAll('[称呼]', '相关人员').replaceAll('[会话称呼]', '相关人员');
  }
  function answer(c, s) { return c.rounds[s.round].advisors.map(m => safeText(m, c)).join('\n'); }
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch (_) {} }
  function outputFields(schema, prefix = '') {
    const result = [];
    for (const [name, value] of Object.entries(schema?.properties || {})) {
      const key = prefix ? prefix + '.' + name : name;
      if (value.properties) result.push(...outputFields(value, key));
      else if (value.items?.properties) result.push(...outputFields(value.items, key + '[]'));
      else result.push({ key, description: value.description || name });
    }
    if (schema?.items?.properties) result.push(...outputFields(schema.items, prefix + '[]'));
    return result;
  }
  function process(c, s) {
    if(root.BusinessProfitWalkthrough?.isCase(c))return root.BusinessProfitWalkthrough.process(c,s,esc);
    const round=c.rounds[s.round];
    if(round.calls) return `<details class="agent-process process-details" id="process-details"><summary><span class="agent-process-label"><i class="agent-done"></i>问题分析与处理</span><span class="agent-process-count">${round.calls.length+2}个环节</span><span class="agent-open-label">展开</span><span class="agent-close-label">收起</span></summary><section class="agent-event business-step"><span>所问</span><div><b>明确本轮诉求</b><p>总体说明 · ${esc(round.question)}</p><p>关键信息 · ${esc(c.customer)} · ${esc(c.title)}</p><details class="technical business-detail"><summary>查看详情</summary><p>先明确客户想了解的业务对象，已知信息沿用本轮沟通；核对范围以对应产品、账户和日期为准。</p></details></div></section>${round.calls.map(t=>`<section class="agent-event business-step"><span>核对</span><div><b>${esc(t.label)}</b><p>总体说明 · 查看与本次答复有关的业务记录，保留日期、金额、状态及空缺。</p><p>关键信息</p><dl class="agent-fact-list">${returnRows(t).map(f=>`<div class="agent-fact-row"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl><details class="technical business-detail"><summary>查看详情</summary><p>对应记录的业务信息已在本环节列明；未提供的日期或金额保持未知，确认结果不替代资金到账。</p></details></div></section>`).join('')}${round.calculation?`<section class="agent-event business-step"><span>核算</span><div><b>单批业绩报酬测算</b><p>总体说明 · 使用客户给定的份额、净值和天数，按本产品费用条款计算。</p><p>关键信息 · 年化门槛6%，超额部分按10%计提。</p><details class="technical business-detail"><summary>查看计算详情</summary>${calculationHtml(round.calculation)}</details></div></section>`:''}<section class="agent-event business-step"><span>答复</span><div><b>整理客户能听懂的解释</b><p>总体说明 · 根据核对结果回答当前问题，区分已知事实与仍需核实的部分。</p><p>关键信息 · ${esc(round.reason.replaceAll("Skill","业务核算"))}</p><details class="technical business-detail"><summary>查看答复详情</summary><p>${esc(answer(c,s))}</p></details></div></section></details>`;
    return `<details class="agent-process process-details" id="process-details"><summary><span class="agent-process-label"><i class="agent-done"></i>核对过程</span><span class="agent-open-label">展开</span><span class="agent-close-label">收起</span></summary><section class="agent-event"><span>核对</span><div><b>明确本轮问题</b><p>${esc(c.rounds[s.round].customers.map(m=>safeText(m,c)).join(' '))}</p><p>顾问沟通资料已读取，尚未执行账户查询；同一产品、同一笔业务的实际结果还需核对。</p></div></section><section class="agent-event"><span>解释</span><div><b>根据已有沟通内容整理</b><p>${esc(answer(c,s))}</p><details class="technical business-detail"><summary>查看本轮依据</summary><p>沟通中的说法与本人账户结果分别核对；日期、金额、状态与到账不能互相代替。</p></details></div></section></details>`;
  }
  function returnRows(t) {
    const d=t.output,rows=[];
    const add=(label,value)=>{if(value===undefined)return;let text=value===null?'—':String(value);if(/日期/.test(label)&&/^\d{8}$/.test(text))text=text.slice(0,4)+'年'+Number(text.slice(4,6))+'月'+Number(text.slice(6,8))+'日';if(/（元）|（份）/.test(label)&&/^-?\d+(\.\d+)?$/.test(text)){const parts=text.split('.');parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');text=parts.join('.');}rows.push({label,value:text});};
    add('产品',d.fundName||d.fundInfo?.fundName||d.productShortName);
    if(d.list) {add('匹配记录',`${d.list.length}笔 / 查询范围${d.total}笔`);add('本笔业务',d.list[0]?.businTypeStr?.startsWith('DIVIDEND')?'现金分红':({'022':'申购','039':'定投','024':'赎回'})[d.list[0]?.businTypeStr]||'业务类型待核对');}
    if(d.confirmState!==undefined)add('确认状态',({'0':'确认失败','1':'确认成功','2':'部分确认成功','4':'已撤单','5':'行为确认','9':'未确认'})[d.confirmState]||'确认结果待核对');
    add('确认日期',d.confirmDate); add('确认金额（元）',d.confirmBalance);add('确认份额（份）',d.confirmShare);add('确认净值（元）',d.dayNav);
    if(d.specialFareInfo)add('业绩报酬条款',d.specialFareInfo.payback);
    if(d.specialLimitInfo)add('首次购买起点',d.specialLimitInfo.startAmount);
    if(d.specialFundTradeTimeInfo){const w=d.specialFundTradeTimeInfo.allotTimeInfo;add('本期申购',w?.thisbegindate?`${w.thisbegindate}—${w.thisenddate}`:'—');add('下一期申购',w?.nextbegindate?`${w.nextbegindate}—${w.nextenddate}`:'—');}
    if(d.balance!==undefined){add('产品额度（元）',d.balance);add('已用额度（元）',d.usedbalance);}
    if(d.protocol&&d.state){add('协议状态',({'A':'正常','P':'暂停','H':'终止'})[d.state]||'协议状态待核对');add('每期金额（元）',d.amount);add('扣款周期',d.fixTimeDesc);add('下次计划日期',d.nextTradeDate);}
    const info=d.specialFundExtInfo;add('投资策略',info?.investstrategy||d.investmentStrategy);add('投资范围',info?.investrange||d.investmentScope);add('风险说明',info?.fundrisklevel||d.riskCharacteristics);
    if(d.totalProfitCategoryMap){const p=d.totalProfitCategoryMap['156'];add('币种','人民币');add('当前持仓收益（元）',p?.holdProfit);add('持仓收益率（%）',p?.holdYield);add('累计收益（元）',p?.totalProfit);add('查询范围',d.capitalQryAngle);}
    return rows;
  }
  function calculationHtml(x) {
    const result=root.SourceServiceSimulation.feeCalculation(x),money=n=>n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
    return `<p>计算条件来自客户本轮给定；门槛与费率来自本产品费用条款。</p><p>期间收益＝${x.shares.toLocaleString('zh-CN')}份 ×（${x.endAccum.toFixed(4)}−${x.startAccum.toFixed(4)}）＝${money(result.gain)}元</p><p>门槛收益＝${x.shares.toLocaleString('zh-CN')}份 × ${x.startUnit.toFixed(4)}元 × ${x.days}天 ÷ ${x.yearDays}天 × ${(x.hurdle*100).toFixed(0)}%＝${money(result.threshold)}元</p><p>超额收益＝${money(result.gain)}−${money(result.threshold)}＝${money(result.excess)}元；不足门槛时按0计算</p><p>业绩报酬＝${money(result.excess)} × ${(x.rate*100).toFixed(0)}%＝${money(result.fee)}元；本批持有${x.days}天，满足最低${x.minimumDays}天，按分舍入。</p><p>测算结果不表示已扣费；其他批次与期间分红须分别核对。</p>`;
  }
  function facts(c,s) {
    if(root.BusinessProfitWalkthrough?.isCase(c))return root.BusinessProfitWalkthrough.facts(c,s,esc);
    const round=c.rounds[s.round];
    if(round.facts) {
      const rows=round.facts.slice();
      if(round.calculation){const x=round.calculation,r=root.SourceServiceSimulation.feeCalculation(x);rows.push({label:'参与份额',value:`${(x.shares/10000).toFixed(0)}万份 · 客户给定`,source:'客户本轮条件'},{label:'起点与期末',value:`起点单位净值${x.startUnit.toFixed(4)}元；累计净值${x.startAccum.toFixed(4)} → ${x.endAccum.toFixed(4)}`,source:'客户本轮条件'},{label:'计费天数',value:`${x.days}天 / 年基准${x.yearDays}天；最低${x.minimumDays}天`,source:'客户条件与产品条款'},{label:'门槛与计提比例',value:`年化${x.hurdle*100}% · 超额收益的${x.rate*100}%`,source:'产品费用条款'},{label:'收益分段',value:`期间收益${r.gain/10000}万元 − 门槛收益${r.threshold/10000}万元＝超额${r.excess/10000}万元`,source:'业务核算'},{label:'测算业绩报酬',value:`${r.fee.toLocaleString('zh-CN')}元 · 不是本次实扣结果`,source:'业务核算'});}
      return `<section class="agent-facts"><div class="agent-section-heading"><h3>关键事实</h3><span class="agent-source-badge">${round.calculation?'费用条款与核算':'业务核对'}</span></div><dl class="agent-fact-list">${rows.map(f=>`<div class="agent-fact-row"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>${round.calculation?`<details class="technical"><summary>查看计算公式与过程因子</summary>${calculationHtml(round.calculation)}</details>`:''}</section>`;
    }
    const meaningful = c.rounds[s.round].advisors.filter(m => m.text.length >= 12);
    const selected = meaningful.find(m=>/\d|确认|到账|费用|收益|净值|开放|扣|风险|定投/.test(m.text)) || meaningful[0] || c.rounds[s.round].advisors[0];
    return `<section class="agent-facts"><div class="agent-section-heading"><h3>关键事实</h3><span class="agent-source-badge">本轮沟通资料</span></div><dl class="agent-fact-list"><div class="agent-fact-row"><dt>顾问已说明</dt><dd>${esc(safeText(selected,c))}</dd></div>${(gaps[c.category]||['本次业务对象、资料日期与适用范围']).map(text=>`<div class="agent-fact-row is-gap"><dt>${esc(text)}</dt><dd>待对应业务记录核对</dd></div>`).join('')}</dl>${formulas[c.category] ? `<div class="agent-fact-caveats"><b>关键过程因子与计算口径</b>${formulas[c.category].map(text=>`<p>${esc(text)}</p>`).join('')}</div>` : ''}</section>`;
  }
  function render(state, escape) {
    shared=state; esc=escape; document.body.dataset.sourceService='true';
    const rows=cases(),original=definition(),s=current(original),round=original.rounds[s.round],c={...original,skill:round.skill||original.skill,tools:round.tools||original.tools,...round.routing};
    const messages=[];
    for(let n=0;n<=s.round;n++) {
      messages.push(...c.rounds[n].customers);
      if(s.sent[n]) messages.push({role:'ADVISOR',text:s.sent[n],timestamp:c.rounds[n].advisors.at(-1).timestamp});
    }
    document.querySelectorAll('.platform-demo-label,.demo-pill,.global-footer').forEach(el=>el.hidden=true);
    const content = root.BusinessProfitWalkthrough?.isCase(c) ? compact(c,s) : root.BusinessAnswerView ? root.BusinessAnswerView.render(c,s,esc,{records:returnRows,calculation:calculationHtml}) : `${process(c,s)}<div class="item-heading"><h2>${esc(c.title)}</h2><span class="badge blue">${s.closed?'当前答复已结束':s.sent[s.round]?'已回复':s.prepared?'答复已整理':'待回复'}</span></div><div class="next-action"><b>${root.BusinessProfitWalkthrough?.isCase(c)?'持仓波动类':'同类问题'}</b><span>${c.question_turns == null ? '客户会话' : c.question_turns.toLocaleString('zh-CN')+'轮 · '+c.conversations.toLocaleString('zh-CN')+'份会话'} ${root.LOCAL_CHAT_ANALYSIS ? '<button class="plain-button" data-action="source-evidence">原文与次数 ↗</button>' : ''}</span></div>${facts(c,s)}${root.BusinessProfitWalkthrough?.isCase(c) ? root.BusinessProfitWalkthrough.answerHtml(c,s,esc) : `<section class="agent-answer"><div class="agent-section-heading"><h3>${s.sent[s.round]?'已发送话术':'建议答复'}</h3><span>顾问答复</span></div><div class="reply-block agent-reply-text">${esc(s.sent[s.round]||answer(c,s))}</div></section>`}${s.sent[s.round] && s.round<c.rounds.length-1 ? '<button class="button small wide" data-action="source-next">接收客户后续消息，继续处理</button>' : ''}`;
    return `<div class="wecom-demo-toolbar"><div><button class="wecom-back" data-go="strategies">‹ 策略后台</button><span class="wecom-demo-name">客户服务</span></div><div class="wecom-demo-tools"><span>财富顾问工作台</span><button data-action="source-reset">重新查看本次会话</button></div></div><div class="wecom-mobile-switch"><button data-wecom-pane="chat">企微聊天</button><button data-wecom-pane="assistant">服务侧边栏</button></div><section class="wecom-window"><div class="wecom-titlebar"><b>企业微信</b><span>客户会话</span><div class="window-controls"><i>─</i><i>□</i><i>×</i></div></div><div class="service-grid wecom-layout">${root.WeComDemoShell.rail()}<aside class="scenario-list wecom-conversations"><div class="wecom-search"><span>⌕</span><input id="source-case-search" placeholder="搜索客户或问题" aria-label="搜索客户或问题"></div>${rows.map(row=>`<button class="scenario-button ${row.id===c.id?'selected':''}" data-case="${esc(row.id)}" data-search="${esc(row.customer+' '+row.title)}"><span class="conversation-avatar">${esc(row.customer[0])}</span><span class="conversation-preview"><b>${esc(row.customer)}<time>${esc(row.rounds[0].customers[0].timestamp.slice(5,10))}</time></b><span>${esc(row.title)}</span></span></button>`).join('')}<div class="conversation-boundary">${rows.length}位客户 · 会话服务</div></aside><section class="chat-panel"><div class="chat-header"><b>${esc(c.customer)} <span class="wecom-contact-tag">@微信</span></b><span>···</span></div><div class="chat-body" id="chat-body"><div class="chat-date">${esc(round.customers[0].timestamp.slice(0,10))}</div>${messages.map(m=>`<div class="message ${m.role==='ADVISOR'?'advisor':''}"><div class="avatar">${m.role==='ADVISOR'?'顾':esc(c.customer[0])}</div><div class="message-content"><div class="message-meta"><span>${m.role==='ADVISOR'?'顾问':esc(c.customer)}</span><span>${esc(m.timestamp.slice(11,16))}</span></div><div class="bubble">${esc(safeText(m,c))}</div></div></div>`).join('')}</div><div class="chat-context"><span>当前问题：${esc(c.title)}</span></div><div class="composer">${root.WeComDemoShell.composerIcons()}<textarea id="compose" aria-label="回复输入框" placeholder="使用右侧话术，也可以在这里修改" ${s.closed||s.sent[s.round]?'disabled':''}>${esc(s.compose)}</textarea><div class="composer-actions"><button class="button primary" id="send-reply" data-action="source-send" ${!s.compose.trim()||s.sent[s.round]||s.closed||(root.BusinessProfitWalkthrough?.isCase(c)&&!root.BusinessProfitWalkthrough.ready(s))?'disabled':''}>发送</button></div></div></section><section class="assistant-panel"><div class="wecom-sidebar-location"><span>财富服务</span><span>当前会话</span></div><div class="assistant-head"><div class="assistant-name"><span class="agent-emblem">✦</span><div>服务助手<span class="agent-header-subtitle">${esc(c.customer)} · 第${s.round+1}轮</span></div></div><button class="agent-replay-button" data-action="source-run" ${s.closed?'disabled':''}>整理答复 ↻</button></div><div class="assistant-content" id="problem-content">${content}</div><footer class="agent-action-dock"><span>${s.sent[s.round]?'保留本轮回复，继续承接客户问题':'话术放入输入框，由顾问确认发送'}</span><div class="action-row"><button class="button primary" data-action="source-use" ${s.sent[s.round]||s.closed||(root.BusinessProfitWalkthrough?.isCase(c)&&!root.BusinessProfitWalkthrough.ready(s))||(root.BusinessAnswerView&&!root.BusinessAnswerView.replyAllowed(c,s.round))?'disabled':''}>使用话术 ↗</button>${s.sent[s.round] && s.round===c.rounds.length-1 && !s.closed && round.canClose!==false?'<button class="button" data-action="source-close">结束本次答复</button>':''}</div></footer></section></div></section>`;
  }
  function compact(c,s) {
    const view=root.BusinessProfitWalkthrough;
    const title=s.round===0?'投入与剩余市值为何不同':'近期赚了，为什么整体还亏';
    const status=s.closed?'本轮已结束':view.ready(s)?s.sent[s.round]?'已回复':'可回复':'待核对';
    const check=`${root.BusinessAnswerView.verdictHtml(view.verdict(c,s),esc)}<p class="profit-scope">均衡精选A · 人民币 · 净值截至9月28日</p>${view.facts(c,s,esc)}`;
    return root.BusinessAnswerView.shell(c,s,esc,{title,status,check,reply:view.answerHtml(c,s,esc),process:view.process(c,s,esc),kind:'calculation'});
  }
  function showProfitDialog(kind,c,s,index) {
    const view=root.BusinessProfitWalkthrough,dialog=document.getElementById('detail-dialog');
    document.getElementById('dialog-title').textContent=kind==='ledger'?'交易与成本账本':kind==='record'?'这笔交易怎么影响成本':'给客户解释怎么算';
    document.getElementById('dialog-eyebrow').textContent='郑女士 · 均衡精选A';
    document.getElementById('dialog-body').innerHTML=kind==='ledger'?view.ledgerHtml(c,s,esc):kind==='record'?view.recordHtml(index,esc):view.explainHtml(c,s,esc);
    dialog.classList.add('profit-dialog');if(!dialog.open)dialog.showModal();document.getElementById('dialog-body').scrollTop=0;
  }
  function redraw() { document.getElementById('main-content').innerHTML=render(shared,esc); save(); }
  function openEvidence(c) {
    c={...c,...c.rounds[current(c).round].routing};
    const category=root.LOCAL_CHAT_ANALYSIS.categories.find(row=>row.id===c.category);
    document.getElementById('dialog-title').textContent='原始聊天与问题次数'; document.getElementById('dialog-eyebrow').textContent=category.name;
    document.getElementById('dialog-body').innerHTML=`<p>${category.question_turns.toLocaleString('zh-CN')}轮，涉及${category.conversations.toLocaleString('zh-CN')}份会话；同轮本类计一次，类型可重叠。</p><p>会话资料保留角色、时间及措辞，身份称呼已替换。历史答复与本人账户查询结果分别核对。</p>${root.ChatQuestionEvidence.originalMessages(category.examples.find(e=>e.id===c.source_id)||category.examples[0])}`;
    document.getElementById('detail-dialog').showModal();
  }
  if(typeof document!=='undefined') {
    document.addEventListener('input', event=>{
      if(document.body.dataset.sourceService!=='true'||shared?.view!=='service')return;
      if(event.target.id==='compose') { event.stopImmediatePropagation(); const c=definition(),s=current(c); if(s.closed||s.sent[s.round])return; s.compose=event.target.value; document.getElementById('send-reply').disabled=!event.target.value.trim()||(root.BusinessProfitWalkthrough?.isCase(c)&&!root.BusinessProfitWalkthrough.ready(s)); save(); }
      if(event.target.id==='source-case-search') document.querySelectorAll('.scenario-button').forEach(row=>row.hidden=!row.dataset.search.includes(event.target.value.trim()));
    },true);
    document.addEventListener('click',event=>{
      if(document.body.dataset.sourceService!=='true'||shared?.view!=='service')return;
      const b=event.target.closest('[data-action]'); if(!b||b.disabled||!b.dataset.action.startsWith('source-'))return;
      event.stopImmediatePropagation(); const c=definition(),s=current(c);
      if(s.closed&&!['source-evidence','source-reset','source-profit-ledger','source-profit-explain','source-profit-record','source-business-detail'].includes(b.dataset.action))return;
      if(b.dataset.action==='source-evidence')return openEvidence(c);
      if(b.dataset.action==='source-business-detail' && root.BusinessAnswerView){const d=document.getElementById('detail-dialog');document.getElementById('dialog-title').textContent=root.BusinessAnswerView.profiles[c.id]?.link||'业务核对详情';document.getElementById('dialog-eyebrow').textContent=c.customer;document.getElementById('dialog-body').innerHTML=root.BusinessAnswerView.detailsHtml(c,s,esc,returnRows,calculationHtml);d.classList.add('profit-dialog');if(!d.open)d.showModal();document.getElementById('dialog-body').scrollTop=0;return;}
      if(root.BusinessProfitWalkthrough?.isCase(c) && root.BusinessProfitWalkthrough.ready(s)) {
        if(b.dataset.action==='source-profit-ledger')return showProfitDialog('ledger',c,s);
        if(b.dataset.action==='source-profit-explain')return showProfitDialog('explain',c,s);
        if(b.dataset.action==='source-profit-record')return showProfitDialog('record',c,s,Number(b.dataset.record));
      }
      if(b.dataset.action==='source-use') {if(root.BusinessProfitWalkthrough?.isCase(c)&&!root.BusinessProfitWalkthrough.ready(s))return;if(root.BusinessAnswerView&&!root.BusinessAnswerView.replyAllowed(c,s.round))return;s.compose=answer(c,s);document.body.dataset.wecomPane='chat';}
      if(b.dataset.action==='source-run') {if(root.BusinessProfitWalkthrough?.isCase(c))root.BusinessProfitWalkthrough.advance(s,true);s.prepared=true;document.body.dataset.wecomPane='assistant';}
      if(b.dataset.action==='source-profit-step' && root.BusinessProfitWalkthrough?.isCase(c) && !s.sent[s.round])root.BusinessProfitWalkthrough.advance(s);
      if(b.dataset.action==='source-send' && !s.sent[s.round] && s.compose.trim()) {if(root.BusinessProfitWalkthrough?.isCase(c)&&!root.BusinessProfitWalkthrough.ready(s))return;s.sent[s.round]=s.compose; s.compose=''; }
      if(b.dataset.action==='source-next' && s.sent[s.round] && !s.compose.trim() && s.round<c.rounds.length-1) { s.round++;s.compose='';s.prepared=false; }
      if(b.dataset.action==='source-close' && s.sent[s.round] && s.round===c.rounds.length-1 && c.rounds[s.round].canClose!==false)s.closed=true;
      if(b.dataset.action==='source-reset')delete progress[c.id];
      redraw();
    },true);
  }
  root.SourceConversationView={available,render,outputFields};
  if(typeof document!=='undefined') document.getElementById('detail-dialog')?.addEventListener?.('close',()=>document.getElementById('detail-dialog').classList.remove('profit-dialog'));
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SourceConversationView;
})(typeof window!=='undefined'?window:globalThis);
