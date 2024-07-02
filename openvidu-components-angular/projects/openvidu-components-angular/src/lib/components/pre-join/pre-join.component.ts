import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILogger } from '../../models/logger.model';
import { CdkOverlayService } from '../../services/cdk-overlay/cdk-overlay.service';
import { OpenViduComponentsConfigService } from '../../services/config/openvidu-components-angular.config.service';
import { LayoutService } from '../../services/layout/layout.service';
import { LoggerService } from '../../services/logger/logger.service';
import { OpenViduService } from '../../services/openvidu/openvidu.service';
import { TranslateService } from '../../services/translate/translate.service';
import { LocalTrack } from 'livekit-client';
import { CustomDevice } from '../../models/device.model';
import { LangOption } from '../../models/lang.model';
import { StorageService } from '../../services/storage/storage.service';

/**
 * @internal
 */
@Component({
	selector: 'ov-pre-join',
	templateUrl: './pre-join.component.html',
	styleUrls: ['./pre-join.component.scss']
})
export class PreJoinComponent implements OnInit, OnDestroy {
	@Input() set error(error: { name: string; message: string } | undefined) {
		if (error) this._error = error.message ?? error.name;
	}
	@Output() onVideoDeviceChanged = new EventEmitter<CustomDevice>();
	@Output() onAudioDeviceChanged = new EventEmitter<CustomDevice>();
	@Output() onVideoEnabledChanged = new EventEmitter<boolean>();
	@Output() onAudioEnabledChanged = new EventEmitter<boolean>();
	@Output() onLangChanged = new EventEmitter<LangOption>();
	@Output() onReadyToJoin = new EventEmitter<any>();

	_error: string | undefined;

	windowSize: number;
	isLoading = true;
	participantName: string | undefined;

	/**
	 * @ignore
	 */
	isMinimal: boolean = false;
	showLogo: boolean = true;

	videoTrack: LocalTrack | undefined;
	audioTrack: LocalTrack | undefined;
	private tracks: LocalTrack[];
	private log: ILogger;
	private screenShareStateSubscription: Subscription;
	private minimalSub: Subscription;
	private displayLogoSub: Subscription;
	private shouldRemoveTracksWhenComponentIsDestroyed: boolean = true;

	@HostListener('window:resize')
	sizeChange() {
		this.windowSize = window.innerWidth;
		this.layoutService.update();
	}

	constructor(
		private layoutService: LayoutService,
		private loggerSrv: LoggerService,
		private libService: OpenViduComponentsConfigService,
		private cdkSrv: CdkOverlayService,
		private openviduService: OpenViduService,
		private storageService: StorageService,
		private translateService: TranslateService,
		private changeDetector: ChangeDetectorRef
	) {
		this.log = this.loggerSrv.get('PreJoinComponent');
	}

	async ngOnInit() {
		this.subscribeToPrejoinDirectives();
		try {
			const cameraEnabled = this.storageService.isCameraEnabled();
			const microphoneEnabled = this.storageService.isMicrophoneEnabled();
			this.tracks = await this.openviduService.createLocalTracks(cameraEnabled, microphoneEnabled);
			this.openviduService.setLocalTracks(this.tracks);
			this.videoTrack = this.tracks.find((track) => track.kind === 'video');
			this.audioTrack = this.tracks.find((track) => track.kind === 'audio');
		} catch (error) {
			this.log.e('Error creating local tracks:', error);
		}

		this.windowSize = window.innerWidth;
		this.isLoading = false;
	}

	ngAfterContentChecked(): void {
		this.changeDetector.detectChanges();
	}

	async ngOnDestroy() {
		this.cdkSrv.setSelector('body');
		if (this.screenShareStateSubscription) this.screenShareStateSubscription.unsubscribe();
		if (this.minimalSub) this.minimalSub.unsubscribe();
		if (this.displayLogoSub) this.displayLogoSub.unsubscribe();

		if (this.shouldRemoveTracksWhenComponentIsDestroyed) {
			this.tracks.forEach((track) => {
				track.stop();
			});
		}
	}

	onDeviceSelectorClicked() {
		// Some devices as iPhone do not show the menu panels correctly
		// Updating the container where the panel is added fix the problem.
		this.cdkSrv.setSelector('#prejoin-container');
	}

	joinSession() {
		if (!this.participantName) {
			this._error = this.translateService.translate('PREJOIN.NICKNAME_REQUIRED');
			return;
		}

		// Mark tracks as permanent for avoiding to be removed in ngOnDestroy
		this.shouldRemoveTracksWhenComponentIsDestroyed = false;
		this.onReadyToJoin.emit();
	}

	onParticipantNameChanged(name: string) {
		this.participantName = name;
	}

	onEnterPressed() {
		this.joinSession();
	}

	private subscribeToPrejoinDirectives() {
		this.minimalSub = this.libService.minimal$.subscribe((value: boolean) => {
			this.isMinimal = value;
			// this.cd.markForCheck();
		});
		this.displayLogoSub = this.libService.displayLogo$.subscribe((value: boolean) => {
			this.showLogo = value;
			// this.cd.markForCheck();
		});
		this.libService.participantName$.subscribe((value: string) => {
			if (value) this.participantName = value;
			// this.cd.markForCheck();
		});
	}

	async videoEnabledChanged(enabled: boolean) {
		if (enabled && !this.videoTrack) {
			const newVideoTrack = await this.openviduService.createLocalTracks(true, false);
			this.videoTrack = newVideoTrack[0];
			this.tracks.push(this.videoTrack);
			this.openviduService.setLocalTracks(this.tracks);
		}
		this.onVideoEnabledChanged.emit(enabled);
	}

	async audioEnabledChanged(enabled: boolean) {
		if (enabled && !this.audioTrack) {
			const newAudioTrack = await this.openviduService.createLocalTracks(false, true);
			this.audioTrack = newAudioTrack[0];
			this.tracks.push(this.audioTrack);
			this.openviduService.setLocalTracks(this.tracks);
		}
		this.onAudioEnabledChanged.emit(enabled);
	}
}
