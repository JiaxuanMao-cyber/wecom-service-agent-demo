// MiniMax实际改写＋Codex表达校订；原型展示资产，不是执行金标或查询链通过率。
window.ADVISOR_COPY_DRAFTS = {
  "actualModel": "MiniMax-M3.1-Flash-Preview",
  "sourcePath": "公开演示资产",
  "inputSha": "a4bca65dfe2ec0e04ec1bef924823c672d28c37c90b3b086bf93382a1f3bf19a",
  "editor": "Codex",
  "drafts": [
    {
      "key": "ISSUE-DEMO-01:initial",
      "text": "这笔150万元申购已确认成功，是景明A，确认金额也是150万元，确认日是1月21日。",
      "sha": "dbc34638d214f9b04ebaade4d2cc3dc4d12b0d18939882127ad0818c1ad87362",
      "generatedText": "这笔150万元申购已确认成功。广发景明中短债A（006591）的确认金额为150万元，确认日为2026年1月21日。",
      "generatedSha": "ad76e0d3e5ea67b9d1a63b75398c5cbef4d4a8120527b5476c3694bca7bceaf9"
    },
    {
      "key": "ISSUE-DEMO-02:initial",
      "text": "查到两笔10万元的申购：景明A现在不能撤，小盘成长A可以撤。您问的是哪一笔？",
      "sha": "c02e723c7317b5594f7e3fbf7a257fd3ee3180decdca432f0826d988c6897f7a",
      "generatedText": "目前查到两笔当日申购，都是10万元：景明A不可撤，小盘成长A可撤。您说的是哪一笔？这里只是当前可撤状态。",
      "generatedSha": "a7a63b8e8a9170fdd9c97fdeaf2a5b295eaff1d25dd719a10d59aa42ef7f0c73"
    },
    {
      "key": "ISSUE-DEMO-02:followup",
      "text": "景明A这笔10万元申购现在不能撤，交易目前还是未确认状态。",
      "sha": "0aeb67addc84bd07ab30b873f6ba2a88eb07c9a13af8f4c5a78a2ddb50a3ad4c",
      "generatedText": "景明A（006591）这笔10万元申购目前不能撤销。它虽然还未确认，但当前显示不可撤；本次仅核实状态，未代办撤单。",
      "generatedSha": "ac916106e9877ff7d16e622df895e097ac6c64a73ab6945c6ca318b832e2de7f"
    },
    {
      "key": "ISSUE-DEMO-03:initial",
      "text": "这笔定投显示确认失败，还要核实扣款时的可用余额和具体失败原因。现在钱袋子有余额，还不足以判断当时为什么失败。",
      "sha": "fe7c4ca23d97d352fe7fcf330ffc55725356710b9b990fc21a38e589f5954bf6",
      "generatedText": "这笔0.1万元定投显示确认失败。当前没有失败原因和扣款时的可用余额，还不能判断具体原因，需要进一步核实。",
      "generatedSha": "611e1cac148c2653ad5811e9fffafd81aea708e0f6e081b18ac0a41145d4c399"
    },
    {
      "key": "ISSUE-DEMO-03:followup",
      "text": "核实到了，这次发起定投时钱袋子的可用余额不足，所以扣款失败。现在有钱不代表当时余额充足；这次也没有查到重新扣款记录。",
      "sha": "933a0264deff3e5d08c34c63b48c0225094f06b84b85358cca43b0e47da3aadd",
      "generatedText": "这次定投发起时可用余额不足，所以扣款失败。现在有钱不代表当时余额充足；本次没有查到重新扣款记录。",
      "generatedSha": "3a45f4cafa62caf6410f152625df00efbbc427eef17f9baef36e1fe9cb8d2eec"
    },
    {
      "key": "ISSUE-DEMO-04A:initial",
      "text": "广发基金APP就可以，搜索276202能找到这只产品。",
      "sha": "2fa3f042a4017f5c717c5236976d7ebc47bbd425e18f00a1e41bd3428857fc7e",
      "generatedText": "广发磐云臻选1号（276202）可以在广发基金APP购买，搜索产品代码即可找到。",
      "generatedSha": "5afdb6add8fa694a589dc661bca638098cdaaf60c9054e7d4505c1ad38e20120"
    },
    {
      "key": "ISSUE-DEMO-04B:initial",
      "text": "本次申购开放期是6月29日到7月3日，首次参与门槛是30万元。能不能提交，还要看您的账户资格、可用资金和页面校验，目前这几项还没核实。",
      "sha": "98e435cdce97bb5d16c42129d9a31755748c2e36789c0fabe5df8eccc46dcc9b",
      "generatedText": "仅看规则，首次参与门槛为30万元，当天的申购期为2026年6月29日至7月3日。您是否符合资格、可用资金是否充足，以及页面能否提交，目前还需核实。",
      "generatedSha": "c978c718217663211d3acff027cd49df08f9de2ba8ce2923536229f895740403"
    },
    {
      "key": "ISSUE-DEMO-04B:followup",
      "text": "已核实，您的账户资格通过，可用资金30万元，页面允许提交申请。能提交还不等于申购成功，最终看交易受理和确认结果。",
      "sha": "9ef6845487edabc911889665ef8e8bc366800bc1702e1339ac50169fae380f79",
      "generatedText": "这次核实到，您的账户资格通过，可用资金为30万元，页面也允许提交，可以在当天对应窗口内申请。最终是否受理及确认，以实际交易结果为准。",
      "generatedSha": "830ad991d967c5a009611bf3a7eb19c64352efe7363ac00a47a2efd4162f853e"
    },
    {
      "key": "ISSUE-DEMO-04C:initial",
      "text": "您的预约码目前还没核实到，这条暂时没法准确答您。",
      "sha": "71709b4b819f463896f948251b7e1ba67aff89ad229a73fe0d89bb67af162bae",
      "generatedText": "目前还没核实到您的预约码，暂时无法提供准确结果，需要单独核实。",
      "generatedSha": "2eddcb12e5954da3f612325b537a65fa3349588d11ce4e05e558f746e69c09be"
    },
    {
      "key": "OPPORTUNITY-DEMO-05:initial",
      "text": "寰宇全球精选19号这期募集到6月16日结束。您如果想了解，我把产品资料和参与规则发您看看。",
      "sha": "9fd7d8a22fdc1df8dc7e494ea4a8e109b9272e624f025560c80d084be35da0ab",
      "generatedText": "广发寰宇全球精选19号（276210）本期于2026年6月16日结束募集。您如果还想了解，我先把产品资料和参与规则发您确认。",
      "generatedSha": "c14552871e86ce835834caacb5bee5a3b9cff510669233132c5bc66109f3f70f"
    },
    {
      "key": "OPPORTUNITY-DEMO-06:initial",
      "text": "这份苍穹创裕3号资料里，投资范围是境内混合资产，投资经理是演示经理01。您更关注持有期限，还是资金使用安排？",
      "sha": "541f926b48e13128266bd77355d79b277493d5635cd47a41d4d6cd265de0d883",
      "generatedText": "示例配置3号（980009）由演示经理01管理，投资范围为境内混合资产。您更关注持有期限，还是资金使用安排？",
      "generatedSha": "e01e6ddbe2473676840537c6569db0289b9d4b9885a4e91a8d1b6bc9a773927e"
    }
  ]
};
