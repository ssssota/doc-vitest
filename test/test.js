import assert from "node:assert";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as process from "node:process";

run();

async function run() {
	await runVitest().catch(console.error);
	const results = await loadTestResults();

	assert(results.numTotalTests === 7, 'Incorrect number of total tests');
	assert(results.numPassedTests === 7, 'Incorrect number of passed tests');
	assert(results.numFailedTests === 0, 'Incorrect number of failed tests');
}

function runVitest() {
	return new Promise((resolve, reject) => {
		const p = spawn("npx", ["vitest", "run"], {
			stdio: "inherit",
			cwd: process.cwd(),
			shell: true,
		});
		p.once("close", resolve);
		p.once("error", reject);
	});
}

async function loadTestResults() {
	const text = await fs.readFile("test-results.json", "utf8");
	/** @type {import("vitest/reporters").JsonTestResults} */
	const json = JSON.parse(text);
	return json;
}
