const { Builder, By, Key, until } = require('selenium-webdriver');
const { get } = require('selenium-webdriver/http');

const url = 'http://sdetchallenge.fetch.com/';

async function runTest() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get(url);

    async function clickButtonById(buttonId) {
        const button = await driver.findElement(By.id(buttonId));
        await button.click();
        console.log("Button with ID " + buttonId + " is clicked")
    }

    async function getResult() {
        const resultDiv = await driver.findElement(By.className('result'));
        const resetButton = await resultDiv.findElement(By.id('reset'));
        const resetButtonText = await resetButton.getText();
        console.log("The result button shows: " + resetButtonText);
        return resetButtonText;
    }

    async function fillInBar(inputId, number) {
        const leftInput = await driver.findElement(By.id(inputId));
        await leftInput.sendKeys(number);
    }

    async function getListWeighting() {
        const olElement = await driver.findElement(By.tagName('ol'));

        const liElements = await olElement.findElements(By.tagName('li'));

        const itemList = [];
        for (const liElement of liElements) {
            const itemText = await liElement.getText();
            itemList.push(itemText);
        }
        console.log("The result list shows: ");
        itemList.forEach(item => {
            console.log(item);
        })
        return itemList;
    }

    async function clickBar(n) {
        const xpath = `//button[contains(@id, 'coin_${n}')]`;
        const coinButton = await driver.findElement(By.xpath(xpath));
        await coinButton.click();
    }

    async function binarySearch(){
        let left = 0;
        let right = 8;
        while(left + 1 < right) {
            let mid = Math.floor((right + left) >> 1);
            for(let i = left; i < mid; i++) {
                let inputId = "left_" + i;
                await fillInBar(inputId, i);
            }
            for(let i = mid; i < right; i++){
                let inputId = "right_" + i;
                await fillInBar(inputId, i);
            }
            await clickButtonById('weigh');
            await new Promise(resolve => setTimeout(resolve, 3000));

            await getListWeighting();
            const result = await getResult();
            if(result === "=") {
                return right;
            }else if(result === "<") {
                console.log('the fake is in left');
                if(left + 2 === right) return left;
                right = mid;
            }else if(result === ">") {
                console.log('the fake is in right');
                if(left + 2 === right) return right;
                left = mid;
            }else{
                console.log('No result shown on the result button');
                break;
            }
            const resetButton = await driver.findElement(By.xpath("//button[text()='Reset']"));

            // Click the button
            await resetButton.click();

        }
    }

    let guess = await binarySearch();
    console.log('guess', guess);
    await clickBar(guess);
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    console.log("Alert Window shows: " + alertText);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await driver.quit();
  }
}

runTest();
