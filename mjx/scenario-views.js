/* 场景化展示层。复用既有数据和状态机，绝不由图片、文案或页面状态生成业务事实。 */
(function (root) {
  'use strict';
  const designs = [
    { title: '客户咨询', path: 'design/01-客户咨询-视觉参考.png', view: 'service', audience: '财富顾问', goal: '客户问什么，就回答什么', steps: '识别问题 → 查询事实 → 解释答复', focus: '交易确认、补问续接、多问题独立答复', metric: '完整答复率' },
    { title: '问题协同', path: 'design/02-问题协同-视觉参考.png', view: 'coordination', audience: '顾问与业务处理人员', goal: '查不到结论，保留事实与缺口', steps: '确认协同 → 人工核查 → 结果答复', focus: '定投失败原因、本人参与条件核查', metric: '实际解决率' },
    { title: '主动服务', path: 'design/03-主动服务-视觉参考.png', view: 'active', audience: '财富顾问', goal: '有依据地服务，不自动推销', steps: '发现机会 → 核对条件 → 确认触达', focus: '窗口提醒、产品资料与需求了解', metric: '按提醒或推荐目标分别评估' },
    { title: '策略沉淀与审核', path: 'design/04-策略审核-视觉参考.png', view: 'strategies', audience: '业务负责人', goal: '让方法可复用，效果可验证', steps: '归纳候选 → 查看证据 → 审核试用', focus: '来源、必要事实、边界、单场景A/B', metric: '沿用策略场景的一个主指标' }
  ];
  // 只校订已核对来源的展示口径，原data、事件、接口字段和状态不改。
  function displayProfile(c, i) {
    if (!c) return {};
    const d = Object.values(root.STRATEGY_CATALOG?.definitions || {}).find(d => d.caseId === c.id && (!i || (d.sourceItemId || c.items[0]?.id) === i.id));
    return d?.replayDisplay || {};
  }
  function caseTitle(c) { return displayProfile(c).caseTitle || c.title; }
  function displayItem(c, i, frozenDisplay) {
    const p = frozenDisplay === undefined ? displayProfile(c, i) : frozenDisplay;
    if (!p.sourceLimit) return i;
    return { ...i, strategy: p.strategy || i.strategy, boundary: i.boundary + ' ' + p.sourceLimit,
      facts: i.facts.map(f => String(f.field || '').includes('allotTimeInfo.') ? { ...f, note: [f.note, p.sourceLimit].filter(Boolean).join(' ') } : f),
      events: i.events.map(s => p.eventText?.[s.text] ? { ...s, text: p.eventText[s.text], sourceText: s.text } : s) };
  }
  function overview(x) {
    const { state, escape: e, intro } = x;
    return intro('金融服务场景 · 同一条事实与能力底座', '把问题答清楚，让方法留下来', '顾问看事实与答复，协同人员看缺口与进度，负责人看方法与效果。', '<button class="button" data-action="design-reference">查看4张视觉稿</button>') + `
      <section class="overview-spine"><div><span class="spine-label">共同原则</span><h2>事实在前，建议在后。</h2></div><p>历史场景原话为起点；接口、客户补充和人工结果为模拟。话术使用到输入框，由顾问确认发送，不自动办理。</p><span class="badge amber">本地交互 · 非生产运行</span></section>
      <div class="scene-map">${designs.map((s, n) => `<article class="scene-entry"><div class="scene-order">0${n + 1}</div><div class="scene-description"><span class="small-label">${s.audience}</span><h2>${s.title}</h2><p>${s.goal}</p><div class="scene-focus">${s.focus}</div><div class="scene-path">${s.steps}</div></div><button class="scene-open" data-go="${s.view}" aria-label="打开${s.title}原型">打开原型 <span>↗</span></button></article>`).join('')}</div>
      <div class="overview-bottom"><section><span class="small-label">已有素材，口径分开</span><b>6个场景起点 · 9条来源消息</b><p>场景改写保留来源哈希；3段历史模型输出可核对。全库会话规模不是本原型解决率。</p></section><section><span class="small-label">能力积累，不增加复杂层级</span><b>4类领域能力 · 同一问题独立执行</b><p>交易、产品、账户、其他服务。策略候选先审核和验证，不把单次成功或演示A/B当作已证实有效。</p></section><button class="button" data-go="plan">查看简化总体方案</button></div>`;
  }
  function facts(i, x) {
    const e = x.escape;
    const human = i.facts.filter(f => f.source.startsWith('人工回填'));
    const gaps = i.facts.filter(f => f.source === '事实缺口');
    const original = i.facts.filter(f => !human.includes(f) && !gaps.includes(f));
    const currentGaps = i.complete && human.length ? [] : gaps;
    const historicalGaps = currentGaps.length ? [] : gaps;
    const rows = list => { const mixed = new Set(list.map(f => f.source)).size > 1; return list.map(f => `<div class="${f.source === '事实缺口' ? 'evidence-gap' : ''}"><dt>${e(root.AgentSidebarView?.factLabel(i, f) || f.label)}${mixed || f.source === '事实缺口' ? `<small>${e(f.source.replaceAll('Mock', '模拟'))}</small>` : ''}</dt><dd>${e(f.value)}${f.note ? `<small class="fact-unit-note">${e(f.note)}</small>` : ''}</dd></div>`).join(''); };
    const hasMock = original.some(f => f.source.includes('Mock'));
    const hasHistory = original.some(f => !f.source.includes('Mock'));
    const heading = hasMock && hasHistory ? '事实来源 · 接口与历史' : hasMock ? '接口返回 · 模拟' : '历史来源事实';
    return `<section class="evidence-sheet"><div class="sheet-head"><span class="evidence-icon">✓</span><b>${heading}</b>${x.readonly ? '' : '<button data-action="fact-details">核对来源 ↗</button>'}</div><dl class="evidence-rows">${rows(original)}${rows(currentGaps)}</dl><p class="evidence-scope">${i.round || i.revision > 1 ? '首次查询范围（续接前）：' : '查询范围：'}${e(i.scope)}</p></section>${human.length ? `<section class="human-evidence"><div class="sheet-head"><b>人工核实结果 · 模拟</b><span>不是接口字段</span></div><dl class="evidence-rows">${rows(human)}</dl>${historicalGaps.length ? `<details class="historical-gaps"><summary>查看先前的查询缺口</summary><dl class="evidence-rows">${rows(historicalGaps)}</dl><p>保留查询时记录；当前结论以本轮绑定的人工结果为准。</p></details>` : ''}</section>` : ''}`;
  }
  function process(i, x) {
    i = displayItem(x.sourceCase, i);
    const e = x.escape;
    const role = { model: '模型建议', tool: '模拟查询', human: '人工环节', advisor: '顾问操作', customer: '客户补充', system: '系统记录' };
    return `<details class="process-details evidence-process"><summary>展开处理过程 <span>${i.events.length}条记录</span></summary><div class="timeline">${i.events.map(s => `<div class="timeline-entry"><i class="timeline-dot ${e(s.kind || 'system')}"></i><div><span class="event-role">${role[s.kind] || '回放记录'}</span><b>${e(s.title)}</b><p>${e(s.text)}</p></div></div>`).join('')}</div><div class="quiet-callout">活动与结果记录，不是模型私有思维链。查询为既有Mock回放，不表示真实服务已接通。</div><details class="technical"><summary>问题标识、能力及发送回执</summary><pre>${e(JSON.stringify({ id: i.id, skill: i.skill, status: i.status, tools: i.tools, receipts: i.sentTexts }, null, 2))}</pre></details></details>`;
  }
  function replyPanel(c, i, x) {
    const { escape: e, businessText, nextAction } = x;
    const closed = i.status === 'CLOSED';
    const sent = i.sentRevision === i.revision ? i.sentTexts.find(r => r.revision === i.revision) : null;
    return `<section class="action-sheet"><div class="sheet-head"><span class="draft-icon">✦</span><b>${closed ? '实际回复记录（模拟）' : sent ? '本轮已发送内容（模拟）' : '建议回复'}</b></div><div class="reply-block">${e(sent ? sent.text : i.reply)}</div><div class="reply-origin">${sent ? '顾问实际发送记录（模拟）' + (sent.modified ? ' · 已修改原建议' : '') : businessText(i.replyEvidence?.origin || '演示草稿') + ' · 非本轮在线生成'}${i.replyEvidence?.model ? '<button data-action="reply-source">查看原始模型输出</button>' : ''}</div>
      ${!i.registered ? `<div class="confirm-box"><b>${i.kind === 'opportunity' ? '顾问核对后再触达' : '确认需要协同，再登记'}</b><p>${i.kind === 'opportunity' ? '历史需求不证明当前需求；演示没有客户真实风险等级或适当性结论。' : '登记不等于核查已完成；只有绑定结果后才能解释原因。'}</p><label class="check-label"><input type="checkbox" id="service-confirm">${i.kind === 'opportunity' ? '已人工核对需求、适当性边界与频控（演示）' : '已核对问题与缺口，同意登记协同（演示）'}</label><button class="button primary wide" data-action="confirm">${i.kind === 'opportunity' ? '确认服务条件' : '确认登记协同'}</button></div>` : `<div class="action-row"><button class="button primary" data-action="use" ${closed || i.sentRevision === i.revision || c.busy ? 'disabled' : ''}>使用话术 ↗</button><button class="button" data-action="run" ${closed || i.sentRevision === i.revision || c.busy ? 'disabled' : ''}>回放过程</button>${i.kind === 'issue' && i.complete && i.sentRevision === i.revision && !closed ? '<button class="button success" data-action="close">确认关闭</button>' : ''}</div>`}
      <div class="next-action"><b>下一步</b><span>${nextAction(i)}</span></div>
      ${i.awaiting === 'human' && i.humanResult ? '<button class="button wide" data-action="human-result">模拟人工回填，生成最终答复</button>' : ''}
      <div class="local-compose"><label for="compose">企微输入框 · ${i.kind === 'opportunity' ? '当前服务机会' : '当前问题'}独立草稿</label><textarea id="compose" aria-label="企微回复输入框" placeholder="使用话术后，核对或修改，再模拟发送。" ${closed ? 'disabled' : ''}>${e(i.compose)}</textarea><div class="composer-actions"><small>不发送模拟客户</small><button id="send-reply" class="button primary" data-action="send" ${!i.compose.trim() || i.sentRevision === i.revision || !i.registered || c.busy ? 'disabled' : ''}>模拟发送 ↗</button></div></div>
      ${i.kind === 'opportunity' ? '<p class="safety-note">触达不是申购确认。等待客户反馈与真实业务结果，不自动标记成交。</p>' : ''}
      <details class="process-details"><summary>查看本问题沟通记录</summary>${c.messages.filter(m => !m.itemId || m.itemId === i.id).map(m => `<div class="compact-message"><span>${m.role === 'CUSTOMER' ? c.customer : '顾问'} · ${e(m.origin)}</span><p>${e(m.text)}</p></div>`).join('')}</details>
      <button class="plain-button candidate-link" data-action="candidate">从本次过程归纳候选策略 ↗</button></section>`;
  }
  function coordination(x) {
    const { state, escape: e, statusText, intro } = x;
    const queue = state.cases.flatMap(c => c.items.filter(i => i.kind === 'issue' && (i.stage === 'handoff' || i.humanResult || i.awaiting === 'human' || i.humanTask)).map(i => ({ caseId: c.id, itemId: i.id, c, i })));
    let selected = queue.find(q => q.caseId === state.selectedCase && q.itemId === q.c.activeItemId) || queue[0];
    state.selectedCase = selected.c.id; selected.c.activeItemId = selected.i.id;
    const { c, i } = selected;
    const owner = i.status === 'CLOSED' ? '已结束维护' : i.awaiting === 'human' ? '业务核查人员（模拟）' : '当前财富顾问';
    const phase = !i.registered ? 0 : !i.sentRevision ? 1 : i.awaiting === 'human' ? 2 : i.status === 'CLOSED' ? 4 : 3;
    return intro('确有证据缺口 · 才进入协同', '问题协同', '保留已查事实，不预设原因。登记、回填、回复和关闭绑定同一个问题。') + `<div class="collaboration-grid"><aside class="work-queue"><div class="queue-title">协同问题 <span>${queue.filter(q => q.i.status !== 'CLOSED').length}个未闭环</span></div>${queue.map(q => `<button data-collab-case="${q.caseId}" data-collab-item="${q.itemId}" class="queue-item ${q.itemId === i.id ? 'selected' : ''}" aria-pressed="${q.itemId === i.id}"><span>${e(q.c.customer)}</span><b>${e(q.i.title)}</b><small>${statusText(q.i)}</small></button>`).join('')}<div class="queue-note">有核查需求的问题统一承接，包含后续新增候选。交易失败不自动认定系统故障。</div></aside>
      <section class="case-investigation"><div class="investigation-header"><div><span class="small-label">${e(c.customer)} · ${e(c.date)}历史场景</span><h2>${e(i.title)}</h2></div><span class="badge ${i.status === 'CLOSED' ? 'green' : 'amber'}">${statusText(i)}</span></div><div class="question-quote">${e(c.messages.filter(m => m.role === 'CUSTOMER' && (!m.itemId || m.itemId === i.id)).map(m => m.text).join('；'))}<button data-action="sources">核对原话 ↗</button></div>
        <div class="phase-strip">${['核对缺口', '顾问登记', '等待核查', '结果答复', '确认关闭'].map((t, n) => `<span class="${n === phase ? 'current' : n < phase ? 'done' : ''}"><i>${n + 1}</i>${t}</span>`).join('')}</div>
        ${c.busy ? '<div class="running-indicator">正在本地回放查询与答复过程</div>' : ''}${facts(i, x)}
        <section class="gap-sheet"><div class="sheet-head"><b>${i.complete ? '本轮已核实的结果' : '仍需核实的内容'}</b></div><p>${e(i.complete ? i.humanResult || '当前诉求已有完整解释。' : i.facts.filter(f => f.source === '事实缺口').map(f => f.label + '：' + f.value).join('；') || i.humanTask || '需要明确事实缺口，不能只说再核实。')}</p><div class="owner-row"><div><span>当前由谁处理</span><b>${owner}</b></div><div><span>下一步</span><b>${i.awaiting === 'human' ? '等待绑定核查结果' : i.status === 'CLOSED' ? '仅保留查询历史' : i.complete ? '顾问核对回复及关闭' : '确认并发送核查说明'}</b></div></div></section>
        ${process(i, x)}<div class="safety-note">确认失败是交易确认状态，不证明扣款、退款或到账结果。没有原因证据，不把当前余额推成失败原因。</div></section><aside class="case-actions">${replyPanel(c, i, x)}</aside></div>`;
  }
  function active(x) {
    const { state, escape: e, statusText, intro } = x;
    const available = state.cases.filter(c => c.mode === 'active');
    const c = available.find(c => c.id === state.selectedCase) || available[0];
    state.selectedCase = c.id;
    const i = c.items.find(i => i.id === c.activeItemId) || c.items[0]; c.activeItemId = i.id;
    const reminder = c.id === 'active-open';
    const shown = displayItem(c, i), profile = displayProfile(c, i);
    return intro('主动服务 · 先核对适用条件', '在合适的时点，提供有依据的服务', '募集、开放提醒与产品资料服务分清；预测信号不代替客户需求、适当性或成交事实。') + `<div class="active-service-grid"><aside class="opportunity-queue"><div class="queue-title">服务机会 <span>2个演示</span></div>${available.map(a => `<button class="queue-item ${a.id === c.id ? 'selected' : ''}" data-case="${a.id}" aria-pressed="${a.id === c.id}"><span>${a.customer}</span><b>${e(caseTitle(a))}</b><small>${a.id === 'active-open' ? '服务提醒 · 不是买卖建议' : '提供资料 · 了解需求'}</small></button>`).join('')}<div class="queue-note">机会不登记生产Issue。触达不等于客户同意，也不等于购买。</div></aside><section class="opportunity-evidence"><div class="investigation-header"><div><span class="small-label">${e(c.date)} · 历史回放</span><h2>${e(i.title)}</h2></div><span class="badge blue">${statusText(i)}</span></div>
      <section class="needs-sheet"><div class="sheet-head"><b>服务依据与客户需求</b><button data-action="sources">核对原文 ↗</button></div><p>依据历史场景顾问的${e(profile.sourceLabel || '产品资料')}消息提出演示机会。尚无本客户当前需求与适当性结论，不推定已经匹配。</p><div class="verification-row"><span>当前需求<b>${i.advisorConfirmed ? '顾问已演示确认' : '待顾问核对'}</b></span><span>适当性边界<b>${i.advisorConfirmed ? '顾问已演示确认' : '待顾问核对'}</b></span><span>触达频控<b>${i.advisorConfirmed ? '顾问已演示确认' : '待顾问核对'}</b></span></div></section>${facts(shown, x)}
      <div class="historical-warning">以上是${e(c.date)}的历史场景与Mock资料，不是今天的募集或交易安排；不以展示的经理资料证明现任。</div>
      <section class="goal-sheet"><span class="small-label">本场景只看一个业务主指标</span><h3>${reminder ? '提醒目标达成' : '资料／需求沟通目标达成'}</h3><p>${reminder ? '以事先定义的提醒任务及模拟客户反馈评估；不能把触达直接计为达成，也不一律要求购买。' : '按客户是否获得所需资料并解决当次资料咨询评估，不能用发送或申购率代替。策略页的确认申购A/B是后续推荐实验示例，需要先确认适用人群，不是本次资料服务效果。'}</p><span class="badge outline">真实结果：尚未接入</span></section>
      <details class="process-details"><summary>预测模型与后续扩展边界</summary><div class="quiet-callout">申购或流失模型未来可提供服务线索，AI提出迭代候选，经离线验证与业务审核后做对照试验。本Demo未训练、评分或发布预测模型；不展示虚构概率。</div></details>${process(i, { ...x, sourceCase: c })}</section><aside class="case-actions">${replyPanel(c, i, x)}</aside></div>`;
  }
  function captureEvidence(c, i) {
    const item = {};
    // 只保存当前已可见信息，不把下一轮Mock、未回填的人工结果放进候选依据。
    for (const key of ['id', 'title', 'skill', 'skillName', 'kind', 'stage', 'scope', 'facts', 'tools', 'raw', 'events', 'sentTexts', 'reply', 'replyEvidence', 'revision', 'sentRevision', 'status', 'complete', 'awaiting', 'boundary']) item[key] = i[key];
    return JSON.parse(JSON.stringify({ capturedAt: new Date().toISOString(), caseId: c.id, customer: c.customer, date: c.date, item, messages: c.messages.filter(m => !m.itemId || m.itemId === i.id), sources: c.sources }));
  }
  const api = { designs, overview, facts, process, captureEvidence, coordination, active, caseTitle, displayItem };
  root.FinancialSceneViews = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
