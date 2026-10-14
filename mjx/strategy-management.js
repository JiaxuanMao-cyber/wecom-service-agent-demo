/* 策略管理的前端投影：同一列表查看场景、问题、方法与证据。
 * contribution是来源归属，不是作者认证；basic是证据层级，不是自动效果评分。
 * strategyView、改进记录只写隔离Demo存储，不新增生产状态、表或接口字段。
 */
(function(root) {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  function create(catalog = { definitions: {} }, attribution = { rows: [] }, sourceData = root.SERVICE_DEMO_DATA) {
    // 独立保存冻结消息投影，不以可编辑的演示状态或自报SHA当作来源证明。
    const sourceKey = s => JSON.stringify(['chatId','date','messageIndex','sourceSha','messageSha','text','role','time','redactions','goldId','goldSourceSha'].map(k => [k, s[k] ?? null]));
    const frozenCases = clone(sourceData?.cases || []), trustedAttribution = clone(attribution);
    function verifiedSources(state, s) {
      const list = sources(state, s), frozen = frozenCases.find(c => c.id === s.caseId)?.sources || [];
      const ids = list.map(x => x.chatId + ':' + x.messageIndex);
      return list.length > 0 && new Set(ids).size === list.length && list.every(x => frozen.some(y => sourceKey(x) === sourceKey(y)));
    }
    function modeLabel(state, s) { return definition(state, s).serviceDirection || s.mode || '服务方向待核对'; }
    function seed(state) {
      if (catalog.entryStrategy && !state.strategies.some(s => s.id === catalog.entryStrategy.id)) state.strategies.push(clone(catalog.entryStrategy));
      return state;
    }
    function sourceCase(state, s) { return state.cases.find(c => c.id === s.caseId); }
    function item(state, s) {
      const c = sourceCase(state, s);
      const d = catalog.definitions[s.id];
      if (d && d.caseId !== s.caseId) return undefined;
      const boundId = d ? d.sourceItemId || c?.items[0]?.id : undefined;
      if (d && (!boundId || s.sourceItemId && s.sourceItemId !== boundId)) return undefined;
      const candidateId = s.id.startsWith('CANDIDATE-') ? s.id.slice('CANDIDATE-'.length) : undefined;
      const expectedId = boundId || s.sourceItemId || candidateId;
      if (!expectedId || candidateId && candidateId !== expectedId) return undefined;
      if (!c?.items.some(i => i.id === expectedId)) return undefined;
      if (s.evidenceSnapshot?.item) { const p = s.evidenceSnapshot; return p.caseId === s.caseId && p.item.id === expectedId ? p.item : undefined; }
      return c?.items.find(i => i.id === expectedId);
    }
    function sources(state, s) { if (!item(state, s)) return []; return s.evidenceSnapshot ? s.evidenceSnapshot.sources || [] : sourceCase(state, s)?.sources || []; }
    function definition(state, s) {
      const i = item(state, s);
      if (!i) return { title: '方法来源待核对', scene: '来源问题待核对', problem: '当前来源身份无效，请核对后重新选择', reason: '不能借用其他问题的方法、事实或客户反馈。', goal: '先核对方法来源', method: [], sourceKind: '来源待核对' };
      if (s.serviceContext && s.serviceContext.caseId === s.caseId && s.serviceContext.sourceItemId === i.id) return s.serviceContext;
      const d = catalog.definitions[s.id];
      if (d && d.caseId === s.caseId) return d;
      const c = sourceCase(state, s);
      return { scene: c?.mode === 'active' ? '主动服务（需求待核对）' : '当前问题服务', problem: i?.title || '客户诉求待核对',
        reason: '从当时可见的问题、事实和处理记录提炼候选；不能因发送或关闭就认定方法有效。', goal: s.goal || '当前问题得到完整答复',
        sourceKind: '本次过程快照', nextValidation: '核对原诉求、来源与必要事实，再用同类问题验证方法；没有真实结果时保留待验证。' };
    }
    function contextForItem(state, caseId, itemId) {
      const c = state.cases.find(c => c.id === caseId);
      if (!c?.items.some(i => i.id === itemId)) return undefined;
      const d = Object.values(catalog.definitions).find(d => d.caseId === caseId && (d.sourceItemId || c.items[0]?.id) === itemId);
      return d ? { ...d, sourceItemId: itemId } : undefined;
    }
    function contribution(state, s) {
      const list = sources(state, s);
      const row = trustedAttribution.rows.find(r => r.caseId === s.caseId && r.sourceShaMatches === true && verifiedSources(state, s) && list.every(x => x.chatId === r.chatId && x.sourceSha === r.frozenSourceSha));
      const d = definition(state, s);
      return { advisor: row?.advisorId || '来源待核对', chatId: row?.chatId || null, date: row?.date || null,
        verified: !!row, methodAuthor: s.revisedFrom ? '本地修订（演示）' : 'AI整理（演示）', confirmedStrategyAuthor: false,
        type: d.sourceKind === '真实顾问服务样本' ? '提供真实服务样本，方法归纳仍待审核' : '来源会话顾问，尚未认定为方法贡献者' };
    }
    function basic(state, s) {
      const d = definition(state, s), i = item(state, s), src = sources(state, s);
      if (!i) return { label: '来源问题待核对', realProgressCount: 0, feedback: null, boundary: '来源身份无效，不展示其他问题的事实或客户进展。', replay: '尚无可回放问题', rate: null, effectivenessConfirmed: false };
      if (d.business && !businessSources(state,s)) return { label: '业务案例来源待核对', realProgressCount: 0, feedback: null, boundary: '当前案例引用失效，不沿用旧客户进展；原始历史记录保留，未知不当失败或0%效果。', replay: '先核对业务案例引用', rate: null, effectivenessConfirmed: false };
      const feedback = d.historicalProgressIndex && !s.evidenceSnapshot && src.find(x => x.messageIndex === d.historicalProgressIndex && x.role === 'CUSTOMER');
      const advisor = contribution(state, s);
      const realProgress = feedback && advisor.verified && feedback.sourceSha === src[0]?.sourceSha && feedback.text === d.historicalProgressText && feedback.messageSha === d.historicalProgressSha;
      const replay = !i.kind || !i.stage ? '快照服务节点待核对' : i.kind === 'opportunity' ? '服务条件与客户反馈待核对' : i.complete ? '完整答复分支（模拟）' : i.stage === 'ask' ? '补问续接分支（模拟）' : '缺口核查分支（模拟）';
      return { label: realProgress ? '1例历史进展' : '真实结果待核对', realProgressCount: realProgress ? 1 : 0,
        feedback: realProgress ? feedback : null, boundary: realProgress ? d.progressBoundary : '当前快照未核对模拟客户结果；未知不计失败，也不计算成功率。',
        replay, rate: null, effectivenessConfirmed: false };
    }
    function ui(state) { return state.strategyView || (state.strategyView = { axis: 'scene', scene: 'all', advisor: 'all' }); }
    function setView(state, key, value) {
      if (key === 'axis' && !['scene', 'strategy', 'problem'].includes(value)) throw new Error('查看维度无效。');
      if (key === 'mode' && !['all', '主动', '被动'].includes(value)) throw new Error('服务方向无效。');
      if (!['axis', 'scene', 'advisor', 'mode'].includes(key)) throw new Error('筛选项无效。');
      ui(state)[key] = String(value);
    }
    function rows(state, options = {}) {
      const u = ui(state), search = String(options.search || '').trim().toLowerCase();
      return state.strategies.filter(s => {
        const d = definition(state, s), c = contribution(state, s);
        const hay = [s.title, d.title, d.scene, d.business?.stage, d.business?.context, d.problem, d.trigger, d.approach, s.description, s.skill, c.advisor].join(' ').toLowerCase();
        const mode = u.mode || options.mode || 'all';
        return (mode === 'all' || modeLabel(state, s).includes(mode)) && (u.scene === 'all' || d.scene === u.scene) && (u.advisor === 'all' || c.advisor === u.advisor) && (!search || hay.includes(search));
      });
    }
    function statistics(state) {
      return { strategies: state.strategies.length, sourceChats: new Set(state.strategies.flatMap(s => sources(state, s).map(x => x.chatId))).size,
        historicalProgressCases: new Set(state.strategies.filter(s => basic(state, s).realProgressCount).map(s => s.caseId)).size, comparableEffectRate: null };
    }
    function reviewGate(state, s) {
      if (!s || !item(state, s)) return { valid: false, reason: '来源问题无法对应，先核对来源' };
      if (!contribution(state, s).verified) return { valid: false, reason: '来源消息或哈希不匹配，不能批准试用' };
      const d = definition(state, s);
      if (d.business && !businessSources(state,s)) return { valid: false, reason: '业务案例原话引用不完整，先核对来源' };
      if (!d.reason || !d.goal || !methodSteps(state, s).length) return { valid: false, reason: '方法、理由或目标不完整，先补齐候选' };
      return { valid: true, reason: '' };
    }
    function reviewSnapshot(state, s) {
      const i = item(state, s);
      return clone({ strategyId: s.id, caseId: s.caseId, sourceItemId: i?.id, mode: s.mode, serviceDirection: modeLabel(state, s),
        definition: definition(state, s), method: methodSteps(state, s), skill: skillLabel(state, s), skillCode: i?.skill || null, declaredSkill: s.skill || null,
        boundary: s.boundary || '', sources: sources(state, s), evidenceSnapshot: s.evidenceSnapshot || null });
    }
    function approval(state, s) {
      const gate = reviewGate(state, s), record = [...state.audits].reverse().find(a => a.strategyId === s.id && ['approve', 'reject'].includes(a.decision));
      const matches = !!record?.definitionSha && record.definitionKey === JSON.stringify(reviewSnapshot(state, s));
      return { valid: gate.valid && matches, record, reason: !gate.valid ? gate.reason : record && !matches ? '定义或来源已变更，旧审批不适用于当前方法' : !record ? '本方法尚未审核' : '' };
    }
    async function review(state, strategyId, decision, checked, engine) {
      const s = state.strategies.find(p => p.id === strategyId), gate = reviewGate(state, s);
      if (!gate.valid) throw new Error(gate.reason);
      const snapshot = reviewSnapshot(state, s), key = JSON.stringify(snapshot);
      const subtle = root.crypto?.subtle || (typeof require === 'function' ? require('node:crypto').webcrypto.subtle : null);
      if (!subtle) throw new Error('当前环境不能生成审核快照，未提交审批。');
      const bytes = new TextEncoder().encode(key), hash = await subtle.digest('SHA-256', bytes);
      if (!reviewGate(state, s).valid || JSON.stringify(reviewSnapshot(state, s)) !== key) throw new Error('审核期间方法或来源发生变化，请重新核对。');
      engine.trial(state, strategyId, decision, checked);
      Object.assign(state.audits.at(-1), { definitionSha: [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join(''), definitionKey: key, reviewedSnapshot: snapshot });
      return s;
    }
    function createRevision(state, strategyId, patch, evidenceSnapshot) {
      const s = state.strategies.find(p => p.id === strategyId), gate = reviewGate(state, s);
      if (!gate.valid) throw new Error(gate.reason);
      const title = String(patch.title || '').trim(), reason = String(patch.reason || '').trim(), note = String(patch.note || '').trim();
      const method = (patch.method || []).map(x => String(x).trim()).filter(Boolean);
      if (!title || !reason || !note || !method.length) throw new Error('请填写方法名称、推荐理由、步骤和改动原因。');
      if (title.length > 100 || reason.length > 600 || note.length > 600 || method.length > 5 || method.some(x => x.length > 300)) throw new Error('方法最多5步；名称100字、理由和原因600字、每步300字以内。');
      const old = reviewSnapshot(state, s), revised = clone(old.definition);
      if (title === methodTitle(state, s) && reason === revised.reason && JSON.stringify(method) === JSON.stringify(methodSteps(state, s))) throw new Error('方法没有变化，请先明确需要修订的内容。');
      const revisionKey = JSON.stringify({ title, reason, method, note });
      const duplicate = state.strategies.find(p => p.revisedFrom === strategyId && p.revisionKey === revisionKey);
      if (duplicate) return duplicate;
      const sourceItemId = item(state, s).id;
      let n = 1; while (state.strategies.some(p => p.id === 'METHOD-' + sourceItemId + '-' + n)) n++;
      Object.assign(revised, { caseId: s.caseId, sourceItemId, title, reason, method, sopSummary: method.slice() });
      const snap = clone(s.evidenceSnapshot || evidenceSnapshot || {});
      if (snap.caseId !== s.caseId || snap.item?.id !== sourceItemId) throw new Error('修订的证据快照与原事项不一致。');
      const candidate = { id: 'METHOD-' + sourceItemId + '-' + n, title, description: revised.trigger,
        caseId: s.caseId, mode: modeLabel(state,s), goal: revised.goal, skill: skillLabel(state,s), boundary: s.boundary,
        sources: clone(s.sources || []), evidence: '本地方法修订；来源沿用已核历史快照，真实效果待验证',
        status: '候选', method, serviceContext: revised, evidenceSnapshot: snap, sourceItemId,
        revisedFrom: s.id, revisionKey, revisionReason: note, originalDefinition: old, kind: '本地修订候选（非在线AI）' };
      const candidateGate = reviewGate(state, candidate);
      if (!candidateGate.valid) throw new Error(candidateGate.reason);
      state.strategies.push(candidate);
      state.audits.push({ strategyId: s.id, decision: 'revision', candidateId: candidate.id, at: new Date().toISOString(), note, actualPublication: false });
      return candidate;
    }
    function validExperiment(exp) {
      return ['a', 'b'].every(k => Number.isInteger(exp?.[k]?.total) && exp[k].total > 0 && Number.isInteger(exp[k].achieved) && exp[k].achieved >= 0 && exp[k].achieved <= exp[k].total);
    }
    function addImprovement(state, strategyId, text) {
      const strategy = state.strategies.find(s => s.id === strategyId);
      if (!strategy) throw new Error('策略不存在。');
      if (!reviewGate(state, strategy).valid) throw new Error('来源或方法不完整，不能为其他方法记录改进。');
      const note = String(text ?? '').trim();
      if (!note) throw new Error('请说明发现的问题和拟调整的方法。');
      if (note.length > 600) throw new Error('改进建议请控制在600字内。');
      const relatedDefinition = reviewSnapshot(state, strategy);
      const old = state.audits.find(a => a.strategyId === strategyId && a.decision === 'improvement' && a.note === note && JSON.stringify(a.relatedDefinition) === JSON.stringify(relatedDefinition));
      if (old) return old;
      const record = { strategyId, decision: 'improvement', note, at: new Date().toISOString(), actualPublication: false, relatedDefinition };
      state.audits.push(record); return record;
    }
    function methodTitle(state, s) { return definition(state, s).title || s.title; }
    function methodSteps(state, s) { return definition(state, s).method || s.method || []; }
    function skillLabel(state, s) { return item(state, s)?.skillName || s.skill || '领域待核对'; }
    function phase(state, s, x) {
      if (['限定试用', '退回完善'].includes(s.status) && !approval(state, s).valid) return '<span class="badge amber">原审批需复核</span><small>仅旧记录，不适用于当前定义</small>';
      return x.strategyBadge(s);
    }
    function renderRow(state, s, x) {
      const e = x.escape, d = definition(state, s), b = basic(state, s), who = contribution(state, s), gate = reviewGate(state, s), a = approval(state, s);
      const next = !gate.valid ? gate.reason : a.record && !a.valid ? '修订为新候选后再审' : ({ '候选': '核对后决定是否试用', '待审核': '核对方法和来源', '限定试用': '收集同类真实结果', '退回完善': '修订为新候选后再审' }[s.status] || '核对当前记录');
      const steps = d.sopSummary || methodSteps(state, s);
      return `<tr data-policy-row="${e(s.id)}"><td class="policy-primary"><span class="policy-direction">${e(modeLabel(state,s))}</span><span class="policy-business-label">${e(d.business?.context || '当前客户服务')}</span><b>${e(d.scene)}</b><small>${e(d.problem)}</small>${!gate.valid ? `<p class="policy-alert">${e(gate.reason)}</p>` : ''}</td><td><b>${e(methodTitle(state, s))}</b><small class="policy-reason">${e(d.reason)}</small></td><td><ol class="policy-sop-preview">${steps.map(v => `<li>${e(v)}</li>`).join('')}</ol></td><td class="policy-basic"><span class="policy-target">目标：${e(d.goal)}</span><b>依据：${e(b.label)}</b><small>${e(b.feedback ? '仅证明找到入口，非成交或信任增强' : '信任变化尚无客户证据')}</small><small class="policy-replay-label">${e(b.replay)}</small></td><td class="policy-contributor"><b>${e(who.methodAuthor)}</b><small>来源：${e(who.advisor)}</small><small>维护人待确认</small></td><td>${phase(state, s, x)}<small>${e(next)}</small></td><td><button class="policy-detail-link" data-action="policy-detail" data-strategy-id="${e(s.id)}" aria-label="查看策略详情：${e(methodTitle(state, s))}">详情 ↗</button></td></tr>`;
    }
    function summary(state, s, x) {
      const e = x.escape, d = definition(state, s), c = contribution(state, s), b = basic(state, s);
      return `<div class="policy-evidence"><div class="policy-evidence-head"><b>贡献与基础证据</b><span class="badge outline">不是效果排名</span></div><dl><div><dt>来源会话顾问</dt><dd>${e(c.advisor)}</dd></div><div><dt>方法整理</dt><dd>${e(c.methodAuthor)}<small>未认定正式策略作者</small></dd></div><div><dt>来源类型</dt><dd>${e(c.type)}</dd></div><div><dt>基础结果</dt><dd><b>${e(b.label)}</b>${b.feedback ? `<blockquote>${e(b.feedback.text)}</blockquote>` : ''}<small>${e(b.boundary)}</small></dd></div><div><dt>当前演示</dt><dd>${e(b.replay)}<small>${s.evidenceSnapshot ? '候选生成时快照；不随后续回填改写' : '本地预置分支，不是生产接口结果或新模型运行'}</small></dd></div></dl><p class="policy-goal">本场景只看：${e(d.goal)}。暂无可比效果率，不以采纳、发送或关闭替代。</p></div>`;
    }
    function renderBusiness(state, s, x) {
      const e=x.escape,d=definition(state,s),b=d.business;
      if (!b) return '<section class="policy-business-case"><h3>业务案例与有效性</h3><p>尚未补齐当前方法的业务案例及验收口径，不借用其他问题结论。</p></section>';
      if (!contribution(state,s).verified) return '<section class="policy-business-case"><h3>业务案例与有效性</h3><p>来源消息需先核对，不展示未经核对的原话或业务结果。</p></section>';
      const quotes=businessSources(state,s);
      if (!quotes) return '<section class="policy-business-case"><h3>业务案例与有效性</h3><p class="policy-alert">案例原话引用不完整，停止展示引用及结果；请核对来源。</p></section>';
      const caseText=`<details class="business-source"><summary>查看场景摘要与来源指纹（${quotes.length}条节选消息）</summary>${quotes.map(v=>`<div class="business-quote"><small>${e(v.date)} · ${v.role==='CUSTOMER'?'客户原话':'顾问原话'}</small><blockquote>${e(v.text)}</blockquote></div>`).join('')}</details>`;
      return `<section class="policy-business-case"><h3>实际业务案例 · ${e(b.context)}</h3><p>${e(b.opportunity)}</p>${caseText}<p class="muted">${e(b.sourceLimit)}</p></section><section class="policy-trust"><h3>服务价值 · 支持可信赖的客户关系</h3><p>${e(b.trustBasis||'信任价值待业务核对，不由单次答复自动认定。')}</p></section><section class="policy-outcomes"><h3>客户服务有效性 · 观察服务，而非只看答题</h3><p><b>判定标准（不是本例已实现结果）：</b>${e(b.customerOutcome)}</p><p class="muted">${e(basic(state,s).boundary)} 未单独验证客户信任变化，不宣称已增强信任。</p><details class="business-source"><summary>查看模型保障：查对事实、数据准确、回答相关</summary><ol>${b.modelChecks.map(v=>`<li>${e(v)}</li>`).join('')}</ol><p class="muted">以上是验收要求，不是执行成绩；本方法尚未开展独立模型全链路验收，当前可回放过程仍为Mock。答对是服务底线，不等于策略或信任有效。</p></details></section><section class="policy-reuse"><h3>组织复用 · 复用服务方法，不复制客户结论</h3><ol>${b.reuse.map(v=>`<li>${e(v)}</li>`).join('')}</ol><p class="muted">需要其他顾问、同类新事项的独立复验；当前均为待验证候选，不因审批或Mock通过自动升级为有效策略。</p></section>`;
    }
    function businessSources(state,s) {
      const indexes=definition(state,s).business?.sourceIndexes;
      if (!Array.isArray(indexes) || !indexes.length || new Set(indexes).size!==indexes.length) return null;
      const list=sources(state,s),quotes=indexes.map(index=>list.find(v=>v.messageIndex===index));
      return quotes.every(Boolean) ? quotes : null;
    }
    function flow() {
      return `<div class="policy-flow"><b>策略迭代路径</b><ol><li><span>1</span>服务记录中发现方法</li><li><span>2</span>核对场景、来源与证据</li><li><span>3</span>人工批准限定试用</li><li><span>4</span>看实际结果，再提出改进</li></ol><small>复用现有管理阶段；不是新增Issue状态，不自动发布Skill。</small></div>`;
    }
    function render(state, x, options = {}) {
      const e = x.escape, u = ui(state), list = rows(state, options), selected = options.detailOnlyId ? state.strategies.find(s => s.id === options.detailOnlyId) : list[0];
      const scenes = [...new Set(state.strategies.map(s => definition(state, s).scene))], advisors = [...new Set(state.strategies.map(s => contribution(state, s).advisor))], stats = statistics(state);
      const head = x.intro('服务客户，沉淀可信赖的方法', '客户服务策略', '按投前、投中、投后，理解关切、透明说明、持续负责、尊重选择。答对是底线，客户信任变化需另有证据；当前均为候选。', '<button class="button" data-action="candidate-help">如何沉淀策略 ↗</button>');
      const toolbar = `<div class="policy-controls"><div class="policy-filters"><label>服务方向<select id="policy-mode" data-policy-filter="mode"><option value="all">全部服务</option><option value="主动" ${u.mode === '主动' ? 'selected' : ''}>主动服务</option><option value="被动" ${u.mode === '被动' ? 'selected' : ''}>被动服务</option></select></label><label>场景<select id="policy-scene" data-policy-filter="scene"><option value="all">全部场景</option>${scenes.map(v => `<option ${u.scene === v ? 'selected' : ''} value="${e(v)}">${e(v)}</option>`).join('')}</select></label><label>来源会话顾问<select id="policy-advisor" data-policy-filter="advisor"><option value="all">全部顾问</option>${advisors.map(v => `<option ${u.advisor === v ? 'selected' : ''} value="${e(v)}">${e(v)}</option>`).join('')}</select></label><input class="search" id="strategy-search" aria-label="搜索场景、策略、问题或来源顾问" placeholder="搜索场景、策略或问题" value="${e(options.search || '')}"></div></div>`;
      if (!selected) return head + toolbar + '<div class="empty-state">没有匹配策略。<button class="button" data-action="policy-clear">清除筛选</button></div>';
      const d = definition(state, selected), c = contribution(state, selected);
      const table = `<div class="policy-list"><div class="policy-scroll"><table class="policy-table"><thead><tr><th scope="col">客户服务场景</th><th scope="col">策略与推荐理由</th><th scope="col">服务步骤</th><th scope="col">目标与基础结果</th><th scope="col">来源与维护</th><th scope="col">阶段与下一步</th><th scope="col">操作</th></tr></thead><tbody>${list.map(s => renderRow(state, s, x)).join('')}</tbody></table></div><div class="policy-list-note">${list.length}条方法 / 共${stats.strategies}条 · ${stats.sourceChats}个来源会话 · 真实效果率及观察窗尚未形成，不填写0%。方法不等于新增Skill。</div></div>`;
      const feedback = state.audits.filter(a => a.strategyId === selected.id && a.decision === 'improvement');
      const detail = `<aside class="strategy-detail policy-detail"><div class="policy-detail-heading"><span class="small-label">${e(d.scene)} · ${e(modeLabel(state,selected))}</span>${phase(state, selected, x)}<h2>${e(methodTitle(state,selected))}</h2></div>${!reviewGate(state, selected).valid || approval(state, selected).reason && approval(state, selected).record && !approval(state, selected).valid ? `<p class="policy-alert">${e(approval(state, selected).reason)}</p>` : ''}<section><h3>客户服务场景</h3><p>${e(d.trigger || d.problem)}</p><p class="muted">客户当前所求：${e(d.problem)}</p></section><section><h3>服务内容与适用条件</h3><p>${e(d.serviceContent || d.goal)}</p><p class="muted">${e(d.applicability || '需核对当前客户需要与业务事实')}</p></section><section><h3>服务逻辑 · 为什么推荐</h3><p>${e(d.reason)}</p></section><section><h3>顾问服务方法</h3><ol class="method-list">${methodSteps(state,selected).map((m,n)=>`<li><span>${n+1}</span>${e(m)}</li>`).join('')}</ol></section><section><h3>继续、协同或停止</h3><ol class="policy-branches">${(d.branches || []).map(v=>`<li>${e(v)}</li>`).join('')}</ol></section>${renderBusiness(state,selected,x)}${summary(state,selected,x)}<details class="policy-details"><summary>查看事实依据与沉淀时来源</summary>${d.construction ? `<p><b>真实起点与构造分支：</b>${e(d.construction)}</p>` : ''}<p><b>执行能力：</b>${e(skillLabel(state,selected))}（不代表真实接口已接通）。</p><p><b>必要事实：</b>${e(x.factLabels(selected)) || '尚待补齐'}。</p><p>${e(selected.boundary)}</p><p>来源核对日期：2026-10-10。${e(c.date || '待核对')}为历史场景日期，不是当前安排。</p><button class="button" data-action="strategy-source" data-strategy-id="${e(selected.id)}">核对原话、事实与沉淀时过程</button></details><details class="policy-details"><summary>下一轮如何迭代和验证</summary><p>${e(d.nextValidation)}</p><p>先修具体不足并新建修订候选；核对必要事实与答复后再审核限定试用。未形成真实同口径结果时，不宣称方法提升了效果。</p>${feedback.length ? `<div class="policy-feedback">${feedback.map(a=>`<p><b>改进建议（本地）：</b>${e(a.note)}</p>`).join('')}</div>` : '<p class="muted">尚无本地改进建议。</p>'}${selected.revisedFrom ? `<p>由原方法${e(selected.revisedFrom)}修订；改动原因：${e(selected.revisionReason)}。原审核和结果保留，不继承为本候选效果。</p>` : ''}</details><div class="strategy-actions policy-actions"><button class="button" data-action="policy-service" data-strategy-id="${e(selected.id)}">打开当前服务</button><button class="button primary" data-action="request-review" data-strategy-id="${e(selected.id)}">查看评估与审核</button><button class="plain-button" data-action="policy-improve" data-strategy-id="${e(selected.id)}">记录改进建议 ↗</button><button class="button" data-action="policy-revise" data-strategy-id="${e(selected.id)}" ${reviewGate(state, selected).valid ? '' : 'disabled'}>修订为新候选</button></div><p class="policy-footnote">当前服务可能已续接，沉淀时证据保持原快照。所有操作仅本地演示，不自动发布Skill。</p></aside>`;
      if (options.detailOnlyId) return detail;
      return head + toolbar + table;
    }
    function renderReview(state, x) {
      const e = x.escape, s = state.reviewId ? state.strategies.find(s => s.id === state.reviewId) : state.strategies[0];
      if (!s || !item(state, s)) return x.intro('未找到有效策略来源', '评估与审核', '审核标识无效或来源问题无法对应，不借用其他策略的证据。') + '<div class="empty-state">请返回列表核对来源后重新选择。<button class="button" data-go="strategies">返回策略列表</button></div>';
      const gate = reviewGate(state,s);
      if (!gate.valid) return x.intro('审核已停止', '来源与方法需先核对', gate.reason) + '<div class="policy-alert">不批准、不借用其他方法的证据。<button class="button" data-go="strategies">返回列表核对</button></div>';
      const d = definition(state,s), a = approval(state,s), done = ['限定试用','退回完善'].includes(s.status), exp = !s.revisedFrom && x.data.experiments.find(a=>a.strategyId === s.id);
      const rate=g=>g.total ? (g.achieved/g.total*100).toFixed(1) : '—';
      const ab = exp && !validExperiment(exp) ? '<div class="policy-alert">演示计数无效，停止展示比例；不能用于审核效果。</div>' : exp ? `<details class="policy-details policy-ab"><summary>查看A/B评估示例（全部Mock，不是本条真实效果）</summary><div class="quiet-callout callout-amber">${s.id === 'S-PRODUCT' ? '当前资料服务与后续推荐实验是不同目标；下方示例只展示推荐实验口径，不是当前资料服务的效果。' : '下方仅演示对照格式，未绑定本方法的目标和快照，不能证明该策略真实有效。'}</div><div class="section-label"><b>${e(exp.goal)}</b><span class="badge amber">全部演示数据</span></div><div class="metric-area">${[['a',exp.baseline],['b',exp.treatment]].map(([key,label])=>`<div class="metric-box"><span>${e(label)}</span><div class="metric-number">${rate(exp[key])}<span>%</span></div><small>${exp[key].achieved} / ${exp[key].total} ${e(exp.unit)}</small></div>`).join('')}</div><p>B − A：${(Number(rate(exp.b))-Number(rate(exp.a))).toFixed(1)}个百分点（演示绝对差）。${e(exp.conclusion)}</p><p>示例未配置未知数和真实逐事项明细，不可用于策略验收；${e(exp.window)}。</p></details>` : '<div class="quiet-callout">尚无本方法的A/B或可比效果率。不借用其他方法数据，不把结果未知算成失败。</div>';
      const regression = s.id === 'S-CONFIRM' ? `<details class="policy-details"><summary>关联领域历史验证（不等于本条策略效果）</summary><p>交易领域：${x.data.regression.realQuestions}个真实问题、${x.data.regression.nodes}个给定Mock事实节点；预先充分问题${x.data.regression.complete}/${x.data.regression.sufficient}完整输出。不是本条方法的独立效果率，也不是完整查询链通过率。</p><button class="button" data-action="regression-source">查看历史核对来源</button></details>` : '';
      const history=state.audits.filter(a=>a.strategyId===s.id);
      const method = `<section class="policy-review-method"><h3>本次方法与目标</h3><p>${e(d.reason)}</p><ol>${methodSteps(state,s).map(v=>`<li>${e(v)}</li>`).join('')}</ol><p><b>目标：</b>${e(d.goal)}</p></section>${renderBusiness(state,s,x)}`;
      const check = `<details class="policy-details"><summary>审核要核对什么</summary><ol><li>场景与诉求准确，方法能推进问题，停止条件明确</li><li>来源、事实与单位可靠，贡献和维护角色如实</li><li>目标与结果对应，未知单列，模拟不冒充真实效果</li></ol><p>业务批准与独立Codex三角色分别留痕，本页不代替后者。</p>${a.record?.definitionSha ? `<p>原审批定义SHA：${e(a.record.definitionSha)}；${a.valid ? '当前快照匹配' : '当前快照不匹配'}。</p>` : ''}</details>`;
      const decisions = `<div class="review-bottom"><div><b>审核决策</b><label class="check-label"><input type="checkbox" id="review-confirm" ${done?'disabled':''}>已核对当前方法、来源与边界；仅批准本地限定试用。</label><small>不发布正式Skill，不认定真实有效。</small></div><div class="action-row"><button class="button" data-action="review-reject" ${done?'disabled':''}>退回完善</button><button class="button primary" data-action="review-approve" ${done?'disabled':''}>批准限定试用</button></div></div>`;
      return x.intro('审核方法与证据，不替代效果验证', '评估与审核', '审批绑定当前定义和来源快照；修订创建新候选，原审核和结果保留。', '<button class="button" data-go="strategies">返回策略列表</button>') + `<div class="review-layout"><aside class="review-list" aria-label="待审核策略">${state.strategies.map(p=>`<button class="review-choice ${p.id===s.id?'selected':''}" data-review="${e(p.id)}"><b>${e(methodTitle(state,p))}</b>${phase(state,p,x)}</button>`).join('')}</aside><section class="review-card"><div class="review-top"><div><span class="small-label">${e(d.scene)}</span><h2>${e(methodTitle(state,s))}</h2><p>${e(d.problem)}</p></div>${phase(state,s,x)}</div>${a.record && !a.valid ? `<div class="policy-alert">${e(a.reason)}</div>` : ''}${method}${summary(state,s,x)}<button class="button" data-action="strategy-execution-source" data-strategy-id="${e(s.id)}">核对沉淀时原话、事实与过程 ↗</button>${regression}${ab}${check}${decisions}<div class="action-row"><button class="plain-button" data-action="policy-improve" data-strategy-id="${e(s.id)}">记录改进建议 ↗</button><button class="button" data-action="policy-revise" data-strategy-id="${e(s.id)}">修订为新候选</button></div><div class="history-list">${history.map(a=>`<div class="history-line"><span>业务操作（演示） · ${e({approve:'批准限定试用',reject:'退回完善',improvement:'记录改进建议',revision:'创建修订候选'}[a.decision] || '记录')}<p>${e(a.note)}</p>${a.candidateId ? `<small>新候选：${e(a.candidateId)}</small>` : ''}</span><span class="muted">${e(a.at)} · 未发布正式资产</span></div>`).join('')}</div></section></div>`;
    }
    return { seed, sourceCase, item, definition, contextForItem, contribution, basic, rows, ui, setView, statistics, verifiedSources, modeLabel, reviewGate, reviewSnapshot, approval, review, createRevision, validExperiment, addImprovement, methodTitle, methodSteps, skillLabel, renderBusiness, render, renderReview };
  }
  root.StrategyManagement = create(root.STRATEGY_CATALOG, root.STRATEGY_ATTRIBUTION);
  if (typeof module !== 'undefined' && module.exports) module.exports = { create };
})(typeof globalThis !== 'undefined' ? globalThis : window);
