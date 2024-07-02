import { expect } from 'chai';
import { Builder, Key, WebDriver } from 'selenium-webdriver';
import { OPENVIDU_CALL_SERVER } from '../config';
import { WebComponentConfig } from '../selenium.conf';
import { OpenViduComponentsPO } from '../utils.po.test';

const url = `${WebComponentConfig.appUrl}?OV_URL=${OPENVIDU_CALL_SERVER}`;

describe('Testing videoconference EVENTS', () => {
	let browser: WebDriver;
	let utils: OpenViduComponentsPO;
	const isHeadless: boolean = (WebComponentConfig.browserOptions as any).options_.args.includes('--headless');
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
		await browser.quit();
	});

	it('should receive the onReadyToJoin event', async () => {
		await browser.get(`${url}`);

		await utils.waitForElement('#prejoin-container');
		expect(await utils.isPresent('#prejoin-container')).to.be.true;

		// Clicking to join button
		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		// Checking if onReadyToJoin has been received
		await utils.waitForElement('#onReadyToJoin');
		expect(await utils.isPresent('#onReadyToJoin')).to.be.true;
	});

	it('should receive the onTokenRequested event', async () => {
		await browser.get(`${url}`);

		await utils.waitForElement('#prejoin-container');
		expect(await utils.isPresent('#prejoin-container')).to.be.true;

		// Clicking to join button
		await utils.waitForElement('#join-button');
		await utils.clickOn('#join-button');

		// Checking if onTokenRequested has been received
		await utils.waitForElement('#onTokenRequested');
		expect(await utils.isPresent('#onTokenRequested')).to.be.true;
	});

	it('should receive the onRoomDisconnected event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Clicking to leave button
		const leaveButton = await utils.waitForElement('#leave-btn');
		expect(await utils.isPresent('#leave-btn')).to.be.true;
		await leaveButton.click();

		// Checking if onRoomDisconnected has been received
		await utils.waitForElement('#onRoomDisconnected');
		expect(await utils.isPresent('#onRoomDisconnected')).to.be.true;
	});

	it('should receive the onVideoEnabledChanged event when clicking on the prejoin', async () => {
		await browser.get(url);
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#camera-button');
		await utils.clickOn('#camera-button');

		// Checking if onVideoEnabledChanged has been received
		await utils.waitForElement('#onVideoEnabledChanged-false');
		expect(await utils.isPresent('#onVideoEnabledChanged-false')).to.be.true;
	});

	it('should receive the onVideoEnabledChanged event when clicking on the toolbar', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Clicking to leave button
		await utils.waitForElement('#camera-btn');
		await utils.clickOn('#camera-btn');

		// Checking if onVideoEnabledChanged has been received
		await utils.waitForElement('#onVideoEnabledChanged-false');
		expect(await utils.isPresent('#onVideoEnabledChanged-false')).to.be.true;

		await utils.clickOn('#camera-btn');
		await utils.waitForElement('#onVideoEnabledChanged-true');
		expect(await utils.isPresent('#onVideoEnabledChanged-true')).to.be.true;
	});

	it('should receive the onVideoEnabledChanged event when clicking on the settings panel', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();
		await utils.togglePanel('settings');
		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.clickOn('#video-opt');

		await utils.waitForElement('ov-video-devices-select');
		await utils.clickOn('ov-video-devices-select #camera-button');
		// Checking if onVideoEnabledChanged has been received
		await utils.waitForElement('#onVideoEnabledChanged-false');
		expect(await utils.isPresent('#onVideoEnabledChanged-false')).to.be.true;

		await utils.clickOn('ov-video-devices-select #camera-button');
		await utils.waitForElement('#onVideoEnabledChanged-true');
		expect(await utils.isPresent('#onVideoEnabledChanged-true')).to.be.true;
	});

	it('should receive the onVideoDeviceChanged event on prejoin', async () => {
		await browser.get(`${url}&fakeDevices=true`);
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#video-devices-form');
		await utils.clickOn('#video-devices-form');

		await utils.waitForElement('#option-custom_fake_video_1');
		await utils.clickOn('#option-custom_fake_video_1');

		await utils.waitForElement('#onVideoDeviceChanged');
		expect(await utils.isPresent('#onVideoDeviceChanged')).to.be.true;
	});

	it('should receive the onVideoDeviceChanged event on settings panel', async () => {
		await browser.get(`${url}&prejoin=false&fakeDevices=true`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();
		await utils.togglePanel('settings');
		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.clickOn('#video-opt');

		await utils.waitForElement('ov-video-devices-select');
		await utils.waitForElement('#video-devices-form');
		await utils.clickOn('#video-devices-form');

		await utils.waitForElement('#option-custom_fake_video_1');
		await utils.clickOn('#option-custom_fake_video_1');

		await utils.waitForElement('#onVideoDeviceChanged');
		expect(await utils.isPresent('#onVideoDeviceChanged')).to.be.true;
	});

	it('should receive the onAudioEnabledChanged event when clicking on the prejoin', async () => {
		await browser.get(url);
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#microphone-button');
		await utils.clickOn('#microphone-button');

		// Checking if onAudioEnabledChanged has been received
		await utils.waitForElement('#onAudioEnabledChanged-false');
		expect(await utils.isPresent('#onAudioEnabledChanged-false')).to.be.true;
	});

	it('should receive the onAudioEnabledChanged event when clicking on the toolbar', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Clicking to leave button
		await utils.waitForElement('#mic-btn');
		await utils.clickOn('#mic-btn');

		// Checking if onAudioEnabledChanged has been received
		await utils.waitForElement('#onAudioEnabledChanged-false');
		expect(await utils.isPresent('#onAudioEnabledChanged-false')).to.be.true;

		await utils.clickOn('#mic-btn');
		await utils.waitForElement('#onAudioEnabledChanged-true');
		expect(await utils.isPresent('#onAudioEnabledChanged-true')).to.be.true;
	});

	it('should receive the onAudioEnabledChanged event when clicking on the settings panel', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();
		await utils.togglePanel('settings');
		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.clickOn('#audio-opt');

		await utils.waitForElement('ov-audio-devices-select');
		await utils.clickOn('ov-audio-devices-select #microphone-button');
		// Checking if onAudioEnabledChanged has been received
		await utils.waitForElement('#onAudioEnabledChanged-false');
		expect(await utils.isPresent('#onAudioEnabledChanged-false')).to.be.true;

		await utils.clickOn('ov-audio-devices-select #microphone-button');
		await utils.waitForElement('#onAudioEnabledChanged-true');
		expect(await utils.isPresent('#onAudioEnabledChanged-true')).to.be.true;
	});

	it('should receive the onAudioDeviceChanged event on prejoin', async () => {
		await browser.get(`${url}&fakeDevices=true`);
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#audio-devices-form');
		await utils.clickOn('#audio-devices-form');

		await utils.waitForElement('#option-custom_fake_audio_1');
		await utils.clickOn('#option-custom_fake_audio_1');

		await utils.waitForElement('#onAudioDeviceChanged');
		expect(await utils.isPresent('#onAudioDeviceChanged')).to.be.true;
	});

	it('should receive the onAudioDeviceChanged event on settings panel', async () => {
		await browser.get(`${url}&prejoin=false&fakeDevices=true`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();
		await utils.togglePanel('settings');
		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.clickOn('#audio-opt');

		await utils.waitForElement('ov-audio-devices-select');
		await utils.waitForElement('#audio-devices-form');
		await utils.clickOn('#audio-devices-form');

		await utils.waitForElement('#option-custom_fake_audio_1');
		await utils.clickOn('#option-custom_fake_audio_1');

		await utils.waitForElement('#onAudioDeviceChanged');
		expect(await utils.isPresent('#onAudioDeviceChanged')).to.be.true;
	});

	it('should receive the onLangChanged event on prejoin', async () => {
		await browser.get(`${url}`);
		await utils.checkPrejoinIsPresent();

		await utils.waitForElement('#lang-btn-compact');
		await utils.clickOn('#lang-btn-compact');

		await browser.sleep(500);
		await utils.clickOn('#lang-opt-es');
		await browser.sleep(500);

		await utils.waitForElement('#onLangChanged-es');
		expect(await utils.isPresent('#onLangChanged-es')).to.be.true;
	});

	it('should receive the onLangChanged event on settings panel', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();
		await utils.togglePanel('settings');
		await browser.sleep(500);

		await utils.waitForElement('#settings-container');
		await utils.waitForElement('.lang-button');
		await utils.clickOn('.lang-button');

		await browser.sleep(500);
		await utils.clickOn('#lang-opt-es');
		await browser.sleep(500);

		await utils.waitForElement('#onLangChanged-es');
		expect(await utils.isPresent('#onLangChanged-es')).to.be.true;
	});

	it('should receive the onScreenShareEnabledChanged event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Clicking to leave button
		const screenshareButton = await utils.waitForElement('#screenshare-btn');
		expect(await utils.isPresent('#screenshare-btn')).to.be.true;
		await screenshareButton.click();

		// Checking if onScreenShareEnabledChanged has been received
		await utils.waitForElement('#onScreenShareEnabledChanged');
		expect(await utils.isPresent('#onScreenShareEnabledChanged')).to.be.true;
	});

	// With headless mode, the Fullscreen API doesn't work
	(isHeadless ? it.skip : it)('should receive the onFullscreenEnabledChanged event', async () => {
		let element;
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		await utils.toggleFullscreenFromToolbar();
		await browser.sleep(500);

		// Checking if onFullscreenEnabledChanged has been received
		await utils.waitForElement('#onFullscreenEnabledChanged-true');
		expect(await utils.isPresent('#onFullscreenEnabledChanged-true')).to.be.true;

		await (await utils.waitForElement('html')).sendKeys(Key.F11);
		await browser.sleep(500);

		await utils.waitForElement('#onFullscreenEnabledChanged-false');
		expect(await utils.isPresent('#onFullscreenEnabledChanged-false')).to.be.true;
	});

	it('should receive the onChatPanelStatusChanged event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		await utils.togglePanel('chat');

		// Checking if onChatPanelStatusChanged has been received
		await utils.waitForElement('#onChatPanelStatusChanged-true');
		expect(await utils.isPresent('#onChatPanelStatusChanged-true')).to.be.true;

		await utils.togglePanel('chat');

		// Checking if onChatPanelStatusChanged has been received
		await utils.waitForElement('#onChatPanelStatusChanged-false');
		expect(await utils.isPresent('#onChatPanelStatusChanged-false')).to.be.true;
	});

	it('should receive the onParticipantsPanelStatusChanged event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		await utils.togglePanel('participants');

		// Checking if onParticipantsPanelStatusChanged has been received
		await utils.waitForElement('#onParticipantsPanelStatusChanged-true');
		expect(await utils.isPresent('#onParticipantsPanelStatusChanged-true')).to.be.true;

		await utils.togglePanel('participants');

		// Checking if onParticipantsPanelStatusChanged has been received
		await utils.waitForElement('#onParticipantsPanelStatusChanged-false');
		expect(await utils.isPresent('#onParticipantsPanelStatusChanged-false')).to.be.true;
	});

	it('should receive the onActivitiesPanelStatusChanged event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('activities');

		// Checking if onActivitiesPanelStatusChanged has been received
		await utils.waitForElement('#onActivitiesPanelStatusChanged-true');
		expect(await utils.isPresent('#onActivitiesPanelStatusChanged-true')).to.be.true;

		await utils.togglePanel('activities');

		// Checking if onActivitiesPanelStatusChanged has been received
		await utils.waitForElement('#onActivitiesPanelStatusChanged-false');
		expect(await utils.isPresent('#onActivitiesPanelStatusChanged-false')).to.be.true;
	});

	it('should receive the onSettingsPanelStatusChanged event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('settings');

		// Checking if onSettingsPanelStatusChanged has been received
		await utils.waitForElement('#onSettingsPanelStatusChanged-true');
		expect(await utils.isPresent('#onSettingsPanelStatusChanged-true')).to.be.true;

		await utils.togglePanel('settings');

		// Checking if onSettingsPanelStatusChanged has been received
		await utils.waitForElement('#onSettingsPanelStatusChanged-false');
		expect(await utils.isPresent('#onSettingsPanelStatusChanged-false')).to.be.true;
	});

	it('should receive the onRecordingStartRequested event when clicking toolbar button', async () => {
		const roomName = 'recordingToolbarEvent';
		await browser.get(`${url}&prejoin=false&roomName=${roomName}`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.toggleRecordingFromToolbar();

		// Checking if onRecordingStartRequested has been received
		await utils.waitForElement(`#onRecordingStartRequested-${roomName}`);
		expect(await utils.isPresent(`#onRecordingStartRequested-${roomName}`)).to.be.true;
	});

	xit('should receive the onRecordingStopRequested event when clicking toolbar button', async () => {});

	xit('should receive the onBroadcastingStopRequested event when clicking toolbar button', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.toggleToolbarMoreOptions();

		await utils.waitForElement('#broadcasting-btn');
		await utils.clickOn('#broadcasting-btn');

		await browser.sleep(500);

		await utils.waitForElement('.sidenav-menu');
		await utils.waitForElement('#activities-container');

		await utils.waitForElement('#broadcasting-url-input');
		const input = await utils.waitForElement('#broadcast-url-input');
		await input.sendKeys('BroadcastUrl');
		await utils.clickOn('#broadcasting-btn');

		// Open more options menu
		await utils.toggleToolbarMoreOptions();

		await utils.waitForElement('#broadcasting-btn');
		await utils.clickOn('#broadcasting-btn');

		// Checking if onBroadcastingStopRequested has been received
		await utils.waitForElement('#onBroadcastingStopRequested');
		expect(await utils.isPresent('#onBroadcastingStopRequested')).to.be.true;
	});

	it('should receive the onRecordingStartRequested when clicking from activities panel', async () => {
		const roomName = 'recordingActivitiesEvent';
		await browser.get(`${url}&prejoin=false&roomName=${roomName}`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('activities');

		await browser.sleep(1000);

		// Open recording
		await utils.waitForElement('ov-recording-activity');
		await utils.clickOn('ov-recording-activity');

		await browser.sleep(1000);

		// Clicking to recording button
		await utils.waitForElement('#start-recording-btn');
		await utils.clickOn('#start-recording-btn');

		// Checking if onRecordingStartRequested has been received
		await utils.waitForElement(`#onRecordingStartRequested-${roomName}`);
		expect(await utils.isPresent(`#onRecordingStartRequested-${roomName}`)).to.be.true;
	});

	xit('should receive the onRecordingStopRequested when clicking from activities panel', async () => {});

	xit('should receive the onRecordingDeleteRequested event', async () => {
		let element;
		const roomName = 'deleteRecordingEvent';
		await browser.get(`${url}&prejoin=false&roomName=${roomName}&fakeRecordings=true`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Clicking to activities button
		const activitiesButton = await utils.waitForElement('#activities-panel-btn');
		expect(await utils.isPresent('#activities-panel-btn')).to.be.true;
		await activitiesButton.click();

		await browser.sleep(1500);
		// Open recording
		element = await utils.waitForElement('ov-recording-activity');
		await element.click();

		await browser.sleep(1500);

		// Delete event
		element = await utils.waitForElement('#delete-recording-btn');
		expect(await utils.isPresent('#delete-recording-btn')).to.be.true;
		await element.click();

		element = await utils.waitForElement('#delete-recording-confirm-btn');
		expect(await utils.isPresent('#delete-recording-confirm-btn')).to.be.true;
		await element.click();

		await utils.waitForElement(`#onRecordingDeleteRequested-${roomName}-fakeRecording`);
		expect(await utils.isPresent(`#onRecordingDeleteRequested-${roomName}-fakeRecording`)).to.be.true;
	});

	it('should receive the onBroadcastingStartRequested event when clicking from panel', async () => {
		const roomName = 'broadcastingStartEvent';
		const broadcastUrl = 'BroadcastUrl';
		await browser.get(`${url}&prejoin=false&roomName=${roomName}`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		await utils.togglePanel('activities');

		await browser.sleep(1000);
		await utils.waitForElement('#broadcasting-activity');
		await utils.clickOn('#broadcasting-activity');

		await browser.sleep(1000);

		const button = await utils.waitForElement('#broadcasting-btn');
		expect(await button.isEnabled()).to.be.false;

		const input = await utils.waitForElement('#broadcast-url-input');
		await input.sendKeys(broadcastUrl);

		await utils.clickOn('#broadcasting-btn');

		// Checking if onBroadcastingStartRequested has been received
		await utils.waitForElement(`#onBroadcastingStartRequested-${roomName}-${broadcastUrl}`);
		expect(await utils.isPresent(`#onBroadcastingStartRequested-${roomName}-${broadcastUrl}`)).to.be.true;
	});

	xit('should receive the onBroadcastingStopRequested event when clicking from panel', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		// Open activities panel
		await utils.togglePanel('activities');

		await utils.waitForElement('#broadcasting-activity');
		await utils.clickOn('#broadcasting-activity');

		const button = await utils.waitForElement('#broadcasting-btn');
		expect(await button.isEnabled()).to.be.false;

		const input = await utils.waitForElement('#broadcast-url-input');
		await input.sendKeys('BroadcastUrl');

		await utils.clickOn('#broadcasting-btn');

		expect(await utils.isPresent('#broadcasting-tag')).to.be.true;

		await utils.clickOn('#stop-broadcasting-btn');

		// Checking if onBroadcastingStopRequested has been received
		await utils.waitForElement('#onBroadcastingStopRequested');
		expect(await utils.isPresent('#onBroadcastingStopRequested')).to.be.true;
		expect(await utils.isPresent('#broadcasting-tag')).to.be.false;
	});

	xit('should receive the onBroadcastingStopRequested event when clicking from toolbar', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();
		await utils.checkToolbarIsPresent();

		// Open more options menu
		await utils.toggleToolbarMoreOptions();
		await utils.waitForElement('#broadcasting-btn');
		await utils.clickOn('#broadcasting-btn');

		await browser.sleep(500);

		// Checking if onBroadcastingStopRequested has been received
		await utils.waitForElement('#onBroadcastingStopRequested');
		expect(await utils.isPresent('#onBroadcastingStopRequested')).to.be.true;
		expect(await utils.isPresent('#broadcasting-tag')).to.be.false;
	});

	it('should receive the onRoomCreated event', async () => {
		await browser.get(`${url}&prejoin=false`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		await utils.waitForElement('#onRoomCreated');
		expect(await utils.isPresent('#onRoomCreated')).to.be.true;

		expect(await utils.isPresent('#onReadyToJoin')).to.be.false;
	});

	// * PUBLISHER EVENTS

	it('should receive onParticipantCreated event from LOCAL participant', async () => {
		const participantName = 'TEST_USER';
		await browser.get(`${url}&participantName=${participantName}&prejoin=false`);
		await utils.waitForElement(`#${participantName}-onParticipantCreated`);
		expect(await utils.isPresent(`#${participantName}-onParticipantCreated`)).to.be.true;
	});

	// * ROOM EVENTS

	it('should receive roomDisconnected event from LOCAL participant', async () => {
		const participantName = 'TEST_USER';
		let element;
		await browser.get(`${url}&prejoin=false&participantName=${participantName}`);

		await utils.checkSessionIsPresent();

		await utils.checkToolbarIsPresent();

		// Checking if leave button is not present
		element = await utils.waitForElement('#leave-btn');
		await element.click();

		await utils.waitForElement(`#roomDisconnected`);
		expect(await utils.isPresent(`#roomDisconnected`)).to.be.true;
	});
});
