import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import * as moment from 'moment';
import { MovieReleaseEvent } from '../movies.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-event-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule,MatButtonModule],
  templateUrl: './event-details-dialog.component.html',
  styleUrls: ['./event-details-dialog.component.css']
})
export class EventDetailsDialogComponent {

  constructor(public dialogRef: MatDialogRef<EventDetailsDialogComponent>, @Inject(MAT_DIALOG_DATA)
  public data : {event: MovieReleaseEvent}
){}

formatDate(date: moment.Moment): string{
  return date.format('MMMM DD YYYY, h:mm a')
}

onDeleteClick(): void{
  this.dialogRef.close('delete')
}

onCloseClick():void{
  this.dialogRef.close('close');
}
  

}
