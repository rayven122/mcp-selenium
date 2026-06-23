/**
 * Optional browser compatibility smoke test.
 *
 * Run with:
 *   MCP_SELENIUM_TEST_BROWSER=firefox npm test -- test/browser-compat.test.mjs
 */

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { fixture, getResponseText, McpClient } from './mcp-client.mjs';

const browser = process.env.MCP_SELENIUM_TEST_BROWSER;
const enabled = Boolean(browser);
const chromiumBrowsers = new Set(['chrome', 'edge']);

describe('Browser Compatibility Smoke', {
    skip: !enabled && 'MCP_SELENIUM_TEST_BROWSER not set',
}, () => {
    let client;

    before(async () => {
        client = new McpClient();
        await client.start();
    });

    after(async () => {
        try {
            await client.callTool('close_session');
        } catch {
            /* ignore */
        }
        await client?.stop();
    });

    it(`starts ${browser}, navigates, and reads page content`, async () => {
        const args = chromiumBrowsers.has(browser)
            ? ['--no-sandbox', '--disable-dev-shm-usage']
            : [];

        const start = await client.callTool('start_browser', {
            browser,
            options: { headless: true, arguments: args },
        });
        const startText = getResponseText(start);
        assert.ok(!start.isError, `Expected ${browser} to start, got: ${startText}`);
        assert.ok(
            startText.includes('Browser started'),
            `Expected start confirmation: ${startText}`
        );

        const navigate = await client.callTool('navigate', { url: fixture('locators.html') });
        assert.ok(
            !navigate.isError,
            `Expected navigation to succeed: ${getResponseText(navigate)}`
        );

        const heading = await client.callTool('get_element_text', { by: 'tag', value: 'h1' });
        assert.equal(getResponseText(heading), 'Locator Test Page');
    });
});
