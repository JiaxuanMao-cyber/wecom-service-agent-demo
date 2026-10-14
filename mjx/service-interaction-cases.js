/* 新增服务交互的独立Mock。没有对应生产工具，不覆盖冻结data/engine。 */
(function (root) {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  const source = '本地案例Mock · 人工编写的演示事实';
  const fact = (label, value, note = '') => ({ label, value, source, field: '', note });
  const gap = (label, value) => ({ label, value, source: '事实缺口', field: '' });
  const msg = (role, text, time) => ({ role, text, time, origin: '原始问法归纳 · 匿名模拟，非客户原文' });
  const item = (id, title, skill, skillName, facts, reply, complete, strategy) => ({ id, title, kind: 'issue', skill, skillName, needsConfirm: false, stage: 'answer', complete, scope: '当前演示客户、当前产品及本轮所问；不是原始客户账户查询', facts, reply, strategy, tools: [], raw: {}, boundary: '独立人工编写Mock，未接入真实查询，不注册为金标或模型执行结果。', steps: [{ title: '整理案例材料', text: '仅展示本地预置业务资料，没有调用真实账户、资金或产品工具。', kind: 'system', mock: true }], replyEvidence: { origin: '独立Mock案例话术 · 非模型执行' } });
  const definitions = [
    {
      id: 'redemption-arrival', title: '赎回确认了，钱到哪了？', customer: '到账案例客户', initials: '到', date: '2026-07-09',
      categories: ['arrival', 'redemption'],
      purpose: '区分赎回确认、钱袋子入账、银行转出；资金结果未齐时不能提前关闭。',
      basis: '归纳原文中的“退出一部分几天到账”“银行卡一直没有到账”和急用钱追问。日期、产品、金额及结果全部另设为Mock。',
      messages: [msg('CUSTOMER', '稳衡1号那笔6万元赎回已经确认了，但银行卡还没看到钱，什么时候到账？', '09:20')],
      items: [item('ISSUE-LOCAL-ARRIVAL', '确认了，银行卡为何没看到钱？', 'SKILL_TRANSACTION_SERVICE', '交易与资金去向', [fact('产品', '稳衡1号（虚构演示产品）'), fact('赎回确认金额', '60,000元'), fact('确认日期', '2026-07-08'), fact('约定收款渠道', '钱袋子'), gap('实际资金结果', '钱袋子是否入账、是否转出到银行尚未核实')], '这笔6万元赎回在7月8日已确认，约定收款渠道是钱袋子。确认不等于资金已到账，也不等于已经转到银行卡；我还需要核对这笔的钱袋子流水和银行转出记录，目前不能给您一个已到账结论或确定的银行到账时间。', false, '先对同笔交易，再分别核对确认、约定渠道和实际资金流水。')],
      followup: { title: '钱到哪里、今天能用吗？', text: '我一直看的是银行卡，钱袋子也没找到。今天要用这笔钱，帮我查一下到底到哪了，能不能加急？', time: '09:25', stage: 'handoff', complete: false, needsConfirm: true,
        reply: '您关注的是这6万元的实际去向和今天能否使用。我会核对同笔钱袋子入账及银行转出情况，到账与是否支持加急分别确认；核实前不能承诺今天可用。您前面提供的产品、金额和确认日期继续沿用。',
        facts: [gap('资金去向与加急', '等待对应资金流水与办理安排核查')],
        humanTask: '核对同笔钱袋子入账、可用余额、银行转出条件与预计安排',
        humanResult: '仅本案例Mock：钱袋子于7月9日09:10入账60,000元，该笔可用60,000元，允许申请银行转出，但未有转出申请。本例规则预计提交后下一个工作日到银行，没有加急渠道。未办理转出、不保证今天银行到账。',
        nextFacts: [fact('钱袋子入账', '2026-07-09 09:10，60,000元'), fact('可用余额与转出条件', '该笔60,000元可用，允许申请转出'), fact('同笔银行转出', '未查到银行转出申请'), fact('预计安排与加急', '本例：提交后下一个工作日预计到银行，无加急渠道', '仅本例预置规则；预计不等于实到，不是所有产品的通用安排。')],
        nextReply: '核实到了：这6万元已在7月9日09:10进入钱袋子，当前该笔6万元可用、允许申请银行转出，但还没有转出申请。本例规则预计提交后下一个工作日到银行，没有加急渠道，不能保证今天银行到账。您如要转到银行卡，需要您另行确认办理；本次只是核实去向和办理安排，没有替您转出。'
      }
    },
    {
      id: 'fee-deduction', title: '分红扣过费，卖出还扣吗？', customer: '扣费案例客户', initials: '费', date: '2026-07-10', categories: ['fee'],
      purpose: '核清费用类别、计提期间和分红再投去向，不以费率代替实际扣费。',
      basis: '归纳原文中的“分红再投资后金额少了”“分红时收费，后面卖还收吗”。不沿用原始客户、家属或金额。',
      messages: [msg('CUSTOMER', '明晰2号分红选了再投资，怎么比预想少了？这是扣了管理费吗？', '10:05')],
      items: [item('ISSUE-LOCAL-FEE', '分红再投资少了哪笔费用？', 'SKILL_TRANSACTION_SERVICE', '费用与计提解释', [fact('产品', '明晰2号（虚构演示产品）'), fact('分红总额', '20,000元'), fact('本次实际费用', '业绩报酬2,000元，不是管理费'), fact('分红净额去向', '18,000元用于再投资'), fact('再投资确认', '确认净值2.0000元，新增9,000份', '20,000−2,000=18,000元；18,000÷2.0000=9,000份。本例无其他扣项。')], '本例分红总额是2万元，这次实际扣的是2,000元业绩报酬，不是管理费。剩下的18,000元已确认用于再投资，确认净值2.0000元，新增9,000份。这里核的是费用和再投资明细，不以份额增加证明银行卡的实际收款状态；若要核银行卡收款，还需对应资金记录。', true, '逐项核对分红总额、费用种类和金额、净额及再投资份额。')],
      followup: { title: '赎回时还会重复扣这笔费吗？', text: '那后面赎回，这2,000元还会再扣一遍吗？是不是其他费也都不用扣了？', time: '10:09', stage: 'answer', complete: true, needsConfirm: false,
        facts: [fact('同一期间计提规则', '本例合同：已计提业绩报酬不对同一期间重复计提', '仅本例预置合同资料，不是所有产品通用规则。'), gap('后续赎回费用', '未提交赎回，没有实际赎回费或后续业绩报酬结果')],
        reply: '按本例合同，已经计提的这2,000元业绩报酬不会对同一期间重复计提，但不等于以后所有费用都免了。后续是否产生新的业绩报酬、赎回费或其他费用，要看对应期间、持有情况、合同规则和实际交易明细；您目前还没有提交赎回，我不能报一个实际扣费金额或到账净额。'
      }
    },
    {
      id: 'holding-volatility', title: '产品涨了，我为什么还亏？', customer: '波动案例客户', initials: '波', date: '2026-07-10', categories: ['holding', 'nav'],
      purpose: '统一产品与客户收益的区间和成本；核用钱安排，不保证未来回本。',
      basis: '归纳原文中的“我跌了很多”“产品收益不错但位置高”“之后要用钱”的追问。个人持仓与净值为独立Mock。',
      messages: [msg('CUSTOMER', '澄远3号这个月明明涨了约1%，我这笔却亏了3%，是不是收益算错了？', '14:10')],
      items: [item('ISSUE-LOCAL-HOLDING', '产品区间涨幅为何不同于本人收益？', 'SKILL_ACCOUNT_SERVICE', '本人持仓与收益解释', [fact('产品', '澄远3号（虚构演示产品）'), fact('本人成本与份额', '6月26日确认成本100,000元，100,000份'), fact('本人持仓估值', '7月10日净值0.9700元，估值97,000元'), fact('本人持仓收益', '浮动亏损3,000元，成本收益率−3.00%'), fact('7月1日至7月10日净值涨幅', '7月1日净值0.9600→7月10日0.9700，涨幅约+1.04%', '本人从6月26日成本计算；产品从7月1日开始。本例没有追加、分红、赎回及申购费。')], '两组数字的起点不同。本例您6月26日确认的成本是10万元，10万份按7月10日净值0.9700元估值9.7万元，浮动亏损3,000元、约3%。产品该区间约涨1.04%是从7月1日的0.9600元算起，不能直接当作您的持仓收益；先统一区间和成本，不能只凭两组百分比不同就判断收益算错。', true, '用本人份额、成本与同日净值核估值，再解释产品区间收益的不同起点。')],
      followup: { title: '亏损口径与下月用钱怎样安排？', text: '那这3%的亏损已经包含赎回费了吗？我下个月要用钱，继续拿着能回本吗？现在赎回怎么安排？', time: '14:16', stage: 'handoff', complete: false, needsConfirm: true,
        facts: [fact('收益口径', '当前持仓估值与成本之差；没有发起赎回，不含尚未发生的实际赎回扣费'), gap('回本与用钱安排', '未来回本不可保证；具体赎回窗口、费用和到账安排尚需核对')],
        reply: '这3%是当前持仓估值相对成本的浮动亏损，不是赎回后实际到手金额；尚未发生的赎回费不能说已经扣了，下个月回本也无法保证。您明确有用钱时间，我还在核对这只产品的可赎安排、适用费用和预计到账时间，不能先把用钱安排当作已经核实。',
        humanTask: '核对对应产品可赎窗口、费用与预计资金安排',
        humanResult: '仅本案例Mock资料：7月13日至17日可申请赎回，本人100,000份均满足本例可赎条件；适用赎回费率0.10%，按实际确认金额计费，估值不等于实际确认金额；预计确认后3个工作日到钱袋子，银行卡转出另办。没有保证回本或办理赎回。',
        nextFacts: [fact('本期赎回窗口', '2026-07-13—2026-07-17，本人100,000份满足本例可赎条件'), fact('适用费用', '本例赎回费率0.10%，按实际确认金额计费', '未提交赎回，实际确认金额、实扣费用和净额尚未产生；不能以当前估值当实际结果。'), fact('预计资金安排', '确认后3个工作日预计到钱袋子；转到银行卡需另行办理', '仅本例演示规则，预计不等于实际到账；申请到确认周期本例未核，不据此推算具体到账日或保证下个月可用。')],
        nextReply: '按本例核到的资料，7月13日至17日可申请赎回，您这10万份符合本例可赎条件；适用赎回费率0.10%，按实际确认金额计算，不是已经扣过的费用。资金预计确认后3个工作日到钱袋子，银行卡转出需另行办理。未来净值仍会变，不能保证下个月回本；当前9.7万元估值也不是实际赎回到手金额。是否保留或调整由您决定，本次没有替您赎回或转出。'
      }
    }
  ];
  function extendData(data) {
    const next = clone(data);
    for (const definition of definitions) if (!next.cases.some(c => c.id === definition.id)) {
      const { followup, categories, purpose, basis, ...c } = definition;
      c.mode = 'passive'; c.sources = []; c.subtitle = purpose;
      for (const i of c.items) i.skill = definition.id === 'holding-volatility' ? 'SKILL_ACCOUNT_SERVICE' : 'SKILL_TRANSACTION_SERVICE';
      next.cases.push(clone(c));
    }
    return next;
  }
  const definitionFor = id => definitions.find(d => d.id === id);
  function canFollowup(c, i) { const d = definitionFor(c.id); return !!d && i?.id === d.items[0].id && i.round === 0 && i.sentRevision === i.revision && i.status !== 'CLOSED' && !c.busy && !i.compose.trim(); }
  function receiveFollowup(state, caseId) {
    const c = state.cases.find(c => c.id === caseId), i = c?.items.find(i => i.id === c.activeItemId);
    if (!c || !i || !canFollowup(c, i)) throw new Error('先发送当前答复；追问只续接一次，已关闭问题不能继续注入。');
    if (i.compose.trim()) throw new Error('请先处理当前草稿，不能用追问覆盖顾问编辑内容。');
    const f = definitionFor(caseId).followup;
    c.messages.push({ ...msg('CUSTOMER', f.text, f.time), itemId: i.id });
    i.round += 1; i.revision += 1; i.compose = ''; i.awaiting = null;
    i.facts = [...i.facts, ...clone(f.facts)];
    i.title = f.title || i.title; i.reply = f.reply; i.stage = f.stage; i.complete = f.complete;
    i.needsConfirm = f.needsConfirm; i.registered = !f.needsConfirm; i.advisorConfirmed = false;
    i.status = i.registered ? 'READY_TO_REPLY' : null;
    i.replyEvidence = { origin: '独立Mock案例追问答复 · 非模型执行' };
    if (f.humanResult) { i.humanTask = f.humanTask; i.humanResult = f.humanResult; i.nextFacts = clone(f.nextFacts).map(row => ({ ...row, source: '人工回填Mock · 本地预置演示' })); i.nextReply = f.nextReply; }
    i.events.push({ title: '收到模拟客户追问，继续原问题', text: '保留问题身份、上一轮发送记录和已知条件；按本地预置案例整理本轮答复。', kind: 'customer', mock: true, at: new Date().toISOString() });
    return i;
  }
  const api = { definitions, extendData, definitionFor, canFollowup, receiveFollowup };
  root.ServiceInteractionCases = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
