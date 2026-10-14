/* 参赛入口适配；不改事实、业务状态、执行逻辑或原工程存储。 */
(function () {
  'use strict';
  window.COMPETITION_DEMO_STORAGE_KEY = 'gffunds-competition-service-V20261011-service-strategy';
  document.addEventListener('DOMContentLoaded', function () {
    const requested = new URLSearchParams(location.search).get('case');
    const cases = window.ServiceInteractionCases?.extendData(window.SERVICE_DEMO_DATA)?.cases || window.SERVICE_DEMO_DATA?.cases || [];
    if (!cases.some(c => c.id === requested)) return;
    // 数据内的合法ID才参与选择；沿用现有点击处理，不注入客户事实。
    const buttons = Array.from(document.querySelectorAll('[data-case]'));
    buttons.find(button => button.dataset.case === requested)?.click();
  });
})();
