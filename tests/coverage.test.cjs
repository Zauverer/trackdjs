const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Read-only TS hook for Node's native test runner; no additional test package.
require.extensions[".ts"] = function(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  });
  module._compile(output.outputText, filename);
};
const { raverHeartProgress, clockProgress } = require("../lib/festival/raver-heart.ts");
const sets = [
  {id:"a",day:"2026-11-14",start:"13:00",end:"14:00",artist:"A",stage:"MAIN STAGE"},
  {id:"b",day:"2026-11-14",start:"13:30",end:"14:30",artist:"B",stage:"A STAGE"},
  {id:"c",day:"2026-11-14",start:"14:30",end:"16:00",artist:"C",stage:"CREAM"},
  {id:"d",day:"2026-11-14",start:"16:00",end:"17:00",artist:"D",stage:"FERAL"},
  {id:"e",day:"2026-11-15",start:"15:00",end:"17:00",artist:"E",stage:"MAIN STAGE"}
];

test("clock: opening=0%, final minute=100%, middle=50%",()=>{
  assert.equal(clockProgress(780,780,1020),0);
  assert.equal(clockProgress(900,780,1020),50);
  assert.equal(clockProgress(1020,780,1020),100);
  assert.equal(clockProgress(500,780,1020),0);
  assert.equal(clockProgress(1500,780,1020),100);
});
test("coverage: no selections = zero",()=>{
  const c=raverHeartProgress(sets,[],"2026-11-14");
  assert.equal(c.startLabel,"13:00");assert.equal(c.endLabel,"17:00");
  assert.equal(c.totalMinutes,240);assert.equal(c.coveredMinutes,0);
  assert.equal(c.percent,0);assert.equal(c.completed,false);
});
test("coverage: overlapping sets never count twice",()=>{
  const c=raverHeartProgress(sets,["a","b"],"2026-11-14");
  assert.equal(c.coveredMinutes,90);
  assert.equal(c.percent,38);
  assert.deepEqual(c.segments,[{start:780,end:870}]);
});
test("coverage: full uninterrupted day is exactly 100%",()=>{
  const c=raverHeartProgress(sets,["a","b","c","d"],"2026-11-14");
  assert.equal(c.coveredMinutes,240);
  assert.equal(c.uncoveredMinutes,0);
  assert.equal(c.percent,100);assert.equal(c.completed,true);
});
test("coverage: a gap prevents 100%",()=>{
  const c=raverHeartProgress(sets,["a","c","d"],"2026-11-14");
  assert.equal(c.coveredMinutes,210);
  assert.equal(c.percent,88);assert.equal(c.gaps.length,1);
  assert.deepEqual(c.gaps[0],{start:840,end:870});
});
test("coverage: selected sets on other day do not contribute",()=>{
  assert.equal(raverHeartProgress(sets,["e"],"2026-11-14").coveredMinutes,0);
});
