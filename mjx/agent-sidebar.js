/* 智能体输出视图：只展示现有事实和活动，不生成业务事实或私有思维链。 */
(function (root) {
  'use strict';
    const copy = root.BusinessScenarioCopy || (typeof require === 'function' ? require('./business-scenarios.js') : null);
  const business = value => copy ? copy.text(value) : String(value ?? '');
  const stages = ['理解当前需求', '匹配已有能力', '核对相关业务记录', '整理建议话术'];
  const roles = { model: '整理答复', tool: '业务核对 · 演示', human: '人工核查', advisor: '顾问操作', customer: '客户补充', system: '处理记录' };
  function sourceName(f) {
    if (f.source === '事实缺口') return '待核实';
    if (f.source.startsWith('人工回填')) return '人工核查 · 演示';
    if (f.source.startsWith('本地案例Mock')) return '本地演示资料';
    if (!f.source.includes('Mock')) return '历史服务资料';
    return /fundInfo|allotTimeInfo|product|manager|invest/i.test(f.field || '') ? '产品资料 · 演示' : '交易核对 · 演示';
  }
  // 专户日历的申购区间称为开放期；本人交易申请日、公募日期不改名。
  // 依据已有源字段，不按基金代码前缀或产品名称猜产品类别。
  function factLabel(i, f) {
    return f.label === '申购日期' && i.raw?.specialFundTradeTimeInfo?.allotTimeInfo && String(f.field || '').includes('allotTimeInfo.') ? '开放期' : f.label;
  }
  function selectFacts(i) {
    const human = i.facts.filter(f => f.source.startsWith('人工回填'));
    const gaps = i.facts.filter(f => f.source === '事实缺口');
    const originals = i.facts.filter(f => !human.includes(f) && !gaps.includes(f));
    const currentGaps = i.complete && human.length ? [] : gaps;
    const historicalGaps = currentGaps.length ? [] : gaps;
    const priority = ['产品', '目标交易', '当前可撤', '确认状态', '确认金额', '购买入口', '申购日期', '开放期', '首次参与门槛', '交易类型', '申请金额'];
    const rank = f => priority.includes(f.label) ? priority.indexOf(f.label) : 100;
    const ordered = [...originals].sort((a, b) => rank(a) - rank(b));
    const candidates = !i.round && Array.isArray(i.raw) && i.raw.some(t => typeof t.cancelable === 'boolean') ? i.raw.filter(t => t.fundCode) : [];
    const candidateRows = candidates.length > 1 ? Math.min(candidates.length, 2) : 0;
    const known = candidateRows ? originals.filter(f => f.label === '确认情况') : [...human, ...ordered];
    // 当前待核实项先保留一项；还有缺口时给出名称摘要，完整内容展开。
    const highlights = [...known.slice(0, 3 - candidateRows - Math.min(currentGaps.length, 1)), ...currentGaps.slice(0, 1)];
    return { originals, human, currentGaps, historicalGaps, highlights, candidates, candidateRows };
  }
  function scene(i, e) {
    return `<div class="agent-scene"><span>服务领域</span><b>${e(i.skillName || '服务咨询')}</b></div>`;
  }
  function process(i, c, e, preview) {
    i = root.FinancialSceneViews?.displayItem(c, i) || i;
    const running = !!preview;
    const summary = running ? stages[preview.stage] : i.awaiting === 'human' ? '已保留事实，等待人工核实' : i.awaiting === 'customer' ? '已补问，等待客户补充' : i.status === 'CLOSED' ? '答复已发送，本问题已关闭' : i.kind === 'opportunity' ? '服务依据已整理，等待顾问确认' : '查看处理依据与过程';
    return `<details class="agent-process process-details" id="process-details" ${running ? 'open' : ''}><summary><span class="agent-process-label"><i class="${running ? 'agent-pulse' : 'agent-done'}"></i><span>${e(summary)}</span></span><span class="agent-process-count">${running ? `${preview.stage + 1}/4` : `<span class="agent-open-label">展开</span><span class="agent-close-label">收起</span>`}</span></summary>${running ? `<div class="agent-live-steps" role="status">${stages.map((s, n) => `<div class="${n === preview.stage ? 'current' : n < preview.stage ? 'done' : 'pending'}"><i>${n < preview.stage ? '✓' : n + 1}</i><span>${s}</span>${n === preview.stage ? '<small>回放中</small>' : ''}</div>`).join('')}</div>` : ''}<div class="agent-context">${scene(i, e)}<p class="agent-intent"><span>处理思路</span>${e(i.replyEvidence?.kind === copy?.source.kind ? copy.items[i.id]?.strategy || business(i.strategy) : business(i.strategy))}</p></div><div class="agent-process-records">${i.events.map(s => `<div class="agent-event"><span>${roles[s.kind] || '处理记录'}</span><div><b>${e(business(s.title))}</b><p>${e(business(s.text))}</p></div></div>`).join('')}</div><div class="agent-copy-source"><p>共性对话经整理改写，业务结果为演示。由顾问核对后使用。</p>${i.replyEvidence?.model ? '<button data-action="reply-source">核对话术原始输出 ↗</button>' : ''}</div><details class="technical"><summary>开发核对记录</summary><p class="quiet-callout">${e(i.boundary)}<br>展示活动与结果，不展示模型私有思维链。本次读取本地快照，不在线查询或生成。</p><pre>${e(JSON.stringify({ id: i.id, skill: i.skill, status: i.status, tools: i.tools, receipts: i.sentTexts }, null, 2))}</pre></details></details>`;
  }
  // 从已保存原始查询投影读取业务属性，不以确认状态推断可撤性。
  function transactionCapabilities(i, e) {
    if (i.round || !Array.isArray(i.raw) || i.raw.length < 2 || !i.raw.some(t => typeof t.cancelable === 'boolean')) return '';
    const items = i.raw.filter(t => t.fundCode);
    const row = t => `<div class="agent-fact-row"><dt>${e(t.fundName || t.fundCode)}<small>${e(t.fundCode)}</small></dt><dd>${t.cancelable === true ? '可撤销' : t.cancelable === false ? '不可撤销' : '可撤结果待核实'}</dd></div>`;
    return `<div class="agent-query-attributes"><span class="agent-source-badge">当前可撤状态 · 模拟查询</span><dl>${items.slice(0, 2).map(row).join('')}</dl>${items.length > 2 ? `<details class="agent-fact-more"><summary>其余${items.length - 2}笔候选 · 尚未选定交易</summary><dl>${items.slice(2).map(row).join('')}</dl></details>` : ''}</div>`;
  }
  function facts(i, e) {
    const { originals, human, currentGaps, historicalGaps, highlights } = selectFacts(i);
    const mixed = new Set(highlights.filter(f => f.source !== '事实缺口').map(f => f.source)).size > 1;
    const rows = (list, detailed = false) => list.map(f => `<div class="agent-fact-row ${f.source === '事实缺口' ? 'is-gap' : ''} ${detailed ? 'agent-detail-row' : ''}"><dt>${e(factLabel(i, f))}${!detailed && (mixed || f.source === '事实缺口') ? `<small>${e(sourceName(f))}</small>` : ''}</dt><dd>${e(business(f.value))}${detailed ? `<div class="agent-field-source">${e(sourceName(f))}${f.note ? `<p>${e(business(f.note))}</p>` : ''}</div>` : ''}</dd></div>`).join('');
    const notes = i.facts.filter(f => f.note);
    const caveats = notes.length ? `<div class="agent-fact-caveats">${notes.map(f => `<p><b>${e(factLabel(i, f))}：</b>${e(business(f.note))}</p>`).join('')}</div>` : '';
    const otherGaps = currentGaps.filter(f => !highlights.includes(f));
    const origin = originals.length && originals.every(f => f.source.startsWith('本地案例Mock')) ? '本地演示资料' : originals.some(f => f.source.includes('Mock')) ? originals.some(f => !f.source.includes('Mock')) ? '业务核对＋历史资料' : originals.some(f => sourceName(f).startsWith('产品资料')) ? '产品资料 · 演示' : '交易核对 · 演示' : '历史服务资料';
    const highlightedKnown = highlights.filter(f => f.source !== '事实缺口');
    const headingSource = highlightedKnown.length && highlightedKnown.every(f => human.includes(f)) ? '人工核查 · 演示' : human.length && highlights.some(f => human.includes(f)) ? '交易与人工核查 · 演示' : origin;
    return `<section class="agent-facts"><div class="agent-section-heading"><h3>关键事实</h3><span class="agent-source-badge">${headingSource}</span><button data-action="fact-details" aria-label="查看事实完整来源">↗</button></div><dl class="agent-fact-list agent-highlights">${rows(highlights)}</dl>${transactionCapabilities(i, e)}${otherGaps.length ? `<p class="agent-gap-summary">另外待核实：${e(otherGaps.map(f => factLabel(i, f)).join('、'))}，展开核对。</p>` : ''}${caveats}<details class="agent-fact-more agent-full-facts"><summary>查看全部事实 · ${i.facts.length}项</summary><p class="agent-fact-scope"><b>${i.round ? '首次查询范围（续接前）' : '查询范围'}</b>　${e(i.scope)}</p><div class="agent-detail-heading">${origin}</div><dl class="agent-fact-list">${rows(originals, true)}</dl>${human.length ? `<div class="agent-human-facts"><div class="agent-detail-heading">人工核查 · 演示，另列核实结果</div><dl>${rows(human, true)}</dl></div>` : ''}${currentGaps.length ? `<div class="agent-detail-heading">当前待核实</div><dl>${rows(currentGaps, true)}</dl>` : ''}${historicalGaps.length ? `<div class="agent-detail-heading">先前的证据缺口 · 保留历史，不作当前结论</div><dl>${rows(historicalGaps, true)}</dl>` : ''}<details class="technical"><summary>开发核对记录</summary><pre>${e(JSON.stringify(i.facts, null, 2))}</pre></details><button class="agent-detail-link" data-action="fact-details">查看核对材料 ↗</button></details></section>`;
  }
  function reply(i, e, preview) {
    const receipt = i.sentRevision === i.revision ? i.sentTexts.find(r => r.revision === i.revision) : null;
    const label = receipt ? '已发送话术' : '建议答复';
    const text = receipt ? receipt.text : preview ? preview.text : i.reply;
    return `<section class="agent-answer"><div class="agent-section-heading"><h3>${label}</h3><span class="agent-generated-label">${receipt ? '顾问发送 · 模拟' : '建议草稿'}</span></div><div class="reply-block agent-reply-text ${preview ? 'is-streaming' : ''}" ${preview ? 'aria-busy="true"' : ''}>${e(text || '正在整理建议答复…')}${preview ? '<i class="agent-cursor" aria-hidden="true"></i>' : ''}</div></section>`;
  }
  function activeBoundary(c, i, e) {
    if (i.kind !== 'opportunity') return '';
    return `<details class="agent-active-boundary"><summary>服务依据与适用边界 <span>${i.advisorConfirmed ? '已演示确认' : '待顾问核对'}</span></summary><p>来自${e(c.date)}历史顾问服务场景，不是当前产品推荐结论。${i.advisorConfirmed ? '顾问已完成本地演示确认。' : '当前需要和触达频控尚待顾问确认；涉及购买推荐时另核适当性。'}预测模型未运行，不展示虚构概率；发送不等于申购或成交。</p></details>`;
  }
  const api = { stages, scene, process, facts, reply, activeBoundary, factLabel, selectFacts };
  root.AgentSidebarView = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
