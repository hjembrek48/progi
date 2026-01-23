const selenium = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const assert = require("assert");
browserDriver = require("geckodriver");
const { Network } = require("selenium-webdriver/bidi/network");

let driver, network;

async function waitAndLocate(seleniumLocator) {
  await driver.wait(selenium.until.elementLocated(seleniumLocator));

  return await driver.findElement(seleniumLocator);
}

async function setup() {
  const options = new firefox.Options().enableBidi();
  let profile = process.env.PROFILE;
  options.setProfile(profile);
  driver = await new selenium.Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();

  network = await Network(driver);

  await driver.manage().setTimeouts({ implicit: 10000 });
}

async function login() {
  await driver.get("http://localhost:3000/");
  await driver.findElement(selenium.By.css(".home_button")).click();

  await new Promise((r) => setTimeout(r, 2000));

  const originalWindow = await driver.getWindowHandle();

  //Check we don't have other windows open already
  assert((await driver.getAllWindowHandles()).length === 1);

  //Click the link which opens in a new window
  await driver
    .findElement(selenium.By.css(".home_button:nth-child(1)"))
    .click();

  //Wait for the new window or tab
  await driver.wait(
    async () => (await driver.getAllWindowHandles()).length === 2,
    10000,
  );

  //Loop through until we find a new window handle
  const windows = await driver.getAllWindowHandles();
  windows.forEach(async (handle) => {
    if (handle !== originalWindow) {
      await driver.switchTo().window(handle);
    }
  });

  await driver
    .findElement(selenium.By.css("li.aZvCDf:nth-child(1) > div:nth-child(1)"))
    .click();

  await driver.switchTo().window(originalWindow);

  await driver.wait(selenium.until.urlIs("http://localhost:3000/"));

  let profileButton = await driver.findElement(
    selenium.By.css("h5:nth-child(2)"),
  );
  let text = await profileButton.getText();
  assert(text == "My Profile", "Login unsuccessfull");

  console.log("Login test successfull");
}

async function addGame(gameName, genre, publisher, description) {
  // navigate to games page
  await driver.findElement(selenium.By.id("nav_button")).click();

  await driver.findElement(selenium.By.css(".add_game_button")).click();

  // test for error on empty input
  await driver
    .findElement(selenium.By.xpath("//button[text()='Confirm']"))
    .click();
  assert(
    (await driver.findElements(selenium.By.css(".invalid-feedback"))).length >
      0,
  );

  let gameInput = await driver.findElement(selenium.By.id("gameName"));

  // test for error on unselected game
  await gameInput.sendKeys("abcdfghjkl");
  await driver
    .findElement(selenium.By.xpath("//button[text()='Confirm']"))
    .click();
  assert((await driver.findElements(selenium.By.css(".error_box"))).length > 0);

  await driver
    .findElement(selenium.By.id("gameName"))
    .sendKeys(
      selenium.Key.CONTROL,
      "a",
      selenium.Key.BACK_SPACE,
      selenium.Key.NULL,
    );
  await gameInput.sendKeys(gameName);

  await driver
    .findElement(selenium.By.css("button.list-group-item:nth-child(1)"))
    .click();

  await driver.wait(selenium.until.elementLocated(selenium.By.id("gameGenre")));

  let selectedGameName = await gameInput.getAttribute("value");

  // test for errors on other fields now avaliable once game name is selected
  await driver
    .findElement(selenium.By.xpath("//button[text()='Confirm']"))
    .click();
  assert(
    (await driver.findElements(selenium.By.css(".invalid-feedback"))).length >=
      3,
  );

  // input values and test if number of errors decreases one by one
  await driver
    .findElement(selenium.By.xpath(`//option[text()='${genre}']`))
    .click();
  assert(
    (await driver.findElements(selenium.By.css(".invalid-feedback"))).length >=
      2,
  );

  await driver.findElement(selenium.By.id("gamePublisher")).sendKeys(publisher);
  assert(
    (await driver.findElements(selenium.By.css(".invalid-feedback"))).length >=
      1,
  );

  await driver
    .findElement(selenium.By.css("input[type='file']"))
    .sendKeys(`${process.cwd()}/sample_image.jpg`);

  /*let onResponseCompleted = [];
  await network.responseCompleted(function (event) {
    if (event._request._method == "POST") {
      onResponseCompleted.push(event);
    }
  });*/

  // input description
  await driver
    .findElement(selenium.By.css("textarea.form-control"))
    .sendKeys(description);

  let addGameHeader = driver.findElement(selenium.By.css(".add_game_header"));

  // submit game
  await driver
    .findElement(selenium.By.xpath("//button[text()='Confirm']"))
    .click();

  const now = new Date();

  try {
    await driver.wait(selenium.until.elementIsNotVisible(addGameHeader));
  } catch {}

  await driver.wait(
    selenium.until.elementLocated(
      selenium.By.xpath("//h1[text()='My Games:']"),
    ),
  );

  try {
    while (true) {
      await driver
        .findElement(selenium.By.xpath(`//p[text()='Go Up']`))
        .click();
      continue;
    }
  } catch {}

  let gameFound = false;
  let gameElement;
  await driver.manage().setTimeouts({ implicit: 2000 });
  while (!gameFound) {
    let elements = await driver.findElements(
      selenium.By.xpath(`//div[text()='${selectedGameName}']`),
    );

    if (elements.length == 0) {
      await driver
        .findElement(selenium.By.xpath(`//p[text()='Go Down']`))
        .click();
      continue;
    } else {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let parent = await element.findElement(selenium.By.xpath("./.."));
        let date = await parent.findElement(selenium.By.css(".date_container"));
        let dateText = await date.getText();
        let time = new Date(dateText);
        if (Math.abs(now.getTime() - time.getTime()) < 10000) {
          gameFound = true;
          gameElement = parent;
          break;
        }
      }
    }

    if (!gameFound) {
      await driver
        .findElement(selenium.By.xpath(`//p[text()='Go Down']`))
        .click();
    }
  }
  await driver.manage().setTimeouts({ implicit: 10000 });

  await gameElement.click();

  await new Promise((r) => setTimeout(r, 2000));

  assert(
    (
      await driver
        .findElement(
          selenium.By.css(".game_card_bigger_unlisted > p:nth-child(2)"),
        )
        .getText()
    ).replace("\n", "") == `Genre:${genre}`,
    "Incorrect genre applied to game",
  );

  assert(
    (
      await driver.findElement(selenium.By.css("p:nth-child(3)")).getText()
    ).replace("\n", "") == `Publisher:${publisher}`,
    "Incorrect publisher applied to game",
  );

  if (description) {
    assert(
      (
        await driver.findElement(selenium.By.css("p:nth-child(4)")).getText()
      ).replace("\n", "") == `Description:${description}`,
      "Incorrect description applied to game",
    );
  }

  console.log("Game successfully added");

  // return to home page
  driver.findElement(selenium.By.css("body")).sendKeys(selenium.Key.ESCAPE);
  driver.findElement(selenium.By.css(".logo")).click();
}

