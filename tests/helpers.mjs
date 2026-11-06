import vm from "node:vm";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
export async function loadModule(path, stubs, globals = {}) {
  const context = vm.createContext({ console, Date, Buffer, URL, URLSearchParams, Response, process: { env: { ADMIN_EMAIL: 'admin@example.com' } }, ...globals });
  const routeModule = new vm.SourceTextModule(await readFile(new URL(path, import.meta.url), 'utf8'), { context });
  await routeModule.link((name) => {
    assert.ok(name in stubs, `Missing stub: ${name}`);
    const values = stubs[name];
    return new vm.SyntheticModule(Object.keys(values), function () { for (const [key,value] of Object.entries(values)) this.setExport(key,value); }, { context });
  });
  await routeModule.evaluate();
  return routeModule.namespace;
}
