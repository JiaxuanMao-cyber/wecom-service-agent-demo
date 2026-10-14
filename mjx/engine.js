/* 本地交互状态机。仅模拟四个现有Issue状态；不写业务库、不发客户。 */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const event = (item, title, text, kind = 'system') => item.events.push({ title, text, kind, at: new Date().toISOString(), mock: true });
  function prepare(item) {
    const i = clone(item);
    i.registered = !i.needsConfirm;
    i.status = i.kind === 'opportunity' ? null : (i.registered ? 'READY_TO_REPLY' : null);
    i.round = 0;
    i.revision = 1;
    i.sentRevision = 0;
    i.compose = '';
    i.sentTexts = [];
    i.awaiting = null;
    i.events = clone(i.steps || []);
    i.advisorConfirmed = false;
    i.closeConfirmed = false;
    return i;
  }
  function initial(data) {
    const cases = data.cases.map(c => ({ ...clone(c), items: c.items.map(prepare), messages: clone(c.messages), activeItemId: c.items[0].id, busy: false, extraAdded: false }));
    return { schema: 1, sourceSnapshot: data.snapshotSha, view: 'service', selectedCase: cases[0].id, mode: 'all', cases, strategies: clone(data.strategies), experiments: clone(data.experiments), reviewId: 'S-CONFIRM', audits: [] };
  }
  function getCase(state, caseId) { return state.cases.find(c => c.id === caseId); }
  function getItem(state, caseId, itemId) { return getCase(state, caseId)?.items.find(i => i.id === itemId); }
  function requireCondition(ok, message) { if (!ok) throw new Error(message); }
  function transition(state, caseId, itemId, action, payload = {}) {
    const c = getCase(state, caseId);
    const i = getItem(state, caseId, itemId);
    requireCondition(c && i, '问题不存在，不能跨客户操作。');
    if (action === 'SELECT') { c.activeItemId = i.id; return i; }
    requireCondition(i.status !== 'CLOSED', '该问题已关闭，仅可查看历史。');
    if (action === 'CONFIRM') {
      requireCondition(!i.registered, '已经确认，不重复登记。');
      requireCondition(payload.checked === true, '请先核对当前服务条件。');
      i.registered = true;
      i.advisorConfirmed = true;
      if (i.kind === 'issue') i.status = 'READY_TO_REPLY';
      event(i, i.kind === 'opportunity' ? '顾问确认服务条件' : '顾问确认登记', i.kind === 'opportunity' ? '仅本地确认可触达；不创建生产Issue。' : '登记当前问题，尚未转派；等待顾问发送本轮说明。');
    } else if (action === 'USE') {
      requireCondition(i.registered, '请先确认登记或主动服务条件。');
      i.compose = i.reply;
      event(i, '使用到企微输入框', '仅放入草稿，尚未发送客户。', 'advisor');
    } else if (action === 'EDIT') {
      i.compose = String(payload.text ?? '');
    } else if (action === 'SEND') {
      requireCondition(i.registered, '尚未确认，不能发送。');
      requireCondition(i.compose.trim(), '请先使用或填写本问题话术。');
      requireCondition(i.sentRevision !== i.revision, '本轮已发送，已阻止重复发送。');
      i.sentRevision = i.revision;
      i.sentTexts.push({ text: i.compose, revision: i.revision, mockReceipt: `DEMO-RECEIPT-${i.id}-${i.revision}`, source: i.replyEvidence?.origin || '演示草稿', modified: i.compose !== i.reply });
      c.messages.push({ role: 'ADVISOR', text: i.compose, time: '演示', origin: '模拟发送回执', itemId: i.id });
      i.compose = '';
      if (i.kind === 'issue') i.status = 'PROCESSING';
      i.awaiting = i.stage === 'ask' ? 'customer' : i.stage === 'handoff' ? 'human' : i.stage === 'outreach' ? 'outcome' : null;
      event(i, '企微发送成功（模拟）', `回执绑定本问题第${i.revision}版话术；不等于业务处理成功。`, 'advisor');
      if (i.awaiting === 'human') event(i, '协同受理成功（模拟）', '本地演示任务已绑定当前Issue，等待人工核查结果。', 'human');
    } else if (action === 'SUPPLEMENT') {
      requireCondition(i.awaiting === 'customer', '当前没有等待客户补充。');
      requireCondition(i.nextReply && c.supplement, '未配置有效续接，不能编造结果。');
      c.messages.push({ role: 'CUSTOMER', text: c.supplement, time: '演示', origin: '模拟补充 · 非历史原文', itemId: i.id });
      i.round += 1;
      i.revision += 1;
      i.facts = clone(i.nextFacts);
      i.reply = i.nextReply;
      i.replyEvidence = i.nextReplyEvidence || { origin: '演示续接草稿' };
      i.awaiting = null;
      i.stage = 'answer';
      i.complete = true;
      i.status = 'READY_TO_REPLY';
      event(i, '客户补充后续接原问题', '保留原Issue与执行链，已提供的产品不再重复询问。', 'customer');
      event(i, '查询目标交易并答复', 'Mock详情确认目标交易当前不可撤；没有实际办理撤单。', 'tool');
    } else if (action === 'HUMAN_RESULT') {
      requireCondition(i.awaiting === 'human', '尚未转派或没有等待人工结果。');
      requireCondition(i.humanResult && i.nextReply, '没有绑定结果，不提前生成成功结论。');
      i.facts = [...i.facts, ...clone(i.nextFacts || [])];
      i.reply = i.nextReply;
      i.replyEvidence = { origin: '演示草稿 · 基于Mock人工核查' };
      i.revision += 1;
      i.round += 1;
      i.awaiting = null;
      i.complete = true;
      i.stage = 'answer';
      i.status = 'READY_TO_REPLY';
      event(i, '人工回填（模拟）', i.humanResult, 'human');
      event(i, '根据核实结果生成答复', '只解释本次核查结果，不说已经补扣、退款或完成交易。', 'model');
    } else if (action === 'CLOSE') {
      requireCondition(i.kind === 'issue', '主动触达不等于问题解决或申购成功。');
      requireCondition(i.complete && !i.awaiting, '当前仍有证据缺口，不能按已解决关闭。');
      requireCondition(i.sentRevision === i.revision && i.status === 'PROCESSING', '最终话术尚未发送，不能关闭。');
      requireCondition(payload.checked === true, '顾问需要确认已完整回答当前诉求。');
      i.status = 'CLOSED';
      i.closeConfirmed = true;
      event(i, '顾问确认关闭（模拟）', '仅关闭本问题，其他问题和草稿不受影响。', 'advisor');
    } else if (action === 'RUN') {
      requireCondition(!c.busy, '当前仍在执行，请勿重复触发。');
      requireCondition(i.sentRevision !== i.revision, '本轮已发送。请等待真实新增消息，不重复生成新问题。');
      event(i, '重放当前执行过程', '本地读取既有事实与草稿，不在线调用模型或真实MCP。');
    } else {
      throw new Error('不支持的操作。');
    }
    return i;
  }
  function addQuestion(state, caseId) {
    const c = getCase(state, caseId);
    requireCondition(c?.extraItem && c?.extraQuestion, '该案例没有可注入的历史新问题。');
    requireCondition(!c.extraAdded, '该消息已处理，已阻止重复创建。');
    c.extraAdded = true;
    const i = prepare(c.extraItem);
    c.items.push(i);
    c.activeItemId = i.id;
    c.messages.push({ role: 'CUSTOMER', ...clone(c.extraQuestion), itemId: i.id });
    event(i, '新增独立诉求', '依据同会话后续消息建立一个新候选，不复制已有两个问题。', 'model');
    return i;
  }
  function trial(state, strategyId, decision, checked) {
    const s = state.strategies.find(s => s.id === strategyId);
    requireCondition(s, '策略不存在。');
    requireCondition(['approve', 'reject'].includes(decision), '审核操作无效。');
    requireCondition(checked === true, '请先确认已核对来源和适用边界。');
    requireCondition(!['限定试用', '退回完善'].includes(s.status), '该候选已有审核结论，不能重复审批。');
    s.status = decision === 'approve' ? '限定试用' : '退回完善';
    state.audits.push({ strategyId, decision, at: new Date().toISOString(), actualPublication: false, note: '本地交互审核，不是独立Codex三角色金标审核；没有发布正式Skill。' });
    return s;
  }
  const api = { initial, getCase, getItem, transition, addQuestion, trial };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ServiceDemoEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
