/* 共性会话的展示改写。原始聊天不打包；不修改冻结事实、工具、状态或发送记录。 */
(function (root) {
  'use strict';
  const origin = '共性场景改写';
  const source = {
    conversationFiles: 9520, messages: 572532, customerMessages: 251277,
    period: '2026年1月1日至8月14日',
    method: '只读检索客户短消息，排除长转发、链接、附件及截断消息。场景可重叠，检索数量不是完整意图分类或解决率。',
    kind: 'COMMON_PATTERNS_REWRITTEN_NOT_VERBATIM_OR_GOLD',
    patterns: [
      ['申购确认', 443], ['撤单变更', 115], ['定投扣款', 408],
      ['购买入口', 535], ['预约与开放', 1748], ['产品理解与风险', 1424],
      ['持仓波动', 693], ['赎回到账', 1773], ['提醒与跟进', 1090]
    ]
  };
  const cases = {
    confirmation: { title: '扣款了，这笔买成功了吗？', purpose: '把扣款疑问落实到同笔申购的确认金额、状态与日期。', messages: [
      ['CUSTOMER', '前几天申购的150万元景明A，钱扣了，我没找到确认结果。'],
      ['ADVISOR', '您想确认的是这笔有没有买成，我先核对这笔申购。'],
      ['CUSTOMER', '对，就是这笔。现在确认成功了吗？']
    ] },
    supplement: { title: '买了两笔，想撤其中一笔', purpose: '同金额、多产品时先问清目标；未确认与能否撤单分别核对。', messages: [
      ['CUSTOMER', '今天买了两笔，各10万元，现在有一笔想撤掉。'],
      ['ADVISOR', '我先核对一下两笔交易，免得弄错您要撤的那笔。'],
      ['CUSTOMER', '两笔都还没确认，是不是还可以撤？']
    ] },
    human: { title: '现在有余额，为什么没扣成？', purpose: '承接客户对余额的疑问，核对本期扣款时点；失败原因与是否补扣分别说明。', messages: [
      ['CUSTOMER', '钱袋子现在有钱，但这期定投显示失败。'],
      ['ADVISOR', '我帮您核对本期定投，看看当时的扣款情况。'],
      ['CUSTOMER', '那为什么没扣成？之后还会重新扣吗？']
    ] },
    multi: { title: '入口找不到，凑够门槛能买吗？', purpose: '购买入口可直接说明；金额门槛、账户条件与申请确认分开处理。', messages: [
      ['CUSTOMER', '磐云臻选1号在哪个APP买？我找了一下，没找到。'],
      ['ADVISOR', '我把入口和这期参与安排分开给您说明。'],
      ['CUSTOMER', '我准备凑够30万元，今天就能买了吗？']
    ] },
    'active-open': { title: '按约定提醒，先把资料看清', purpose: '将群发催促改成有关注、有约定的提醒，先承接资料需要。', messages: [
      ['CUSTOMER', '上次问的全球精选19号，如果有新的参与安排，帮我留意一下。'],
      ['ADVISOR', '好的，有相关安排时我先把资料和规则发您。'],
      ['CUSTOMER', '可以，提醒我一下。我先看资料，再决定要不要参加。']
    ] },
    'active-product': { title: '先看投资方向，再看用钱安排', purpose: '产品资料服务围绕客户要理解什么、资金何时要用展开；不凭资料判定适合。', messages: [
      ['CUSTOMER', '你发的苍穹创裕3号主要投什么？'],
      ['ADVISOR', '我先把投资方向和需要注意的安排整理给您。'],
      ['CUSTOMER', '我下半年可能要用这笔钱，想先看看风险和持有安排。']
    ] }
  };
  const items = {
    'ISSUE-DEMO-01': {
      title: '这笔申购确认成功了吗？', strategy: '先答是否确认，再给同笔金额和日期。',
      initial: '这笔150万元景明A申购已确认成功，确认金额也是150万元，确认日是1月21日。您问的这笔已经核对上了。',
      guidance: '确认结果已齐，可以直接答复。客户若继续问收益何时显示，再核对对应规则。'
    },
    'ISSUE-DEMO-02': {
      title: '您想撤的是哪一笔？', strategy: '先问清目标，再说明这笔当前能不能撤。',
      initial: '查到两笔各10万元的申购：景明A现在不能撤，小盘成长A现在可以撤。您想撤的是哪一笔？我先帮您核对清楚，目前还没有办理撤单。',
      followup: '景明A这笔10万元申购现在不能撤，虽然还未确认，但当前不支持撤销。这次只是核实状态，没有替您办理撤单。',
      guidance: '金额相同也要分清产品。先确认客户要撤的那一笔，再继续原问题。',
      followupGuidance: '目标交易已经明确，直接说明当前能否撤；是否退回资金要另核资金记录。'
    },
    'ISSUE-DEMO-03': {
      title: '这期定投为何失败，会补扣吗？', strategy: '核对当次扣款时的余额和失败原因，再说明有没有重新扣款。',
      initial: '这期1,000元定投没有确认成功。我还在核实当时的可用余额和具体失败原因，您现在看到的余额不能说明当时的情况。是否会重新扣款，也需要一并核实。',
      followup: '核实到了，这次发起定投时钱袋子的可用余额不足，所以扣款失败。现在有钱不代表当时余额充足；这次没有查到重新扣款记录，不能当作已经补扣。',
      guidance: '先回应“现在有钱为什么失败”，再核当次原因与补扣安排；核实前保留原问题。',
      followupGuidance: '已明确当次失败原因。客户若要补投，再核可办理方式和本期安排。'
    },
    'ISSUE-DEMO-04A': {
      title: '从哪里找到这只产品？', strategy: '给出可操作的入口，把资格与预约事项分别承接。',
      initial: '在广发基金APP里搜索产品代码276202，就能找到磐云臻选1号。参与门槛和您这次能否提交，我分别帮您核对。',
      guidance: '先给入口和产品代码，减少客户反复找产品；参与条件在另一问题中继续核对。'
    },
    'ISSUE-DEMO-04B': {
      title: '凑够30万元，还要核对什么？', strategy: '先说明开放期与金额门槛，再逐项核对账户资格、可用资金和提交条件。',
      initial: '这期申购开放期是6月29日至7月3日，首次参与门槛是30万元。您这次能否提交，还要核对账户资格、实际可用资金和办理页面的校验，目前这几项还没核实。',
      followup: '已核实，您的账户资格通过，可用资金30万元，办理页面允许提交申请。能提交还不等于申购成功，最终看交易受理和确认结果。',
      guidance: '先答规则，再核客户本人的条件；提交申请后的受理和确认要继续跟进。',
      followupGuidance: '当前提交条件已核实。提醒客户查看实际受理和确认结果，不提前记为参与成功。'
    },
    'ISSUE-DEMO-04C': {
      title: '本人的预约码核实到了吗？', strategy: '只核本人预约事项，保留尚未确认的部分。',
      initial: '您的预约码目前还没核实到，我还不能给您一个准确的码。这个问题我会单独跟进，不影响前面已经说明的购买入口。',
      guidance: '需要核对本人预约情况；有名额、收到提醒和已经拿到预约码是不同结果。'
    },
    'OPPORTUNITY-DEMO-05': {
      title: '按客户约定，提醒本期安排', strategy: '兑现提醒约定，先提供资料，由客户决定是否继续。',
      initial: '按您之前的约定提醒一下：寰宇全球精选19号这期募集到6月16日结束。您如果还在关注，我先把产品资料和参与规则发您看看，是否参与再结合您的安排判断。',
      guidance: '先确认客户是否仍关注、是否愿意收资料；用钱安排改变时调整服务，不催促下单。'
    },
    'OPPORTUNITY-DEMO-06': {
      title: '产品怎么投，与用钱安排合适吗？', strategy: '解释已有产品资料，先核资金使用时间和产品持有安排。',
      initial: '这份苍穹创裕3号资料写的是境内混合资产，权益和固收比例按产品合同约定，投资经理是演示经理01。您提到下半年可能要用钱，我先把持有和赎回安排、风险说明核对清楚，再判断是否符合您的安排。',
      guidance: '投资方向可以先说明；风险和持有安排尚未齐全，先补资料，不直接作适合购买的结论。'
    }
  };
  function text(value) {
    return String(value ?? '')
      .replaceAll('演示假定源单位为元，真实接口单位仍须联调', '本例金额按万元展示，实际办理前还需核对金额单位。')
      .replaceAll('时间点不是当前MCP源字段，不当实时截止规则', '这是历史提醒时点，当前办理截止时间还需重新核实。')
      .replaceAll('接口未提供', '还未核实到')
      .replaceAll('非接口字段', '另列人工核查结果')
      .replaceAll('可撤标志', '可撤结果')
      .replaceAll('Mock详情', '演示交易明细')
      .replaceAll('Mock', '演示')
      .replaceAll('接口返回', '业务核对')
      .replaceAll('接口字段', '业务记录')
      .replaceAll('MCP源字段', '业务记录')
      .replaceAll('MCP', '业务查询')
      .replaceAll('Issue', '问题')
      .replaceAll('Skill', '服务能力')
      .replaceAll('接口', '业务查询');
  }
  function displayCase(c) {
    const definition = cases[c.id];
    if (!definition) return c;
    const baselineCount = { multi: 2 }[c.id] || 1;
    return { ...c, title: definition.title, messages: [
      ...definition.messages.map(([role, value], n) => ({ role, text: value, time: `14:${String(n * 2).padStart(2, '0')}`, origin })),
      ...c.messages.slice(baselineCount)
    ] };
  }
  function apply(state) {
    for (const c of state.cases) for (const i of c.items) {
      const definition = items[i.id];
      if (!definition || i.status === 'CLOSED' || i.sentRevision === i.revision) continue;
      const replacement = i.round ? definition.followup : definition.initial;
      if (!replacement) continue;
      const previous = i.replyEvidence?.kind === source.kind ? i.replyEvidence.original : i.replyEvidence;
      i.reply = replacement;
      i.replyEvidence = { origin: '共性场景整理 · 基于演示事实', kind: source.kind, sourcePath: 'business-scenarios.js', original: previous };
      if (!i.round && definition.followup && i.nextReply) i.nextReply = definition.followup;
    }
    return state;
  }
  function guidance(i) {
    const definition = items[i.id];
    return i.round ? definition?.followupGuidance || definition?.guidance : definition?.guidance;
  }
  const api = { source, cases, items, text, displayCase, apply, guidance, title: i => items[i.id]?.title || i.title };
  root.BusinessScenarioCopy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
