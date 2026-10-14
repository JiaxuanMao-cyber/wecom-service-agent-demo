/* 原型表达适配层。不得改冻结事实、金标、状态、人工结果或顾问已编辑／已发送内容。 */
(function (root) {
  'use strict';
  const titles = {
    'ISSUE-DEMO-01': '这笔150万元申购成功了吗？',
    'ISSUE-DEMO-02': '未确认的申购能撤吗？',
    'ISSUE-DEMO-03': '钱袋子有钱，定投为什么失败？',
    'ISSUE-DEMO-04A': '在哪个APP买？',
    'ISSUE-DEMO-04B': '凑够30万元能买了吗？',
    'ISSUE-DEMO-04C': '我的预约码是多少？',
    'OPPORTUNITY-DEMO-05': '募集结束提醒',
    'OPPORTUNITY-DEMO-06': '新产品资料'
  };
  const tabs = { 'ISSUE-DEMO-01': '申购确认', 'ISSUE-DEMO-02': '能否撤单', 'ISSUE-DEMO-03': '定投失败', 'ISSUE-DEMO-04A': '购买入口', 'ISSUE-DEMO-04B': '参与条件', 'ISSUE-DEMO-04C': '本人预约码', 'OPPORTUNITY-DEMO-05': '募集提醒', 'OPPORTUNITY-DEMO-06': '产品资料' };
  const clone = value => JSON.parse(JSON.stringify(value));
  function create(asset) {
    const byKey = new Map((asset?.drafts || []).map(d => [d.key, d]));
    function evidence(draft, original) {
      return { origin: '模型改写＋Codex表达校订 · 基于已有模拟事实', kind: 'COPY_REWRITE_NOT_FULL_AGENT_VALIDATION', model: asset.actualModel, text: draft.generatedText, displayText: draft.text, sourcePath: asset.sourcePath, sha: draft.generatedSha, displaySha: draft.sha, original: clone(original || {}) };
    }
    function apply(state) {
      for (const c of state.cases) for (const i of c.items) {
        const key = i.id + (i.round ? ':followup' : ':initial');
        const draft = byKey.get(key), next = byKey.get(i.id + ':followup');
        if (draft && i.status !== 'CLOSED' && i.sentRevision !== i.revision) {
          i.copyOriginals ||= {};
          if (!i.copyOriginals[key]) i.copyOriginals[key] = i.round && i.copyNextOriginal ? clone(i.copyNextOriginal) : { text: i.reply, evidence: clone(i.replyEvidence || {}) };
          i.reply = draft.text;
          i.replyEvidence = evidence(draft, i.copyOriginals[key]);
        }
        if (!i.round && next && i.nextReply) {
          i.copyNextOriginal ||= { text: i.nextReply, evidence: clone(i.nextReplyEvidence || {}) };
          i.nextReply = next.text;
          i.nextReplyEvidence = evidence(next, i.copyNextOriginal);
        }
      }
      return state;
    }
    return { apply, title: i => titles[i.id] || i.title, tab: i => tabs[i.id] || i.title };
  }
  root.AdvisorCopy = create(root.ADVISOR_COPY_DRAFTS);
  if (typeof module !== 'undefined' && module.exports) module.exports = { create };
})(typeof globalThis !== 'undefined' ? globalThis : window);
