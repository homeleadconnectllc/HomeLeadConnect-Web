import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router=readFileSync("src/routes/AppRouter.tsx","utf8");
const boundary=readFileSync("src/routes/PortalAccessBoundary.tsx","utf8");
const nav=readFileSync("src/components/Navbar.tsx","utf8");

test("M5 preserves cross-surface route authority",()=>{for(const s of ["/homeowner-portal","/contractor-portal","/partner-portal","/leads","/jobs","/calendar","/follow-ups","/messages","/hq","/operations","/customer-experience"])assert.ok(router.includes('path="'+s+'"'),"Missing route "+s)});
test("M5 keeps portal boundaries role-scoped",()=>{assert.match(router,/PortalAccessBoundary audience="resident"/);assert.match(router,/PortalAccessBoundary audience="professional"/);assert.match(router,/PortalAccessBoundary audience="partner"/);assert.match(boundary,/access\.homeowner/);assert.match(boundary,/access\.contractor/);assert.match(boundary,/access\.partner/)});
test("M5 keeps role navigation from leaking across audiences",()=>{assert.match(nav,/access\.partner \? "\/partner-portal"/);assert.match(nav,/access\.homeowner/);assert.match(nav,/access\.contractor/)});
