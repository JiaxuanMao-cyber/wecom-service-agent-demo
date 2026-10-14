/* 企微宿主外观与Demo控制。不是企业微信SDK；不改变问题、事实与执行状态。 */
(function (root) {
  'use strict';
  function opening(escape, pane) {
    return `<div class="wecom-demo-toolbar"><div><button class="wecom-back" data-go="strategies">‹ 策略后台</button><span class="wecom-demo-name">客户服务</span></div><div class="wecom-demo-tools"><span>共性场景改写 · 演示业务结果</span><span>设计依据</span><button data-action="show-data-boundary">数据说明</button><button data-action="show-reset">重置演示</button></div></div>
      <div class="wecom-mobile-switch" aria-label="窄屏演示视图"><button data-wecom-pane="chat" aria-pressed="${pane === 'chat'}">企微聊天</button><button data-wecom-pane="assistant" aria-pressed="${pane === 'assistant'}">服务侧边栏</button></div>
      <section class="wecom-window" aria-label="企业微信客户端交互模拟"><div class="wecom-titlebar"><b>企业微信</b><span>交互演示 · 非实际客户端</span><div class="window-controls" aria-hidden="true"><i>─</i><i>□</i><i>×</i></div></div>`;
  }
  function rail() {
    const icon = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
    return `<aside class="wecom-native-rail" aria-label="企微宿主示意，图标仅外观参考"><div class="wecom-advisor-avatar">顾</div><span class="native-section selected" aria-label="当前是客户会话">${icon('<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3H3V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/>')}</span><div class="native-decoration" aria-hidden="true"><span>${icon('<circle cx="12" cy="8" r="3"/><path d="M5 21v-4c0-4 14-4 14 0v4M4 3h16v18H4Z"/>')}</span><span>${icon('<path d="M4 6h16v15H4ZM8 3v6M16 3v6M4 11h16M8 15h2M14 15h2"/>')}</span><span>${icon('<path d="M6 3h9l4 4v14H6ZM14 3v5h5M9 12h7M9 16h5"/>')}</span><span>${icon('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>')}</span></div><span class="native-bottom-icon" aria-hidden="true">☰</span></aside>`;
  }
  function composerIcons() {
    return '<div class="wecom-input-tools" aria-hidden="true"><span>☺</span><span>✂</span><span>▧</span><span>▱</span><span class="wecom-tool-divider"></span><span>◷</span></div>';
  }
  function closing() {
    return `</section><div class="wecom-demo-footer"><p><span class="boundary-full"><b>演示说明</b>　“使用话术”只填写草稿，发送由顾问确认。业务结果、补充与核查为演示，不向真实客户发送或办理业务。</span><span class="boundary-short">本地演示 · 不真实发送或办理</span></p><button data-action="candidate">演示后台沉淀当前方法 ↗</button></div>`;
  }
  const api = { opening, rail, closing, composerIcons };
  root.WeComDemoShell = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
