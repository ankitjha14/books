const { Builder, By, until } = require('selenium-webdriver');
const { AxeBuilder } = require('@axe-core/webdriverjs');

// Define test cases
const runTests = async () => {
    // Initialize Selenium WebDriver
    const driver = await new Builder().forBrowser('chrome').build();
    
    try {
        // Test case 1: Ensure main-nav is loaded
        await driver.get('https://dequeuniversity.com/demo/mars');
        await driver.wait(until.elementLocated(By.css('#main-nav')), 10000);
        console.log('Test case 1: main-nav is loaded - Passed');

        // Test case 2: Perform accessibility scan
        const axe = new AxeBuilder(driver);
        const results = await axe.analyze();
        if (results.violations.length === 0) {
            console.log('Test case 2: No accessibility violations found - Passed');
        } else {
            console.log('Test case 2: Accessibility violations found - Failed');
            console.log('Violations:');
            console.log(JSON.stringify(results.violations, null, 2));
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Quit the WebDriver session
        await driver.quit();
    }
};

// Run the tests
runTests();
