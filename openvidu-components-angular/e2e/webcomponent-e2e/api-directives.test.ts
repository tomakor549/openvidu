import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';
import { OPENVIDU_CALL_SERVER } from '../config';
import { WebComponentConfig } from '../selenium.conf';
import { OpenViduComponentsPO } from '../utils.po.test';

const url = `${WebComponentConfig.appUrl}?OV_URL=${OPENVIDU_CALL_SERVER}`;

describe('Testing API Directives', () => {
	let browser: WebDriver;
	let utils: OpenViduComponentsPO;
	async function createChromeBrowser(): Promise<WebDriver> {
		return await new Builder()
			.forBrowser(WebComponentConfig.browserName)
			.withCapabilities(WebComponentConfig.browserCapabilities)
			.setChromeOptions(WebComponentConfig.browserOptions)
			.usingServer(WebComponentConfig.seleniumAddress)
			.build();
	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduComponentsPO(browser);
	});

	afterEach(async () => {
		// console.log('data:image/png;base64,' + await browser.takeScreenshot());
		await browser.quit();
	});

	it('should set the MINIMAL UI', async () => {
		await browser.get(`${url}&minimal=true`);
		// Checking if prejoin page exist
		await utils.checkPrejoinIsPresent();

		// Checking if audio detection is not displayed
		expect(await utils.isPresent('#audio-wave-container')).to.be.false;

		const joinButton = await utils.waitForElement('#join-button');
		await joinButton.click();

		// Checking if session container is present
		await utils.checkSessionIsPresent();

		// Checking if layout is present
		await utils.checkLayoutPresent();

		// Checking if stream component is present
		utils.checkStreamIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if screenshare button is not present
		expect(await utils.isPresent('#screenshare-btn')).to.be.false;

		// Checking if more options button is not present
		expect(await utils.isPresent('#more-options-btn')).to.be.false;

		// Checking if participants panel button is not present
		expect(await utils.isPresent('#participants-panel-btn')).to.be.false;

		// Checking if activities panel button is not present
		expect(await utils.isPresent('#activities-panel-btn')).to.be.false;

		// Checking if logo is not displayed
		expect(await utils.isPresent('#branding-logo')).to.be.false;

		// Checking if session name is not displayed
		expect(await utils.isPresent('#session-name')).to.be.false;

		// Checking if nickname is not displayed
		expect(await utils.getNumberOfElements('#participant-name-container')).equals(0);

		// Checking if audio detection is not displayed
		expect(await utils.isPresent('#audio-wave-container')).to.be.false;

		// Checking if settings button is not displayed
		expect(await utils.isPresent('#settings-container')).to.be.false;
	});

	it('should change the UI LANG in prejoin page', async () => {
		await browser.get(`${url}&lang=es`);

		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#lang-btn-compact');

		const element = await utils.waitForElement('#join-button');
		expect(await element.getText()).equal('Unirme ahora');
	});

	it('should change the UI LANG in room page', async () => {
		await browser.get(`${url}&prejoin=false&lang=es`);

		await utils.checkLayoutPresent();
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('settings');

		await utils.waitForElement('.sidenav-menu');
		expect(await utils.isPresent('#default-settings-panel')).to.be.true;
		const panelTitle = await utils.waitForElement('.panel-title');
		expect(await panelTitle.getText()).equal('Configuración');

		const element = await utils.waitForElement('#lang-selected-name');
		expect(await element.getAttribute('innerText')).equal('Español');
	});

	it('should override the LANG OPTIONS', async () => {
		await browser.get(`${url}&prejoin=true&langOptions=true`);

		await utils.checkPrejoinIsPresent();
		await utils.waitForElement('#lang-btn-compact');
		await utils.clickOn('#lang-btn-compact');
		await browser.sleep(500);
		expect(await utils.getNumberOfElements('.lang-menu-opt')).equals(2);

		await utils.clickOn('.lang-menu-opt');
		await browser.sleep(500);

		await utils.clickOn('#join-button');

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('settings');

		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.waitForElement('.lang-button');
		await utils.clickOn('.lang-button');

		await browser.sleep(500);

		expect(await utils.getNumberOfElements('.lang-menu-opt')).equals(2);
	});

	it('should show the PREJOIN page', async () => {
		await browser.get(`${url}&prejoin=true`);
		await utils.checkPrejoinIsPresent();
	});

	it('should not show the PREJOIN page', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
	});

	it('should join to Room', async () => {
		await browser.get(`${url}`);

		// Checking if prejoin page exist
		await utils.checkPrejoinIsPresent();

		const joinButton = await utils.waitForElement('#join-button');
		await joinButton.click();

		// Checking if session container is present
		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Checking if screenshare button is not present
		expect(await utils.isPresent('#screenshare-btn')).to.be.true;
	});

	it('should show the token error WITH prejoin page', async () => {
		const fixedUrl = `${url}&roomName=TEST_TOKEN&participantName=PNAME`;
		await browser.get(`${fixedUrl}`);

		// Checking if prejoin page exist
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		// Checking if session container is present
		await utils.checkSessionIsPresent();

		// Starting new browser for adding a new participant
		const newTabScript = `window.open("${fixedUrl}")`;
		await browser.executeScript(newTabScript);

		// Go to first tab
		const tabs = await browser.getAllWindowHandles();
		browser.switchTo().window(tabs[1]);

		await utils.checkPrejoinIsPresent();
		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		// Checking if token error is displayed
		await utils.waitForElement('#token-error');
		expect(await utils.isPresent('#token-error')).to.be.true;
	});

	it('should show the token error WITHOUT prejoin page', async () => {
		const fixedUrl = `${url}&roomName=TOKEN_ERROR&prejoin=false&participantName=PNAME`;
		await browser.get(`${fixedUrl}`);

		// Checking if session container is present
		await utils.checkSessionIsPresent();

		// Starting new browser for adding a new participant
		const newTabScript = `window.open("${fixedUrl}")`;
		await browser.executeScript(newTabScript);

		// Go to first tab
		const tabs = await browser.getAllWindowHandles();
		browser.switchTo().window(tabs[1]);

		// Checking if token error is displayed
		await utils.waitForElement('#openvidu-dialog');
		expect(await utils.isPresent('#openvidu-dialog')).to.be.true;
	});

	it('should run the app with VIDEO DISABLED in prejoin page', async () => {
		await browser.get(`${url}&prejoin=true&videoEnabled=false`);

		await utils.checkPrejoinIsPresent();

		// Checking if video is displayed
		expect(await utils.getNumberOfElements('video')).equals(1);

		// Checking if virtual background button is disabled
		// const button = await utils.waitForElement('#background-effects-btn');
		// expect(await button.isEnabled()).to.be.false;

		await utils.waitForElement('#videocam_off');
		await utils.clickOn('#join-button');

		await utils.checkSessionIsPresent();

		expect(await utils.getNumberOfElements('video')).equals(1);

		await utils.waitForElement('#videocam_off');
		expect(await utils.isPresent('#videocam_off')).to.be.true;
	});

	it('should run the app with VIDEO DISABLED and WITHOUT PREJOIN page', async () => {
		await browser.get(`${url}&prejoin=false&videoEnabled=false`);

		await utils.checkSessionIsPresent();

		await utils.checkLayoutPresent();

		// Checking if video is displayed
		expect(await utils.getNumberOfElements('video')).equals(1);
		expect(await utils.getNumberOfElements('#video-poster')).equals(1);

		await utils.waitForElement('#videocam_off');
		expect(await utils.isPresent('#videocam_off')).to.be.true;
	});

	it('should run the app with AUDIO DISABLED in prejoin page', async () => {
		// let isAudioEnabled;
		// const script = 'return document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].enabled;';

		await browser.get(`${url}&audioEnabled=false`);

		await utils.checkPrejoinIsPresent();

		// Checking if video is displayed
		await utils.checkVideoElementIsPresent();

		// Checking if audio track is disabled/muted
		// isAudioEnabled = await browser.executeScript(script);
		// expect(isAudioEnabled).to.be.false;

		await utils.waitForElement('#mic_off');
		expect(await utils.isPresent('#mic_off')).to.be.true;

		await utils.clickOn('#join-button');

		await utils.checkSessionIsPresent();
		// isAudioEnabled = await browser.executeScript(script);
		// expect(isAudioEnabled).to.be.false;

		await utils.waitForElement('#mic_off');
		expect(await utils.isPresent('#mic_off')).to.be.true;
	});

	it('should run the app with AUDIO DISABLED and WITHOUT PREJOIN page', async () => {
		// let isAudioEnabled;
		// const audioEnableScript = 'return document.getElementsByTagName("video")[0].srcObject.getAudioTracks()[0].enabled;';

		await browser.get(`${url}&prejoin=false&audioEnabled=false`);

		await utils.checkSessionIsPresent();

		// Checking if video is displayed
		await utils.checkVideoElementIsPresent();

		// Checking if audio track is disabled/muted
		// isAudioEnabled = await browser.executeScript(audioEnableScript);
		// expect(isAudioEnabled).to.be.false;

		await utils.waitForElement('#mic_off');
		expect(await utils.isPresent('#mic_off')).to.be.true;
	});

	it('should HIDE the SCREENSHARE button', async () => {
		await browser.get(`${url}&prejoin=false&screenshareBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if screenshare button is not present
		expect(await utils.isPresent('#screenshare-btn')).to.be.false;
	});

	it('should HIDE the FULLSCREEN button', async () => {
		await browser.get(`${url}&prejoin=false&fullscreenBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.toggleToolbarMoreOptions();
		expect(await utils.getNumberOfElements('#fullscreen-btn')).equals(0);
	});

	it('should HIDE the CAPTIONS button', async () => {
		await browser.get(`${url}&prejoin=false&toolbarCaptionsBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.toggleToolbarMoreOptions();

		// Checking if captions button is not present
		expect(await utils.isPresent('#captions-btn')).to.be.false;

		await utils.clickOn('#toolbar-settings-btn');

		await browser.sleep(500);

		await utils.waitForElement('.settings-container');
		expect(await utils.isPresent('.settings-container')).to.be.true;

		expect(await utils.isPresent('#captions-opt')).to.be.false;
	});

	it('should HIDE the TOOLBAR RECORDING button', async () => {
		await browser.get(`${url}&prejoin=false&toolbarRecordingButton=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.toggleToolbarMoreOptions();

		// Checking if recording button is not present
		expect(await utils.isPresent('#recording-btn')).to.be.false;
	});

	it('should HIDE the TOOLBAR BROADCASTING button', async () => {
		await browser.get(`${url}&prejoin=false&toolbarBroadcastingButton=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.toggleToolbarMoreOptions();

		// Checking if broadcasting button is not present
		expect(await utils.isPresent('#broadcasting-btn')).to.be.false;
	});

	it('should HIDE the TOOLBAR SETTINGS button', async () => {
		await browser.get(`${url}&prejoin=false&toolbarSettingsBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Open more options menu
		await utils.toggleToolbarMoreOptions();

		expect(await utils.isPresent('#toolbar-settings-btn')).to.be.false;
	});

	it('should HIDE the LEAVE button', async () => {
		await browser.get(`${url}&prejoin=false&leaveBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if leave button is not present
		expect(await utils.getNumberOfElements('#leave-btn')).equals(0);
	});

	it('should HIDE the ACTIVITIES PANEL button', async () => {
		await browser.get(`${url}&prejoin=false&activitiesPanelBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if activities panel button is not present
		expect(await utils.isPresent('#activities-panel-btn')).to.be.false;
	});

	it('should HIDE the CHAT PANEL button', async () => {
		await browser.get(`${url}&prejoin=false&chatPanelBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if chat panel button is not present
		expect(await utils.isPresent('#chat-panel-btn')).to.be.false;
	});

	it('should HIDE the PARTICIPANTS PANEL button', async () => {
		await browser.get(`${url}&prejoin=false&participantsPanelBtn=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if participants panel button is not present
		expect(await utils.isPresent('#participants-panel-btn')).to.be.false;
	});

	it('should HIDE the LOGO', async () => {
		await browser.get(`${url}&prejoin=false&displayLogo=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if toolbar is present
		await utils.waitForElement('#info-container');
		expect(await utils.isPresent('#info-container')).to.be.true;

		// Checking if logo is not displayed
		expect(await utils.isPresent('#branding-logo')).to.be.false;
	});

	it('should HIDE the SESSION NAME', async () => {
		await browser.get(`${url}&prejoin=false&displayRoomName=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if toolbar is present
		await utils.waitForElement('#info-container');
		expect(await utils.isPresent('#info-container')).to.be.true;

		// Checking if session name is not displayed
		expect(await utils.isPresent('#session-name')).to.be.false;
	});

	it('should HIDE the PARTICIPANT NAME', async () => {
		await browser.get(`${url}&prejoin=false&displayParticipantName=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if stream component is present
		await utils.checkStreamIsPresent();

		// Checking if nickname is not present
		expect(await utils.isPresent('#participant-name-container')).to.be.false;
	});

	it('should HIDE the AUDIO DETECTION element', async () => {
		await browser.get(`${url}&prejoin=false&displayAudioDetection=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if stream component is present
		await utils.checkStreamIsPresent();

		// Checking if audio detection is not present
		expect(await utils.isPresent('#audio-wave-container')).to.be.false;
	});

	it('should HIDE the STREAM VIDEO CONTROLS button', async () => {
		await browser.get(`${url}&prejoin=false&videoControls=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		// Checking if stream component is present
		await utils.checkStreamIsPresent();

		// Checking if settings button is not present
		expect(await utils.isPresent('.stream-video-controls')).to.be.false;
	});

	it('should HIDE the MUTE button in participants panel', async () => {
		const roomName = 'e2etest';
		const fixedUrl = `${url}&prejoin=false&participantMuteBtn=false&roomName=${roomName}`;
		await browser.get(fixedUrl);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		const participantsButton = await utils.waitForElement('#participants-panel-btn');
		await participantsButton.click();

		// Checking if participatns panel is displayed
		await utils.waitForElement('#participants-container');
		expect(await utils.isPresent('#participants-container')).to.be.true;

		// Checking remote participants item
		expect(await utils.isPresent('#remote-participant-item')).to.be.false;

		// Starting new browser for adding a new participant
		const newTabScript = `window.open("${fixedUrl}")`;
		await browser.executeScript(newTabScript);

		// Go to first tab
		const tabs = await browser.getAllWindowHandles();
		browser.switchTo().window(tabs[0]);

		// Checking if mute button is not displayed in participant item
		await utils.waitForElement('#remote-participant-item');
		expect(await utils.isPresent('#remote-participant-item')).to.be.true;

		expect(await utils.isPresent('#mute-btn')).to.be.false;
	});

	it('should HIDE the RECORDING ACTIVITY in activities panel', async () => {
		let element;
		const fixedUrl = `${url}&prejoin=false&activitiesPanelRecordingActivity=false`;
		await browser.get(fixedUrl);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		element = await utils.waitForElement('#activities-panel-btn');
		await element.click();

		// Checking if participatns panel is displayed
		await utils.waitForElement('#default-activities-panel');
		expect(await utils.isPresent('#default-activities-panel')).to.be.true;

		// await browser.sleep(1000);

		// Checking if recording activity exists
		await utils.waitForElement('.activities-body-container');
		expect(await utils.isPresent('ov-recording-activity')).to.be.false;
	});

	it('should SHOW a RECORDING ERROR in activities panel', async () => {
		let element;
		const fixedUrl = `${url}&prejoin=false&recordingError=TEST_ERROR`;
		await browser.get(fixedUrl);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		element = await utils.waitForElement('#activities-panel-btn');
		await element.click();

		// Checking if participatns panel is displayed
		await utils.waitForElement('#default-activities-panel');
		expect(await utils.isPresent('#default-activities-panel')).to.be.true;

		// Checking if recording activity exists
		await utils.waitForElement('#activities-container');
		await utils.waitForElement('.activities-body-container');

		await utils.waitForElement('ov-recording-activity');
		expect(await utils.isPresent('ov-recording-activity')).to.be.true;

		await utils.waitForElement('.failed');
		expect(await utils.isPresent('.failed')).to.be.true;

		// Open recording
		await browser.sleep(500);
		await utils.waitForElement('ov-recording-activity');
		await utils.clickOn('ov-recording-activity');
		await browser.sleep(500);
		element = await utils.waitForElement('.recording-error');
		expect(await element.getAttribute('innerText')).equal('"TEST_ERROR"');
		expect(await utils.isPresent('.recording-error')).to.be.true;
	});

	it('should SHOW a BROADCASTING ERROR in activities panel', async () => {
		let element;
		const fixedUrl = `${url}&prejoin=false&broadcastingError=TEST_ERROR`;
		await browser.get(fixedUrl);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		element = await utils.waitForElement('#activities-panel-btn');
		await element.click();

		// Checking if participatns panel is displayed
		await utils.waitForElement('#default-activities-panel');
		expect(await utils.isPresent('#default-activities-panel')).to.be.true;

		// Checking if broadcasting activity exists
		await utils.waitForElement('#activities-container');
		await utils.waitForElement('.activities-body-container');

		await utils.waitForElement('ov-broadcasting-activity');
		expect(await utils.isPresent('ov-broadcasting-activity')).to.be.true;

		const status = await utils.waitForElement('#broadcasting-status');
		expect(await status.getAttribute('innerText')).equals('FAILED');

		// Open broadcasting
		await browser.sleep(500);
		await utils.clickOn('ov-broadcasting-activity');
		await browser.sleep(500);

		element = await utils.waitForElement('#broadcasting-error');
		expect(await element.getAttribute('innerText')).equal('TEST_ERROR');
	});

	it('should HIDE the BROADCASTING ACTIVITY in activities panel', async () => {
		await browser.get(`${url}&prejoin=false&activitiesPanelBroadcastingActivity=false`);

		await utils.checkSessionIsPresent();

		// Checking if toolbar is present
		await utils.checkToolbarIsPresent();

		await utils.waitForElement('#activities-panel-btn');
		await utils.clickOn('#activities-panel-btn');

		// Checking if participatns panel is displayed
		await utils.waitForElement('#default-activities-panel');
		expect(await utils.isPresent('#default-activities-panel')).to.be.true;

		// await browser.sleep(1000);

		// Checking if recording activity exists
		await utils.waitForElement('.activities-body-container');
		expect(await utils.isPresent('ov-broadcasting-activity')).to.be.false;
	});
});
