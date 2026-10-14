/* 公开静态Mock：顾问、来源身份和指纹均已替换；不提供原始来源核验或生产审核证明。 */
(function(root) {
  'use strict';
  const data = {
    "date": "2026-10-10",
    "database": "公开演示数据（非数据库）",
    "query": "演示顾问与演示来源的关联，仅用于交互展示",
    "rows": [
      {
        "caseId": "supplement",
        "chatId": "DEMO-SOURCE-001",
        "advisorId": "演示顾问06",
        "date": "2026-08-06",
        "databaseRawSha": "10e1a5b31201819f6cf9b24388cacf2799cb178ac03221fd5f874e0a7fc30cb5",
        "frozenSourceSha": "10e1a5b31201819f6cf9b24388cacf2799cb178ac03221fd5f874e0a7fc30cb5",
        "sourceShaMatches": true
      },
      {
        "caseId": "multi",
        "chatId": "DEMO-SOURCE-002",
        "advisorId": "演示顾问02",
        "date": "2026-06-29",
        "databaseRawSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
        "frozenSourceSha": "971627509a5cbec328c96b9ba623a158d81be3f1c58a2ea72444903676c70069",
        "sourceShaMatches": true
      },
      {
        "caseId": "active-open",
        "chatId": "DEMO-SOURCE-005",
        "advisorId": "演示顾问03",
        "date": "2026-06-16",
        "databaseRawSha": "b990c1149cfb0c64f2129cd3d0d9ac6f0cbf62e08711a003e2fe2ade61f80cb7",
        "frozenSourceSha": "b990c1149cfb0c64f2129cd3d0d9ac6f0cbf62e08711a003e2fe2ade61f80cb7",
        "sourceShaMatches": true
      },
      {
        "caseId": "human",
        "chatId": "DEMO-SOURCE-003",
        "advisorId": "演示顾问05",
        "date": "2026-04-02",
        "databaseRawSha": "d661c4b02b3512b7cf65811102f05fe0c9fceba3ba8e617c16861715d78c36ea",
        "frozenSourceSha": "d661c4b02b3512b7cf65811102f05fe0c9fceba3ba8e617c16861715d78c36ea",
        "sourceShaMatches": true
      },
      {
        "caseId": "active-product",
        "chatId": "DEMO-SOURCE-004",
        "advisorId": "演示顾问01",
        "date": "2026-06-11",
        "databaseRawSha": "9b1398e834e2c65267fc76bf5eba8d68daa07567d88487ac64400d3d6e89ffd1",
        "frozenSourceSha": "9b1398e834e2c65267fc76bf5eba8d68daa07567d88487ac64400d3d6e89ffd1",
        "sourceShaMatches": true
      },
      {
        "caseId": "confirmation",
        "chatId": "DEMO-SOURCE-006",
        "advisorId": "演示顾问04",
        "date": "2026-01-23",
        "databaseRawSha": "8aae9c2dc1d4f3a30bcc121c9dd6511deaa3157d7bf4b2cfb98eeceff8eb5818",
        "frozenSourceSha": "8aae9c2dc1d4f3a30bcc121c9dd6511deaa3157d7bf4b2cfb98eeceff8eb5818",
        "sourceShaMatches": true
      }
    ]
  };
  root.STRATEGY_ATTRIBUTION = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof globalThis !== 'undefined' ? globalThis : window);
