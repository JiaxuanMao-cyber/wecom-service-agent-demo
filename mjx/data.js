window.SERVICE_DEMO_DATA = {
  "version": "2026-10-08",
  "sourceKind": "HISTORY_DERIVED_SCENARIO_REWRITE_WITH_MOCK_INTERACTION",
  "cases": [
    {
      "id": "confirmation",
      "mode": "passive",
      "title": "150万元申购成功了吗",
      "subtitle": "本人交易 · 直接答复",
      "customer": "客户甲",
      "initials": "甲",
      "date": "2026-01-23",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-006",
          "date": "2026-01-23",
          "messageIndex": 2,
          "sourceSha": "8aae9c2dc1d4f3a30bcc121c9dd6511deaa3157d7bf4b2cfb98eeceff8eb5818",
          "messageSha": "a12398d5fc8a8d396a064d21f831e5831dd4355ef642453380c9d0a403decfb6",
          "text": "演示客户：我想了解150万元申购成功了吗，请帮我核实相关信息。",
          "role": "CUSTOMER",
          "time": "14:04",
          "redactions": [],
          "goldId": "TRADE-EXP-CONFIRM-150-04",
          "goldSourceSha": "8aae9c2dc1d4f3a30bcc121c9dd6511deaa3157d7bf4b2cfb98eeceff8eb5818"
        }
      ],
      "messages": [
        {
          "role": "CUSTOMER",
          "text": "演示客户：我想了解150万元申购成功了吗，请帮我核实相关信息。",
          "time": "14:04",
          "origin": "场景改写"
        }
      ],
      "items": [
        {
          "id": "ISSUE-DEMO-01",
          "title": "核实150万元申购是否成功",
          "skill": "SKILL_TRANSACTION_SERVICE",
          "skillName": "交易咨询与处理",
          "kind": "issue",
          "complete": true,
          "needsConfirm": false,
          "stage": "answer",
          "strategy": "先定位同笔，再解释确认结果",
          "reply": "根据本次提供的交易记录，广发景明中短债A（006591）这笔150万元申购已确认成功。申请金额和确认金额均为150万元，确认状态为“成功”，确认日期为2026年1月21日。",
          "replyEvidence": {
            "text": "根据本次提供的交易记录，广发景明中短债A（006591）这笔150万元申购已确认成功。申请金额和确认金额均为150万元，确认状态为“成功”，确认日期为2026年1月21日。",
            "origin": "历史模型输出",
            "model": "MiniMax-M3.1-Flash-Preview",
            "sourcePath": "公开演示资产",
            "sha": "7fffc7052691f2444319930eb844d4988a6a3e1b6b1d7888fc3eba3716480c41"
          },
          "facts": [
            {
              "label": "产品",
              "value": "广发景明中短债A · 006591",
              "field": "fundCode / fundName",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "申请金额",
              "value": "150万元",
              "field": "requestBalance = 1500000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认金额",
              "value": "150万元",
              "field": "confirmBalance = 1500000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认状态",
              "value": "确认成功",
              "field": "confirmState = 1",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认日",
              "value": "2026年1月21日",
              "field": "confirmDate = 20260121",
              "source": "接口返回 · Mock",
              "note": ""
            }
          ],
          "scope": "模拟授权账户 · 2026年1月17日至23日 · 同笔交易",
          "tools": [
            "account_transaction_status_query",
            "account_transaction_detail_query"
          ],
          "raw": {
            "delegateNo": "MOCK-EXP-04",
            "businType": "022",
            "requestType": "1",
            "fundCode": "006591",
            "fundName": "广发景明中短债A",
            "requestDate": "20260120",
            "acceptDate": "20260120103000",
            "shareType": "A",
            "moneyType": "156",
            "confirmState": "1",
            "requestBalance": "1500000",
            "requestShare": null,
            "confirmBalance": "1500000",
            "confirmShare": "1500000",
            "confirmFee": "0",
            "confirmDate": "20260121",
            "dayNav": "1.0000",
            "cancelable": false,
            "protocol": null
          },
          "steps": [
            {
              "title": "识别客户问题",
              "text": "客户要核实此前150万元申购的确认结果。",
              "kind": "model"
            },
            {
              "title": "定位同笔交易",
              "text": "以授权账户、近期范围和150万元线索匹配；金额仅作定位条件。",
              "kind": "system"
            },
            {
              "title": "查询交易详情",
              "text": "Mock详情显示申请与确认金额一致，确认状态为成功。",
              "kind": "tool"
            },
            {
              "title": "生成答复",
              "text": "只回答确认结果，不把确认成功推成资金到账。",
              "kind": "model"
            }
          ],
          "boundary": "确认成功不代表付款或赎回到账。本例沿用已保存的MiniMax给定事实答复，不宣称查询链已经在线运行。"
        }
      ]
    },
    {
      "id": "supplement",
      "mode": "passive",
      "title": "未确认的申购能撤吗",
      "subtitle": "两笔候选 · 补充后续接",
      "customer": "客户乙",
      "initials": "乙",
      "date": "2026-08-06",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-001",
          "date": "2026-08-06",
          "messageIndex": 1,
          "sourceSha": "10e1a5b31201819f6cf9b24388cacf2799cb178ac03221fd5f874e0a7fc30cb5",
          "messageSha": "f0d8b469239709c68d986f7a42a132765f0fe9601d9551edc5e34b69d33e9886",
          "text": "演示客户：我想了解未确认的申购能撤吗，请帮我核实相关信息。",
          "role": "CUSTOMER",
          "time": "19:44",
          "redactions": [],
          "goldId": "TRADE-EXP-CANCELABLE-03",
          "goldSourceSha": "10e1a5b31201819f6cf9b24388cacf2799cb178ac03221fd5f874e0a7fc30cb5"
        }
      ],
      "messages": [
        {
          "role": "CUSTOMER",
          "text": "演示客户：我想了解未确认的申购能撤吗，请帮我核实相关信息。",
          "time": "19:44",
          "origin": "场景改写"
        }
      ],
      "supplement": "我说的是景明A那笔申购申请，想查现在能不能撤，不是请您代办撤单。",
      "items": [
        {
          "id": "ISSUE-DEMO-02",
          "title": "核实这笔申购当前能否撤单",
          "skill": "SKILL_TRANSACTION_SERVICE",
          "skillName": "交易咨询与处理",
          "kind": "issue",
          "complete": false,
          "needsConfirm": false,
          "stage": "ask",
          "strategy": "多笔先确认目标，不重复建问题",
          "reply": "查到两笔当日申购，都是10万元：景明A目前不可撤，小盘成长A目前可撤。您问的是哪一笔？这里查询的是当前可撤状态，不代表已经办理撤单。",
          "replyEvidence": {
            "text": "按本次提供的模拟核验结果，有两笔当日申购目前均尚未最终确认：\n1. 广发景明中短债A（006591），申请金额10万元：当前不可撤销；\n2. 广发小盘成长A（162703），申请金额10万元：当前可撤销。\n能否撤销须以对应交易的当前可撤标志为准，不能仅凭“未确认”判断；“当前可撤销”也不代表已经撤销。请确认您问的是哪只基金。",
            "origin": "演示整理 · 参考历史模型输出",
            "model": "MiniMax-M3.1-Flash-Preview",
            "sourcePath": "公开演示资产",
            "sha": "1c4e40ed6a10e330fd6dc3c441893bad1db0ad64d898a653618ae02e1ed86e0f"
          },
          "facts": [
            {
              "label": "候选一",
              "value": "广发景明中短债A · 10万元",
              "field": "006591 / requestBalance = 100000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "候选二",
              "value": "广发小盘成长A · 10万元",
              "field": "162703 / requestBalance = 100000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认情况",
              "value": "两笔均未确认",
              "field": "confirmState = 9",
              "source": "接口返回 · Mock",
              "note": ""
            }
          ],
          "scope": "模拟授权账户 · 2026年8月6日 · 两笔候选",
          "tools": [
            "account_transaction_status_query",
            "account_transaction_detail_query"
          ],
          "raw": [
            {
              "delegateNo": "MOCK-EXP-03",
              "businType": "022",
              "requestType": "1",
              "fundCode": "006591",
              "fundName": "广发景明中短债A",
              "requestDate": "20260806",
              "acceptDate": "20260806143000",
              "shareType": "A",
              "moneyType": "156",
              "confirmState": "9",
              "requestBalance": "100000",
              "requestShare": null,
              "confirmBalance": null,
              "confirmShare": null,
              "confirmFee": null,
              "confirmDate": null,
              "dayNav": null,
              "cancelable": false,
              "protocol": null
            },
            {
              "delegateNo": "MOCK-EXP-03-OTHER",
              "businType": "022",
              "requestType": "1",
              "fundCode": "162703",
              "fundName": "广发小盘成长A",
              "requestDate": "20260806",
              "acceptDate": "20260806143000",
              "shareType": "A",
              "moneyType": "156",
              "confirmState": "9",
              "requestBalance": "100000",
              "requestShare": null,
              "confirmBalance": null,
              "confirmShare": null,
              "confirmFee": null,
              "confirmDate": null,
              "dayNav": null,
              "cancelable": true,
              "protocol": null
            }
          ],
          "nextReply": "景明A（基金代码006591）这笔申购目前不能撤销。该笔交易当前显示为尚未最终确认，但是否可撤销不能仅凭“未确认”判断；同笔交易当前的可撤标志为不可撤销。本次仅为您核实状态，未代办撤单。",
          "nextReplyEvidence": {
            "text": "景明A（基金代码006591）这笔申购目前不能撤销。该笔交易当前显示为尚未最终确认，但是否可撤销不能仅凭“未确认”判断；同笔交易当前的可撤标志为不可撤销。本次仅为您核实状态，未代办撤单。",
            "origin": "历史模型输出",
            "model": "MiniMax-M3.1-Flash-Preview",
            "sourcePath": "公开演示资产",
            "sha": "364742ba57ce8cb55ac2dbc414dc796ebed8ccaf41acf98f4367d1939805f5f1"
          },
          "nextFacts": [
            {
              "label": "目标交易",
              "value": "广发景明中短债A · 006591",
              "field": "fundCode",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "申请金额",
              "value": "10万元",
              "field": "requestBalance = 100000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认状态",
              "value": "未确认",
              "field": "confirmState = 9",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "当前可撤",
              "value": "不可撤单",
              "field": "cancelable = false",
              "source": "接口返回 · Mock",
              "note": ""
            }
          ],
          "steps": [
            {
              "title": "识别查询诉求",
              "text": "客户查询当前可撤状态，不是要求代办撤单。",
              "kind": "model"
            },
            {
              "title": "找到两笔候选",
              "text": "两笔产品不同，不能取第一笔代替客户选择。",
              "kind": "tool"
            },
            {
              "title": "生成必要补问",
              "text": "列出区别，等待客户明确目标。",
              "kind": "model"
            }
          ],
          "boundary": "“未确认”本身不能证明可撤。补充消息为原金标模拟续接，不是历史客户真实回复。"
        }
      ]
    },
    {
      "id": "human",
      "mode": "passive",
      "title": "钱袋子有钱，定投为何失败",
      "subtitle": "证据缺口 · 协同核实",
      "customer": "客户丙",
      "initials": "丙",
      "date": "2026-04-02",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-003",
          "date": "2026-04-02",
          "messageIndex": 1,
          "sourceSha": "d661c4b02b3512b7cf65811102f05fe0c9fceba3ba8e617c16861715d78c36ea",
          "messageSha": "eafced23aca2b5dfd684e51b19cee5f08ed35f9363387fd8a2e03d10c1fffc19",
          "text": "演示客户：我想了解钱袋子有钱，定投为何失败，请帮我核实相关信息。",
          "role": "CUSTOMER",
          "time": "14:37",
          "redactions": [],
          "goldId": "TRADE-REAL-20-18",
          "goldSourceSha": "d661c4b02b3512b7cf65811102f05fe0c9fceba3ba8e617c16861715d78c36ea"
        }
      ],
      "messages": [
        {
          "role": "CUSTOMER",
          "text": "钱袋子里有钱，为什么定投扣款失败",
          "time": "14:37",
          "origin": "场景改写 · 称谓脱敏"
        }
      ],
      "items": [
        {
          "id": "ISSUE-DEMO-03",
          "title": "核实定投失败原因",
          "skill": "SKILL_TRANSACTION_SERVICE",
          "skillName": "交易咨询与处理",
          "kind": "issue",
          "complete": false,
          "needsConfirm": true,
          "stage": "handoff",
          "strategy": "保留已知事实，协同核实具体缺口",
          "reply": "这笔定投记录显示确认失败。但当前还没有扣款时的可用余额和失败原因，不能仅凭现在钱袋子的余额判断原因，需要进一步核实这两项。",
          "replyEvidence": {
            "origin": "演示草稿 · 人工整理",
            "model": null
          },
          "facts": [
            {
              "label": "交易类型",
              "value": "定投 · 广发景明中短债A",
              "field": "businType = 039 / fundCode = 006591",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "申请金额",
              "value": "0.1万元",
              "field": "requestBalance = 1000",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "确认状态",
              "value": "确认失败",
              "field": "confirmState = 0",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "失败原因",
              "value": "接口未提供",
              "field": "当前详情无原因字段",
              "source": "事实缺口",
              "note": ""
            }
          ],
          "scope": "模拟授权账户 · 2026年4月2日 · 同笔定投",
          "tools": [
            "account_transaction_status_query",
            "account_transaction_detail_query"
          ],
          "raw": {
            "delegateNo": "MOCK-NEW-18",
            "businType": "039",
            "requestType": "1",
            "fundCode": "006591",
            "fundName": "广发景明中短债A",
            "requestDate": "20260402",
            "acceptDate": "20260402103000",
            "shareType": "A",
            "moneyType": "156",
            "confirmState": "0",
            "requestBalance": "1000",
            "requestShare": null,
            "confirmBalance": null,
            "confirmShare": null,
            "confirmFee": null,
            "confirmDate": null,
            "dayNav": null,
            "cancelable": false,
            "protocol": "MOCK-NEW-P18"
          },
          "nextReply": "这次核实到，定投发起时钱袋子的可用余额不足，因此当次扣款没有成功。您现在看到的余额不代表当时的可用余额。本次核查没有查到重新扣款记录，不能把它当作已经补扣成功。",
          "humanResult": "模拟人工核查：当次扣款发起时可用余额不足；随后余额变化不改变当次结果；未查到重新扣款记录。",
          "nextFacts": [
            {
              "label": "扣款失败原因",
              "value": "发起时可用余额不足",
              "field": "人工核实结果",
              "source": "人工回填 · Mock",
              "note": ""
            },
            {
              "label": "是否重新扣款",
              "value": "核查范围内未发现记录",
              "field": "人工核查范围",
              "source": "人工回填 · Mock",
              "note": "不等于永远不会重试"
            }
          ],
          "steps": [
            {
              "title": "核实当前交易",
              "text": "查询了同笔定投，但确认失败状态不能替代扣款失败原因。",
              "kind": "tool"
            },
            {
              "title": "识别证据缺口",
              "text": "需要扣款时可用余额和支付失败原因。",
              "kind": "model"
            },
            {
              "title": "建议协同核查",
              "text": "顾问确认登记后才能发起协同；回执前不预写人工处理人。",
              "kind": "system"
            }
          ],
          "boundary": "新增人工结果只是交互演示夹具，不是原金标新增通过节点，也不是真实生产处理结果。"
        }
      ]
    },
    {
      "id": "multi",
      "mode": "passive",
      "title": "怎么买、今天能买、预约码",
      "subtitle": "真实同会话 · 多问题独立处理",
      "customer": "客户丁",
      "initials": "丁",
      "date": "2026-06-29",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-002",
          "date": "2026-06-29",
          "messageIndex": 1,
          "sourceSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
          "messageSha": "90e48ddefefe53131426d2453d7716fec312b8a82495d4a7db397207184382ea",
          "text": "演示客户：我想了解怎么买、今天能买、预约码，请帮我核实相关信息。",
          "role": "CUSTOMER",
          "time": "11:47",
          "redactions": []
        },
        {
          "chatId": "DEMO-SOURCE-002",
          "date": "2026-06-29",
          "messageIndex": 2,
          "sourceSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
          "messageSha": "da8dfc07412e848cac4ff320df99cb6a90e13855182ddc0cd1d0b6b785a0e7aa",
          "text": "演示客户：我想了解怎么买、今天能买、预约码，请帮我核实相关信息。",
          "role": "CUSTOMER",
          "time": "11:48",
          "redactions": []
        },
        {
          "chatId": "DEMO-SOURCE-002",
          "date": "2026-06-29",
          "messageIndex": 3,
          "sourceSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
          "messageSha": "294ee412e84d8794ff5441f28a23fe51e73d0662189ec597b83a0e9eb4e77b5c",
          "text": "演示顾问：我已了解这项需要，会先核对相关事实和可办理的范围。",
          "role": "ADVISOR",
          "time": "11:48",
          "redactions": []
        },
        {
          "chatId": "DEMO-SOURCE-002",
          "date": "2026-06-29",
          "messageIndex": 11,
          "sourceSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
          "messageSha": "77e70a532ed44b8950e215ac819839e581045eb3a41d66589e1ccd410a40fc0b",
          "text": "演示客户：我已经找到购买入口，请帮我核对接下来的要求。",
          "role": "CUSTOMER",
          "time": "12:07",
          "redactions": []
        }
      ],
      "messages": [
        {
          "role": "CUSTOMER",
          "text": "演示客户：我想了解怎么买、今天能买、预约码，请帮我核实相关信息。",
          "time": "11:47",
          "origin": "场景改写"
        },
        {
          "role": "CUSTOMER",
          "text": "演示客户：我想了解怎么买、今天能买、预约码，请帮我核实相关信息。",
          "time": "11:48",
          "origin": "场景改写"
        }
      ],
      "extraQuestion": {
        "text": "演示客户：我已经找到购买入口，请帮我核对接下来的要求。",
        "origin": "历史场景后续消息 · 演示注入",
        "time": "12:07"
      },
      "items": [
        {
          "id": "ISSUE-DEMO-04A",
          "title": "在哪个APP购买276202",
          "skill": "SKILL_PRODUCT_INFORMATION",
          "skillName": "产品信息与规则",
          "kind": "issue",
          "complete": true,
          "needsConfirm": false,
          "stage": "answer",
          "strategy": "按当前问题给出明确购买入口",
          "reply": "这只产品可以在广发基金APP查看，搜索产品代码276202即可找到。这里回答的是购买入口，不代表您的账户已经满足办理条件。",
          "replyEvidence": {
            "origin": "演示草稿 · 基于历史顾问答复",
            "model": null
          },
          "facts": [
            {
              "label": "产品",
              "value": "广发磐云臻选1号 · 276202",
              "field": "FUND_CODE",
              "source": "历史场景标注",
              "note": ""
            },
            {
              "label": "购买入口",
              "value": "广发基金APP",
              "field": "同会话顾问原文：演示顾问：我已了解这项需要，会先核对相关事实和可办理的范围。",
              "source": "历史顾问答复",
              "note": ""
            }
          ],
          "scope": "2026年6月29日历史回放 · 仅说明入口",
          "tools": [],
          "raw": {
            "source": "HISTORICAL_ADVISOR_REPLY_NOT_LIVE_TOOL",
            "fundCode": "276202",
            "note": "历史答复只适用于该回放，不发布为当前办理指引。"
          },
          "steps": [
            {
              "title": "拆分独立问题",
              "text": "购买入口与当日参与条件是两个目标。",
              "kind": "model"
            },
            {
              "title": "核对同会话答复",
              "text": "历史顾问已明确广发基金APP入口。",
              "kind": "system"
            },
            {
              "title": "生成入口说明",
              "text": "不把找到产品等同成功购买。",
              "kind": "model"
            }
          ],
          "boundary": "购买入口来自同会话历史答复，不冒充MCP返回；没有新增交易操作指引接口。"
        },
        {
          "id": "ISSUE-DEMO-04B",
          "title": "今天凑够30万元能否参与",
          "skill": "SKILL_TRANSACTION_SERVICE",
          "skillName": "交易咨询与处理",
          "kind": "issue",
          "complete": false,
          "needsConfirm": true,
          "stage": "handoff",
          "strategy": "规则先答，账户资格缺口保留",
          "reply": "本次查询显示产品处于可申购日期范围，首次参与门槛为30万元。但能否在今天提交，还需要核对您账户的可用资金、参与资格以及页面当时的校验结果，不能只凭凑够30万元就保证可以办理。",
          "replyEvidence": {
            "origin": "演示草稿 · Mock规则事实",
            "model": null
          },
          "facts": [
            {
              "label": "申购日期",
              "value": "2026年6月29日至7月3日",
              "field": "allotTimeInfo.thisbegindate / thisenddate",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "首次参与门槛",
              "value": "30万元",
              "field": "specialLimitInfo.startAmount = 300000",
              "source": "接口返回 · Mock",
              "note": "演示假定源单位为元，真实接口单位仍须联调"
            },
            {
              "label": "本人资格及资金",
              "value": "未取得核实结果",
              "field": "不在本次规则返回中",
              "source": "事实缺口",
              "note": ""
            }
          ],
          "scope": "历史回放时点2026年6月29日 · 产品规则，不是本人获配",
          "tools": [
            "open_window_query",
            "participation_rule_query"
          ],
          "raw": {
            "fundInfo": {
              "fundCode": "276202"
            },
            "specialLimitInfo": {
              "fundcode": "276202",
              "startAmount": "300000"
            },
            "specialFundTradeTimeInfo": {
              "allotTimeInfo": {
                "thisbegindate": "2026-06-29",
                "thisenddate": "2026-07-03"
              }
            }
          },
          "humanTask": "核对参与资格、可用资金和页面提交条件",
          "humanResult": "模拟人工核实：回放当日账户资格通过，可用资金30万元，渠道页面校验允许提交；不证明申购已经受理或确认。",
          "nextReply": "这次核实到，您的账户资格、可用资金和页面校验均符合本次提交条件，可以在当天对应窗口内提交申请。这里只确认提交条件；是否最终受理和确认，仍以实际交易结果为准。",
          "nextFacts": [
            {
              "label": "本人资格",
              "value": "回放时点核查通过",
              "field": "人工核查结果",
              "source": "人工回填 · Mock",
              "note": ""
            },
            {
              "label": "可用资金",
              "value": "30万元",
              "field": "人工核查时点",
              "source": "人工回填 · Mock",
              "note": ""
            },
            {
              "label": "页面提交条件",
              "value": "当前校验允许提交",
              "field": "人工核查结果",
              "source": "人工回填 · Mock",
              "note": "不证明实际申请已经受理或确认"
            }
          ],
          "steps": [
            {
              "title": "识别参与条件咨询",
              "text": "没有把客户询问直接识别成生产故障。",
              "kind": "model"
            },
            {
              "title": "查询产品规则",
              "text": "依次核对产品代码、日期和门槛。",
              "kind": "tool"
            },
            {
              "title": "保留账户证据缺口",
              "text": "产品规则不证明本人资金可用或资格通过。",
              "kind": "model"
            }
          ],
          "boundary": "规则与人工补充均为新增演示Mock，不是原客户真实数据或正式新增金标。没有扩展MCP合同。"
        }
      ],
      "extraItem": {
        "id": "ISSUE-DEMO-04C",
        "title": "核实本人预约码",
        "skill": "SKILL_TRANSACTION_SERVICE",
        "skillName": "交易咨询与处理",
        "kind": "issue",
        "complete": false,
        "needsConfirm": true,
        "stage": "handoff",
        "strategy": "本人数据无来源时明确缺口",
        "reply": "目前没有查到可用于核实您本人预约码的接口结果。产品预约规则不能代替本人预约码，需要单独核实。",
        "replyEvidence": {
          "origin": "演示草稿 · 无本人预约码来源",
          "model": null
        },
        "facts": [
          {
            "label": "客户所问",
            "value": "本人预约码",
            "field": "历史场景消息#11",
            "source": "场景改写",
            "note": ""
          },
          {
            "label": "本人预约码结果",
            "value": "无可用来源",
            "field": "未调用不等价规则接口",
            "source": "事实缺口",
            "note": ""
          }
        ],
        "scope": "同一历史会话的新诉求 · 不借用其他问题事实",
        "tools": [],
        "raw": {
          "note": "不伪造本人预约码，不调用已暂缓来源。"
        },
        "steps": [
          {
            "title": "收到新问题",
            "text": "这是新的本人预约码诉求，不是前两个问题的重复。",
            "kind": "model"
          },
          {
            "title": "确认能力边界",
            "text": "预约规则接口不能查询本人预约码。",
            "kind": "system"
          },
          {
            "title": "等待顾问确认协同",
            "text": "按咨询证据缺口处理，非预约生产故障。",
            "kind": "system"
          }
        ],
        "boundary": "不能把预约咨询自动归为生产故障。本例只展示待核实，不构造真实预约码。"
      }
    },
    {
      "id": "active-open",
      "mode": "active",
      "title": "开放窗口到期提醒",
      "subtitle": "主动服务 · 不等于产品推荐",
      "customer": "客户戊",
      "initials": "戊",
      "date": "2026-06-16",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-005",
          "date": "2026-06-16",
          "messageIndex": 1,
          "sourceSha": "b990c1149cfb0c64f2129cd3d0d9ac6f0cbf62e08711a003e2fe2ade61f80cb7",
          "messageSha": "08dda9ab922e309d47e9283edd4f256f62d3d6bfb177b88912485852c21fdf79",
          "text": "演示顾问：我已了解这项需要，会先核对相关事实和可办理的范围。",
          "role": "ADVISOR",
          "time": "09:31",
          "redactions": [
            [
              "许总您好，",
              "您好，"
            ]
          ]
        }
      ],
      "messages": [
        {
          "role": "ADVISOR",
          "text": "演示顾问：我已了解这项需要，会先核对相关事实和可办理的范围。",
          "time": "09:31",
          "origin": "真实顾问历史话术 · 称谓脱敏"
        }
      ],
      "items": [
        {
          "id": "OPPORTUNITY-DEMO-05",
          "title": "提醒客户核对募集安排",
          "skill": "SKILL_TRANSACTION_SERVICE",
          "skillName": "交易咨询与处理",
          "kind": "opportunity",
          "complete": false,
          "needsConfirm": true,
          "stage": "outreach",
          "strategy": "按开放时点提供信息，不催促下单",
          "reply": "广发寰宇全球精选19号今天结束募集。您如果还想了解，我可以先把产品资料和参与规则发您确认；是否参与，还是结合您的需求和账户条件来判断。",
          "replyEvidence": {
            "origin": "演示草稿 · 历史时点回放",
            "model": null
          },
          "facts": [
            {
              "label": "产品",
              "value": "广发寰宇全球精选19号（QDII）· 276210",
              "field": "fundInfo.fundCode / fundName",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "本期结束日",
              "value": "2026年6月16日",
              "field": "allotTimeInfo.thisenddate",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "历史提醒时点",
              "value": "顾问原文提到当日15:00",
              "field": "消息#1",
              "source": "历史场景顾问话术",
              "note": "时间点不是当前MCP源字段，不当实时截止规则"
            }
          ],
          "scope": "2026年6月16日历史回放 · 不是今天仍可认购",
          "tools": [
            "open_window_query"
          ],
          "raw": {
            "fundInfo": {
              "fundCode": "276210",
              "fundName": "广发寰宇全球精选19号（QDII）"
            },
            "specialFundTradeTimeInfo": {
              "allotTimeInfo": {
                "thisbegindate": "2026-06-04",
                "thisenddate": "2026-06-16"
              }
            }
          },
          "steps": [
            {
              "title": "识别服务时点",
              "text": "来自历史开放期触点，不是客户已提出生产问题。",
              "kind": "system"
            },
            {
              "title": "查询产品日历",
              "text": "Mock核对回放日期和产品对象。",
              "kind": "tool"
            },
            {
              "title": "顾问确认再触达",
              "text": "先确认客户需求、适当性边界和是否重复提醒。",
              "kind": "system"
            }
          ],
          "boundary": "触达成功不代表申购或服务有效；此机会不强制创建生产Issue。"
        }
      ]
    },
    {
      "id": "active-product",
      "mode": "active",
      "title": "新产品信息服务",
      "subtitle": "主动推荐 · 顾问先核对适用性",
      "customer": "客户己",
      "initials": "己",
      "date": "2026-06-11",
      "sources": [
        {
          "chatId": "DEMO-SOURCE-004",
          "date": "2026-06-11",
          "messageIndex": 6,
          "sourceSha": "9b1398e834e2c65267fc76bf5eba8d68daa07567d88487ac64400d3d6e89ffd1",
          "messageSha": "e91afa531b9022567de5588585e04553d44128b3c4909719be438b707116509c",
          "text": "【专户新发】：示例配置3号（代码：980009）\n发售时间：6月4日至6月16日\n产品类型：境内混合\n投资经理：演示经理01\n风险等级：R3\n投资比例：权益0%-80%，固收0%-80%\n费率：管理费1.2%/年\n业绩报酬：超过年化收益率6%提取20%\n参与金额：首次参与40万元，追加1万元起\n开放期：每季度多次开放，成立后的前6个月不接受退出。不接受违约退出\n预警止损线：预警线0.90元，止损线0.85元",
          "role": "ADVISOR",
          "time": "12:09",
          "redactions": []
        }
      ],
      "messages": [
        {
          "role": "ADVISOR",
          "text": "【专户新发】：示例配置3号（代码：980009）\n发售时间：6月4日至6月16日\n产品类型：境内混合\n投资经理：演示经理01",
          "time": "12:09",
          "origin": "演示顾问场景节选"
        }
      ],
      "items": [
        {
          "id": "OPPORTUNITY-DEMO-06",
          "title": "提供产品资料，了解客户需求",
          "skill": "SKILL_PRODUCT_INFORMATION",
          "skillName": "产品信息与规则",
          "kind": "opportunity",
          "complete": false,
          "needsConfirm": true,
          "stage": "outreach",
          "strategy": "先解释产品，再确认需求，不以分数替代适当性",
          "reply": "示例配置3号的产品资料我整理好了，投资范围和风险说明可以先发您看看。您更关注持有期限，还是资金使用安排？我们先把需求确认清楚，再判断是否合适。",
          "replyEvidence": {
            "origin": "演示草稿 · 基于Mock产品资料",
            "model": null
          },
          "facts": [
            {
              "label": "产品",
              "value": "示例配置3号 · 980009",
              "field": "fundInfo.fundCode / fundName",
              "source": "接口返回 · Mock",
              "note": ""
            },
            {
              "label": "投资范围",
              "value": "境内混合资产；权益与固收比例按产品合同约定",
              "field": "specialFundExtInfo.investrange",
              "source": "接口返回 · Mock",
              "note": "投资范围不是客户实际持仓"
            },
            {
              "label": "投资经理",
              "value": "演示经理01",
              "field": "specialFundExtInfo.investmanager",
              "source": "接口返回 · Mock",
              "note": "仅演示历史资料配置，不证明现任或变更原因"
            }
          ],
          "scope": "2026年6月11日历史回放 · 不证明本人的风险适配",
          "tools": [
            "product_profile_query"
          ],
          "raw": {
            "fundInfo": {
              "fundCode": "980009",
              "fundName": "示例配置3号"
            },
            "specialFundExtInfo": {
              "fundcode": "980009",
              "investrange": "境内混合资产；权益与固收比例按产品合同约定",
              "investmanager": "演示经理01"
            }
          },
          "steps": [
            {
              "title": "发现主动服务机会",
              "text": "历史聊天曾出现产品资料推送；预测模型在本Demo仅为建设示意。",
              "kind": "system"
            },
            {
              "title": "核对产品资料",
              "text": "Mock来源只证明产品信息，不证明客户适配或未来收益。",
              "kind": "tool"
            },
            {
              "title": "生成需求沟通建议",
              "text": "不承诺收益，不直接判断应加仓。",
              "kind": "model"
            }
          ],
          "boundary": "申购／流失预测模型未在本轮运行。不能将该演示名单称为模型筛选的模拟客户。"
        }
      ]
    }
  ],
  "experiments": [
    {
      "id": "AB-DEMO-01",
      "strategyId": "S-PRODUCT",
      "title": "产品资料服务：统一告知 vs 按需解释",
      "scenario": "主动推荐",
      "goal": "确认申购率",
      "unit": "冻结分组客户",
      "window": "固定14天观察窗（演示）",
      "model": "同一申购机会模型（示意）",
      "baseline": "A · 现有服务",
      "treatment": "B · AI辅助服务",
      "a": {
        "total": 120,
        "achieved": 18
      },
      "b": {
        "total": 120,
        "achieved": 24
      },
      "mock": true,
      "randomized": true,
      "conclusion": "仅演示统计与审核流程，不能证明真实增量或显著改善。"
    },
    {
      "id": "AB-DEMO-02",
      "strategyId": "S-CONFIRM",
      "title": "交易确认：只报状态 vs 同笔事实解释",
      "scenario": "被动服务",
      "goal": "完整答复率",
      "unit": "同类独立问题",
      "window": "同一观察窗（演示）",
      "model": "模型与接口版本固定",
      "baseline": "A · 只报状态",
      "treatment": "B · 事实与含义",
      "a": {
        "total": 40,
        "achieved": 30
      },
      "b": {
        "total": 40,
        "achieved": 35
      },
      "mock": true,
      "randomized": true,
      "conclusion": "示意数据不能代替既有金标回归或真实服务验证。"
    }
  ],
  "strategies": [
    {
      "id": "S-CONFIRM",
      "title": "先定位同笔，再解释确认",
      "mode": "被动服务",
      "goal": "完整答复率",
      "skill": "交易咨询与处理",
      "status": "待审核",
      "description": "本人交易先查对账户和同笔交易，只解释已取得的确认事实。",
      "method": [
        "使用客户已提供的金额和近期线索定位交易",
        "核对产品、申请与确认字段及单位",
        "回答当前问题，不把确认推成到账"
      ],
      "boundary": "数据缺口保留；多笔不任取第一笔。",
      "sources": [
        "TRADE-EXP-CONFIRM-150-04"
      ],
      "caseId": "confirmation",
      "experimentId": "AB-DEMO-02",
      "evidence": "已保存MiniMax答复 · Mock事实",
      "kind": "知识与服务方法"
    },
    {
      "id": "S-SUPPLEMENT",
      "title": "多笔补充，续接原问题",
      "mode": "被动服务",
      "goal": "完整答复率",
      "skill": "交易咨询与处理",
      "status": "候选",
      "description": "信息足够就答；无法唯一匹配才补问，补充后沿用原问题。",
      "method": [
        "列出可区分候选，不重问已有信息",
        "收到补充后重新查询所指交易",
        "保留原Issue、事实与发送记录"
      ],
      "boundary": "补问正确不是直接解决。",
      "sources": [
        "TRADE-EXP-CANCELABLE-03"
      ],
      "caseId": "supplement",
      "evidence": "模拟客户起点 + 模拟补充",
      "kind": "服务方法"
    },
    {
      "id": "S-HUMAN",
      "title": "具体缺口，协同核实",
      "mode": "被动服务",
      "goal": "问题解决率",
      "skill": "交易咨询与处理",
      "status": "候选",
      "description": "只协同当前无法核实的原因，人工结果回填后答复原问题。",
      "method": [
        "保留已知状态及具体证据缺口",
        "顾问确认登记，发送受理说明",
        "收到绑定结果后生成最终答复"
      ],
      "boundary": "受理、转派和关闭状态都不代表业务已解决。",
      "sources": [
        "TRADE-REAL-20-18"
      ],
      "caseId": "human",
      "evidence": "人工结果为交互演示Mock",
      "kind": "服务方法"
    },
    {
      "id": "S-OPEN",
      "title": "开放时点，按需提醒",
      "mode": "主动服务",
      "goal": "对应提醒任务达成",
      "skill": "交易咨询与处理",
      "status": "候选",
      "description": "核对产品安排后提供信息，不催促办理，不一律以申购衡量提醒。",
      "method": [
        "确认产品、日历与提醒目标",
        "顾问核对客户需求与重复触达",
        "记录客户是否获得所需信息，缺结果时保留未知"
      ],
      "boundary": "提醒本身不等于推荐；触达不等于成交。",
      "sources": [
        "DEMO-SOURCE-005"
      ],
      "caseId": "active-open",
      "evidence": "历史场景提醒 + 模拟事实",
      "kind": "待验证服务方法"
    },
    {
      "id": "S-PRODUCT",
      "title": "先解释产品，再确认需求",
      "mode": "主动推荐",
      "goal": "确认申购率",
      "skill": "产品信息与规则",
      "status": "待审核",
      "description": "先提供有依据的产品资料，确认客户需求和适当性，再观察后续真实结果。",
      "method": [
        "核对产品资料与适用范围",
        "顾问确认需求、风险边界与触达频控",
        "固定模型和名单，比较服务策略的真实申购结果"
      ],
      "boundary": "不能以模型分数代替适当性；演示正差值不证明真实增量。",
      "sources": [
        "DEMO-SOURCE-004"
      ],
      "caseId": "active-product",
      "experimentId": "AB-DEMO-01",
      "evidence": "历史场景案例 + 演示A/B",
      "kind": "待验证经营方法"
    }
  ],
  "stats": {
    "chats": 121996,
    "first_date": "2025-01-01",
    "last_date": "2026-08-23"
  },
  "regression": {
    "source": "output/validation/V20260919/transaction-asset-consultation-20260901/iterations/20260919/product_skill_quality/trade_gold_verification_20261007/business_rules/answer_diagnostic_20_wallet_rules/codex_answer_review.json",
    "model": "MiniMax-M3.1-Flash-Preview",
    "realQuestions": 20,
    "nodes": 22,
    "complete": 10,
    "sufficient": 11,
    "queryTested": false,
    "boundary": "只评给定Mock事实后的答复。未验证完整查询链，不是线上服务解决率。"
  },
  "boundaries": [
    "客户问题及顾问原文来自本地SQLite或冻结来源快照。",
    "交易、产品规则、人工结果、发送回执为Mock，不接真实业务。",
    "A/B客户及结果全部是演示数据，不支持正式策略有效性结论。",
    "部分话术使用已保存MiniMax输出；其余为明确标注的演示草稿，本页不在线调用大模型。",
    "本地审核是交互模拟，不等同独立Codex三角色金标审核。",
    "没有改表结构、Issue状态、领域Skill或MCP请求／应答合同。"
  ],
  "snapshotSha": "7b66765cb3b808737493dd29801a2393c6432595803bbdc38cbeac8a8f1298e5"
};
