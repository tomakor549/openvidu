import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RecordingDialogData } from '../../models/dialog.model';

/**
 * @internal
 */
@Component({
	selector: 'app-recording-dialog',
	template: `
		<div mat-dialog-content>
			<video #videoElement controls autoplay [src]="src" (error)="handleError()"></video>
		</div>
		<div mat-dialog-actions *ngIf="data.showActionButtons" align="end">
			<button mat-button (click)="close()">{{ 'PANEL.CLOSE' | translate }}</button>
		</div>
	`,
	styles: [
		`
			video {
				max-height: 64vh;
				max-width: 100%;
			}
		`
	]
})
export class RecordingDialogComponent {
	@ViewChild('videoElement', { static: true }) videoElement: ElementRef<HTMLVideoElement>;

	src: string;

	constructor(
		public dialogRef: MatDialogRef<RecordingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: RecordingDialogData
	) {
		this.src = data.src;
	}
	close() {
		this.dialogRef.close({ manageError: false, error: null });
	}

	handleError() {
		const videoElement = this.videoElement.nativeElement;
		this.dialogRef.close({ manageError: true, error: videoElement.error });
	}
}
