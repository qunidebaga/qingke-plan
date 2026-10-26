/* ============================================================
   青稞计划官网 交互脚本
   - hash 路由切换 5 个视图（首页 / 关于 / 帮扶体系 / 合作共建 / 加入我们）
   - 导航激活态、移动端菜单
   - 申请表单：整理填写信息 -> 调起邮箱发送 / 一键复制
   ============================================================ */
(function () {
  "use strict";

  var VIEWS = {
    "#/": "view-home",
    "#/about": "view-about",
    "#/programs": "view-programs",
    "#/partners": "view-partners",
    "#/join": "view-join",
    "#/apply": "view-apply"
  };

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a:not(.nav-cta)[href^='#/']"));
  var views = document.querySelectorAll(".view");

  function currentHash() {
    var h = location.hash || "#/";
    if (!(h in VIEWS)) h = "#/";
    return h;
  }

  function switchView() {
    var target = VIEWS[currentHash()];
    views.forEach(function (v) {
      v.classList.toggle("active", v.id === target);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === currentHash());
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", switchView);
  switchView();

  /* 移动端菜单 */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) nav.classList.remove("open");
    });
  }

  /* ===== 申请表单：整理信息并发送至计划邮箱 ===== */
  var MAIL_TO = "105529978@qq.com";
  var form = document.querySelector("#apply-form");
  var copyBtn = document.querySelector("#copy-info");
  var tip = document.querySelector("#form-success");

  var ROLE_MAP = {
    student: "在校学生创业者",
    graduate: "毕业创业者",
    mentor: "导师 / 专家",
    partner: "合作方（政府 / 高校 / 企业）"
  };

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function collectBody() {
    var lines = [];
    lines.push("【青稞计划】申请 / 合作信息");
    lines.push("提交时间：" + new Date().toLocaleString("zh-CN"));
    lines.push("");
    lines.push("姓名：" + val("f-name"));
    lines.push("联系方式：" + val("f-contact"));
    lines.push("身份类型：" + (ROLE_MAP[val("f-role")] || "未选择"));
    lines.push("学校 / 单位：" + (val("f-org") || "未填写"));
    lines.push("项目名称：" + (val("f-project") || "未填写"));
    lines.push("项目简介 / 合作意向：" + (val("f-brief") || "未填写"));
    return lines.join("\n");
  }

  function showTip(text, isError) {
    if (!tip) return;
    tip.textContent = text;
    tip.style.display = "block";
    if (isError) {
      tip.style.borderColor = "rgba(168, 70, 50, 0.55)";
      tip.style.background = "rgba(168, 70, 50, 0.08)";
      tip.style.color = "#8A3B2C";
    } else {
      tip.style.borderColor = "rgba(92, 107, 52, 0.4)";
      tip.style.background = "rgba(92, 107, 52, 0.12)";
      tip.style.color = "#46522A";
    }
    var top = tip.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  function copyText(text, done) {
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    } else {
      legacy();
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = val("f-name");
      var contact = val("f-contact");
      if (!name || !contact) {
        showTip("请先填写姓名与联系方式，再提交申请。", true);
        return;
      }
      var body = collectBody();
      var subject = "青稞计划申请信息 - " + name;
      var mailto = "mailto:" + MAIL_TO +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
      showTip("申请信息已整理并调起邮箱发送至 " + MAIL_TO + "。若邮件客户端未自动弹出，请点击「复制申请信息」后自行粘贴发送。", false);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var body = collectBody();
      copyText(body, function (ok) {
        showTip(ok ? "申请信息已复制，请打开邮箱粘贴发送至 " + MAIL_TO + "。" : "复制失败，请手动选择文本复制。", !ok);
      });
    });
  }
})();