async function changeUsernameAndDescription(username, description) {
  const usernameSelector = selenium.By.css("input[placeholder='Username']");
  const descriptionSelector = selenium.By.css("textarea");
  await driver
    .findElement(selenium.By.xpath("//*[text()[contains(.,'My Profile')]]"))
    .click();

  await driver
    .findElement(usernameSelector)
    .sendKeys(
      selenium.Key.CONTROL,
      "a",
      selenium.Key.BACK_SPACE,
      selenium.Key.NULL,
    );

  await driver
    .findElement(selenium.By.xpath("//button[text()='Save username']"))
    .click();

  try {
    await driver.findElement(selenium.By.css("span"));
  } catch {
    console.error(
      "Unable to find error message for incorrectly inputted username.",
    );
    return;
  }

  await new Promise((r) => setTimeout(r, 2000));

  await driver
    .findElement(descriptionSelector)
    .sendKeys(
      selenium.Key.CONTROL,
      "a",
      selenium.Key.BACK_SPACE,
      selenium.Key.NULL,
    );

  await driver.findElement(descriptionSelector).sendKeys(description);

  await driver.findElement(selenium.By.css("header")).click();

  await driver
    .findElement(usernameSelector)
    .sendKeys(
      selenium.Key.CONTROL,
      "a",
      selenium.Key.BACK_SPACE,
      selenium.Key.NULL,
    );

  await driver.findElement(usernameSelector).sendKeys(username);

  await driver
    .findElement(selenium.By.xpath("//button[text()='Save username']"))
    .click();

  await driver.wait(
    selenium.until.elementLocated(
      selenium.By.xpath("//span[text()='Username saved!!']"),
    ),
  );

  await new Promise((r) => setTimeout(r, 2000));

  await driver.findElement(selenium.By.css("svg")).click();

  await driver.wait(
    selenium.until.elementLocated(selenium.By.css(".categories_container")),
  );

  await driver
    .findElement(selenium.By.xpath("//*[text()[contains(.,'My Profile')]]"))
    .click();

  assert(
    (await driver.findElement(usernameSelector).getAttribute("value")) ==
      username,
    "Username not saved correctly",
  );

  assert(
    (await driver.findElement(descriptionSelector).getText()) == description,
    "Description not saved correctly",
  );

  console.log("Username and description update test passed.");

  //await driver.findElement(selenium.By.css("svg")).click();
}

async function runTests() {
  await setup();
  await login();
  await addGame("za", "STRATEGY", "epic gamers", new Date().toLocaleString());
  const now = Date.now();
  await changeUsernameAndDescription(
    `username test ${now}`,
    `description test ${now}`,
  );
}
runTests();
