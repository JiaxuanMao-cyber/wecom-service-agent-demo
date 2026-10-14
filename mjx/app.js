(function () {
  'use strict';
  const data = window.ServiceInteractionCases?.extendData(window.SERVICE_DEMO_DATA) || window.SERVICE_DEMO_DATA;
  const engine = window.ServiceDemoEngine;
  const storageKey = window.COMPETITION_DEMO_STORAGE_KEY || 'gffunds-service-demo-20261008-v1';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const businessText = value => escape(String(value ?? '').replaceAll('Mock', '模拟').replaceAll('MCP', '接口').replaceAll('Issue', '问题').replaceAll('Skill', '能力'));
  let state = engine.initial(data);
  state.view = 'service';
  try { const stored = JSON.parse(localStorage.getItem(storageKey)); if (stored?.schema === 1 && stored.sourceSnapshot === data.snapshotSha && stored.cases?.length >= window.SERVICE_DEMO_DATA.cases.length && stored.cases.every(c => state.cases.some(f => f.id === c.id)) && window.SERVICE_DEMO_DATA.cases.every(c => stored.cases.some(f => f.id === c.id))) { stored.cases = state.cases.map(c => stored.cases.find(f => f.id === c.id) || c); state = stored; state.cases.forEach(c => { c.busy = false; }); } } catch {}
  let strategySelection = state.reviewId || 'S-CONFIRM';
  let strategyFilter = 'all';
  let strategySearch = '';
  let toastTimer;
  let wecomPane = 'assistant';
  const playbackPreview = new Map();
  const names = { service: '会话服务', coordination: '问题协同', active: '主动服务', strategies: '策略管理', review: '评估与审核', plan: '总体方案' };
  const $ = selector => document.querySelector(selector);
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} }
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600); }
  function dialog(title, body, eyebrow = '可回溯详情') { $('#dialog-title').textContent = title; $('#dialog-eyebrow').textContent = eyebrow; $('#dialog-body').innerHTML = body; if (!$('#detail-dialog').open) $('#detail-dialog').showModal(); $('#dialog-body').scrollTop = 0; }
  function intro(eyebrow, title, subtitle, extra = '') { return `<div class="page-intro"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${extra}</div>`; }
  function statusText(i) {
    if (i.kind === 'opportunity') return !i.registered ? '待顾问确认' : i.sentRevision ? '已触达 · 待结果' : '待触达';
    if (!i.registered) return '待确认登记';
    if (i.status === 'CLOSED') return '已关闭';
    if (i.awaiting === 'human') return '人工核查中';
    if (i.awaiting === 'customer') return '等客户补充';
    if (i.status === 'PROCESSING') return i.complete ? '待确认关闭' : '待继续核实';
    return '待回复';
  }
  function nextAction(i) {
    if (i.status === 'CLOSED') return '已结束维护；其他问题可继续处理。';
    if (!i.registered) return i.kind === 'opportunity' ? '先确认客户需求、适当性边界与提醒频控。' : '顾问确认登记，再发送说明并协同核查。';
    if (i.awaiting === 'human') return `业务人员正在${i.humanTask || '核实当前问题所需信息'}，结果核实后继续答复客户。`;
    if (i.awaiting === 'customer') return '等待客户补充目标产品，再继续原问题。';
    if (i.awaiting === 'outcome') return '查看模拟客户反馈与业务结果，不将触达当作成交。';
    if (i.sentRevision === i.revision) return i.complete ? '顾问核对当前诉求已答全后，确认关闭本问题。' : '保留已答部分，等待账户或业务证据，不能按已解决关闭。';
    return '核对事实 → 使用到输入框 → 顾问确认发送。';
  }
  // 只调整可滚动导航的展示位置，不触发重新执行或改写问题状态。
  function revealSelection(container, selected) {
    if (container && selected && container.scrollWidth > container.clientWidth) container.scrollLeft = Math.max(0, selected.offsetLeft - container.offsetLeft + selected.offsetWidth - container.clientWidth + 12);
  }
  function revealNavigation() {
    if (state.view !== 'service') revealSelection($('#navigation'), $('#navigation .nav-link.active'));
    revealSelection($('.problem-tabs'), $('.problem-tab[aria-selected="true"]'));
  }
  window.addEventListener('resize', revealNavigation);
  function render() {
    document.body.dataset.sourceService = 'false';
    window.StrategyManagement?.seed(state);
    window.AdvisorCopy?.apply(state);
    window.BusinessScenarioCopy?.apply(state);
    if (!names[state.view]) state.view = 'service';
    const context = { state, data, escape, businessText, statusText, nextAction, intro };
    document.body.dataset.scene = state.view;
    document.body.dataset.wecomPane = wecomPane;
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
    $('#page-name').textContent = names[state.view];
    $('#main-content').innerHTML = state.view === 'overview' ? window.FinancialSceneViews.overview(context) : state.view === 'coordination' ? window.FinancialSceneViews.coordination(context) : state.view === 'active' ? window.FinancialSceneViews.active(context) : state.view === 'service' ? renderService() : state.view === 'strategies' ? renderStrategies() : state.view === 'review' ? renderReview() : renderPlan();
    revealNavigation();
    if (state.view === 'service') {
      const current = engine.getCase(state, state.selectedCase);
      if (playbackPreview.get(current.activeItemId)?.stage === 3) {
        const panel = $('#problem-content'), answer = $('.agent-answer');
        if (panel && answer) panel.scrollTop = Math.max(0, answer.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom + 20);
      }
    }
    save();
  }
  function renderService() {
    if (window.SourceConversationView?.available()) return window.SourceConversationView.render(state, escape);
    const available = state.cases.map(c => window.BusinessScenarioCopy?.displayCase(c) || { ...c, title: window.FinancialSceneViews.caseTitle(c) });
    if (!available.some(c => c.id === state.selectedCase)) state.selectedCase = available[0]?.id || state.cases[0].id;
    const originalCase = engine.getCase(state, state.selectedCase);
    const c = window.BusinessScenarioCopy?.displayCase(originalCase) || originalCase;
    const i = c.items.find(i => i.id === c.activeItemId) || c.items[0];
    const preview = playbackPreview.get(i.id);
    const sidebar = window.AgentSidebarView;
    const shown = window.FinancialSceneViews.displayItem(c, i);
    const sourceCategory = window.ChatQuestionEvidence?.categoryForItem(i, window.LOCAL_CHAT_ANALYSIS);
    const interaction = window.ServiceInteractionCases?.definitionFor(c.id);
    const sourceCategories = interaction ? interaction.categories.map(id => window.LOCAL_CHAT_ANALYSIS?.categories.find(row => row.id === id)).filter(Boolean) : [sourceCategory].filter(Boolean);
    return window.WeComDemoShell.opening(escape, wecomPane) + `
    <div class="service-grid wecom-layout">
      ${window.WeComDemoShell.rail()}
      <aside class="scenario-list wecom-conversations" aria-label="企微演示客户会话"><div class="wecom-search"><span aria-hidden="true">⌕</span><input id="case-search" aria-label="搜索演示会话" placeholder="搜索"><span class="wecom-search-add" aria-hidden="true">＋</span></div>${available.map(x => `<button class="scenario-button ${x.id === c.id ? 'selected' : ''}" data-case="${x.id}" data-search="${escape(x.customer + ' ' + x.title + ' ' + x.messages.map(m => m.text).join(' '))}" aria-pressed="${x.id === c.id}"><span class="conversation-avatar">${x.initials}</span><span class="conversation-preview"><b>${escape(x.customer)}<time>${escape(x.date.slice(5).replace('-', '/'))}</time></b><span>${escape(x.messages.find(m => m.role === 'CUSTOMER')?.text || x.title)}</span></span></button>`).join('')}<div class="conversation-boundary">${available.length}个匿名演示会话 · 可切换</div></aside>
      <section class="chat-panel" aria-label="企微聊天与输入框">
        <div class="chat-header"><div><b>${c.customer} <span class="wecom-contact-tag">@微信</span></b></div><span class="wecom-chat-label" aria-hidden="true">···</span></div>
        <div class="chat-body" id="chat-body"><div class="chat-date">${c.date} · 历史时点，不是今天</div>${c.messages.map(m => `<div class="message ${m.role === 'ADVISOR' ? 'advisor' : ''}"><div class="avatar">${m.role === 'ADVISOR' ? '顾' : c.initials}</div><div class="message-content"><div class="message-meta"><span>${m.role === 'ADVISOR' ? '顾问' : c.customer}</span><span>${escape(m.time)}</span></div><div class="bubble">${escape(m.text)}</div><div class="message-origin">${escape(m.origin)}</div></div></div>`).join('')}</div>
        <div class="chat-context"><span>当前回复：${escape(window.BusinessScenarioCopy?.title(i) || i.title)}</span><button data-action="business-case-source">查看场景依据</button></div>
        <div class="composer">${window.WeComDemoShell.composerIcons()}<textarea id="compose" aria-label="企微回复输入框" placeholder="使用右侧话术，也可以在这里修改" ${i.status === 'CLOSED' ? 'disabled' : ''}>${escape(i.compose)}</textarea><div class="composer-actions"><small>演示发送，不触达客户</small><button class="button primary" id="send-reply" data-action="send" ${!i.compose.trim() || i.sentRevision === i.revision || !i.registered || c.busy ? 'disabled' : ''}>模拟发送</button></div></div>
      </section>
      <section class="assistant-panel" aria-label="服务智能体侧边栏">
        <div class="wecom-sidebar-location"><span>财富服务</span><span>演示 · 模拟数据</span></div>
        <div class="assistant-head"><div class="assistant-name"><span class="agent-emblem">✦</span><div>服务助手<span class="agent-header-subtitle">仅当前会话 · ${c.items.length}个事项</span></div></div><button class="agent-replay-button" data-action="run" aria-label="演示整理答复过程" ${c.busy || i.status === 'CLOSED' || i.sentRevision === i.revision ? 'disabled' : ''}>${c.busy ? '整理中' : '整理答复'} <span>↻</span></button></div>
        <div class="problem-tabs ${c.items.length === 1 ? 'single' : ''}" role="tablist" aria-label="当前会话服务事项">${c.items.map((x, n) => `<button class="problem-tab" id="tab-${x.id}" role="tab" aria-controls="problem-content" aria-selected="${x.id === i.id}" tabindex="${x.id === i.id ? 0 : -1}" title="${escape(x.title)}" data-item="${x.id}"><i class="tab-dot ${x.status === 'CLOSED' ? 'closed' : ''}"></i><span class="tab-caption"><small>${x.kind === 'opportunity' ? '服务建议' : `问题${n + 1}`}${x.status === 'CLOSED' ? ' · 已关闭' : ''}</small><b>${escape(window.AdvisorCopy?.tab(x) || x.title)}</b></span></button>`).join('')}</div>
        ${c.items.length > 1 ? '<div class="agent-tab-hint">各问题独立答复、独立关闭</div>' : ''}
        <div class="assistant-content" role="tabpanel" id="problem-content" aria-labelledby="tab-${i.id}">
          <div class="item-heading"><h2>${escape(window.BusinessScenarioCopy?.title(i) || window.AdvisorCopy?.title(i) || i.title)}</h2><span class="badge ${i.status === 'CLOSED' ? 'green' : i.awaiting || !i.complete ? 'amber' : 'blue'}">${statusText(i)}</span></div>
          ${sourceCategories.map(row => `<div class="next-action"><b>同类提问${interaction ? ' · ' + escape(row.name) : ''}</b><span>${row.question_turns.toLocaleString('zh-CN')}轮 · ${row.conversations.toLocaleString('zh-CN')}份会话。<button class="plain-button" data-action="original-chat-examples" data-category-id="${escape(row.id)}">原文例子 ↗</button></span></div>`).join('')}
          ${interaction ? `<div class="next-action"><b>演示边界</b><span>${escape(interaction.purpose)} 对话为归纳模拟，账户及规则为独立Mock；关闭只确认当前解释已答全，不代表办理或资金到账。</span></div>` : ''}
          ${!preview || preview.stage >= 2 ? sidebar.facts(shown, escape) : '<div class="agent-pending-facts">演示核对本问题的业务资料…</div>'}
          ${!preview || preview.stage >= 3 ? sidebar.reply(i, escape, preview) : '<div class="agent-pending-answer">事实核对后再整理话术</div>'}
          ${!preview && window.BusinessScenarioCopy?.guidance(i) ? `<div class="next-action"><b>顾问提示</b><span>${escape(window.BusinessScenarioCopy.guidance(i))}</span></div>` : ''}
          ${sidebar.process(i, c, escape, preview)}
          ${sidebar.activeBoundary(c, shown, escape)}
          ${!i.registered ? `<div class="confirm-box"><b>${i.kind === 'opportunity' ? '顾问核对服务条件' : '此问题需要顾问确认协同'}</b><p>${i.kind === 'opportunity' ? '先核对需要及触达频控；涉及购买推荐时另核适当性，不自动办理。' : '登记仅用于核实当前缺口，不代表已办理。'}</p><label class="check-label"><input type="checkbox" id="service-confirm">${i.kind === 'opportunity' ? '已核对需要及相关服务边界（演示）' : '已确认问题及核查范围，需要登记协同（演示）'}</label></div>` : ''}
          ${i.registered && i.complete && !i.awaiting && !i.sentRevision && i.kind === 'issue' ? '' : `<div class="next-action"><b>${i.awaiting === 'human' ? '当前处理' : '下一步'}</b><span>${nextAction(i)}</span></div>`}
          ${i.awaiting === 'customer' ? '<button class="button small wide" style="margin-top:12px" data-action="supplement">模拟收到客户补充，继续原问题</button>' : ''}
          ${i.awaiting === 'human' && i.humanResult ? '<button class="button small wide" style="margin-top:12px" data-action="human-result">模拟人工回填，生成最终答复</button>' : ''}
          ${window.ServiceInteractionCases?.canFollowup(c, i) ? '<button class="button small wide" style="margin-top:12px" data-action="customer-followup">模拟客户追问，继续原问题</button>' : ''}
          ${c.extraQuestion && !c.extraAdded ? '<button class="button small wide" style="margin-top:12px" data-action="new-question">收到后续新问题：本人预约码（回放）</button>' : ''}
        </div>
        <footer class="agent-action-dock"><span>${c.busy ? '演示整理中，请稍候' : i.status === 'CLOSED' ? '当前问题已关闭' : i.sentRevision === i.revision ? '已发送，等待下一步' : '话术放入企微输入框，顾问再发送'}</span><div class="action-row">${!i.registered ? `<button class="button primary" data-action="confirm" ${c.busy ? 'disabled' : ''}>${i.kind === 'opportunity' ? '确认服务条件' : '确认登记协同'}</button>` : `<button class="button primary" data-action="use" ${i.status === 'CLOSED' || i.sentRevision === i.revision || c.busy ? 'disabled' : ''}>使用话术 ↗</button>${i.kind === 'issue' && i.complete && i.sentRevision === i.revision && i.status !== 'CLOSED' ? '<button class="button success" data-action="close">确认关闭</button>' : ''}`}</div></footer>
      </section>
    </div>` + window.WeComDemoShell.closing();
  }
  function strategyBadge(s) { return `<span class="badge ${s.status === '限定试用' ? 'green' : s.status === '待审核' ? 'blue' : 'amber'}">${escape(s.status)}</span>`; }
  function strategySourceItem(s) { if (window.StrategyManagement) return window.StrategyManagement.item(state, s); if (s.evidenceSnapshot?.item) return s.evidenceSnapshot.item; const items = engine.getCase(state, s.caseId)?.items || []; if (s.sourceItemId) return items.find(i => s.sourceItemId === i.id); if (s.id.startsWith('CANDIDATE-')) return items.find(i => s.id === `CANDIDATE-${i.id}`); return items[0]; }
  function strategyFactLabels(s) { const i = strategySourceItem(s); return (i?.facts || []).map(f => (window.AgentSidebarView?.factLabel(i, f) || f.label) + (f.source === '事实缺口' ? '（当时未取得）' : '')).join('、'); }
  function strategyGoal(s) { return s.id === 'S-PRODUCT' ? '后续推荐实验 · 确认申购率' : s.goal; }
  function renderStrategies() {
    if (window.StrategyManagement) return window.StrategyManagement.render(state, { escape, intro, strategyBadge, factLabels: strategyFactLabels }, { search: strategySearch, mode: strategyFilter });
    const rows = state.strategies.filter(s => (strategyFilter === 'all' || s.mode.includes(strategyFilter)) && `${s.title}${s.description}`.includes(strategySearch));
    const selected = rows.find(s => s.id === strategySelection) || rows[0];
    if (!selected) return intro('从真实服务中积累方法', '策略管理', '当前条件没有匹配策略；不会沿用旧详情或提供旧策略审核操作。') + `<div class="toolbar"><div class="segment"><button data-strategy-filter="all">全部策略</button><button data-strategy-filter="被动">被动服务</button><button data-strategy-filter="主动">主动服务</button></div><input class="search" id="strategy-search" aria-label="搜索服务策略" placeholder="搜索策略或处理方法" value="${escape(strategySearch)}"></div><div class="empty-state">没有匹配策略。<button class="button" data-action="clear-strategy-search">清除搜索</button></div>`;
    strategySelection = selected.id;
    return intro('从真实服务中积累方法', '策略管理', '每条策略只写适用场景、处理方法、必要事实和边界。审核与证据独立保存。', '<button class="button" data-action="candidate-help">如何沉淀策略 <span>↗</span></button>') + `
      <div class="toolbar"><div class="segment"><button data-strategy-filter="all" class="${strategyFilter === 'all' ? 'active' : ''}">全部策略</button><button data-strategy-filter="被动" class="${strategyFilter === '被动' ? 'active' : ''}">被动服务</button><button data-strategy-filter="主动" class="${strategyFilter === '主动' ? 'active' : ''}">主动服务</button></div><input class="search" id="strategy-search" aria-label="搜索服务策略" placeholder="搜索策略或处理方法" value="${escape(strategySearch)}"></div>
      <div class="strategy-layout"><div class="strategy-table"><div class="table-row header"><span>策略与处理方法</span><span>服务方式</span><span class="table-goal">本场景主指标</span><span>阶段</span><span></span></div>${rows.length ? rows.map(s => `<div class="table-row ${s.id === selected.id ? 'selected' : ''}" data-strategy="${s.id}" tabindex="0" role="button" aria-label="查看策略：${escape(s.title)}"><div><b>${escape(s.title)}</b><small>${escape(s.skill)}${s.id === 'S-PRODUCT' ? ' · 后续推荐实验候选' : ''}</small></div><span>${escape(s.mode)}</span><span class="table-goal">${escape(strategyGoal(s))}</span><span>${strategyBadge(s)}</span><button aria-label="打开${escape(s.title)}">›</button></div>`).join('') : '<div class="empty-state">没有匹配策略，试试其他关键词。</div>'}</div>
      <aside class="strategy-detail"><div><span class="small-label">服务方法，不是固定话术</span><h2>${escape(selected.title)}</h2>${strategyBadge(selected)}</div><p><b>适用场景</b><br>${escape(selected.description)}</p><div class="section-label"><b>处理方法</b></div><ol class="method-list">${selected.method.map((m, n) => `<li><span>${n + 1}</span>${escape(m)}</li>`).join('')}</ol><div class="quiet-callout"><b>必要事实 · 来源示例</b><br>${escape(strategyFactLabels(selected)) || '当前来源尚不足，待补齐'}。具体问题仍按适用规则核对，不把示例字段视为全部要求。<br>${selected.evidenceSnapshot ? '按候选生成时快照展示，不随后续回填改写。' : '预置示例的当前回放，非冻结候选快照。'}</div><div class="quiet-callout"><b>风险边界</b><br>${escape(selected.boundary)}</div><div class="provenance-line">来源：${escape(selected.evidence)}<br>${selected.sources.length}项来源，可展开核对</div><div class="strategy-actions"><button class="button" data-action="strategy-source" data-strategy-id="${selected.id}">查看来源</button><button class="button primary" data-action="request-review" data-strategy-id="${selected.id}">查看评估与审核</button></div></aside></div>
      <div class="quiet-callout" style="margin-top:22px">候选方法不等于有效策略。知识依据和经营效果分开：准确的业务知识可以沉淀；营销方法须经真实对照验证后才能宣称有效。这里的管理阶段仅是本地Demo，不新增业务状态或正式表。</div>`;
  }
  function rate(g) { return g.total ? (g.achieved / g.total * 100).toFixed(1) : '—'; }
  function renderReview() {
    if (window.StrategyManagement) return window.StrategyManagement.renderReview(state, { escape, intro, strategyBadge, factLabels: strategyFactLabels, data });
    const s = state.strategies.find(x => x.id === state.reviewId) || state.strategies[0];
    const exp = data.experiments.find(e => e.id === s.experimentId);
    const done = ['限定试用', '退回完善'].includes(s.status);
    return intro('用证据决定是否继续', '评估与审核', '一个场景一个主指标。先核对事实和答案，再查看同口径A/B结果，不靠采纳或关闭证明有效。') + `
      <div class="review-layout"><aside class="review-list" aria-label="待审核策略">${state.strategies.map(x => `<button class="review-choice ${x.id === s.id ? 'selected' : ''}" data-review="${x.id}"><b>${escape(x.title)}</b>${strategyBadge(x)}</button>`).join('')}</aside><section class="review-card"><div class="review-top"><div><div class="small-label">${escape(s.mode)} · ${escape(s.kind)}</div><h2>${escape(s.title)}</h2><p class="muted" style="font-size:12px">${escape(s.description)}</p></div>${strategyBadge(s)}</div>
      ${s.id === 'S-CONFIRM' ? `<div class="quiet-callout"><b>已有真实模型执行证据，不是线上效果</b><br>20个真实问题、22个节点；预先认定充分的11问，完整输出10/11。模型：MiniMax。给定Mock事实的答复核对，未测试完整路由与MCP查询链。<button class="plain-button" data-action="regression-source" style="display:block">查看原始核对来源 ↗</button></div>` : `<div class="quiet-callout"><b>案例证据</b><br>${escape(s.evidence)}。可以核对可行性与边界，但当前没有模拟客户实验结果。</div>`}
      ${s.id === 'S-PRODUCT' ? '<div class="quiet-callout callout-amber"><b>后续推荐实验示例，不是当前资料服务效果</b><br>只有客户需求与适当性等条件已核对、试验分组和观察窗冻结后，推荐策略才按确认申购评估。当前产品资料服务只评资料／需求沟通目标；来源消息和演示A/B不能证明发生了真实推荐、购买或增量。</div>' : ''}
      <button class="button" data-action="strategy-execution-source" data-strategy-id="${s.id}">核对问题事实、实际回复与执行记录 ↗</button>
      ${exp ? `<div class="section-label"><b>${escape(exp.goal)} · A/B对照</b><span class="badge amber">全部为演示数据</span></div><div class="metric-area">${[['a', exp.baseline], ['b', exp.treatment]].map(([key, label]) => `<div class="metric-box ${key === 'b' ? 'featured' : ''}"><span class="small-label">${label}</span><div class="metric-number">${rate(exp[key])}<span style="font-size:16px">%</span></div><small>${exp[key].achieved} / ${exp[key].total} ${escape(exp.unit)}</small><div class="bar-track"><div class="bar-fill" style="width:${rate(exp[key])}%"></div></div></div>`).join('')}</div><div class="delta-line"><span>B组 − A组 · 绝对差值</span><strong>+${(Number(rate(exp.b)) - Number(rate(exp.a))).toFixed(1)} <small>个百分点</small></strong></div><div class="metadata-grid"><div><span>比较条件</span>同客群、同产品／问题、同观察窗</div><div><span>模型与策略</span>${escape(exp.model)}</div><div><span>观察范围</span>${escape(exp.window)}</div><div><span>分母规则</span>冻结分组，不只保留回复或成交者</div></div><div class="quiet-callout callout-amber"><b>证据结论：尚不能证明真实效果</b><br>${escape(exp.conclusion)}正差值也不能直接称为显著改善，更不能自动晋升为已验证策略。</div>` : `<div class="quiet-callout callout-amber">该方法尚无A/B数据。先核对服务路径及适用边界，不能用其他策略的转化率替代。</div>`}
      <details class="process-details"><summary>查看审核依据与结果链</summary><ol class="method-list"><li><span>1</span>客户原话与服务起点，核对来源会话和水位</li><li><span>2</span>实际取得的事实、单位与业务含义</li><li><span>3</span>答案是否完整对应当前诉求，不能夹带错误结论</li><li><span>4</span>A/B人群、分母、窗口和结果来源是否一致</li></ol><div class="quiet-callout">本页只是人工审核交互演示。独立Codex业务、方法、风险三角色金标审核仍在原治理流程中进行，本Demo不伪造三角色PASS。</div></details>
      <div class="review-bottom"><div><b style="font-size:12px">审核决策</b><label class="check-label"><input type="checkbox" id="review-confirm" ${done ? 'disabled' : ''}>已核对来源、方法和边界；演示结果不作为正式有效性证据。</label><small>可以批准限定试用，不发布正式Skill。</small></div><div class="action-row"><button class="button" data-action="review-reject" ${done ? 'disabled' : ''}>退回完善</button><button class="button primary" data-action="review-approve" ${done ? 'disabled' : ''}>批准限定试用</button></div></div>
      <div class="history-list">${state.audits.filter(a => a.strategyId === s.id).map(a => `<div class="history-line"><span>业务负责人（演示） · ${a.decision === 'approve' ? '批准限定试用' : '退回完善'}</span><span class="muted">未发布正式资产</span></div>`).join('')}</div></section></div>`;
  }
  function renderPlan() {
    return `<div class="plan-hero"><div class="eyebrow">财富顾问服务智能体 · 简化总体方案</div><h1>从一次服务，<br>到可复用的能力。</h1><p>先查对客户与产品事实，再回答客户问题。用真实结果验证服务方法，由AI提出改进、人工审核，持续积累Skill。</p></div>
    <div class="plan-flow"><div class="plan-step"><div class="number">01</div><b>发现服务需求</b><p>被动问题识别<br>主动机会建议</p></div><div class="plan-step"><div class="number">02</div><b>核对事实</b><p>匹配领域Skill<br>按需调用MCP</p></div><div class="plan-step"><div class="number">03</div><b>顾问服务</b><p>事实与建议分开<br>确认后发送</p></div><div class="plan-step"><div class="number">04</div><b>评估效果</b><p>场景一个主指标<br>A/B比较增量</p></div><div class="plan-step"><div class="number">05</div><b>审核沉淀</b><p>归纳方法与边界<br>验证后复用</p></div></div>
    <div class="plan-columns"><section class="plan-panel"><h2>被动服务：把客户问题答清楚</h2><p>客户问什么 → 匹配Skill → 查询必要事实 → 解释并答复。信息不足补问，收到补充续接原问题；确实无法闭环才建议协同。</p><ul class="simple-list"><li><b>一个独立问题，一个Issue。</b>多个问题各自保留事实、草稿、发送与关闭记录。</li><li><b>主指标：</b>完整答复率／问题解决率，按当前场景选一个。</li><li><b>通过条件：</b>事实查对、数据解释正确、完整回答所问。关闭状态不代替质量。</li></ul></section>
    <section class="plan-panel"><h2>主动服务：有需要，才介入</h2><p>开放时点、已有关注或预测信号提出服务机会，顾问确认需求、适当性与触达频控后提供资料或解释，不自动推荐买卖或办理。</p><ul class="simple-list"><li><b>机会不强制登记生产问题。</b>客户提出新问题后再进入被动Issue流程。</li><li><b>主指标：</b>按策略目标确定；推荐实验看真实确认申购，服务提醒不一律看申购。</li><li><b>效果证据：</b>同客群、同窗随机A/B；未触达或未采用也保留在分组分母。</li></ul></section>
    <section class="plan-panel"><h2>策略沉淀：知识准确，方法有效</h2><p>服务记录 → AI归纳候选 → 核对业务与事实 → 查看金标／A/B证据 → 人工审核 → 限定试用或继续验证。</p><ul class="simple-list"><li><b>只写四项：</b>适用场景、处理方法、必要事实、风险边界。</li><li><b>知识与效果分开：</b>正确规则可积累；经营方法有真实对照才宣称有效。</li><li><b>复用现有结构：</b>策略正文承载服务方法，Skill承载通用业务依据；Issue承载问题；执行记录承载过程；MCP返回事实。</li></ul></section>
    <section class="plan-panel"><h2>预测模型：受控的AI迭代</h2><p>申购／流失模型提出服务线索，AI分析真实结果并提出改进候选；离线验证、业务审核后，再进入下一轮小范围实验。</p><ul class="simple-list"><li><b>先固定模型比服务策略。</b>不同时换模型、换策略后宣称改善来源。</li><li><b>真实结果做反馈。</b>不把AI话术、点击或“好的”当作成交标签。</li><li><b>建设边界：</b>本Demo没有训练预测模型、接生产接口或进行真实A/B。</li></ul></section></div>
    <div class="quiet-callout" style="margin-top:23px">不新增业务表、Issue状态、领域Skill或MCP合同。策略与实验清单先文件化管理；正式启用前沿用独立Codex三角色、冻结金标和真实模型回归门禁。该页面是总体方案中的交互演示，不是上线完成证明。</div>`;
  }
  function sourceDialog(c) {
    const interaction = window.ServiceInteractionCases?.definitionFor(c.id);
    if (interaction) return dialog('独立Mock案例来源', `<p>${escape(interaction.basis)}</p><p>对话为原始问法归纳，账户和规则为人工编写Mock，不具有原始客户账户或金标身份。侧边栏原文按钮提供同类问题的本地脱敏节选及规则识别次数。</p>`);
    dialog('场景改写与回放来源', c.sources.map(s => `<div class="source-record"><span class="badge green">${s.role === 'ADVISOR' ? '演示顾问场景' : '模拟客户原话'} · ${s.date}</span><p>${escape(s.text)}</p><code>CHAT_ANN_ID：${escape(s.chatId)} · 消息序号：${s.messageIndex}<br>演示消息标识：${escape(s.messageSha)}<br>演示会话标识：${escape(s.sourceSha)}${s.goldId ? `<br>执行候选案例身份：${escape(s.goldId)}` : ''}</code></div>`).join('') + '<div class="quiet-callout">原文只摘录相关消息。交易、人工续接和发送结果另标模拟；真实原话不能证明该客户拥有模拟展示的交易或产品。</div>');
  }
  function factDialog(i) {
    i = window.FinancialSceneViews.displayItem(engine.getCase(state, state.selectedCase), i);
    const view = window.AgentSidebarView, selected = view.selectFacts(i);
    const copy = window.BusinessScenarioCopy;
    const group = (title, list) => list.length ? `<h3>${title}</h3>` + list.map(f => `<div class="source-record"><b>${escape(view.factLabel(i, f))}：${escape(copy?.text(f.value) || f.value)}</b><div class="small-label">${f.source === '事实缺口' ? '待核实' : f.source.startsWith('人工回填') ? '人工核查 · 演示' : '业务核对材料 · 演示'}</div>${f.note ? `<p>${escape(copy?.text(f.note) || f.note)}</p>` : ''}</div>`).join('') : '';
    dialog('核对材料与待办事项', `<div class="quiet-callout"><b>${i.round ? '初次核对范围（续接前）' : '核对范围'}</b>：${escape(copy?.text(i.scope) || i.scope)}</div>` + group('已有业务资料', selected.originals) + group('本轮人工核查 · 演示', selected.human) + group('当前待核实', selected.currentGaps) + group('先前的证据缺口 · 保留历史，不作当前结论', selected.historicalGaps) + `<details class="technical"><summary>开发核对记录</summary><pre>${escape(JSON.stringify({ raw: i.raw, facts: i.facts }, null, 2))}</pre></details><div class="quiet-callout">业务结果为演示，实际办理时需要重新核实。${escape(copy?.text(i.boundary) || i.boundary)}</div>`);
  }
  function strategyEvidenceDialog(s) {
    const c = engine.getCase(state, s.caseId);
    const original = strategySourceItem(s);
    if (!c || !original) return dialog('来源不足', '<p>未定位到本问题来源，不用其他问题的事实替代。</p>');
    const snapshot = s.evidenceSnapshot || window.FinancialSceneViews.captureEvidence(c, original);
    const i = window.FinancialSceneViews.displayItem(c, snapshot.item, s.evidenceSnapshot ? s.serviceContext?.replayDisplay || {} : undefined);
    const receipts = i.sentTexts || [];
    dialog('策略来源：问题、事实与实际答复', `<span class="badge ${s.evidenceSnapshot ? 'blue' : 'amber'}">${s.evidenceSnapshot ? '候选生成时快照' : '既有示例当前回放 · 非冻结候选快照'}</span><p><b>${escape(snapshot.customer)} · ${escape(i.title)}</b><br>问题标识：${escape(i.id)}；回放时点：${escape(snapshot.date)}。接口／人工／发送均为模拟。</p><details class="technical"><summary>查看源会话原文与哈希（上下文）</summary>${snapshot.sources.map(r => `<div class="source-record"><b>${escape(r.text)}</b><code>${escape(r.chatId)} · 消息${r.messageIndex}<br>消息SHA：${escape(r.messageSha)}<br>会话SHA：${escape(r.sourceSha)}</code></div>`).join('')}</details>${window.FinancialSceneViews.facts(i, { escape, readonly: true })}<div class="section-label"><b>生成时建议回复</b><span>历史输出或演示整理</span></div><div class="reply-block">${escape(i.reply)}</div><div class="section-label"><b>本问题实际发送记录</b><span>模拟回执，不是业务办理凭证</span></div>${receipts.length ? receipts.map(r => `<div class="source-record"><div class="reply-block">${escape(r.text)}</div><code>第${r.revision}轮 · ${escape(r.mockReceipt)}${r.modified ? ' · 顾问修改过原建议' : ''}</code></div>`).join('') : '<p>尚未发送，不能把建议草稿当客户已经收到的答复。</p>'}${window.FinancialSceneViews.process(i, { escape })}<details class="technical"><summary>查看当前查询范围与原始事实投影</summary><pre>${escape(JSON.stringify({ scope: i.scope, tools: i.tools, raw: i.raw, complete: i.complete, awaiting: i.awaiting }, null, 2))}</pre></details><div class="quiet-callout">来源准确与方法有效分开。这里可核对本问题已出现的事实和活动；没有未来Mock、真实业务效果或正式发布证明。</div>`, '只读证据 · 不借用其他问题');
  }
  function makeCandidate(c, i) {
    const id = `CANDIDATE-${i.id}`;
    const existing = state.strategies.find(s => s.id === id);
    const serviceContext = window.StrategyManagement?.contextForItem(state, c.id, i.id);
    if (!existing) state.strategies.push({ id, title: serviceContext?.title || i.strategy, mode: c.mode === 'active' ? '主动服务' : '被动服务', goal: serviceContext?.goal || '客户当前问题得到准确完整答复', skill: i.skillName, status: '候选', description: serviceContext?.trigger || '从本次服务过程归纳的待验证做法，尚未证明经营增量。', method: serviceContext?.method?.slice() || ['回应客户当前疑问，说明正在核实什么', '根据已有事实回答，只补问推进问题所必需的信息', '跟随客户反馈承接后续诉求；不能回答的部分说明具体缺口'], serviceContext: serviceContext ? JSON.parse(JSON.stringify(serviceContext)) : undefined, boundary: i.boundary, sources: c.sources.map(s => s.goldId || s.chatId), caseId: c.id, sourceItemId: i.id, evidenceSnapshot: window.FinancialSceneViews.captureEvidence(c, i), evidence: '真实起点 + 本地Mock执行记录', kind: '演示归纳方法' });
    strategySelection = id;
    strategyFilter = 'all';
    strategySearch = '';
    navigate('strategies');
    toast(existing ? '已定位已有候选，没有重复创建。' : '已归纳候选（本地演示），尚未审核或发布。');
  }
  async function runPlayback(c, i) {
    engine.transition(state, c.id, i.id, 'RUN');
    c.busy = true;
    const texts = window.AgentSidebarView.stages;
    for (let stage = 0; stage < texts.length; stage++) {
      c.runningText = texts[stage];
      playbackPreview.set(i.id, { stage, text: '' });
      if (['service', 'coordination', 'active'].includes(state.view) && state.selectedCase === c.id) render();
      await new Promise(resolve => setTimeout(resolve, 420));
    }
    const chars = Array.from(i.reply);
    for (let end = 1; end <= 8; end++) {
      playbackPreview.set(i.id, { stage: 3, text: chars.slice(0, Math.ceil(chars.length * end / 8)).join('') });
      if (state.view === 'service' && state.selectedCase === c.id) render();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    playbackPreview.delete(i.id);
    c.busy = false;
    c.runningText = '';
    render();
    toast('回放完成。事实和话术没有在线重新查询或生成。');
  }
  function navigate(view) { if (!names[view]) return; state.view = view; history.replaceState(null, '', '#' + view); render(); window.scrollTo(0, 0); }
  $('#navigation').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) navigate(b.dataset.view); });
  $('.brand').addEventListener('click', e => { e.preventDefault(); navigate('strategies'); });
  $('#close-dialog').addEventListener('click', () => $('#detail-dialog').close());
  $('#detail-dialog').addEventListener('click', e => { if (e.target === $('#detail-dialog')) $('#detail-dialog').close(); });
  $('#data-boundary').addEventListener('click', () => {
    const source = window.BusinessScenarioCopy?.source;
    if (source) return dialog('场景取材与演示说明', `<p>本轮从本地${source.conversationFiles.toLocaleString('zh-CN')}份会话、${source.messages.toLocaleString('zh-CN')}条消息中检索共性需求，覆盖${escape(source.period)}。</p><p>六组对话为匿名改写，产品、金额和日期沿用已有演示设置。后续补充、人工结果和发送均为演示，不是原客户的真实账户结果。</p><p>${escape(source.method)}</p><p>原始聊天仅在本地读取，不随原型发布，也不传给外部模型。工程检查通过不等于客户问题真实解决。</p>`, '共性归纳与实际业务结果分开');
    return dialog('演示说明', '<p>页面使用演示数据，实际办理前需要重新核实。</p>');
  });
  $('#reset-demo').addEventListener('click', () => dialog('重置本地演示', '<p>只清除本Demo的浏览器交互状态。不会修改聊天数据库、金标、正式策略或其他浏览器数据。</p><button class="button primary" data-action="reset-confirm">确认重置</button>'));
  document.addEventListener('input', e => {
    if (e.target.id === 'case-search') {
      const term = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.scenario-button[data-case]').forEach(row => { row.hidden = !row.dataset.search.toLowerCase().includes(term); });
    } else if (e.target.id === 'compose') {
      const c = engine.getCase(state, state.selectedCase);
      const i = engine.getItem(state, c.id, c.activeItemId);
      if (i.status !== 'CLOSED') engine.transition(state, c.id, i.id, 'EDIT', { text: e.target.value });
      const button = $('#send-reply');
      if (button) button.disabled = !i.compose.trim() || !i.registered || i.sentRevision === i.revision || c.busy;
      save();
    } else if (e.target.id === 'strategy-search') {
      strategySearch = e.target.value;
      const start = e.target.selectionStart;
      render();
      $('#strategy-search').focus();
      $('#strategy-search').setSelectionRange(start, start);
    }
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.table-row[role=button]')) { e.preventDefault(); strategySelection = e.target.dataset.strategy; render(); }
    if (e.target.matches('.problem-tab') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault(); const c = engine.getCase(state, state.selectedCase); const index = c.items.findIndex(i => i.id === c.activeItemId);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? c.items.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + c.items.length) % c.items.length;
      engine.transition(state, c.id, c.items[next].id, 'SELECT'); render(); document.getElementById('tab-' + c.activeItemId)?.focus();
    }
  });
  document.addEventListener('change', e => {
    if (e.target.dataset.policyFilter && window.StrategyManagement) { window.StrategyManagement.setView(state, e.target.dataset.policyFilter, e.target.value); render(); }
  });
  document.addEventListener('click', async e => {
    const policyAxis = e.target.closest('[data-policy-axis]'); if (policyAxis && window.StrategyManagement) { window.StrategyManagement.setView(state, 'axis', policyAxis.dataset.policyAxis); render(); return; }
    const paneButton = e.target.closest('button[data-wecom-pane]'); if (paneButton) { wecomPane = paneButton.dataset.wecomPane; render(); return; }
    const route = e.target.closest('[data-go]'); if (route) { navigate(route.dataset.go); return; }
    const coord = e.target.closest('[data-collab-case]'); if (coord) { state.selectedCase = coord.dataset.collabCase; engine.transition(state, state.selectedCase, coord.dataset.collabItem, 'SELECT'); render(); return; }
    const mode = e.target.closest('[data-mode]'); if (mode) { state.mode = mode.dataset.mode; render(); return; }
    const caseButton = e.target.closest('[data-case]'); if (caseButton) { state.selectedCase = caseButton.dataset.case; wecomPane = 'assistant'; render(); return; }
    const tab = e.target.closest('[data-item]'); if (tab) { engine.transition(state, state.selectedCase, tab.dataset.item, 'SELECT'); render(); return; }
    const row = e.target.closest('[data-strategy]'); if (row) { strategySelection = row.dataset.strategy; render(); return; }
    const filter = e.target.closest('[data-strategy-filter]'); if (filter) { strategyFilter = filter.dataset.strategyFilter; render(); return; }
    const review = e.target.closest('[data-review]'); if (review) { state.reviewId = review.dataset.review; render(); return; }
    const b = e.target.closest('[data-action]'); if (!b || b.disabled) return;
    const action = b.dataset.action;
    const c = engine.getCase(state, state.selectedCase);
    const i = engine.getItem(state, c.id, c.activeItemId);
    try {
      if (action === 'original-chat-examples' && window.ChatQuestionEvidence) {
        const category = window.LOCAL_CHAT_ANALYSIS?.categories.find(row => row.id === b.dataset.categoryId) || window.ChatQuestionEvidence.categoryForItem(i, window.LOCAL_CHAT_ANALYSIS);
        if (category) return dialog('原始聊天例子与问题频次', window.ChatQuestionEvidence.evidenceHtml(category), '原文已脱敏 · 与演示账户结果分开');
      }
      if (action === 'business-case-source' && window.BusinessScenarioCopy) {
        const interaction = window.ServiceInteractionCases?.definitionFor(c.id);
        if (interaction) return dialog('原始问法归纳与独立演示案例', `<p><b>${escape(interaction.title)}</b></p><p>${escape(interaction.basis)}</p><p>${escape(interaction.purpose)}</p><p>所有账户记录、规则、金额、日期和后续人工结果为本地预置Mock，未调用真实工具、模型或公司系统。可以在侧边栏的同类次数下查看脱敏原文；原文与本案例账户事实无对应关系。</p>`, '问法来源与模拟事实分开');
        const copy = window.BusinessScenarioCopy;
        const definition = copy.cases[c.id];
        return dialog('共性场景与演示说明', `<p><b>${escape(definition?.title || c.title)}</b></p><p>${escape(definition?.purpose || '')}</p><p>这组对话按本地真实聊天中的共性需求重新编写，使用匿名客户和既有演示产品、金额、日期；不是客户原话或新金标。后续补充、人工核查和发送结果同样为演示。</p><p>只读检索${copy.source.conversationFiles.toLocaleString('zh-CN')}份会话、${copy.source.messages.toLocaleString('zh-CN')}条消息。覆盖${escape(copy.source.period)}。</p><p>${escape(copy.source.method)}</p><p>赎回到账和持仓波动也较常见；本轮先完善已有六组可演示场景，没有新增对应查询能力。</p>`, '匿名归纳 · 不复制原始聊天');
      }
      if (action === 'policy-clear') { strategySearch = ''; strategyFilter = 'all'; window.StrategyManagement.setView(state, 'scene', 'all'); window.StrategyManagement.setView(state, 'advisor', 'all'); window.StrategyManagement.setView(state, 'mode', 'all'); render(); return; }
      if (['policy-detail', 'policy-service', 'policy-improve', 'policy-save-improvement', 'policy-revise', 'policy-save-revision'].includes(action)) {
        const s = state.strategies.find(s => s.id === b.dataset.strategyId);
        if (!s) throw new Error('未找到当前方法，不能借用其他方法的记录。');
        const manager = window.StrategyManagement;
        if (action === 'policy-detail') return dialog(manager.methodTitle(state, s), manager.render(state, { escape, intro, strategyBadge, factLabels: strategyFactLabels }, { detailOnlyId: s.id }), '策略详情 · 来源与结果分开');
        if (action === 'policy-service') {
          const target = manager.item(state, s);
          if (!target || !engine.getItem(state, s.caseId, target.id)) throw new Error('当前来源问题无法回放。');
          state.selectedCase = s.caseId; engine.transition(state, s.caseId, target.id, 'SELECT'); wecomPane = 'assistant'; $('#detail-dialog').close(); navigate('service'); return;
        }
        if (action === 'policy-revise') {
          const d = manager.definition(state, s), gate = manager.reviewGate(state, s);
          if (!gate.valid) throw new Error(gate.reason);
          return dialog('修订为新候选', `<p>保留原方法、审批和证据；新候选单独审核。只演示方法修订，不在线AI生成或发布。</p><label class="policy-edit-field">方法名称<input id="policy-revision-title" maxlength="100" value="${escape(manager.methodTitle(state,s))}"></label><label class="policy-edit-field">推荐理由<textarea id="policy-revision-reason" maxlength="600">${escape(d.reason)}</textarea></label><label class="policy-edit-field">服务步骤（每行一步，最多5步）<textarea id="policy-revision-method">${escape(manager.methodSteps(state,s).join('\n'))}</textarea></label><label class="policy-edit-field">发现的问题与改动原因<textarea id="policy-revision-note" maxlength="600" placeholder="说明具体不足及对应来源；本次未形成的效果不能填成成功。"></textarea></label><button class="button primary" data-action="policy-save-revision" data-strategy-id="${escape(s.id)}">保存新候选并核对</button>`, '本地修订 · 不覆盖旧记录');
        }
        if (action === 'policy-save-revision') {
          const source = manager.item(state, s), sourceCase = engine.getCase(state,s.caseId);
          const snapshot = window.FinancialSceneViews.captureEvidence(sourceCase, source);
          const p = manager.createRevision(state,s.id,{ title: $('#policy-revision-title')?.value, reason: $('#policy-revision-reason')?.value, method: ($('#policy-revision-method')?.value || '').split('\n'), note: $('#policy-revision-note')?.value },snapshot);
          state.reviewId = p.id; $('#detail-dialog').close(); navigate('review'); toast('已保存独立修订候选；原方法、事实和审批保留。'); return;
        }
        if (action === 'policy-improve') return dialog('记录改进建议', `<p><b>${escape(manager.methodTitle(state,s))}</b></p><p>说明发现的问题和拟调整的方法；只保存本地建议，不改写策略、事实或正式Skill。</p><textarea class="policy-feedback-input" id="policy-feedback" aria-label="改进建议" maxlength="600" placeholder="例如：当前记录只证明找到入口，需要另核对资格问题的结果。"></textarea><button class="button primary" data-action="policy-save-improvement" data-strategy-id="${escape(s.id)}">保存本地建议</button>`, '方法待验证 · 不自动发布');
        manager.addImprovement(state, s.id, $('#policy-feedback')?.value); $('#detail-dialog').close(); render(); toast('已保存改进建议；未修改方法、事实或正式资产。'); return;
      }
      if (action === 'show-data-boundary') { $('#data-boundary').click(); return; }
      if (action === 'show-reset') { $('#reset-demo').click(); return; }
      if (action === 'sources') return sourceDialog(c);
      if (action === 'design-reference') return dialog('imagegen视觉参考 · 不作为业务事实', '<div class="quiet-callout callout-amber">图片中可能包含模型虚构的日期、分类、风险等级和处理结果。只用于配色与布局参考；交互原型已以真实来源及Mock合同重新核对。</div><div class="design-gallery">' + window.FinancialSceneViews.designs.map(d => '<figure><img src="' + d.path + '" alt="' + escape(d.title) + '视觉参考"><figcaption>' + escape(d.title) + ' · 仅视觉参考</figcaption></figure>').join('') + '</div>', '4个场景视觉稿 · 非执行结果');
      if (action === 'fact-details') return factDialog(i);
      if (action === 'reply-source') return dialog('话术来源与原始输出', `<span class="badge blue">已保存输出 · ${escape(i.replyEvidence.model)}</span><p>${i.replyEvidence.kind === 'COPY_REWRITE_NOT_FULL_AGENT_VALIDATION' ? 'MiniMax改写后由Codex作表达校订，基于既有模拟事实；不是查询链或生产闭环验收。' : '历史模型执行，不是当前在线请求。'}</p><h3>模型原始改写</h3><div class="reply-block">${escape(i.replyEvidence.text || i.reply)}</div>${i.replyEvidence.displayText ? `<h3>展示校订稿</h3><div class="reply-block">${escape(i.replyEvidence.displayText)}</div>` : ''}<code style="display:block;font-size:10px;overflow-wrap:anywhere;margin-top:15px">${escape(i.replyEvidence.sourcePath)}<br>原始SHA：${escape(i.replyEvidence.sha)}${i.replyEvidence.displaySha ? `<br>展示SHA：${escape(i.replyEvidence.displaySha)}` : ''}</code>${i.replyEvidence.original ? `<details class="technical"><summary>改写前的草稿与依据</summary><p>${escape(i.replyEvidence.original.text)}</p><pre>${escape(JSON.stringify(i.replyEvidence.original.evidence, null, 2))}</pre></details>` : ''}`, '表达改写与历史业务验证分开');
      if (action === 'candidate-help') return dialog('最简单的策略沉淀', '<p>在咨询页查看当前问题及处理过程，点击企微模拟窗口外的“演示后台沉淀当前方法”。系统演示总结适用场景、处理方法、必要事实和边界，保留来源，进入管理审核；这不是顾问侧边栏的管理操作。</p><p>候选没有真实效果证据时，只能试用或继续验证，不直接启用为有效经营策略。</p>');
      if (action === 'strategy-source') {
        const s = state.strategies.find(x => x.id === b.dataset.strategyId); return strategyEvidenceDialog(s);
      }
      if (action === 'strategy-execution-source') return strategyEvidenceDialog(state.strategies.find(x => x.id === b.dataset.strategyId));
      if (action === 'clear-strategy-search') { strategySearch = ''; render(); return; }
      if (action === 'request-review') { state.reviewId = b.dataset.strategyId; $('#detail-dialog').close(); navigate('review'); return; }
      if (action === 'regression-source') return dialog('已保存的模型答复核对', `<p>模型：${data.regression.model}；20个真实问题、22个Mock给定事实节点。充分问题完整输出${data.regression.complete}/${data.regression.sufficient}。</p><p>${data.regression.boundary}</p><code style="font-size:10px;overflow-wrap:anywhere">${escape(data.regression.source)}</code>`, '历史执行证据 · 不混入演示A/B');
      if (action === 'review-approve' || action === 'review-reject') {
        const targetStrategy = state.strategies.find(s => s.id === state.reviewId);
        if (!targetStrategy || !window.StrategyManagement.item(state, targetStrategy)) throw new Error('当前方法来源无效，不能批准或借用其他问题的证据。');
        await window.StrategyManagement.review(state, state.reviewId, action === 'review-approve' ? 'approve' : 'reject', $('#review-confirm')?.checked === true, engine); render(); toast('已记录本地审核及定义快照；未发布正式策略或修改Skill。'); return;
      }
      if (action === 'reset-confirm') {
        if (state.cases.some(x => x.busy)) { toast('当前回放尚未结束，请结束后再重置。'); return; }
        const currentView = state.view; localStorage.removeItem(storageKey); state = engine.initial(data); state.view = currentView;
        strategySelection = 'S-CONFIRM'; strategyFilter = 'all'; strategySearch = ''; wecomPane = 'assistant';
        playbackPreview.clear();
        $('#detail-dialog').close(); render(); toast('本地演示已重置，真实数据未改动。'); return;
      }
      if (action === 'close') return dialog('确认关闭当前问题', `<p><b>${escape(i.title)}</b></p><p>当前最终话术已有模拟成功发送回执；其他问题仍会独立保留。</p><label class="check-label"><input id="close-confirm" type="checkbox">已核对接口事实和实际回复，当前客户诉求已完整回答（演示）</label><button class="button primary" data-action="close-confirm">确认关闭此问题</button>`, '顾问确认 · 不自动关闭');
      if (action === 'close-confirm') { engine.transition(state, c.id, i.id, 'CLOSE', { checked: $('#close-confirm')?.checked === true }); $('#detail-dialog').close(); render(); toast('已关闭当前问题，其他问题未受影响。'); return; }
      if (action === 'candidate') { if (window.ServiceInteractionCases?.definitionFor(c.id)) return dialog('演示案例的方法边界', '<p>本案例为原始问法归纳和独立Mock交互，没有真实客户执行与效果证据。本轮不将它登记为正式策略候选或经营效果。</p>'); return makeCandidate(c, i); }
      if (action === 'run') return await runPlayback(c, i);
      if (action === 'new-question') { engine.addQuestion(state, c.id); wecomPane = 'assistant'; render(); toast('已识别一个新的独立诉求，原问题与发送记录保留。'); return; }
      if (action === 'customer-followup') { window.ServiceInteractionCases.receiveFollowup(state, c.id); wecomPane = 'assistant'; render(); toast('客户追问已续接同一问题，上一轮发送和已知条件保留。'); return; }
      if (action === 'confirm') { engine.transition(state, c.id, i.id, 'CONFIRM', { checked: $('#service-confirm')?.checked === true }); render(); toast(i.kind === 'opportunity' ? '已本地确认服务条件；没有创建生产问题。' : '已确认登记；尚未发送或转派。'); return; }
      if (action === 'use') { engine.transition(state, c.id, i.id, 'USE'); wecomPane = 'chat'; render(); $('#compose')?.focus(); toast('话术已放入企微输入框，尚未发送。'); return; }
      if (action === 'send') { engine.transition(state, c.id, i.id, 'SEND'); render(); toast('模拟发送回执已记录；未向模拟客户发送。'); return; }
      if (action === 'supplement') { engine.transition(state, c.id, i.id, 'SUPPLEMENT'); wecomPane = 'assistant'; render(); toast('已续接原问题，查询目标交易并形成新答复。'); return; }
      if (action === 'human-result') { engine.transition(state, c.id, i.id, 'HUMAN_RESULT'); wecomPane = 'assistant'; render(); toast('已载入绑定的模拟人工结果，等待顾问发送最终答复。'); return; }
    } catch (error) { toast(error.message || '当前操作不可执行。'); }
  });
  if (names[location.hash.slice(1)]) state.view = location.hash.slice(1);
  window.addEventListener('hashchange', () => { if (names[location.hash.slice(1)]) { state.view = location.hash.slice(1); render(); window.scrollTo(0, 0); } });
  render();
})();
