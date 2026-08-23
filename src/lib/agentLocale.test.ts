import assert from "node:assert/strict";
import test from "node:test";
import { detectAgentLocale, getAgentUiCopy, normalizeAgentLocale, resolveAgentLocale } from "./agentLocale.ts";

test("normalizes supported browser locales", () => {
  assert.equal(normalizeAgentLocale("es-MX"), "es-US");
  assert.equal(normalizeAgentLocale("fr-CA"), "fr-FR");
  assert.equal(normalizeAgentLocale("pt-PT"), "pt-BR");
  assert.equal(normalizeAgentLocale("zh-TW"), "zh-CN");
  assert.equal(normalizeAgentLocale("ar-EG"), "ar-SA");
  assert.equal(normalizeAgentLocale("de-DE"), "en-US");
});

test("detects common user message languages before browser fallback", () => {
  assert.equal(detectAgentLocale("Hola, necesito ayuda con mi cita", "en-US"), "es-US");
  assert.equal(detectAgentLocale("Bonjour, merci pour votre aide", "en-US"), "fr-FR");
  assert.equal(detectAgentLocale("Olá, preciso de ajuda com o preço", "en-US"), "pt-BR");
  assert.equal(detectAgentLocale("你好，我需要帮助", "en-US"), "zh-CN");
  assert.equal(detectAgentLocale("مرحبا أحتاج مساعدة", "en-US"), "ar-SA");
  assert.equal(detectAgentLocale("Need help with scheduling", "es-MX"), "es-US");
});

test("explicit locale wins over detection", () => {
  assert.equal(resolveAgentLocale("fr-FR", "Hola", "es-MX"), "fr-FR");
  assert.equal(resolveAgentLocale("auto", "Hola, necesito ayuda", "en-US"), "es-US");
});

test("localized UI copy is available for every supported response locale", () => {
  for (const locale of ["en-US", "es-US", "fr-FR", "pt-BR", "zh-CN", "ar-SA"] as const) {
    const copy = getAgentUiCopy(locale);
    assert.ok(copy.language.length > 0);
    assert.ok(copy.howCanIHelp.length > 0);
    assert.ok(copy.enableVoice.length > 0);
  }
});
